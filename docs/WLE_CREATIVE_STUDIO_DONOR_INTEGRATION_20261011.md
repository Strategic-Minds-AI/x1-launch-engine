# WEBSITE LAUNCH ENGINE | Creative Studio donor integration

Date: 2026-10-11
Status: DRAFT FEATURE / NONPRODUCTION PREVIEW
Canonical upstream: Strategic-Minds-AI/website-launch-engine, approved recovery source PR #9 at aed388468f17916f43a2ccc593981e4fbf1e8603
Branch: feature/wle-business-creative-studio-20261011
Owner objective: extend the *existing* Business Studio digital card into a high-polish, one-profile brand/creative suite without Base44 runtime dependencies.

## 1. Immutable donor evidence and classification

Donor A: conversation upload autobuilder(1).zip
- SHA-256: 9ea6d4c6a9d1dfcc6e219e2a356a901976da5864d5d7e62b1246e0c491b6ce76
- 818 ZIP entries, ~5.86 MB unpacked, no unsafe traversal or symlink entries observed.
- Reusable source:
  - src/components/brand/StepBusinessCard.jsx: live front/back card, html2canvas PNG export, Base44 AI-designed card call.
  - src/components/brand/StepBrochure.jsx: brochure copy/cover generation workflow with editable text download.
  - src/components/brand/StepLogo.jsx: logo selection and generation.
  - src/components/brand/BrandStepper.jsx and src/lib/brandPrompts.js: typed brand, logo, business-card, brochure and social prompt/schema contracts.
  - src/pages/BusinessProfile.jsx: categorized owner/team/project imagery intake.
  - src/components/rebrand/ColorStudio.jsx: palette and design editing.
- Disposition: EXTRACT brand pipeline contract, user experience and validated content field names. REFACTOR Base44-dependent orchestration. Do not vendor entire app.

Donor B: conversation upload xtremevisualizer.zip
- SHA-256: d7111f58efe2aa6636ec0db5009e13e27d29e4bd601812c55006ee4eae183aa5
- 443 ZIP entries, ~3.97 MB unpacked, no unsafe traversal or symlink entries observed.
- Reusable source:
  - src/pages/CRM.jsx: digital card and brochure editor with shared business fields, colors, fonts, layouts and saved-asset concept.
  - src/components/card/ShareBar.jsx: mailto, SMS composer, WhatsApp, copy and share tracking (tracking depends on Base44).
  - src/components/card/QrGenerator.jsx: QR graphic, but calls a public api.qrserver.com endpoint, which should NOT receive private contact data.
  - src/components/card/CompanyScraper.jsx: asks Base44 InvokeLLM with Internet context to research a supplied company URL; no independently verified lawful skip-tracing or deterministic provenance.
  - src/components/card/LogoGenerator.jsx: Base44 image generation/UploadFile. Generated logos are NOT proven transparent-background assets.
  - src/components/card/ImagePicker.jsx: uploaded images and generated gallery selection via Base44.
  - src/components/settings/AccentColorPicker.jsx, BrandingCustomizer.jsx: branding controls.
  - base44/functions/gmail/entry.ts, sendGmailMessage/entry.ts: authenticated Gmail API samples with Base44 connector token, NOT portable user OAuth grants.
  - base44/functions/createCalendarAppointment/entry.ts: Google Calendar API event creation via a Base44 connector, NOT a portable WLE identity.
  - base44/shared/gmailMime.ts: generic MIME encoding helpers for later security review.
- Disposition: EXTRACT/REFACTOR functional UI logic. QUARANTINE direct Base44 SDK calls and third-party QR contact-data disclosure. Google Contacts multi-tenant connection is not substantiated by the donor evidence.

Both ZIPs are BASE44 DONORS, not runtime authorities. No donor imports or Base44 integration credentials copied to WLE. New code is original, inspired by inspectable authorized user-provided concepts.

## 2. Implemented in isolated Website Launch Engine branch

- New route: src/creative-studio.html
- Client-side controller: src/creative-studio.js
- Offline, locally served MIT QR library: src/vendor/qrcode-generator.js plus full license in src/vendor/qrcode-generator.LICENSE, pinned upstream git commit 83b7e8fe3fddd3b0368dbafd6ce56995bd25e3c8. No contact information sent to a QR API.
- Tiny, reversible link from the existing approved Studio card tool: src/studio.html
- Business profile is the shared state for card, QR/vCard, logo, brand, flyer, brochure and social draft.
- Real local functionality:
  * editable card and live responsive preview;
  * QR SVG generation from HTTPS business URL or vCard 3.0;
  * email and SMS *composer links* (not account sends);
  * copy contact details and download .vcf contact card;
  * download digital card SVG;
  * generate three curated design directions; accent picker, card layout, logo-mark selector;
  * generate true background-free vector SVG logo and transparent PNG using canvas.clearRect() and no background fill;
  * local image preview for personal portrait, project image, and existing logo, restricted MIME and <=5 MiB;
  * print-friendly flyer/brochure live layout and browser Save as PDF;
  * source-derived, editable social caption and brochure draft (no invented claims);
  * owner-reviewed extraction of emails, phones and HTTPS URLs from content pasted by the operator;
  * disabled, clearly labeled Google Gmail, Calendar, Contacts and website crawling controls until authorized backend.
- User/customer data is NOT uploaded or persisted by this preview. Browser-local input and temporary downloads only; refresh loses data. No hosted public card URL or attached card email automation claimed.
- Card and transparent logo are local, deterministic generators. **Cloud AI logo/image/content generation is not implemented or claimed.**

## 3. System integration contract (PENDING REVIEW, NOT IMPLEMENTED)

Canonical WLE user entry -> Authenticated actor + tenant -> tenant-scoped Supabase profile and private media -> verified brand pack -> derived card, QR, flyer, brochure, SEO content and social drafts -> approval -> scoped share or preview -> delivery/analytics receipts.

Suggested data entities only; no migrations were performed:
- business_profiles: tenant_id, business_id, verified_by, verified_at, permitted_facts, social_links, source_uri, source_evidence.
- brand_packs: source_hash, status=PENDING_REVIEW, palette, typography, logo_variants, consent/legal checks and manifest.
- creative_assets: tenant_id, owner_id, asset_kind, media_storage_key, source_hash, rights, content_type, moderation result, publishing_status.
- digital_cards: verified business_id, canonical slug, version, visual preset, QR target, audience scope, share permissions, revocation.
- brochure_flyer_versions and social_content_drafts: version lineage, owner approvals, claim evidence and immutable export hash.
- google_connections: per-tenant user, provider, encrypted OAuth reference, scopes approved, expiry, revocation, last-check. No access/refresh token values in rows or frontend.
- user messaging: immutable approval, recipient consent, provider ID, idempotency, rate limit, opt-out and send receipt before any Gmail or SMS dispatch.

Google:
- Use own Google Cloud OAuth client, server-side authorization-code + PKCE/state handling, tenant-specific token custody, incremental consent (Gmail send, Calendar events, People/Contacts read) and explicit disconnect/revoke.
- ChatGPT's connected Gmail/Calendar/Contacts are NOT automatically OAuth authorization for WLE customer accounts.
- Restrict Gmail send to user-approved recipients and requests; no bulk email/SMS or harvesting without permission.
- Google connections remain DISABLED in preview.

Uploads:
- Supabase staging only after separately authorized tenant-scoped RLS and private Storage bucket setup; validated MIME, image decode/re-encode, dimensions, size/quotas, ownership and rights consent; signed URLs.
- Personal photos and project images must never be silently scraped, redistributed, put in public storage, or reused across tenants.

Company research:
- Owner-authorized public site only, robots/site restriction checks, domain egress allowlist, SSRF/private-network blocking, request quotas/timeouts, provenance, reviewable field-level citations and user confirmation.
- Do NOT implement private-person skip tracing, unconsented contact enrichment, bypass paywalls, CAPTCHA evasion, hidden email extraction or scraped reviews/fake claims.
- Existing X1 Cloud Browser/Fault Line are optional read-only adapters AFTER authenticated binding, not a new scraper queue or new scheduler.

AI:
- Vercel AI Gateway only from server-side, authenticated and rate-limited request boundary, budget ceiling and fallback; image model must explicitly support alpha transparency or background-removal pipeline with validation.
- Template/shape vector generator is useful now; do not label it AI.
- Publish and send only after separate scoped authorization, and track status CONFIGURED/QUEUED/PREVIEW_READY/VALIDATED/LIVE per original WLE operator contract.

## 4. Preview evidence and release gates

Vercel preview initial SHA 51ae6e397c44e68c3787ddd9b3130ebec6b22050:
- Deployment dpl_4Myq24iBcU33YNd98KQTVjTXZpYX READY, target null, no production alias (only a development-branch preview alias).
- URL: https://website-launch-engine-f5kmgwgux-strategic-minds-advisory.vercel.app/creative-studio.html
- HTTP 200: /creative-studio.html, /creative-studio.js, /vendor/qrcode-generator.js, /studio.html; noindex response.
- Cloud Browser desktop 1440x900, mobile 390x844, tablet 820x1180: page title correct, assets 200, sampled zero network errors, no JS errors on mobile/tablet; desktop console empty.
- Desktop interaction: changed business name and phone, generated three visible brand directions; browser DOM confirmed live card company updated, QR container data-qr-state=ready and SVG with viewBox="0 0 298 298"; three Google buttons disabled.
- Latest follow-up code commit fixed QR SVG export to retain actual viewBox; new immutable Git preview/build and tests must be checked on this latest SHA.
- Screenshot/pixel-level visual parity has NOT been proven because the Cloud Browser screenshot storage integration lacks BLOB_READ_WRITE_TOKEN.
- Image upload, PNG download and PDF print have NOT yet been independently validated in a full user browser; do not count as production PASS.
- No customer auth, persistent Storage, Gmail/Calendar/Contacts OAuth, live SMS/Gmail sending, payment/spend, AI inference, production migrations or customer publishing was performed.

## 5. Requirements and QA priorities

Before recommending production release:
1. Require design approval of desktop, tablet, mobile image evidence; preserve existing WLE storefront.
2. Validate browser exports for SVG, transparent PNG alpha, scannable QR target, vCard import, brochure print/PDF, attachment prep, MIME/size rejection and accessibility keyboard use.
3. Validate two-tenant isolation, OAuth negative tests/revoke and secret custody, media RLS, private signed URLs, file retention/deletion and abuse limits.
4. Validate owner-authorized research with source citations, per-field acceptance, blocking unknown claims.
5. Prove actual authenticated end-to-end Gmail and Calendar workflows and approved message receipts in STAGING.
6. Keep WLE GitHub main, production Vercel deployment, aliases, X1 production and credentials unchanged until separate explicit release approval.
7. Update versioned pack manifest and delivery receipts.

Rollback: revert/close the feature branch and draft PR. The approved PR #9 base source and current live production deployment remain untouched. Do not assign custom domains to review deployments.
