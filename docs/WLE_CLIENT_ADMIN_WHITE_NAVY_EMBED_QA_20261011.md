# Website Launch Engine | Customer-admin Creative Studio, balanced light UI and bounded embed

Date: 2026-10-11
Work class: Branch-only source repair + Git-based Vercel preview.
RESULT: VERIFIED preview integration with bounded iframe sizing. NOT a production/customer-account launch.

## Scope and source truth

- User requested all business creative tools in the **user's admin** (customer portal `src/client.html`, not platform operator `src/admin.html`), with same branding as approved homepage, roughly 50/50 white/navy balance, less blue, and a streamlined path to launch.
- Existing premium marketing homepage `src/index.html` was **not edited**.
- Source branch: `feature/wle-business-creative-studio-20261011`; draft PR #10 targets `release/wle-pinned-production-source-20261011` (pinned review), not README-only `main`.
- Baseline prior to repair: `5f8694d73148faf6b494c26c9016b68c3896aa14`; cloud browser saw `#creativeFrame` grow to 8,003 px (1440 and 390) and 8,011 px (820). All three origins were served with zero observed JS errors, but resizing was unacceptable.
- Frame-size corrective commit: `a9542e8bf0a615fcbde6f9c1135c9d35644ee50f`, file `src/creative-studio.js`.
- New preview: Vercel `dpl_FvARiXcZT9nDDtVBR19eqWy7skX5`, READY, Git source `a9542e8bf0a615fcbde6f9c1135c9d35644ee50f`, target null (preview), only a Git-branch preview alias.
- Entry: https://website-launch-engine-8bpbxjna6-strategic-minds-advisory.vercel.app/client.html#Creative%20Studio
- Embedded editor: https://website-launch-engine-8bpbxjna6-strategic-minds-advisory.vercel.app/creative-studio.html?embedded=client

## Implemented integration and simplification

1. Client admin `src/client.html`: add a true `Creative Studio` navigation view. Existing Overview, My Websites, Lead Inbox, Onboarding, Approvals, Support remain unchanged and navigable. The separate operator admin is untouched.
2. Use the same existing card, QR, logo, image preview, flyer/brochure and social tool code via one same-origin embedded view. Avoid duplicate tool implementations, DB tables, schedulers or Base44 dependencies.
3. Keep a 50/50 white/navy lead-in in the customer workspace, homepage-derived `#04172b` midnight navy and `#0675f9` royal blue CTAs, white card/field work areas, lighter separators and accents. Existing marketing homepage not modified. This is a DESIGN INTENT, not verified screenshot-area percentage or screenshot parity.
4. Suppress the standalone Creative Studio masthead, hero, privacy/footer when embedded, so users stay inside one customer admin.
5. Fix recursive iframe growth: old implementation measured `max(document.body.scrollHeight, document.documentElement.scrollHeight)` and then resized the iframe, feeding the new iframe height back into document scrollHeight. New implementation measures intrinsic `main.workarea.getBoundingClientRect().height + 24` via `ResizeObserver` of the content root; only updates for meaningful changes (greater than 3 px) within 300–6500 px; parent validates origin, source and reported height.
6. Existing client admin remains a **static preview**: no live customer auth, persistent profile, tenant-scoped storage, Google OAuth, approved sending or AI inference. Browser-only generated assets, no external publication.

## Browser / API evidence after corrective source SHA

At desktop 1440x900, mobile 390x844 and tablet 820x1180:
- Cloud Browser navigated to selected `#Creative%20Studio` route, Creative Studio tab `aria-current=page`, content class `creative-active`, iframe present.
- `#creativeFrame` inline height: desktop **2780 px**, mobile **2780 px**, tablet **3171 px**. No 8,000px feedback runaway observed during smoke test.
- On each viewport checked five requests: client.html, creative-studio.html?embedded=client, creative-studio-light.css, qrcode-generator.js, creative-studio.js. All returned HTTP 200.
- JavaScript errors `[]` on all three.
- Desktop click test: Overview -> Creative Studio toggled navigation and content correctly, with hash changes; no JS errors and frame height remained 2780 px.
- Separate mobile (390x844) embedded route loaded; QR SVG in DOM, data-qr-state=ready, brand-tab activation PASS, generated 3 options (LAUNCH BLUE / ONYX / ELECTRIC), switched back to card, JS errors `[]`.
- The underlying code's transparent PNG, image upload and PDF print behaviors were NOT validated end-to-end in this test. Email/SMS are composer links, NOT sends.

## Remaining gates / risk

- Screenshot/pixel comparison against approved homepage and admin design remains **BLOCKED**: Cloud Browser screenshots fail because `BLOB_READ_WRITE_TOKEN` is missing in the browser service. Chrome local filesystem has no network/DNS access to the remote Vercel deployment; do not claim visual parity.
- Customer authentication, two-tenant RLS, encrypted Google OAuth, genuine upload storage and external email/SMS sending not yet implemented. No live customer data should be entered in this preview.
- Production release still needs separate explicit scoped approval and security/visual validation. Do not merge PR #10 or main, change Vercel aliases, change secrets, activate workers or spend money.
- Current offline source/unit suite not executed. Browser interaction smoke tests cover only the declared interactions.
- Rollback source: revert `a9542e8bf0a615fcbde6f9c1135c9d35644ee50f` (iframe measurement) or close PR #10 for entire customer Creative Studio addition. No production rollback necessary because no production mutation occurred.
- Next eligible actions: obtain a lawful screenshot route or authorized storage fix and 1440/390 screenshot signoff; independently QA asset exports; implement tenant authentication and private media; then seek explicit production release approval.
