// Authenticated, read-only operational telemetry for the X1 Launch Engine admin.
// Never connects a public deployment directly to the local Docker socket or Ollama port.
const ROUTES = Object.freeze({
  control: '/api/x1/operator-status',
  workers: '/api/x1/worker-status',
  agents: '/api/x1/agent-sessions',
  queue: '/api/x1/work-items',
  browser: '/api/x1/browser-health',
  health: '/api/x1/health'
});
const json = (res, status, data) => res.status(status).json(data);
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if(req.method !== 'GET') {res.setHeader('Allow', 'GET');return json(res, 405, {error:'Method not allowed'});}
  const supabase = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const allowed = (process.env.X1_ADMIN_USER_IDS || '').split(',').map(x=>x.trim()).filter(Boolean);
  if(!supabase || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabase) || !anon || !allowed.length)
    return json(res,503,{error:'Admin identity provider is not configured'});
  const auth = (req.headers.authorization || '').match(/^Bearer ([A-Za-z0-9._-]+)$/);
  if(!auth) return json(res,401,{error:'Sign in required'});
  try {
    const valid = await fetch(supabase + '/auth/v1/user', {
      headers:{apikey:anon,Authorization:'Bearer '+auth[1]},
      signal:AbortSignal.timeout(5000)
    });
    if(!valid.ok) return json(res,401,{error:'Invalid session'});
    const user = await valid.json();
    if(!user.id || !allowed.includes(user.id)) return json(res,403,{error:'Admin permission required'});
    const origin = 'https://www.strategicmindsai.com';
    const runtimeToken = process.env.X1_RUNTIME_READ_TOKEN;
    const tenant = process.env.X1_RUNTIME_TENANT_ID;
    const checks = await Promise.all(Object.entries(ROUTES).map(async ([name,path])=>{
      try {
        const result = await fetch(origin + path, {
          headers:{accept:'application/json',
            ...(runtimeToken ? {authorization:'Bearer '+runtimeToken} : {}),
            ...(runtimeToken && tenant ? {'x-x1-tenant-id':tenant} : {})},
          signal:AbortSignal.timeout(7000),
          redirect:'error'
        });
        return {name,status:result.status,level:result.ok?'transport-only':'not-verified'};
      } catch {return {name,status:0,level:'unreachable'};}
    }));
    return json(res,200,{read_at:new Date().toISOString(),checks,
      inference:'Docker and Ollama require existing private JARVIS bridge telemetry; no direct public Docker access.',
      proof:'HTTP-only, not independent functional QA'});
  } catch {return json(res,502,{error:'Operational status provider could not be verified'});}
}
