# Railway X1 One-Shot Worker: Execution + Independent Validation Receipt

Mission ID: WLE-SB-RAILWAY-20261011-001
Timestamp: 2026-10-11
Environment: STAGING SANDBOX ONLY
Approval: operator requested "CONTINNUE PLEASE binding and isolated worker patch. No production worker or customer publishing changes."
Result: VERIFIED one-shot Railway-run synthetic canary with separate independent browser validation.
Revenue/cost: No domain purchases, AI generation charges, client messages, customer data, or site sales claimed.

## Verified source and runtime
- Canonical GitHub: `Strategic-Minds-AI/website-launch-engine`.
- Branch: `feature/wle-x1-targeted-preview-canary-v1`.
- Versioned runner source: `src/wle-staging-runner/worker.mjs` (Git blob `98452943b97652cf482aef8b33180ccfe18bdde7`).
- Railway project: `15f90272-e2f6-4739-8286-91447f545d71`, environment `30d1f937-6b6a-4b64-af93-c5f20ebad857` (sandbox-code).
- **Existing idle** Railway service repurposed: `agent-worker` (`b0162c7b-c387-4921-9dd1-145b0dae0793`), Node 22 Alpine.
- Railway deployment: `6da10bdf-4c4b-4e35-8d01-74ebe1b87d4a`, SUCCESS; deployed by committed staged patch `18906394-f92c-4462-a3d3-4dd8e431a90d`.
- Six scoped Railway changes: startCommand, restartPolicy=NEVER, SUPABASE_PUBLISHABLE_KEY, WLE_STAGING_SUPABASE_URL, WLE_ONE_SHOT_CAPABILITY and WLE_TARGET_WORK_ID. The original `worker-sandbox-code` service remained at deployment `4bc6d191-9067-4dae-9aeb-d932dee7e24f` with zero staged changes. The original Base44 polling worker was not modified.
- Railway GitHub integration could not access private WLE repository; safe workaround: staged the GitHub-fetched versioned one-shot Node source as an inline start command on this idle Node service. **This workaround is temporary, not the future maintained runner deployment pattern.**
- After successful validation, WLE_ONE_SHOT_CAPABILITY was overwritten with a nonfunctional revocation marker using skipDeploys=true. Supabase capability row is marked used. Secret/token bytes are not stored in the source or this receipt.

## Existing X1 staging contracts
- Supabase project: `uvdkzsbjackpjvpoxtyk` X1 AI Hub Staging; production database not mutated.
- Existing `x1_enqueue_work`, `x1_lease_work_by_id`, `x1_finish_work`, `x1_task_leases`, `x1_audit_receipts` reused. No new general-purpose queue, scheduler or recurring heartbeat.
- Additive staging migration: `wle_scoped_railway_canary_capability_20261011`.
- `public.wle_targeted_canary_caps`: hashed, time-limited, one-claim one-submit grant for one exact work ID. RLS on; anon/authenticated table SELECT denied.
- `public.wle_targeted_canary_results`: worker-provided hash, fixed proof URL, lease, bytes and status; RLS on, anon/authenticated table INSERT denied.
- Narrow SECURITY DEFINER functions `wle_claim_targeted_canary` and `wle_submit_targeted_canary` executable by `anon` only with the 256-bit capability; authenticated EXECUTE denied, ordinary table rights denied. Binding is staging-only to a fixed tenant, work packet, task, Git source, source SHA, action NON_PRODUCTION_MUTATION, no customer data, no external model, no purchase, and preview environment.
- Expiry enforced in database, and one-time used_at consumed. The runner never received a service-role credential.

## Execution chain and independent verification
- X1 Work ID: `34384c94-6b24-4a1a-9fde-71f41d9d7292`.
- Packet: `WLE-SB-RAILWAY-20261011-001`.
- Source SHA: `56f5cf7a0f6bffbe8e9ecb44ebbd69aece4e9d99`.
- Existing pinned synthetic preview: https://website-launch-engine-bp4kubfrm-strategic-minds-advisory.vercel.app/proof/roofing-canary.html
- Vercel preview deployment: `dpl_82h6gCNpiqdeRmHxG6EFgesK8WPL`, READY, nonproduction.
- Canonical preview HTML source blob: `9bc39e47c8ac4b738c3a41cf2f4d133bb1ef9ed3`.
- Artifact SHA256: `3db4e69029722995f4fd01ddd235f3e60520b64a3fc859db3df8978ba8e3c75f`.
- Worker submitted 13,045 UTF-8 bytes and the expected SHA with fixed proof URL.
- Staging work item claimed at `2026-10-11 10:55:05.877055+00`; submitted at `2026-10-11 10:55:06.348423+00` while new Railway deployment started. Database result `AWAITING_INDEPENDENT_VALIDATION` preceded validator action.
- Independent Vercel live GET of donor and output: HTTP 200, exact deterministic transformation equality with GitHub blob and delivered HTML.
- Independent fresh Xtreme Cloud Browser sessions 1440x900 and 390x844: 9 and 5 image requests, 0 image errors, 0 reported JS errors, working portal and phone CTAs.
- Independent validation receipt: `WLE-VAL-RAILWAY-20261011-001`, stored in `x1_audit_receipts` with immutable artifact hash, validator, deployed source identity, and honest limitations.
- `x1_finish_work` invoked only after independent receipt. Fresh Supabase readback: queue **COMPLETED**, lease **COMPLETED**, worker result **VALIDATED**, capability **used**, attempts **1**, exactly **one** independent matching audit receipt.
- Railway deployment status SUCCESS; Railway deploy-log entries did not expose a readable `WLE_CANARY_SUBMITTED` line, so runtime attribution relies on paired service deployment and scoped capability execution timestamps plus exact result (not a captured explicit worker stdout proof).
- **Important limit:** the site preview URL was pre-provisioned during an earlier APEX one-shot canary. Railway generated/verified the identical site content and submitted a durable result, but did not provision a new site URL, register a domain, or perform a paid media build.

## Production safety and remaining release gates
- Public production https://website-launch-engine-xps.vercel.app remains at `dpl_3ou9SX8CpMZEhTYbTDDmtrEdwrFi` (READY).
- No default-branch merge, new external domain/DNS, production RLS, service-role key injection, or outbound customer marketing.
- Proof-dashboard preview: https://website-launch-engine-f4mnlydk8-strategic-minds-advisory.vercel.app/admin/proof.html (nonproduction, receipt updated).
- UI preview must never be equated with an authenticated admin or production-ready remote executor.
- Screenshot capture/pixel parity comparison still blocked by unavailable browser screenshot storage; JS/image/HTML checks PASS, pixel review UNKNOWN.
- Node test source exists at `src/wle-staging-runner/tests/worker.test.mjs`. Source-based guards and real execution passed, but a full canonical Node test run from the immutable Git commit was **not performed** in this mission; do not label CI GREEN without evidence.
- For repeatability: grant Railway GitHub access to the private canonical repo or use a reviewed container image; replace inline start command with pinned, auditable artifact. Then build a reusable executor with short-lived work-specific credentials, true tenant isolation, bounded egress, proof receipts, clean revocation, fresh preview site provisioning and automated independent validators. Authorize each protected step separately.
- Rollback for the one-shot service: reset its startCommand to prior `node -e "console.log('Agent worker running'); setInterval(() => {}, 1000)"` or retire this staging service after preserving receipts. Do not touch original worker service. Production baseline requires no rollback because unchanged.
