# Website Launch Engine — Production + Supabase/Railway Integration Receipt
**Date:** 2026-10-11
**Operator approval:** "GO AHEAD AND PUSH TO PRODUCTION AND CONNECT TO SUPABASE AND RAILWAY"
**Current status:** PREMIUM WEBSITE LIVE; SUPABASE READ-ONLY LIVE; RAILWAY ONLINE / NOT X1 QUEUE-BOUND.
**No unapproved customer actions executed.**

## Production
- Canonical URL: https://website-launch-engine-xps.vercel.app/
- Vercel team: team_aFdds8lsbHMwe2ip4aQdbQ3d
- Vercel project: prj_70bwCwyXR7yqb0Yicku8rHzRVAZc
- Premium Business Studio deployment: dpl_7zLZWjYUW3SeFW8xir6XmX1Xt38U (first successful release of five HTML files)
- Final production read-only backend deployment: **dpl_3ou9SX8CpMZEhTYbTDDmtrEdwrFi**
- Immediate previous production rollback: **dpl_7zLZWjYUW3SeFW8xir6XmX1Xt38U**
- Five production HTML routes: /, /studio.html, /client.html, /admin.html, /templates/roofing.html all returned HTTP 200. /api/platform-health and /api/health both HTTP 200.
- Approved Florida number: (772) 209-0266. Cinematic design, twenty industries, six featured templates and Business Studio retained.
- Source files deployed from this branch and SHA; production deployment uses direct API files, NOT Git-linked automatic CI/CD.
- Git default branch main not merged.

## Supabase
- Staging project: **uvdkzsbjackpjvpoxtyk** X1 AI Hub Staging.
- Production project: **vgsmyhqqtkkluhypxyua** X1 AI Hub.
- Vercel Preview encrypted env vars: WLE_STAGING_SUPABASE_URL and WLE_STAGING_SUPABASE_PUBLISHABLE_KEY.
- Vercel Production encrypted env vars: WLE_PROD_SUPABASE_URL and WLE_PROD_SUPABASE_PUBLISHABLE_KEY.
- No service-role tokens, private keys or raw credentials written into GitHub or displayed to users.
- /api/platform-health pinned to exact Supabase hostname based on VERCEL_ENV, calls Auth health endpoint, no tenant data read and no writes.
- Preview GET /api/platform-health: mode=staging_read_only, supabase=CONNECTED_STAGING, all customer operations DISABLED.
- Production GET /api/platform-health: mode=production_read_only, supabase=CONNECTED_PRODUCTION_READ_ONLY, all customer operations DISABLED.
- Added staging migration wle_staging_integration_registry_and_sealed_drafts_20261011 to create public.wle_integration_bindings (6 receipt rows) and public.wle_studio_drafts (0 customer rows).
- Both staging tables RLS-enabled; explicit grants tested: anon SELECT=false, authenticated SELECT=false, service_role SELECT=true. The draft table also denies INSERT to anon/authenticated.
- Staging backend did not receive customer data. No production schema migration applied.
- Two unrelated existing staging tables (missions and connector_bindings) have broad authenticated ALL policies. Avoid exposing or using these for a tenant portal until reconciled.
- Staging X1 heartbeat exists but observed worker belongs to local mirror execution plane, not proven Railway sandbox consumer.

## Railway
- Existing project Strategic Sandbox System: 15f90272-e2f6-4739-8286-91447f545d71.
- Environment sandbox-orchestrator: service 3fc125a8-295e-4dd2-8a76-c695d911f4d3, deployment ac4cc0d4-3504-4b12-9ab4-c4dc0a30ab8b SUCCESS, 1 running replica, zero recent failures.
- Environment sandbox-code: service f21a857e-bf86-4f84-b478-4df2ff4692c1, deployment 4bc6d191-9067-4dae-9aeb-d932dee7e24f SUCCESS.
- Environment sandbox-social: service c98f95d0-cf86-4b55-a286-0175d2c7d3cb, deployment 72294e4c-ce8b-4ee8-8c8a-34d5eb65796a SUCCESS.
- **Blocker:** These workers run Strategic-Minds-AI/super-agents /local-worker/worker.js, commit 2b830ecfb74a13e28e840bdf36a1f59f013c4dad; the exact worker source uses APP_URL, WORKER_SECRET and polls application functions, with legacy Base44 default fallback. No runtime authenticated X1 queue consumption or bound WLE mission observed.
- No public service domain on orchestrator. Do NOT reconfigure live APP_URL, consume a live queue or activate a duplicate worker until transport and tenant/approval auth are validated.
- Supabase staging integration registry records all three Railway services as ONLINE_UNBOUND and customer_operations_enabled=false. This is discovery, not a live Railway queue connection.

## Vercel Production Independent Smoke
- READY, target=production, aliases include canonical website-launch-engine-xps.vercel.app.
- Live browser desktop 1440 and mobile 390: Studio seven tabs, JS errors []; marketing homepage 20 industry tiles / 6 templates, JS errors []; premium roofing sample 390 JS errors [].
- /api/platform-health production returned CONNECTED_PRODUCTION_READ_ONLY, railway=ONLINE_WORKERS_NOT_BOUND, customerAuth=DISABLED, customerData=DISABLED, missionSubmission=DISABLED, socialPublishing=DISABLED, mediaGeneration=DISABLED.
- /api/health returned scaffold_only. /api/missions GET returned 405 (method rejected); POST not independently executed.
- Browser screenshot backend remains unavailable due missing storage configuration. Pixel-level fidelity certification still UNKNOWN.
- Node unit test source is committed but these latest API unit tests were not independently executed; do not misreport as PASS.

## Required to complete requested full Railway connection
1. Reconcile Railway worker source and exact X1 enqueue/lease/finish RPC contract; do not redirect legacy worker to a fail-closed endpoint.
2. Write a branch-safe Railway/X1 adapter with service-to-service auth, per-tenant scope, signed work packets and no exposed customer secrets; dry run with synthetic tenant in staging.
3. Independent negative RLS tests, dedup/idempotency, lease timeout, bounded retry/dead-letter, cancelled job and approval state tests.
4. Observe an actual synthetic WLE mission lease, website preview URL, independent validator and signed receipt.
5. Only then request scoped approval for runtime queue activation and customer portal authentication.

## Release-gate / rollback
- Protected: default-branch merge, production DB schema/RLS, service-role credentials, Railway service configuration, paid AI generation, social posting/replies, real customer messages and external publishing. None activated here.
- Restore production deployment dpl_7zLZWjYUW3SeFW8xir6XmX1Xt38U if the new read-only API causes regression.
