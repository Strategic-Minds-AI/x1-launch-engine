# WLE Secure Inquiry Repair | Development Candidate | 2026-10-12

## Verified scope

This is a reversible **development-branch** repair to the pinned approved Website Launch Engine marketing design, source SHA `aed388468f17916f43a2ccc593981e4fbf1e8603`. It addresses read-only browser audit finding `WLE_CONTACT_MAILTO_ONLY` by preparing an authenticated-server-bound, fail-closed inquiry path. It does **not** activate real lead intake.

- Preserves original premium art, 20 industries, layout, phone `tel:+17722090266`, and the approved page composition.
- The contact form POSTs only to same-origin `/api/inquiry`. The button is disabled during submission; a stable UUID avoids accidentally generating different request IDs after a timeout. It reports success only after a server-side persisted receipt. If unavailable, the UI explicitly tells the visitor that submission is **not confirmed**, and presents a manual phone or email contact option. No email or SMS is sent automatically.
- The server rejects HTTP GET, cross-origin, unexpected host, bad media types, oversized payloads, unknown industries, unrecognized fields, tenant injection, honeypot failures and malformed data.
- All server-side Supabase fetches use the **exact** X1 staging host and a tenant ID from trusted runtime configuration, not from the browser. The only allowable table is `wle_lead_inquiries`. The separate `public.website_leads` table is configured for **Phoenix Epoxy Coatings** and MUST NOT be reused for WLE.
- The server uses a unique `(tenant_id, request_id)` key and reconciles uncertain POST outcomes through an independent GET of the stored row, comparing **content** as well as the ID. No PII is returned to the public caller or included in structured server logs.
- The backend is disabled by default, and it is staged-only: `VERCEL_ENV=preview` plus verified origin, bounded tenant, explicit WLE feature flag, server secret binding and independently verified rate limiter are ALL required.

## Test evidence

- Local JARVIS command: `node --test tests/inquiry.test.mjs`, and `node --check src/api/inquiry.js`.
- Local headless browser: `tests/browser-qa.mjs` using a verified Chrome binary and the approved source snapshot at the explicit `WLE_BASELINE_DIR`.
- Browser QA checks desktops 1440x900, tablet 768x1024, mobile 390x844, real Chrome screenshots, the twenty-industry select, telephone links, overflow, runtime page errors, and *negative* form submit against a **local 503 stub**. It NEVER contacts a customer or Supabase.
- Screenshot pixel comparison is **initial viewport only**, not measured full-page visual parity. External imagery, platform banners and dynamic content may differ in a deployed preview.
- Unit HTTP mocks are NOT evidence of a real Supabase write. Browser stub is NOT evidence of a real customer intake.
- CI workflow in `.github/workflows/wle-secure-inquiry-qa.yml` runs tests without credentials; status is UNKNOWN until GitHub Actions reports on the exact branch commit.

## STRICT PROTECTED ACTIVATION HOLD

The following actions are NOT performed by this candidate and require an exact staged approval, authority confirmation and independent readback:

1. Provision WLE-dedicated `public.wle_lead_inquiries` using an official migration prepared from `docs/WLE_STAGING_LEAD_SCHEMA_DRAFT.sql`. This draft is **not executed**. Verify Supabase project `uvdkzsbjackpjvpoxtyk`, RLS deny-by-default, `anon`/`authenticated` privilege revocation, service-only access, tenant uniqueness and rollback before applying.
2. Bind existing server-only Supabase credentials without displaying values. Stage env variables `WLE_STAGING_SUPABASE_URL`, `WLE_LEAD_TENANT_ID`, `WLE_LEAD_SERVICE_ROLE_KEY`, `WLE_LEAD_ALLOWED_ORIGIN` plus `WLE_LEAD_INTAKE_ENABLED`; require a separately VERIFIED edge/perimeter abuse throttle before `WLE_LEAD_RATE_LIMIT_VERIFIED=true`.
3. Activate a **single synthetic, no-customer-data** preview inquiry first. Independently confirm the stored row under the WLE table, matching tenant/request ID/contents and generated receipt. Do not send notifications to real customers. No real customer intake until full auth/abuse/privacy tests and further approval.
4. X1's separate synthetic *website generator* canary still needs missing `wle-synthetic-preview-only` capability registration and a scoped Railway preview-worker feature activation. Draft X1 PR #11 remains unmerged; a form test is NOT a website-generation test.
5. Production releases, protected branch merges, secrets, permissions, DNS, payments, public posting and customer messages remain separate protected actions.

## Rollback and release

- Do not merge this draft PR. Closing it leaves the approved WLE production source and its mailto form unchanged.
- The proposal does not alter X1 staging or production RLS, schema, tables, grants, credentials, queues, leases, workers, crons, email/SMS, DNS or production Vercel deployments.
- In future, after approved schema and staged activation, disable `WLE_LEAD_INTAKE_ENABLED` first and verify the form reports unavailable instead of dropping requests. Reconcile the idempotency receipts before any data removal.
- Preserve `WLE_ONE_COMMAND_AUTONOMOUS_FINISH_V1_20261011.md` and all previous WLE receipts. The QA requirement for a full generated synthetic website remains pending.
