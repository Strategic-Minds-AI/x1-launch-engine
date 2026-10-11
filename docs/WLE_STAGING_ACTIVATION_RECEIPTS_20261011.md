# WLE Staging Auth + Private Media Activation Receipts

DATE: 2026-10-11 | GOVERNANCE: operator approved STAGING ONLY, no production release

## Source of truth and scope
- GitHub canonical repo: Strategic-Minds-AI/website-launch-engine.
- Existing open draft PR #10, branch feature/wle-business-creative-studio-20261011; base release/wle-pinned-production-source-20261011; no merge.
- Authorized data provider: X1 AI Hub Staging project uvdkzsbjackpjvpoxtyk, not production.
- Vercel project prj_JbkX4yKWygqBFRhkHL6nbeQXM46f, branch-scoped Preview credentials only. No raw secret was decrypted, printed or written to GitHub.
- WLE_CLIENT_STAGING_AUTH_ENABLED remains disabled until two independent real sign-ins and tenant/role negative tests pass.

## VERIFIED changes applied in STAGING
- Supabase migration: wle_staging_private_media_isolation_20261011, migration version 20261011230212.
- New private bucket: wle-client-private; public=false; maximum per object 5242880 bytes; image/png, image/jpeg, image/webp only.
- Three storage.objects policies, all targeted to the named bucket and role authenticated: wle_private_media_select_20261011, wle_private_media_insert_20261011, wle_private_media_delete_20261011.
- Namespace wle_private; SQL helper can_access_client_media(text,boolean) uses current auth.uid, active X1 membership, active X1 tenant and role for write authorization. SECURITY DEFINER with empty search_path, PUBLIC and anon function execute revoked; authenticated execute permitted. No existing X1 table grants, RLS, queues, workers or schedulers modified.
- Two synthetic tenants created by generated UUID, ACTIVE and separate from existing x1-preview-system:
  - wle-qa-a-20261011: e8154f7a-633c-4e8d-8c04-54eaf6f15527
  - wle-qa-b-20261011: 8c352348-ef78-4080-8186-c6df4e6d1b5e
- Existing X1 preview tenant preserved unchanged.

## Security testing
- SQL simulated authenticated identity with NO active X1 membership: can_access_client_media(read)=false; can_access_client_media(write)=false.
- Function ACL readback: anon_executable=false; authenticated_executable=true.
- Bucket configuration independently read back. Authenticated role still has Storage object SELECT/INSERT/DELETE grants; per-bucket row access is controlled by explicit RLS.
- Security advisors after migration: two existing anon-executable definer canary function warnings and one leaked-password-protection warning. No new warning introduced by WLE private media migration. Do not change unrelated X1 canary access without separate scoped approval.
- GitHub server-only Auth helper updated for both modern sb_secret_ (apikey-only) and legacy service_role JWT (Bearer). No credential material committed.
- Isolated Node24 mocked auth/session/tenant tests executed on authorized JARVIS-COMMAND: 13/13 PASS, zero failures.
- Prior real Chrome Preview suite for unchanged creative UI: 16/16 PASS at 390x844 mobile and 1440x900 desktop. Need rerun on final code deployment and reverify console.

## COULD NOT VERIFY / staging activation blockers
- Supabase staging now has 1 pre-existing Auth user, 3 tenants including 2 WLE synthetic, zero tenant memberships, zero WLE drafts. Existing Auth user was not modified.
- Two synthetic Supabase Auth users have NOT been created. Connected Supabase management tools expose DB/migrations but no supported Auth Admin createUser. An authorized external Supabase Dashboard session is not signed in. Do NOT insert directly into auth.users; do NOT expose temporary unauthenticated provisioning APIs.
- Existing independent Xtreme Team auditor and deployer routes returned 402 monthly integration limit; do not purchase plans or imply independent Guardian PASS.
- Public customer login flag must remain disabled. No verified positive login, two live user identities, real cross-tenant denial or live upload/download test.
- Media UI still holds images locally. Bucket and policies are ready but customer-upload flow is not yet end-to-end operational.

## Exact next step (requires authenticated Supabase Dashboard or Admin Auth connector)
1. In Supabase staging Authentication > Users, choose Add user > Create new user (NOT Invite user), and create exactly two fictional users, using wle-qa-a-20261011@example.test and wle-qa-b-20261011@example.test; use strong distinct randomly generated passwords stored only in the operator password vault, confirm email administratively without sending any email. Do not paste passwords or keys into ChatGPT.
2. Recheck IDs and exact email match through metadata-only Supabase read; attach each synthetic user ONLY to its designated existing WLE test tenant as CLIENT or OWNER with ACTIVE status using authorized staging DB migration/insert.
3. Validate authentication provider configuration and credentials without exposing values; if correct, set branch Preview WLE_CLIENT_STAGING_AUTH_ENABLED=true, redeploy Preview only.
4. Independently run positive owner sign-in, viewer denial, cross-tenant access denial, membership revocation, session logout, real storage MIME/size/ownership negative tests, then browser regression and Guardian review.
5. Obtain separate production-source merge, DB, env and Vercel promotion permission ONLY if all gates PASS. No production, DNS, payments, customer messaging or public social changes authorized in this phase.

## Rollback scope
- Code rollback: close/revert draft PR #10. Production Vercel deployment dpl_35towmS2gBRZwXibE2rRvTTv8LrF remains unchanged.
- Staging rollback (operator permission before destructive cleanup): delete only the two named WLE synthetic tenants after verifying no attached test users/drafts; remove only WLE private media Storage bucket after verifying it has no objects; drop only WLE-prefixed Storage policies and private schema function. Do not touch shared X1 records or any production resource.

## Post-deployment independent browser readback
- Vercel Preview-only deployment dpl_EPykVnDDYV6Tb4UVJSckYs1zBaGS; READY; target null; current source SHA e50d9dec1d0176af88382a9e5160abd2fe56106b; branch feature/wle-business-creative-studio-20261011.
- URL: https://website-launch-engine-4trencgrk-strategic-minds-advisory.vercel.app/client.html#Creative%20Studio
- API /api/platform-health HTTP 200 with staging_read_only, supabase=CONNECTED_STAGING, customerAuth=DISABLED, customerData=DISABLED.
- API /api/client/session HTTP 503 STAGING_CUSTOMER_AUTH_NOT_CONFIGURED, customerDataAccepted=false.
- Server helper static URL /_internal/wle-customer-session.js HTTP 404.
- Real Chrome DevTools Protocol Browser QA rerun on EXACT Vercel preview SHA at 390 mobile and 1440 desktop: 16/16 PASS, no JS exceptions. Includes QR privacy, actual PNG/SVG/vCard files, transparent PNG alpha, brochure PDF, mobile navigation and desktop side-by-side editor.
- Node 24 local mocked Auth/tenancy/key-format tests: 13/13 PASS on executable code SHA b54a6b157bb1e7529b0c0d9ee65f19865d49db80. Subsequent GitHub changes are documentation only; source still same.
- GitHub main and production Vercel deployment dpl_35towmS2gBRZwXibE2rRvTTv8LrF unchanged.
