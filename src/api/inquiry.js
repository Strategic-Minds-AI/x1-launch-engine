/**
 * Website Launch Engine inquiry intake, PREVIEW/STAGING ONLY.
 *
 * This is a branch-safe candidate. It is disabled until all of: dedicated
 * WLE schema, approved tenant, server-only role binding, verified perimeter
 * rate limit and explicit staging activation exist. Never repurpose
 * public.website_leads (owned by Phoenix Epoxy Coatings).
 * No customer emails, external messages or public release are triggered.
 */
const PROJECT_URL = "https://uvdkzsbjackpjvpoxtyk.supabase.co";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INDUSTRIES = new Set([
  "Legal", "Real Estate", "Epoxy Flooring", "Roofing", "HVAC",
  "Plumbing", "Electrical", "Med Spa", "Dental", "Chiropractic",
  "Remodeling", "Landscaping", "Solar", "Pest Control", "Moving",
  "Auto Detailing", "Restaurants", "Insurance", "Mortgage",
  "Cleaning Services"
]);
const MAX_JSON_CHARS = 4096;
const MAX_FIELD = { name: 120, email: 254, industry: 60, message: 2000 };
function send(res, status, body) {
  return res.status(status).json({ ok: false, customerDataAccepted: false, ...body });
}
function clean(input, max) {
  if (typeof input !== "string") return null;
  const text = input.trim().normalize("NFC");
  if (!text || text.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text)) return null;
  return text;
}
function stageConfig(env) {
  if (env.VERCEL_ENV !== "preview" || env.WLE_LEAD_INTAKE_ENABLED !== "true" ||
      env.WLE_LEAD_RATE_LIMIT_VERIFIED !== "true") return null;
  const base = env.WLE_STAGING_SUPABASE_URL;
  if (base !== PROJECT_URL || !UUID.test(env.WLE_LEAD_TENANT_ID ?? "")) return null;
  const key = env.WLE_LEAD_SERVICE_ROLE_KEY;
  if (!key || key.length < 32) return null;
  const origin = env.WLE_LEAD_ALLOWED_ORIGIN;
  if (typeof origin !== "string" || !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return null;
  return { base, tenantId: env.WLE_LEAD_TENANT_ID, key, origin };
}
function validateBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  if (Object.keys(body).some(k => !["requestId","name","email","industry","message","website"].includes(k))) return null;
  // Honeypot must be present but empty, to reduce ordinary automated spam.
  if (body.website !== "") return null;
  if (!REQUEST_ID.test(body.requestId ?? "")) return null;
  const name = clean(body.name, MAX_FIELD.name);
  const email = clean(body.email, MAX_FIELD.email);
  const industry = clean(body.industry, MAX_FIELD.industry);
  const message = clean(body.message, MAX_FIELD.message);
  if (!name || name.length < 2 || !email || !industry || !message || message.length < 10) return null;
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return null;
  if (!INDUSTRIES.has(industry)) return null;
  return { request_id:body.requestId.toLowerCase(), contact_name:name, email, industry, details:message };
}
function requestHeaders(key) {
  return { apikey:key, Authorization:"Bearer " + key, "Content-Type":"application/json",
    Accept:"application/json", "Cache-Control":"no-store" };
}
async function getReceipt(fetchImpl, url, headers, expected) {
  const response = await fetchImpl(url,{method:"GET",headers,redirect:"error",signal:AbortSignal.timeout(7500)});
  if (!response.ok) throw new Error("RECEIPT_FETCH_FAILED");
  const body = await response.json();
  if (!Array.isArray(body) || body.length !== 1 || !UUID.test(body[0]?.id ?? "")) {
    throw new Error("RECEIPT_NOT_UNIQUE");
  }
  // A reused idempotency key with different contents is NOT proof of this
  // submission. Verify the persisted fields server-side, never return PII.
  const row=body[0];
  for (const field of ["contact_name","email","industry","details","source_site"]) {
    if (row[field] !== expected[field]) throw new Error("RECEIPT_PAYLOAD_MISMATCH");
  }
  return row.id;
}

export function createInquiryHandler({ env=process.env, fetchImpl=fetch }={}) {
  return async function handler(req,res) {
    res.setHeader("Cache-Control","no-store, max-age=0");
    res.setHeader("X-Content-Type-Options","nosniff");
    res.setHeader("Referrer-Policy","no-referrer");
    res.setHeader("Allow","POST");
    if (req.method !== "POST") return send(res,405,{code:"METHOD_NOT_ALLOWED"});
    const conf=stageConfig(env);
    if (!conf) return send(res,503,{code:"WLE_LEAD_INTAKE_NOT_BOUND",retryable:false});
    // No CORS authorization, and no cross-origin request accepted.
    if (req.headers?.origin !== conf.origin || req.headers?.host !== new URL(conf.origin).host) {
      return send(res,403,{code:"ORIGIN_NOT_ALLOWED",retryable:false});
    }
    if (!/^application\/json(?:;|$)/i.test(req.headers?.["content-type"] ?? "")) {
      return send(res,415,{code:"UNSUPPORTED_MEDIA_TYPE",retryable:false});
    }
    const headerLength=Number(req.headers?.["content-length"] ?? 0);
    if (headerLength > MAX_JSON_CHARS || !Number.isFinite(headerLength) || headerLength < 0) {
      return send(res,413,{code:"REQUEST_TOO_LARGE",retryable:false});
    }
    const raw=req.body;
    let body=raw;
    if (typeof raw === "string") {
      if (raw.length>MAX_JSON_CHARS) return send(res,413,{code:"REQUEST_TOO_LARGE",retryable:false});
      try { body=JSON.parse(raw); } catch { return send(res,400,{code:"INVALID_JSON",retryable:false}); }
    }
    if (JSON.stringify(body??null).length > MAX_JSON_CHARS) {
      return send(res,413,{code:"REQUEST_TOO_LARGE",retryable:false});
    }
    const valid=validateBody(body);
    if (!valid) return send(res,422,{code:"INVALID_INQUIRY",retryable:false});
    // The tenant is derived exclusively from server config, never from request.
    const item={ ...valid, tenant_id:conf.tenantId, source_site:"website-launch-engine", status:"new" };
    const headers=requestHeaders(conf.key);
    const endpoint=PROJECT_URL+"/rest/v1/wle_lead_inquiries";
    const query=new URLSearchParams({tenant_id:"eq."+conf.tenantId,request_id:"eq."+valid.request_id,select:"id,contact_name,email,industry,details,source_site"});
    const lookup=endpoint+"?"+query.toString();
    let writeStatus=0;
    try {
      const response=await fetchImpl(endpoint+"?on_conflict=tenant_id,request_id",{
        method:"POST",headers:{...headers,Prefer:"resolution=ignore-duplicates,return=minimal"},
        body:JSON.stringify([item]),redirect:"error",signal:AbortSignal.timeout(7500)
      });
      writeStatus=response.status;
    } catch {
      writeStatus=0; // Unknown write status: only independently verified read-back can complete it.
    }
    try {
      const receiptId=await getReceipt(fetchImpl,lookup,headers,item);
      return res.status(202).json({
        ok:true,customerDataAccepted:true,code:"WLE_INQUIRY_PERSISTED",
        requestId:valid.request_id,receiptId,delivery:"staging_private_intake",
        messageSent:false
      });
    } catch {
      return send(res,503,{code:"WLE_INQUIRY_PERSISTENCE_UNVERIFIED",retryable:true,
        writeStatus:writeStatus===0?"UNKNOWN":"NOT_VERIFIED"});
    }
  };
}

export default createInquiryHandler();
