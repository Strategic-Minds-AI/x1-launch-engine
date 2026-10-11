# WLE Production: Zero Open Launch-Blocker Gate Contract

Date: 2026-10-11
Mission: WLE-PRODUCTION-READINESS-20261011
Execution class: DISCOVERY / DRAFT / BRANCH ONLY
Operator scope: approval-first. No production change implied by this document.

## Deterministic operating model
Approved client/operator request -> authenticated tenant API -> existing X1 queue and idempotency ledger -> single existing Railway staging worker -> new Vercel preview (not alias) -> independent browser/security/functional validator -> immutable audit receipt + approval -> protected production release. No Base44 transport, no second queue, no unsupervised production publishing.

## Release gates
| Gate | Evidence as of 2026-10-11 | Exit criterion | Status |
| --- | --- | --- | --- |
| G01 Source truth | GitHub main 22429ac contains README only; branch main unprotected. Exact verified nine production blobs in draft PR #9 (aed3884). | Source PR reviewed; required checks; protected main; approved immutable release SHA | BLOCKED |
| G02 Vercel Git build | Draft PR #9 preview dpl_BaSMfoQcGBP7rriSbpSLMSyAGc8k READY but eight route GETs 404; manual production still returns 200. | Explicit scoped Vercel project setting Root Directory=src; new Git preview all routes 200, APIs fail closed, browser QA | BLOCKED |
| G03 Safe worker artifact | Existing Railway sandbox-code agent-worker one-shot deployment 6da10bdf SUCCESS; starts from inline Node command, restart NEVER. Dockerfile in draft PR #7 unbuilt/unpinned. | Reviewed source SHA, immutable image digest, security scan, tested startup and rollback; no legacy worker changes | BLOCKED |
| G04 Runner source grant | Railway service currently image=node:22-alpine; cannot access private WLE Git repo through Git integration as of last checked. | Grant only repo-specific Railway GitHub App scope to WLE, or controlled GHCR immutable build+read-only registry access; exact staging identity | BLOCKED |
| G05 Scoped preview credential | Railway agent-worker has publishable Supabase + consumed one-use capability, no Vercel deploy credential variable observed. | Provider-native approved team/project scope as available, preview-only backend broker and shadow secret binding; readback of name/permission without exposing bytes | BLOCKED |
| G06 X1 queue and tenant isolation | One successful X1 staging canary and independent receipt. No fresh preview was worker-initiated. | Unique per-job tenant ID, digest, TTL, least privilege, idempotent lease, no double builds, bounded retries, cancellation; 1 real unattended new URL + validator receipt | BLOCKED |
| G07 Staging SQL hardening | X1 staging advisories: two SECURITY DEFINER public RPC functions callable by anon (one-shot token gated), no direct table SELECT for anon. | Security review and explicit role and function enforcement; no general anon privileged RPC in customer production; injection/cross-tenant/red-team checks | BLOCKED |
| G08 Authenticated missions | Live new-project /api/platform-health shows NOT_CONFIGURED, customerAuth DISABLED and missionSubmission DISABLED; source /api/missions fail closed (503 POST). | Supabase Auth and tenant roles server-side; approved RLS and authenticated enqueue/missions; cross-tenant negative tests | BLOCKED |
| G09 Independent QA | Fresh manually provisioned fictional noindex preview verified HTTP 200; desktop/mobile smoke. Screenshot backend BLOB_READ_WRITE_TOKEN unavailable in CloudBrowser. | Automated source hash, build/type/lint/integration, desktop/mobile/e2e/a11y, visual parity via an alternate independent screenshot runner, rollback rehearsal | BLOCKED |
| G10 Release identity + rollback | Public production served via dpl_B66U7WBQagTrPbyQgkozXCuUufGu at website-launch-engine.vercel.app; original XPS production is separate. | Unique canonical Vercel project and branch, preapproved SHA, gated promotion/rollback, logging/cost/failure monitoring | BLOCKED |

## Customer self-service / all-in-one gates (not silently included in operator factory V1)
- Client auth and roles; signed onboarding and explicit privacy/data retention terms.
- Per-client site domain selection and optional registrar checkout: quote, user consent, spend/DNS approvals, DNS + TLS verified.
- GA4 and Search Console OAuth + real ownership verification; programmatic XML sitemaps/robots/canonicals; analytics ownership and lifecycle.
- Google Business Profile only for eligible real businesses: no fictional office or unverified local presence.
- Distinct, useful city/county/state content with real differentiation and canonical/noindex safety; no doorway site multiplication.
- Billing, payment provider onboarding, notifications, social OAuth, media generation, quotas, attribution, billing disputes and chargebacks are separately verified workstreams.

## Immediate protected config approval packet (no production release)
1. VERCEL PROJECT SETTING: Team strategic-minds-advisory, project prj_JbkX4yKWygqBFRhkHL6nbeQXM46f; set Root Directory=src; do not assign production alias or start production build. Inspect config and preview from PR #9, then verify routes.
2. RAILWAY REPO ACCESS: project 15f90272-e2f6-4739-8286-91447f545d71, env sandbox-code 30d1f937-6b6a-4b64-af93-c5f20ebad857, service agent-worker b0162c7b-c387-4921-9dd1-145b0dae0793; grant GitHub App access only to Strategic-Minds-AI/website-launch-engine; do not touch worker-sandbox-code.
3. SHADOW CREDENTIAL: create/bind only reviewed staging preview-deploy authorization using provider-native secret path; never expose token to ChatGPT; preserve old config; no production access or customer data.
4. No production release, secrets cutover, SQL migration, main merge, spend/DNS or customer contact until new explicit scoped approval and independent PASS receipts.

## Required next execution
- Read back Vercel root project setting and fresh branch deployment (fail closed if unverified).
- Revalidate source immutability and branch protection gate.
- Repair staging worker using reviewed image and least privilege only after its individual approval.
- Execute worker-created *new* noindex preview with independent network/browser QA and X1 work/lease/receipt verification.
- Promote only exact reviewed release SHA with separate approval. No release-critical UNKNOWN may be called PASS.

Receipts: PR #7 https://github.com/Strategic-Minds-AI/website-launch-engine/pull/7 ; PR #9 https://github.com/Strategic-Minds-AI/website-launch-engine/pull/9 .
Production safety: new and original public production aliases left untouched.