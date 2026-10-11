/** WLE sandbox control: truthful, fail-closed command surface.
 * Never let a browser submit production work directly to X1 or Railway.
 * The visual editor is a local iframe preview, not a remote isolated runtime.
 */
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  if (req.method === "GET") return res.status(200).json({
    ok: true,
    controlVersion: "wle-sandbox-contract-v1",
    visualPreview: "CLIENT_SANDBOX_ACTIVE",
    remoteWorker: "NOT_BOUND",
    supabaseQueue: "NOT_BOUND_FOR_WLE",
    auth: "NOT_CONFIGURED",
    isolation: "NOT_ATTESTED",
    remoteExecution: false,
    domainPurchases: false,
    googleSync: false,
    customerPublishing: false
  });
  res.setHeader("Allow", "GET");
  return res.status(403).json({
    ok: false,
    code: "PROTECTED_ACTION_NOT_ENABLED",
    message: "Remote sandbox execution requires tenant auth, independent isolation validation, bounded budget and a signed approval receipt."
  });
}
