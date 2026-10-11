# APEX Builder Studio / Production Sandbox Mission Receipt
Date: 2026-10-11
Mission: WLE-APEX-VISUAL-BUILDER-SANDBOX-001
Release state: PREVIEW_READY, PRODUCTION_CONTROL_BLOCKED.

## Canonical identity
Repository: Strategic-Minds-AI/website-launch-engine
Branch: feature/agent-visual-builder-sandbox-control-v1
Vercel Preview: https://website-launch-engine-6eh2oykvs-strategic-minds-advisory.vercel.app
Admin Builder: /admin/builder.html
Preview deployment ID: dpl_DMYQ6TVc3ikWAxfXxz3EdfoaVkUv, READY.
Public production baseline (not changed): dpl_3ou9SX8CpMZEhTYbTDDmtrEdwrFi, https://website-launch-engine-xps.vercel.app.
Approved corporate design and phone (772) 209-0266 preserved.

## Delivered (actual code)
- src/admin/builder.html: three-panel premium Chat + Visual Editor; local deterministic chat instructions; live iframe website editing/selection; undo/redo; desktop/tablet/mobile modes; standalone HTML export.
- Existing src/admin.html preserved except new visual builder navigation link.
- Editor built-in approval-first provisioning work packet: industry, quantity, domain, verified business requirements; downloadable JSON; no job dispatched.
- Geography planner for city/county/state, 1-10 unique entries per preview batch with duplicate rejection; generated topic variations, JSON plan, ZIP archive with actual HTML draft pages and noindex meta. No scraped content or fake local office.
- Google SEO controls: owned-domain HTTPS check, unique-content attestation, gated export sitemap.xml and robots.txt for verified homepage only; no draft locality pages in indexable sitemap.
- src/lib/site-maps.js: reusable canonical sitemap shard generator, 50k URLs and 50MB per file, only validated indexable URLs, canonical origin same-host enforcement, XML escaped; Node test source present (not executed).
- GoDaddy domain search handoff; no reservation, purchase, billing or DNS changes.
- Google Business Profile eligibility/intake and downloadable draft; not a verified Google profile nor an authorized API call.
- src/api/sandbox/control.js: production-safe fail-closed remote sandbox status; GET 200, remoteWorker=NOT_BOUND, auth=NOT_CONFIGURED, isolation=NOT_ATTESTED; POST/PATCH/PUT/DELETE return 403. Unit test source committed but not executed.
- docs/APEX_SANDBOX_VISUAL_BUILDER_V1.md: security requirements for real production-grade sandbox, Google integrations, compliance and proof gates.

## Live tests and evidence
- Vercel preview deployment dpl_DMYQ6TVc3ikWAxfXxz3EdfoaVkUv READY. /admin/builder.html, /admin.html, /api/sandbox/control return HTTP 200. Public production still points to prior deployment.
- Browser 1440x900, 390x844: builder loaded and chat entry displayed; errors [].
- Browser 1440: chat entered "Set headline to Premium Florida Roofing Solutions"; response confirmed change; Undo/Redo click succeeded; mobile-preview toggle succeeded; 10 South Florida plan generated, SEO release safety correctly blocked; no console JS errors.
- Browser 1440: provisioning packet created (quantity 1); GBP eligibility check correctly denied absent ownership/facts; ZIP download handler click succeeded; SEO release blocked until verified domain; no JS errors.
- Browser 390: county duplicate entries correctly rejected; follow-up valid county confirmation was blocked by browser automation provider safety gate (UNKNOWN), not falsely passed.
- Zip button triggered with no reported JS errors, but archive bytes/CRC and downloaded ZIP content were not independently retrieved/verified.
- Screenshot capture failed with HTTP 500 due missing BLOB_READ_WRITE_TOKEN. Visual pixel parity, WCAG audit and Core Web Vitals unknown.
- Backend POST denial was verified by source but not independently invoked over HTTP; do not claim an executed POST test.
- Node tests for sandbox API and sitemap shard generator were authored, not run against this Git SHA.
- No production merge/deploy, external customer messages, Google property creation, domain purchase, Google Business Profile creation or social posting occurred.

## Integration discovery
- Live existing Supabase X1 Staging/Prod read-only health verified in previous mission.
- Existing Railway orchestrator/code/social workers ONLINE, but their source still polls legacy Base44 APP_URL; no authenticated X1 tenant mission processing bound to WLE.
- GSC Wizard list_sites and list_ga4_properties calls returned payment_required subscription errors. OAuth/property access remains UNVERIFIED. Do not use data from unrelated Google account.
- GoDaddy read-only domain availability successfully checked in existing connected tool. No checkout action.
- Google Business Profile official eligibility and business verification required; cannot mass-create business profiles by city.

## Remaining guarded work packets
WLE-SB-001: tenant-safe authentication, authorization, roles and Supabase RLS negative tests
WLE-SB-002: sandbox worker runner isolated per tenant, restricted network/FS, bounded budget/retries and lease TTL
WLE-SB-003: migrate legacy Railway code polling to authorized X1 queue on staging-only branch; verify one synthetic site build
WLE-SB-004: Google OAuth for tenant GA4/GSC property mapping, real sitemap submission + crawl/index proof
WLE-SB-005: guarded GoDaddy quote→approval→purchase/DNS, with idempotency and refund/rollback plan
WLE-SB-006: official eligible Google Business Profile intake/verification workflow; no fake location listings
WLE-SB-007: independent desktop/mobile screenshot, security/SSRF, E2E, WCAG, CWV, signed validator receipts
WLE-SB-008: owner approves exact SHA/deployment; protected production control activation

## Rollback and blockers
Unchanged production: dpl_3ou9SX8CpMZEhTYbTDDmtrEdwrFi. Preview can be reverted to Git parent branch feature/wle-supabase-railway-staging-bridge-20261011.
Release blocker: open admin currently demo unauthenticated. A production remote executor cannot be exposed to that interface. Screenshots blocked by browser storage; Google connector requires subscription; real worker queue not bound.
