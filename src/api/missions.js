/**
 * Deliberately deny all website provisioning operations until an authorized
 * tenant-scoped Supabase/X1 queue bridge and independent QA are integrated.
 *
 * Never accept unauthenticated user-supplied domains, instructions or secrets.
 */
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Allow", "POST");
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  return res.status(503).json({
    ok: false,
    code: "INTEGRATION_NOT_BOUND",
    message: "Authenticated Website Launch Engine mission intake is not enabled.",
    retryable: false,
    customerDataAccepted: false
  });
}
