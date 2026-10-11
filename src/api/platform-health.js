/**
 * Website Launch Engine — non-sensitive staging health probe.
 * Read-only. No customer records, work queue dispatch, publishing, or secrets in response.
 * Does NOT confer Railway agent execution authority.
 */
const stagingHost = "uvdkzsbjackpjvpoxtyk.supabase.co";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  const response = {
    service: "website-launch-engine",
    mode: "staging_read_only",
    supabase: "NOT_CONFIGURED",
    railway: "ONLINE_WORKERS_NOT_BOUND",
    customerAuth: "DISABLED",
    customerData: "DISABLED",
    missionSubmission: "DISABLED",
    socialPublishing: "DISABLED",
    mediaGeneration: "DISABLED",
    productionBackend: "DISABLED"
  };
  const base = process.env.WLE_STAGING_SUPABASE_URL;
  const key = process.env.WLE_STAGING_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) return res.status(200).json(response);
  try {
    const url = new URL(base);
    if (url.hostname !== stagingHost || url.protocol !== "https:" || url.pathname !== "/") {
      response.supabase = "CONFIGURATION_REJECTED";
      return res.status(200).json(response);
    }
    const upstream = await fetch(new URL("/auth/v1/health", url), {
      method: "GET",
      headers: { apikey: key, Accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(4000)
    });
    response.supabase = upstream.ok ? "CONNECTED_STAGING" : "HEALTH_CHECK_FAILED";
    return res.status(200).json(response);
  } catch {
    response.supabase = "HEALTH_CHECK_FAILED";
    return res.status(200).json(response);
  }
}
