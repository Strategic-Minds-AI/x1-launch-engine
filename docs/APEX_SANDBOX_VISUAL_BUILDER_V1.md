# APEX Site Factory Sandbox / Admin Builder V1
Date: 2026-10-11 | Branch: feature/agent-visual-builder-sandbox-control-v1
Scope: PREVIEW WRITE ONLY. Production site preserved until visual acceptance.

## Verified before build
- Approved production Vercel WLE: dpl_3ou9SX8CpMZEhTYbTDDmtrEdwrFi, project prj_70bwCwyXR7yqb0Yicku8rHzRVAZc.
- Canonical GitHub private repo Strategic-Minds-AI/website-launch-engine.
- Supabase X1 Staging uvd... with existing x1_work_queue, leases, receipts and six WLE integration entries. The staging draft table is RLS sealed and has zero records.
- Railway Strategic Sandbox System project 15f90272-e2f6-4739-8286-91447f545d71. Orchestrator online but worker.js polls legacy app functions via APP_URL/WORKER_SECRET; X1 queue bridge not proven.
- GSC Wizard (both Search Console and GA4 list) currently payment_required subscription error.
- GoDaddy domain availability tool is connected and was used read-only; registration and payment not approved.
- Google Business Profile API requires provider access/verified real business; mass artificial office profiles prohibited.

## Implemented in preview
- /admin/builder.html independent premium chat + visual editor, connected from old admin sidebar.
- Locally running iframe srcdoc website renderer and click-to-edit headline/name/description/CTA. All selected fields and palette controls produce actual standalone HTML export.
- Deterministic chat controls (NOT an LLM or Manus/OpenClaw remote agent): commands for title, business, CTA, subtitle, color, and navigation to SEO/replicator/domain/sandbox tabs.
- Undo/redo; desktop/tablet/mobile preview.
- Regional page planner 1-10 distinct City, State entries with duplicate rejection and JSON export, permanently marked DRAFT until independent real local facts verified.
- SEO control: ownership and unique-content affirmations, absolute HTTPS canonical URL, downloadable sitemap.xml and robots.txt for one eligible homepage; all location draft URLs excluded from public sitemap.
- GoDaddy domain search opens external registrar; does not purchase, reserve or change DNS.
- Sandbox API GET reports true capability flags; all mutations return 403.
- Supabase production/staging read-only health remains available via /api/platform-health.
- No new cron, queue, worker, secret, production schema or external account provisioned.

## Production-grade sandbox design (REQUIRED, NOT YET IMPLEMENTED)
Control: authenticated Admin → WLE API → tenant, role + budget authorization → immutable WorkPacket with content/SHA/desired edits/rollback → existing X1 staging queue → signed worker lease → ephemeral isolated executor (unprivileged UID; deny ambient credentials; restricted egress; CPU/memory/time cap; seccomp/no privileged container; readonly base image; safe-volume TTL) → Vercel preview branch → independent QA → immutable receipt → approval → protected production.
Never grant arbitrary shell or browser access to customer workspaces by default. File/browser/terminal capabilities must have explicit per-mission least-privilege permissions and human override. Dedup/idempotency/cancel/dead letter. No access to JARVIS visible desktop.
Before activation validate container boundary, SSRF, network policy, malicious prompt boundaries, cross-tenant isolation, domain controls and rollback. Do not self-certify.

## Simplified admin flow
1. Select industry design or chat "Set headline to..." / click to edit.
2. Review live responsive preview; export HTML and version.
3. Add cities/counties/states with verified factual differentiation, export nonindex preview plan.
4. Obtain domain choice/availability from authorized registrar, scoped purchase approval per quote, then DNS binding approval.
5. Generate SEO pack (robots, verified sitemap, canonical, unique JSON-LD, nav/internal links, page speed and schema tests).
6. Connect Google Analytics GA4 and Search Console with per-tenant OAuth and verified property permissions; create property and submit sitemap only under authorized account.
7. Google Business Profile: real eligible verified business, not bulk location generator. Request official API access; ownership, consent and verification gates.
8. Queue real site build in existing sandbox; QA → approval → publish → proof dashboard.

## Programmatic SEO / AEO / GEO compliance
- Google spam policies forbid scaled content abuse and doorway pages that merely swap city names. Index only pages with genuine utility: locally factual offerings, constraints, case studies, evidence and location-specific service differences.
- No fake locations or Google Business profiles, reviews, credentials, warranties or claimed services.
- Crawlable indexable real pages with correct response codes, accurate title/meta, canonical, unique content, accessible structured data. No fabricated schema signals. Good internal linking and sitemap splitting (50k URLs / 50 MB uncompressed max per sitemap). GSC submission does NOT guarantee indexing.
- GA4 reporting, GSC coverage, Bing Webmaster/IndexNow (only for supported engines), schema and LLM-readable helpful factual answers; no guarantee of AI citation or ranking.

## Specialist agent model / future work
APEX command → planner → website designer → content/SEO research → cloud browser builder → sandbox worker → independent validator → approver. OpenClaw/Manus-style capabilities are a product target not granted by installing the visual editor. Sandbox worker remains UNBOUND to X1 and requires dedicated staging integration with receipts. Do not expand the worker fleet or add another scheduler until validated.

## Validation and release gates
[ ] Browser desktop 1440/mobile 390 proof with actual interaction logs.
[ ] Screenshot comparison blocked if storage unavailable; don't claim 99% parity.
[ ] Chat text update, color, undo/redo, click-selection, mobile device toggle, HTML export behavior.
[ ] Duplicate markets rejected and draft plan not publicly indexable.
[ ] Sitemap blocked without HTTPS domain and ownership confirmations.
[ ] Remote POST 403, GET truthful status, no customer auth/storage claims.
[ ] Protected production/admin release approval against immutable SHA and exact preview URL.

Rollback existing production dpl_3ou9SX8CpMZEhTYbTDDmtrEdwrFi. Never merge default branch or deploy admin builder publicly without auth and visual acceptance.
