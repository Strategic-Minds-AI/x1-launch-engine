# Website Launch Engine — Approved Cinematic Hero V3

- Mission: WLE-HERO-REPLICA-20261011
- Visual direction: **LOCKED** to user-attached 1672×941 reference screenshot
- Reference screenshot SHA256: `7dd47c17d50dabda1baa59205a0e97f4711acd74282baa6ad0ef229829a69475`
- Reference is a conversation attachment; its bytes are **not** included in GitHub or Vercel. Preserve original off-repository until durable asset workflow is approved. No false asset-install claim.
- Canonical repo: `Strategic-Minds-AI/website-launch-engine`
- Implementation branch: `feature/approved-cinematic-hero-20261011`
- New hero source blob: `e63a3cd3e6c2170a9228b6bb33a856cdd10da820`
- Implementation commit: `db574aa495075c9f398bd13f62b1cb234f7870ab`
- Vercel preview deployment: `dpl_FN5nr58tcNKeWM6wgsSzBM3542gD`
- Preview URL: https://website-launch-engine-hxds4mdgk-strategic-minds-advisory.vercel.app/
- Protected production URL (unchanged): https://website-launch-engine-xps.vercel.app/
- Current production rollback baseline: `dpl_DZZDfBwpBiXmgDfrn9o9nqsNj41t`

## Implementation scope and visual ceiling

Scoped replacement of marketing site's `<section class="hero">` and addition of namespaced `wle-` CSS. All rest of HTML and CSS verified unchanged byte-for-byte after excluding one injected CSS block, one hero block and its preceding newline. Admin/client HTML unchanged.

### Reference elements recreated as code

1. Atmospheric snow mountain panoramic with layered blue/purple sunset gradients, navy overlay, cyan orbital lighting.
2. High-contrast white/electric-cyan oversized headline in real HTML.
3. Three real CTA links (Browse Industries, View Templates, tel:+17722090266) and existing working launch-wizard command as real button.
4. Hero feature row with four benefits.
5. HTML/CSS perspective laptop with roofing website design, laptop keyboard, luminous chassis and realistic shadows.
6. Four separate perspective-screen compositions (real estate, landscape, legal, spa) with image-backed website content.
7. Responsive desktop 1920/1440, tablet 850, phone 390 with reduced-motion preference support.
8. Screenshot art is NOT simply baked into the hero; all primary text, navigation and CTAs remain selectable, keyboard-accessible HTML.

**Limitation:** User's exact reference art/photo was NOT hosted as a durable first-party asset. The scenic backdrop and device photos use Unsplash image URLs (all six newly added images returned 200 at browser check). This is a working recreation, not a pixel-perfect claim. Need durable optimized first-party approved asset set and screenshot diff before 99% fidelity certification.

## Validation receipts observed

- Deployment `dpl_FN5nr58tcNKeWM6wgsSzBM3542gD` Vercel READY; target PREVIEW.
- HTML routes: home/admin/client all HTTP 200.
- CloudBrowser desktop 1440, 1920, and mobile 390: 20 industries, six featured templates, four (772) phone links, no reported JS errors.
- Preview desktop and mobile successful image requests; newly added mountain/landscape/legal/spa/roofing photographs returned HTTP 200 in observed network.
- Mobile first hero Browse Industries/View Templates CTA boxes visible and launch-wizard activation works; 390px hero stage-link is present and accessible.
- Full launch wizard smoke on preview desktop: open wizard, choose industry, choose quantity, approve markets, prepare proof all returned successful browser clicks. Download Preview Plan action present, JS errors [].
- Production re-fetched independently, HTTP 200, `wle-hero-cinematic` marker ABSENT: production left unchanged.
- Cloud Browser screenshot capture BLOCKED: `BLOB_READ_WRITE_TOKEN not set`. No actual 99% screenshot visual match or performance Lighthouse PASS. Do not claim independent visual certification.

## Acceptance gates / next actions

- [x] Branch-scoped hero source change
- [x] Existing 20 industries and template gallery preserved, as verified by source diff and browser count
- [x] Existing launch wizard operational in tested flow
- [x] Marketing phone (772) 209-0266 preserved
- [x] Desktop/mobile browser JS smoke and response check
- [ ] Durable approved mountain and floating-laptop image asset pack installed locally, optimized WebP/AVIF with alt/provenance
- [ ] Visual screenshots captured at 1440, 1920, 850, 390 and independently compared against approved reference
- [ ] Browser screenshot storage service restored or authorized alternative used
- [ ] Performance and WCAG audit, verify image crop/loading with independent validator
- [ ] Operator preview acceptance
- [ ] Separate operator release approval tied to final immutable SHA and deployment

This is **preview-only**. Do not merge, assign live domain aliases, or publish.
