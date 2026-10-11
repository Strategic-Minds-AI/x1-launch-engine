# WLE Cloud Browser + AI Gateway binding audit

Date: 2026-10-11
Task class: READ / DRAFT / BRANCH_WRITE ONLY
Source: live authorized Railway, Vercel, GitHub, Cloud Browser probes. No secret values accessed.
Scope: Strategic-Minds-AI/website-launch-engine PR #7 feature/wle-auditable-preview-runner-20261011.

## Verified independent services

**Existing Railway WLE worker (do not duplicate).**
- Project Strategic Sandbox System: `15f90272-e2f6-4739-8286-91447f545d71`
- Environment `sandbox-code`: `30d1f937-6b6a-4b64-af93-c5f20ebad857`
- Service `agent-worker`: `b0162c7b-c387-4921-9dd1-145b0dae0793`
- Current source image `node:22-alpine`; temporary one-shot inline command; restart policy NEVER; last deployment `6da10bdf-4c4b-4e35-8d01-74ebe1b87d4a` SUCCESS. Environment check reports online but **not** an active autonomous preview builder.
- Service variable names indicate only prior one-shot X1 capability/publishable staging metadata, **not** Cloud Browser or new Vercel preview-deployer bindings. No staged WLE Railway changes.
- Separate `worker-sandbox-code` is an existing protected legacy worker; do not change or create a second supervisor.

**Existing X1 AI Browser staging.**
- Railway project `4fd76d35-df2c-4358-a936-0f5ac055d9d6`, staging environment `abc93895-5f8e-4c9b-b913-3daaf2595ba3`
- `cloud-browser-engine-staging`: `0aab1ee9-7ac0-474a-bd22-eaa3e6d50368`
- `cloud-browser-mcp-staging`: `50e888dc-8269-4f10-82d1-babbfd4f2990`, service domain `cloud-browser-mcp-staging-staging.up.railway.app`
- Both last inspected deployments SUCCESS. Exact client contract, permissions, and egress from WLE worker **not yet proven**.

**Existing CloudBrowser runtime.**
- Railway project `b68545a5-c9f8-482d-8e1b-4c1574f7af3b` control system.
- `cloudbrowser-engine`: `debc3270-1cf5-4db6-b4dc-3db7b70f8718` last deployment SUCCESS, plus two online sibling engines.
- `browser_health` actual tool probe returned ok=true, engine_version=3.1.0. This proves an authorized Browser client can reach a working engine, not that WLE worker has direct access.
- The Cloud Browser screenshot service previously reported missing BLOB_READ_WRITE_TOKEN; do not assert pixel-level screenshot QA until a supported evidence storage path works.

**Website Launch Engine Vercel project.**
- Team strategic-minds-advisory; project `prj_JbkX4yKWygqBFRhkHL6nbeQXM46f`.
- Git-driven preview SHA `aed388468f17916f43a2ccc593981e4fbf1e8603` from draft PR #9 passed 5/5 HTML route checks after rootDirectory=src, preview deployment `dpl_5dY7QACiYg3FtqYsFeZzpmGCbk9R`.
- Existing `/api/platform-health` reports staging_read_only, supabase=NOT_CONFIGURED, railway=ONLINE_WORKERS_NOT_BOUND, customerAuth=DISABLED, missionSubmission=DISABLED. `/api/missions` deliberately fails closed.
- Current project preview environment metadata returned 100 listed entries, with 39 readable names and 61 output-truncated placeholders. Known entries target preview and include Cloud Browser configuration and credential-like names (database, GitHub and Railway). They are encrypted entries, **not automatically authorized runtime connections**. Provider did not expose values. Nothing in this audit authorizes copying, rotating, or deleting them.
- **Security review needed:** the broad preview secret surface must be minimized/isolated before a preview runs unreviewed PR code. Do not copy Browser/Postgres/Railway/GitHub administrative credentials to customer/public client code.

**Vercel AI Gateway evidence and limits.**
- Strategic Minds corporate admin connector verified read-only model catalog through Vercel AI Gateway (`gateway.models` PASS_READ_PROBE_ONLY). This proves an agency integration can reach the catalog but **does not** prove WLE Vercel project has an authenticated inference route.
- A different XTREME_TEAM provider status advertises `free_llm` (Groq/Gemini/OpenRouter), NOT Vercel AI Gateway. Never conflate these bindings.
- Vercel documentation permits server-side AI Gateway authentication via Vercel OIDC (`VERCEL_OIDC_TOKEN`) on Vercel deployments, rather than propagating an API key into a frontend. No paid inference was executed in this audit.

## Correct production architecture

`Approved operator/client action -> Vercel WLE server-side authenticated mission API -> X1 staging queue/lease/idempotency -> existing Railway WLE worker -> template/render/build -> Vercel preview only -> Cloud Browser isolated QA -> source/deployment/QA receipts -> release approval`

- Prefer **Vercel Functions / AI SDK using Vercel OIDC** for AI Gateway generation in WLE; the Railway worker may call an authenticated server-side broker if needed. This is a proposed route, not a verified WLE consumer.
- Browser execution stays in existing Railway Cloud Browser; WLE worker calls a **restricted authenticated browser adapter**. Verify the allowed host, scoped credential identity, tenancy, SSRF/egress allowlists, timeout, rate limit, and audit receipts.
- Never put browser administration tokens, Vercel tokens, or AI Gateway credentials in client JS, source code, logs, or receipt values.
- Reuse one X1 queue, current worker identity, lease and heartbeat. No second cron/supervisor, no Base44 dependency, no production activation by this document.

## Next protected stage packet (requires scoped approval)

1. **Review and shrink Vercel PREVIEW variable inventory** to only keys necessary for WLE; preserve rollback metadata and no plaintext readback. Avoid deleting an existing binding before verifying consumers.
2. **Review and pin Railway WLE worker artifact** on a branch and stage only on `sandbox-code` service `b0162...`. Verify source digest, test suite, code scanning, rollback, and the existing original one-shot behavior.
3. **Authorize only staging authentication** for Cloud Browser QA and for per-job Vercel preview deployment, using provider-native secrets/references; no production credential or alias access.
4. **Implement fail-closed Vercel server-side AI Gateway adapter** on review branch. Use OIDC in Vercel runtime when supported. Disable paid inference until explicitly approved and budget-limited.
5. **Run a synthetic one-job end-to-end canary**: Railway worker must create a fresh noindex Vercel URL, submit X1 work/lease receipt, and independent Cloud Browser must inspect. Test retries, idempotency, cross-tenant denial and error paths.
6. Require independent verified receipts before any production change. GitHub main and public domains remain protected and unchanged.

## Status

- VERIFIED: browser engine health, agency model-catalog read access, Vercel preview source, Railway worker identities and current metadata.
- NOT VERIFIED: any current runtime WLE-to-CloudBrowser authenticated call, WLE-to-AI-Gateway inference, new Railway-created Vercel preview, continuous worker loop, tenant auth.
- BLOCKED by scope: secret/config mutation, worker activation, model spend, production releases.
- WORKAROUND: continue branch-safe development and read-only probes, then request exact protected binding approval.
