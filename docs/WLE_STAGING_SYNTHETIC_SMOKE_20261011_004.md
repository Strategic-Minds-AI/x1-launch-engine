# WLE staging connection and synthetic preview test receipt

**Mission**: WLE-X1-STAGING-SMOKE-20261011-004
**Date**: 2026-10-11
**Scope**: X1 Supabase staging READ; existing Railway sandbox and Cloud Browser READ; one operator-assisted, inlined Vercel PREVIEW site. No production, secrets, DNS, payments, customer messages, new cron/worker, or database mutations.
**Result**: PARTIAL PASS. Staging infrastructure independently reachable and new fictional site preview validated. The three-provider **Supabase queue -> Railway worker -> Vercel provisioner** automation remains UNBOUND and was NOT demonstrated.

## 1. Current identities and preconditions

- Canonical source: `Strategic-Minds-AI/website-launch-engine`, draft PR #7. Source commit **before** test and repair: `0a59b953e1ce7946d2e45769571374f13319f3d7`.
- Reviewed fictional donor: `src/wle-staging-runner/fixtures/roofing.html`, Git blob `bf92408e9c495254f6a6c660b8bddd765cf6af62`, contains `NOT A REAL CONTRACTOR` and `<meta name="robots" content="noindex,nofollow">`.
- Supabase **staging only**: project `uvdkzsbjackpjvpoxtyk`, X1 AI Hub Staging, ACTIVE_HEALTHY.
- Existing Railway project `15f90272-e2f6-4739-8286-91447f545d71`, environment `30d1f937-6b6a-4b64-af93-c5f20ebad857` sandbox-code, service `agent-worker` id `b0162c7b-c387-4921-9dd1-145b0dae0793`; existing deployment `6da10bdf-4c4b-4e35-8d01-74ebe1b87d4a` reports SUCCESS.
- Railway service still has temporary inline one-shot code and restart policy NEVER; the previous one-shot capability is consumed. Service shows ONLINE in environment status, but a fresh queue-consumption/deploy loop was **not** observed.
- Existing Vercel project `prj_JbkX4yKWygqBFRhkHL6nbeQXM46f` under strategic-minds-advisory, Root Directory `src`.
- Baseline production deployment prior to this test: `dpl_35towmS2gBRZwXibE2rRvTTv8LrF`, target production and aliases `website-launch-engine.vercel.app` and `website-launch-engine-strategic-minds-advisory.vercel.app`. This deployment preexisted the test and was not created by it.
- Staging database already held one earlier `VALIDATED` targeted Railway canary and two historic WLE queue records; fresh read-back after test: `wle_targeted_canary_results=1`, `wle_queue_count=2`, `QUEUED=0`, `BUILDING=0`. No new database job or receipt was inserted.

## 2. Synthetic provisioning execution

- Mission marker: `WLE-X1-STAGING-SMOKE-20261011-004`. Fictional static template only; corrected standalone links to verified business studio `https://website-launch-engine.vercel.app/studio.html` (GET 200). Phone links remain `tel:+17722090266`.
- First PREVIEW attempt `dpl_4seRaV6vdorZVHMn3Zt3szxnmSR5`: `ERROR`; Vercel build logs returned `NOW_SANDBOX_WORKER_ROOTDIR_NOT_EXIST`: Root Directory `src` not present when uploading `index.html` and `vercel.json` at repository root. Target preview/null, aliases none; **not a successful site**.
- Scoped repair: upload `src/index.html` and `src/vercel.json` within the same existing project. No project Root Directory change, no prod aliases, no credential operations.
- Successful PREVIEW deployment `dpl_H6odDqWV61Kd2qxuj4yjwVXER2uj`, state `READY`, target `null`, alias `[]`.
- URL: https://website-launch-engine-nge9i9dpo-strategic-minds-advisory.vercel.app/
- Independent Vercel GET: HTTP 200, `X-Robots-Tag: noindex, nofollow`, `Cache-Control: no-store`. HTML had expected unique mission marker and fictional brand disclaimer.
- Expected transformed source: 13,260 characters. Served: 13,423. Exactly equal expected source prefix with a **single known 163-character Vercel feedback toolbar** bound to `dpl_H6odDqWV61Kd2qxuj4yjwVXER2uj`. No other drift.
- The Vercel connector, NOT Railway, performed this preview deployment. Never use this receipt to claim end-to-end unattended factory provisioning.

## 3. Independent Cloud Browser and security review

- Cloud Browser `browser_health` returned `ok:true` engine version `3.1.0`.
- Desktop `1440x900`: loaded demo page with correct title and 17 semantic elements; JS errors `[]`, 10 checked network requests HTTP 200, validated real demo Studio and `tel:+17722090266` links.
- Mobile `390x844`: correct title and 12 semantic elements; JS errors `[]`, 6 checked network requests HTTP 200, links valid. Browser sessions were closed with receipts `rcpt_1791743069248_cs7g4n` and `rcpt_1791743071931_qcec96`.
- Screenshot QA could not run because the Cloud Browser screenshots service is missing `BLOB_READ_WRITE_TOKEN` for evidence storage. Visual pixel parity is UNKNOWN, not PASS.
- Supabase staging security review shows `anon` can execute public `SECURITY DEFINER` RPCs `wle_claim_targeted_canary` and `wle_submit_targeted_canary`. Their token/expiry safeguards do not remove the need to restrict privileges before real customer operations. No DB permissions were changed.
- Application API `/api/platform-health` says `supabase:NOT_CONFIGURED`, `railway:ONLINE_WORKERS_NOT_BOUND`, `customerAuth:DISABLED`, `missionSubmission:DISABLED`. Correct fail-closed behavior for customer mission intake.

## 4. Branch-safe defect repair

The active `src/wle-staging-runner/provision-preview.mjs` file manifest was stale: it generated `index.html` and `vercel.json` rather than including `src/`. Following live root-dir failure, changed only the draft PR branch:
1. Library now builds `src/index.html` and `src/vercel.json` in inlined Vercel payloads (commit `7eea94fe2ca8e275732ef736a3b212ceb18d91b1`).
2. Corrected path assertions in offline tests (commit `7ec966bc7d4ce34dab1998d066598242da3ef8fd`).
3. Updated README with current source truth and explicit operator-assisted evidence (commit `2f70a047f179078d4bb7dd13604b66656e9598d3`).
4. **Offline Node test suite/CI on the new Git SHA has not been executed in this run.** The actual Vercel preview build and browser checks validate the fixed file layout, not all library cases or Railway automation.

## 5. Gates, rollback and next action

- Full X1 -> Railway -> Vercel E2E: **BLOCKED** until the exact existing staging worker has an independently built/pinned image, tenant/work-scoped one-use worker privilege, least-privilege Vercel preview deployment reference, and an authorized narrow sandbox service configuration change.
- Do not repurpose consumed capability; do not create a new queue, worker, timer, or global token. Use X1 staging queue/lease/idempotency with separate independent validation.
- No new production release/alias, GitHub main merge, Supabase schema/RLS action, env mutation, raw credential read, external customer communication or paid AI inference occurred during this test.
- Rollback: since the preview has no public aliases, leave it unpromoted and ignore its unique URL. The two deployment IDs are immutable failure/success receipts. For development source, revert the three draft-branch commits; no production rollback is necessary.
- Next: run Node unit tests/CI on branch SHA; security-review and narrowly authorize staging-only Railway/preview credential binding; submit a new scoped synthetic X1 job **only after** worker authentication and safe idempotency are verified. Independently prove a Railway-created Vercel preview and QA receipt before calling automation complete.
