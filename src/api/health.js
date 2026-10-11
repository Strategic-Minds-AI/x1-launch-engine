/**
 * Non-sensitive integration bootstrap health. This is NOT a check of the
 * sandbox worker, Supabase, lead capture or authenticated customer operations.
 */
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  return res.status(200).json({
    service: "website-launch-engine",
    status: "scaffold_only",
    backendConnected: false,
    authConnected: false,
    provisioningConnected: false,
    productionReleaseEnabled: false
  });
}
