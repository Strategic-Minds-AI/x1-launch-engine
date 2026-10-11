# WLE Customer Staging Auth Activation Gate
Date: 2026-10-11 | Status: PREVIEW CODE PREPARED, ACCOUNT ACTIVATION BLOCKED

## Provider source truth (rechecked)
- Canonical GitHub: Strategic-Minds-AI/website-launch-engine, existing draft PR #10, branch feature/wle-business-creative-studio-20261011, base release/wle-pinned-production-source-20261011.
- Tested code SHA 884b233c3183bb1605d42c34b1ee65b37d0f330d. Vercel preview deployment dpl_3Py55zZWasayERSZJxFjmi14JGc7 is READY, preview only, no production alias.
- Entry: https://website-launch-engine-k9wyxiyni-strategic-minds-advisory.vercel.app/client.html#Creative%20Studio
- Supabase staging: uvdkzsbjackpjvpoxtyk, NOT Supabase production vgsmyhqqtkkluhypxyua.
- Staging row counts: auth.users 0; x1_tenant_memberships 0; wle_studio_drafts 0. The existing x1_tenants, x1_tenant_memberships and wle_studio_drafts use service-role-only RLS and explicit service-role table grants.
- Verified status and kind constraints: ACTIVE tenant/member; draft kind business_card, status DRAFT.
- Only one private Storage bucket exists: artifact-staging, max file size 1GiB, unrestricted MIME; storage.objects has no policies. It is NOT appropriate for private customer photos.
- Supabase Security Advisor still reports two anon-executable SECURITY DEFINER canary RPC warnings. Official remediation: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable

## Branch implementation (disabled until explicitly approved)
- src/api/_internal/wle-customer-session.js: compiled SERVER-side helper with hardcoded staging host, VERCEL_ENV=preview and dedicated feature switch WLE_CLIENT_STAGING_AUTH_ENABLED=true. Privileged keys never sent to the client.
- src/api/client/session.js: verifies Supabase Auth identity and active X1 membership.
- src/api/client/login.js: password sign-in only for existing invited users, HTTP-only Secure SameSite=Strict cookies, same-origin JSON POST checks. No signup, reset-email, OAuth or automated messaging.
- src/api/client/logout.js: local-scoped remote session-revocation attempt and transparent status on provider uncertainty.
- src/api/client/drafts.js: existing service-role-only business_card drafts, role gates, required owner/tenant, strict payload whitelist, insert-ignore then tenant/user-filtered update to avoid privileged upsert races.
- src/client.html and src/client-auth.js: approved white-and-navy existing customer admin with a sign-in gate only when staged Auth is configured, no second customer dashboard.
- src/creative-studio.js: explicit customer Save / Load buttons, hidden until same-origin authenticated tenant selection. Photos stay device-local.
- Vercel CSP allows same-origin draft requests only.
- Sensitive server-side helper was removed from static src/_internal and moved to src/api/_internal; old public URL and direct helper route both return HTTP 404.

## Independently verified tests at the exact tested source SHA
- Node 24, synthetic/mocked Supabase, authorized JARVIS-COMMAND workspace: 11/11 tests PASS, 0 failures. Test source: tests/wle-client-auth.test.mjs. Includes disabled-by-default gate, production denial, input/origin checks, active membership requirement, two-tenant cross-access denial, viewer edit denial, draft insert/update idempotency scope, invalid profile, logout revocation request.
- Real headless Chrome on Vercel preview at 1440x900 and 390x844: 16/16 checks PASS, 0 failures. Tested browser-local card QR, five real file exports, transparent PNG alpha, vCard, brochure PDF, sanitized project-image upload, selected mobile navigation, side-by-side desktop preview, and hidden account/save controls before staging activation.
- Vercel GET /api/client/session returns 503 STAGING_CUSTOMER_AUTH_NOT_CONFIGURED with customerDataAccepted=false. Draft API GET also 503. GET login returns 405. Old server helper source URL returns 404, direct API helper 404.
- JARVIS readback QA: C:\_Strategic_Minds_AI_OS\49_WEBSITE LAUNCH EGINE\QA_NONPROD_20261011\secure_client_tests\tests\wle-client-auth.test.mjs and parent cdp-qa-receipt.json / screenshots / downloads.
- These are MOCK authorization tests, not real 2-tenant RLS proof. No new staging user, memberships, storage policies, secret changes, outbound messages, worker, production deploy or merge.

## Blockers and proposed protected activation
Fresh scoped operator approval is required before any staging credential/permission/user change:
1. Scope ONLY Supabase staging uvdkzsbjackpjvpoxtyk and WLE project prj_JbkX4yKWygqBFRhkHL6nbeQXM46f, selected preview branch. Configure branch-only server-side WLE_STAGING_SUPABASE_URL, WLE_STAGING_SUPABASE_PUBLISHABLE_KEY, WLE_STAGING_SUPABASE_SERVICE_ROLE_KEY and explicit WLE_CLIENT_STAGING_AUTH_ENABLED=true through secure provider UI. No values in ChatGPT, git or logs, no production credentials.
2. Review two anon-executable privileged RPC warnings with Guardian. Revoke/repair only after separate scoped database-permission approval and validation.
3. Create exactly two fictional Supabase Auth users using the supported administrative Auth API, and two synthetic test tenants with ACTIVE memberships in shared existing X1 tables. No real customer invites or messages.
4. Independently verify login, logout, refresh, role-revocation and cross-tenant negative tests against live staging, including two-tenant drafts and idempotency.
5. Only after scoped Storage permission approval: provision a dedicated private WLE client media bucket with <=5 MiB size and PNG/JPG/WebP whitelist, tenant+owner RLS, short signed URLs, content rights/consent, quotas, delete tests and strict cross-tenant denial. The general artifact-staging bucket must NOT be used for customer images.
6. Guardian/Fault Line independently rechecks secrets, RLS, session revocation and browser behavior before any account activation.
7. Separate later approval required for default-branch merge, production release, production database/storage, DNS, payments, customer messaging and customer-data collection.

## Rollback and next action
Rollback: close/revert draft PR #10, retain production GitHub main and current Vercel production deployment unchanged. No production rollback is needed.
NEXT SAFE ACTION: leave staged login disabled; obtain explicit staging-only Auth/Storage test approval before any provider changes or real account acceptance. Full customer launch remains BLOCKED; the frontend and authorization code are PREVIEW-VALIDATED, not live.
