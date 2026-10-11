# X1 Website Launch Engine staging runner

## Source of truth
- Canonical: Strategic-Minds-AI/website-launch-engine
- Original one-shot runner: worker.mjs
- Synthetic source: fixtures/roofing.html (fictional sample; noindex)
- New scoped fresh-preview library: provision-preview.mjs
- Container recipe: Dockerfile (build input, not a built or deployed image)
- X1 staging Supabase only; do not use X1 production or customer records

## Validation
Run from this directory on Node 22+: npm test. The new preview library tests are offline/fake-fetch tests. A real operator-assisted Vercel preview was separately created on 2026-10-11: dpl_2KNwWsRj9nBZRAoyxy6WY1GhjHc3, URL https://website-launch-engine-93x0z77dy-strategic-minds-advisory.vercel.app/ . Its status and HTML/robots guards were independently read back. It was **not** created by the Railway worker.

Build recipe (requires locally available Docker):
  docker build -t wle-staging-runner:review -f Dockerfile .

## Fail-closed deploy constraints
- Existing Railway staging worker: project 15f90272-e2f6-4739-8286-91447f545d71; environment sandbox-code; service agent-worker b0162c7b-c387-4921-9dd1-145b0dae0793.
- Original legacy worker-sandbox-code stays untouched. No new queue/cron/supervisor.
- The previous Railway startCommand contains temporary inline source. Do not replace it until there is a reviewed, independently built and digest-pinned image and an authorized narrow staging service configuration patch.
- This Dockerfile does not activate a new worker. The existing one-shot capability is already consumed/revoked. Running the container without a new approved per-work capability must fail closed.
- **Live corrected inlined API contract (2026-10-11):** the Vercel project Root Directory is `src`; the `files[]` manifest must include `src/index.html` and `src/vercel.json`. Sending root-level `index.html`/`vercel.json` failed with `NOW_SANDBOX_WORKER_ROOTDIR_NOT_EXIST` (deployment `dpl_4seRaV6vdorZVHMn3Zt3szxnmSR5`), while `src/index.html`/`src/vercel.json` produced `READY`, target preview/null and HTTP 200 (deployment `dpl_H6odDqWV61Kd2qxuj4yjwVXER2uj`). Earlier historical READY/404 observations are superseded by this verified current configuration; reverify after any Root Directory change.
- The new tested preview was provisioned **by an operator-authorized Vercel tool**, not by the Railway service. The worker still needs a reviewed build, per-work capability and preview-only credential binding before claiming full X1 queue to Railway to Vercel automation.
- The Vercel deployments API rejects target="preview"; omitting target creates a preview with target=null. This was verified on an actual nonproduction deployment. Never pass target=production.
- Require exact tenant, work ID, source SHA, one-use short-lived privilege, preview-only action class, authorized deploy credential in secret storage, scoped egress, idempotency, quota, and independent validation.
- New library functions can only prepare a synthetic fictional noindex preview, POST one preview deployment, and compare a live response with expected bytes; they do not purchase domains, create customers, authorize production, or complete the X1 job/lease.

## Remaining gates
1. Independent build/tests on the final GitHub SHA (CI results or supervised sandbox).
2. Least-privilege Vercel preview deploy credential binding, with explicit scoped approval.
3. Immutable worker image digest + SBOM/supply-chain review + independent security validation.
4. Adapt existing X1 scoped capability/RPC contract for distinct *new* preview URLs and per-work lease/idempotency, without creating a second queue.
5. One actual Railway-initiated preview deployment with exact receipt and failure-path tests.
6. Separate independent browser/functional/visual QA. Pixel parity stays UNKNOWN without usable screenshots.
7. Production branch/project convergence by operator-approved release only. GitHub main is README-only and may overwrite the currently working second Vercel production project if used for auto-deploy.

## Evidence
- Original one-shot: docs/WLE_RAILWAY_X1_ONE_SHOT_VERIFIED_20261011.md (on previous staging-canary branch)
- New staged work: docs/WLE_FRESH_PREVIEW_STAGE_20261011.md
- No production deployment/merge, customer operations, spend, or secret changes were authorized by this artifact.
