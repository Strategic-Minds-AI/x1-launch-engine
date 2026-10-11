# WLE Premium Sites + Business Studio V1
Mission: WLE-PREMIUM-SITES-BUSINESS-STUDIO-20261011
State: PREVIEW-ONLY, NOT AUTONOMOUS-CUSTOMER-READY
Canonical repo: Strategic-Minds-AI/website-launch-engine
Branch: feature/premium-sites-business-studio-v1
Design baseline: locked cinematic mountain-blue Website Launch Engine marketing site
Source website phone: (772) 209-0266, Florida based, nationwide reach

## Product promise and nonnegotiable quality
Every customer website must have the same **level of design craft** as Website Launch Engine, but not be a clone of its mountains or same reusable hero. Create genuine industry-specific websites with differentiated structures, copy, imagery and conversion paths. Each project has a visual design pack, interactive prototype, versioned site pack, preview URL, independent QA, operator acceptance and approved release receipt. Marketing claims of site delivery in minutes remain unverified until actual queue/worker metrics support them.

### Golden quality standard (release BLOCKED unless evidenced)
1. Intentional 1920/1440/850/390px layouts; screenshot comparison and independent human visual critic with >= 90/100 qualitative design rubric; never assert 99% parity without evidence.
2. Strong typography, 18px+ desktop body, large readable headings, clear navigation and working phone/contact buttons.
3. Proper licensing and stable optimization for real industry photographs; separate mobile crops, alt text, max LCP target 2.5s based on measured lab performance.
4. Distinct interior page designs, full-page scrollable template previews, responsive mobile interactions, helpful content from verified client facts only.
5. Usable contact and lead flows connected to authorized CRM and tenant-scoped backend before release, with failure handling, rate limiting and consent.
6. SEO/AEO/GEO: helpful original content, appropriate schema, accessibility, legitimate locations, no fake testimonials, no scaled doorway spam or unsubstantiated guarantees.
7. All templates versioned and independently validated by worker other than implementer; no production publishing without exact immutable approval.

## Client portal scope
Single client workspace: websites, approval desk, real leads (after secure auth), social planning, business card generator, image studio, video studio, content studio, reporting, support, campaign billing (separately approved). Entry /client.html -> /studio.html. Owner sees only own tenant data after real auth/RLS.

### Functions / status
- Digital business card: **implemented, local-only**: editable fields with DOM preview and downloadable SVG. Not NFC, hosted profile, QR distribution, or persistent directory.
- Content Studio: **implemented, deterministic local draft generator** for captions/posts/web sections/newsletters. NOT a GPT API, no verified business facts automatically included.
- Social: **implemented, local-only** seven-day draft plan plus JSON export. No actual scheduling, OAuth channel binding, approval records, posting/replies, performance analytics or autonomous execution.
- Image: **implemented only a text creative brief generator** and copy button; NO cloud image file created by this UI.
- Video: **implemented only 15/30/60 second script/storyboard and text export**; NO MP4/video/voice generated.
- Premium roofing site: one complete illustrative HTML sample at /templates/roofing.html with original visual composition, clear fictional disclaimer and no fake business/testimonials.
- No background jobs, tenant auth, real customer data, leads, social provider accounts, secrets, model billing or public messages.

## Target production architecture (PROPOSED / NOT BOUND)
GPT / APEX X1 supervision -> WLE authenticated tenant API (Vercel) -> existing Supabase policies/queue/leases -> verified Railway sandbox worker(s) -> asset generator adapters -> per-version media manifest/QA receipts -> approval -> channel-specific publisher / site release.

Data:
tenants; memberships; businesses; business_facts; sites; site_versions; templates; templates_versions; campaigns; campaign_items; approvals; agent_jobs; worker_leases; creative_assets; content_drafts; social_channels; scheduled_posts; publish_events; reporting_events; billing_entitlements; audit_log. Every row has tenant ID where applicable, role/owner and RLS tests. Use existing canonical tables if matching; do not duplicate.

### Agent routing
- Site generator: approved Website Launch Engine template compiler; first reproduce one roofing site in preview, then test 6 industries, then 20, then batches 10 -> 100 with verified deployed URL evidence.
- GPT content: Vercel AI Gateway (after server-side authenticated binding), with verified business fact constraints, citations and brand approval.
- Image: discover reusable authorized connected Runway / alternative image pipeline; output licensed WebP/AVIF + provenance. Keep provider secrets exclusively server-side. Avoid expensive generation without scoped budget approval.
- Video: discover connected Runway or HeyGen service and authorization; persist job ID, cost estimate, status, asset provenance and approval receipt. Do not claim MP4 until it exists and is tested.
- Social: bind consented OAuth connections for opted-in channels, drafts -> content approval -> schedule approval for exact hashes/date window -> bounded publisher with retry + revocation + receipts. No external posting/replies/DM without scoped approval.
- Cards: render validated SVG/PNG/VCard/QR profile only after security/hostname review. For real customer uploads protect assets, require explicit sharing and deletion controls.
- Analytics: no fabricated leads, calls, earnings or engagement. Show unknown unless data source is connected.
- Existing shared heartbeat: reuse one canonical orchestrator; do not create another persistent cron forest.

## Implementation work packets
1. WLE-STUDIO-001 (DONE, BRANCH): Studio UI with 5 local draft/export tools, honest disabled statuses, link from client. QA in browser required.
2. WLE-TEMPLATE-001 (DONE, BRANCH): one full-page premium roof template sample, fictional.
3. WLE-INTEGRATION-001 (READ): Verify canonical X1 Supabase queue schema, Railway worker binding, Vercel AI Gateway, existing media generators and provider spending.
4. WLE-AUTH-001 (NONPROD): create and independently test Supabase Auth + RLS and explicit platform_admin/tenant_owner roles. Block customer data until negative cross-tenant checks PASS.
5. WLE-AI-001 (PREVIEW): Wire secure content/image/video job adapters and immutable media assets, bounded billing/quotas.
6. WLE-SOCIAL-001 (PREVIEW): OAuth channel sandbox, approval envelopes, scheduled post worker, revocation, verification receipts.
7. WLE-GENERATOR-001 (PREVIEW): template genome compiler, premium acceptance suite, one real synthetic end-to-end generated website.
8. WLE-RELEASE-001 (PROTECTED): operator approves exact version/commit/deployment after independent evidence.

## Stop conditions
Protect existing /admin.html, /client.html, public homepage, marketing nav and hero. No protected merge, production deploy, prod RLS/schema, secrets, payment spend, social publishing or client messaging without explicit scoped approval. First pilot must produce a real rendered website preview with exact SHA, tests, cost/elapsed receipts, and an independent validator.

## Rollback
Git parent branch: feature/approved-cinematic-hero-20261011
Production baseline: dpl_DZZDfBwpBiXmgDfrn9o9nqsNj41t
Branch changes: new src/studio.html, new src/templates/roofing.html, only targeted /client.html links.
