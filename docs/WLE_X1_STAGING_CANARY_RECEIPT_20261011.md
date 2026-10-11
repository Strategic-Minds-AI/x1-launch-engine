# WLE X1 Preview Canary: Staging Queue, Lease, Preview, Validator, Receipt

Date: 2026-10-11
Mission: WLE-X1-SYNTHETIC-PREVIEW-20261011
WorkPacket: WLE-SB-CANARY-20261011-001
Classification: NON_PRODUCTION_MUTATION, synthetic, no customer data or cost-bearing model calls.

## Authority and release boundaries
- GitHub canonical repository: Strategic-Minds-AI/website-launch-engine
- Branch: feature/wle-x1-targeted-preview-canary-v1
- Baseline parent: feature/agent-visual-builder-sandbox-control-v1
- Production remains **dpl_3ou9SX8CpMZEhTYbTDDmtrEdwrFi** on website-launch-engine-xps.vercel.app, untouched.
- Supabase staging project: uvd***yk; operational X1 queue, task leases and audit receipts reused.
- Railway Strategic Sandbox System services currently online but **NOT** bound to X1 Website Launch Engine jobs.
- This is an **operator-driven one-shot staging canary**. Do not describe it as an autonomous Railway site build.

## Source / Artifact
- Source commit: `56f5cf7a0f6bffbe8e9ecb44ebbd69aece4e9d99`
- Premium source donor: `src/templates/roofing.html`, blob `bf92408e9c495254f6a6c660b8bddd765cf6af62`
- Generated synthetic preview artifact: `src/proof/roofing-canary.html`, blob `9bc39e47c8ac4b738c3a41cf2f4d133bb1ef9ed3`
- SHA256 content hash: `3db4e69029722995f4fd01ddd235f3e60520b64a3fc859db3df8978ba8e3c75f`
- First preview deployment: `dpl_82h6gCNpiqdeRmHxG6EFgesK8WPL`, READY, target preview, 12 source files
- Proof artifact URL: https://website-launch-engine-bp4kubfrm-strategic-minds-advisory.vercel.app/proof/roofing-canary.html
- Synthetic design is a fictional roofing brand; contains noindex,nofollow, no fake office, no testimonials, no customer information.

## Actual staging execution trace
1. Independently re-fetched the repo and Vercel preview source: byte-for-byte identical, HTTP 200.
2. Xtreme Cloud Browser separate runtime validated 1440x900 and 390x844, with no reported JS errors, all tested image requests successful (9 desktop / 5 mobile), correct navigation and portal preview links. No screenshot: screenshot storage unavailable.
3. Enqueued one explicit X1 work item using the existing `x1_enqueue_work` RPC and **atomically leased the same ID** using `x1_lease_work_by_id` with environment `preview` and a 900-second lease. No global scheduler or queue poller created.
4. Queue Work ID: `5ecf4038-46ce-48ba-bab6-3356089d17e5`. Targeted lease ID `3120aafc-117c-4d28-a887-9e3e0c01bcf1`. Worker identity `wle-staging-operator-canary` denotes APEX operator-driven execution, **NOT Railway**.
5. Written immutable `x1_audit_receipts` entry of type `WLE_PREVIEW_FUNCTIONAL_QA`, receipt ID `WLE-VAL-20261011-ROOFING-001` with source SHA, artifact SHA256, preview URL, deployment ID, tested viewports/images, and declared limitations. Updated queue.validation_receipt_id to same receipt.
6. Completed queue item with existing `x1_finish_work` RPC; fresh SQL readback: queue status `COMPLETED`, attempts 1, lease status `COMPLETED`, matching independent audit receipt count 1.

## Source code prepared for actual Railway integration
- `src/lib/x1-targeted-preview-canary.mjs`: single-work targeted lease adapter only; checks tenant ID, work ID, exact source SHA, no customer data, nonproduction class, explicit preview environment, valid lease, fixed synthetic payload, fictional design. Requires injected preview publisher, **independent validator** different from worker and persisted receipt before `x1_finish_work COMPLETED`.
- `src/tests/x1-targeted-preview-canary.test.mjs`: eight Node native tests authored for acceptance, cross-tenant rejection, production action rejection, determinism, independent validator, production publish rejection, missing receipt rejection, and no-work behavior.
- **Tests are authored, not yet executed from the committed GitHub source in a canonical Node runner.** No Railway service received or ran this code.
- The adapter is side-effect-free until an authorized runtime injects credentialled RPC/publishing callbacks. No API key embedded in source or browser.

## Remaining blockers
1. Connect **existing** Railway sandbox-code worker to actual X1 RPC with secure service-to-service credential and workspace/tenant scope, without redirecting legacy Base44 worker unexpectedly.
2. Tests: execute Node module tests from exact commit SHA, verify negative tenant/RLS, invalid task and message injection behavior.
3. Independent isolation and network/FS budget restrictions on production-grade sandbox jobs.
4. Test a **real Railway-executed** synthetic job end to end. Record worker identity fingerprint/deployment + signed receipt and compare SHA.
5. Screenshot/pixel check blocked by Cloud Browser storage missing BLOB_READ_WRITE_TOKEN.
6. Only after these gates, operator may approve enabling authenticated customer commands. Public production and default branch remain unchanged.

## Rollback
Synthetic canary has no external production effects. If work ever needs rollback, do not delete receipts; quarantine preview URL, mark new superseding receipt with appropriate reason. Public WLE production remains at prior deployment until separately released.
