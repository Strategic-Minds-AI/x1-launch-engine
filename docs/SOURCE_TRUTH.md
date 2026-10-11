# Website Launch Engine — Source Truth and Provenance

Date: 2026-10-11
Product owner: Strategic Minds AI
Product: Florida-based Website Launch Engine — (772) 209-0266
Primary repository: `Strategic-Minds-AI/website-launch-engine` (PRIVATE)
First implementation branch: `feature/source-recovery-and-backend-foundation`
**The production website has not been linked to this repo and MUST NOT be auto-switched to Git deploys without a separate approval.**

## Approved public experience
- Current production: https://website-launch-engine-xps.vercel.app/
- Production Vercel project: `prj_70bwCwyXR7yqb0Yicku8rHzRVAZc`
- Immutable production deployment source: `dpl_7FngG6jRrZ5agcvkB7kdwQsgEaCi`
- Approved premium preview: https://website-launch-engine-joj4ni51v-strategic-minds-advisory.vercel.app/
- Premium preview deployment: `dpl_7LKDgSf1HnwR24HjLxQgWjKV1VjA`
- Admin preview: /admin.html
- Client preview: /client.html
- Premium hero, mountain background, font enlargement, template browsing, industry gallery, Florida copy, and phone are visually LOCKED; do not rewrite them into generic designs.
- Six newly generated concept images are **approved direction**, not automatically proof of installation. Four original industry images and six exported mockups were assembled separately; verify assets before adding to repo.

## Recovered files and source authority
1. `snapshots/production-2026-10-10/index.html` is frozen rollback reference.
2. `src/index.html`, `src/admin.html` and `src/client.html` are the preview-ready frontends recovered from the Vercel deployment.
3. `src/api/` is a proposed nonproduction, deny-by-default API foundation. It is NOT an operational authenticated backend.
4. Developer commands and migration materials are subordinate to this approved source truth.
5. Previous `XTREME-SYSTEMS/digital-dominance` branch remains a donor, not the canonical site repository.

## Architecture boundary
ChatGPT/APEX -> tenant-authenticated Website Launch Engine API -> existing Supabase authority/queue -> existing isolated Railway sandbox -> independent validator -> receipts -> operator release gate.
No extra heartbeat, unsanctioned production credentials, privileged default-branch merge, public customer messaging, DNS mutation, or production deployment.

## Proof requirements before backend claims
- Exact project and environment identity
- Supabase auth and row-level isolation tests across two tenants
- Persisted mission IDs, leases, idempotency keys, bounded retry and rollback receipts
- Website builder deployed output with honest real URLs, including mobile/desktop QA
- Independent reviewer distinct from implementer
- Production approvals tied to immutable deployment and SHA

The existence of this repository, browser interface, or 200 response does not demonstrate autonomous site provisioning.
