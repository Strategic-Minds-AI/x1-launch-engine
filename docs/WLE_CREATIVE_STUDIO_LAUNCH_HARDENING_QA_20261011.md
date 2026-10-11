# WLE Creative Studio launch hardening | 2026-10-11

**Classification:** VERIFIED front-end preview hardening, NOT approved customer production release.

## Source, target, scope

- Canonical private repo: `Strategic-Minds-AI/website-launch-engine`
- Draft PR: https://github.com/Strategic-Minds-AI/website-launch-engine/pull/10
- Existing review branch: `feature/wle-business-creative-studio-20261011`, based on pinned recovery branch `release/wle-pinned-production-source-20261011`.
- **Exactly tested source SHA**: `7a5f41229962e8823ad19b534e42e05dd1225df8`.
- **Exactly tested Vercel deployment**: `dpl_CRb7QpUMJsNZfJY7MvX56QhrDUY5`, READY, preview target null; no production alias.
- **Customer admin**: https://website-launch-engine-khtmimfb8-strategic-minds-advisory.vercel.app/client.html#Creative%20Studio
- No secrets/OAuth, customer email/SMS, production deployment/merge, DNS, payments, production DB/RLS, queue/scheduler, paid inference, or external publication changed.

## Product lock

Preserved existing `src/index.html` approved marketing homepage. The customer-facing `src/client.html` holds the built-in Creative Studio. Operator `src/admin.html` is not modified. Hero 50/50 white / midnight navy, homepage `#04172b` and royal blue `#0675f9` accents. Desktop editor displays real live card side by side with business profile. Mobile scrolls active Creative Studio menu into view; no visible horizontal scrollbar or duplicated mobile action buttons. The tool is a browser-only editor, not live multi-tenant account service.

## Corrections/hardening on this draft branch

1. QR: **fail-closed website mode**. An absent/invalid/credential-bearing website does not silently embed name/email/phone in a fallback vCard QR. QR export remains disabled until a verified HTTPS business URL is provided. Contact QR is only created after explicit mode selection with privacy warning. Web URL rejects embedded credentials, obvious internal/localhost hosts and IP-literal hosts.
2. Photo selection: MIME/size validation, browser image decode, safe dimension/pixel caps, local canvas re-encoding to PNG (removes original EXIF/GPS metadata), and no backend upload.
3. One-device sharing: native Web Share API action initiated by the user; email/SMS open draft composer only, no automated sends. File contact export remains vCard 3.0.
4. Keyboard access: Left/Right/Home/End creative tab controls.
5. Web security: Creative Studio HTTP CSP prohibits external requests and non-same-origin scripting/framing, referrer no-referrer, nosniff, no-store and noindex; client and admin carry no-store, noindex, anti-framing.
6. Layout: intrinsic content-height iframe resizing without feedback loop, mobile grid and selected tab visibility, white/navy home branding, client admin desktop 2-column editor/card.
7. Real transparent local logo PNG + SVG, QR SVG, card SVG, vCard, browser-printed brochure PDF validated.
8. No Base44 runtime dependence added.

## Independent QA method

**JARVIS-COMMAND**, authorized folder `C:\_Strategic_Minds_AI_OS\49_WEBSITE LAUNCH EGINE\QA_NONPROD_20261011`, Node 24 and locally installed Chrome via isolated headless Chrome DevTools Protocol. No new browser automation package installed. Synthetic business data only; no customer emails/SMS or external images uploaded.

- Executable local test: `cdp-qa.cjs` (local, not yet ported into GitHub CI).
- Evidence local: `cdp-qa-receipt.json`, `client-cdp-mobile-390.png`, `client-cdp-desktop-1440.png`, `brochure-proof.pdf`, `downloads/sample-roofer-*.{png,svg,vcf}`.
- Latest local receipt timestamp: `2026-10-11T20:51:09.318Z`. **15/15 declared executable checks PASS, 0 failures**, independently read back by desktop commander.
- Exact 390px mobile: viewport verified; selected Creative Studio nav visible, scrollLeft 480 / nav clientWidth 344, selected tab x 224.75..358.78, iframe height 3631px.
- Exact 1440px desktop: profile and card in two columns (491.266px / 576.734px); embedded frame height 1645px.
- QR privacy: no website -> `missing`+download disabled; credential-bearing URL rejected; valid https://example.com QR READY; explicitly chosen vCard QR READY with warning.
- Five actual output files created: `sample-roofer-transparent-logo.png`, `sample-roofer-transparent-logo.svg`, `sample-roofer-qr.svg`, `sample-roofer-digital-business-card.svg`, `sample-roofer-contact.vcf`.
- Transparent PNG independently parsed: 1800x440, PNG RGBA color type 6, corner alpha byte **0**, transparent background.
- Card SVG verified contains QR node and does not contain a `<script>` tag. Contact vCard is VERSION 3.0 with correct HTTPS website.
- Synthetic 1x1 project PNG successfully decoded and locally converted to new PNG data URL.
- Browser `Page.printToPDF` independently generated a one-page brochure: 120,905 bytes; PDF readback confirms heading, fictional business copy and footer call to action.
- Zero uncaught JS exceptions. Desktop and mobile screenshots were opened and visually inspected. **This is visual review, not measured >=99% reference parity**. User previously approved the white/navy customer-admin direction.

## Runtime/API and security gates still NOT satisfied

- No proven login/customer session binding on `src/client.html`. Anyone with the preview URL can see a **static demo**. It is noindex, not a secure customer portal. Never use for real account or customer data until auth.
- No authenticated multi-tenant Supabase business profiles, private storage, upload authorization, retention or two-tenant RLS negative tests.
- Vercel WLE preview lacks verified Supabase staging client runtime binding. Production-scoped environment-variable names exist but do not authorize leaking or reusing production credentials. No token values viewed/copied.
- Existing X1 Supabase staging warns that anonymous callers have EXECUTE on 2 public SECURITY DEFINER targeted-canary RPCs: `wle_claim_targeted_canary`, `wle_submit_targeted_canary`. Needs separately authorized security review before exposing operational backend.
- Google Gmail, Calendar, Contacts OAuth not implemented. AI Gateway image/content generators, hosted shareable cards, server-side email/SMS sends, automatic website research, production website factory and persistent assets remain disabled.
- Screenshot visual parity not quantified or independently certified to >=99% official reference standard; broader performance/accessibility/security audits, tenant/auth and production release are still UNKNOWN.
- Do not infer a premium paid enterprise-ready platform from a static preview or 15 front-end tests.

## Decision, rollback, exact next action

**Result:** Creative Studio FRONTEND PREVIEW hardening PASS at SHA `7a5f41229962e8823ad19b534e42e05dd1225df8`; full customer launch readiness BLOCKED.

**Rollback:** Do not promote/merge PR #10. To undo branch changes, close PR #10 or revert branch commits; current production Vercel alias `website-launch-engine.vercel.app` remains at deployment `dpl_35towmS2gBRZwXibE2rRvTTv8LrF`; GitHub main remained README-only `22429acb2a85a4f740718c5caea71d5505d7ea14` during test. No production rollback needed.

**Next permitted action:** Draft authenticated client portal + tenant-scoped storage API contract in PR #10 (read-only/draft), then obtain fresh scoped approval to bind **X1 AI Hub Staging** customer authentication/storage/preview credential configuration. Independently validate login/logout, two-tenant RLS isolation, private media storage, role failures, receipts and staged launch. Separately seek explicit production merge/release approval only once all applicable gates pass.

Evidence is restricted to user-authorized local WLE folder and this GitHub draft; do not paste any PII, secrets or raw tokens into the receipt.
