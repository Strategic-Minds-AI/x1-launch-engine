# Prime Surfaces | Premium Template 05

**Approved direction:** Brand B / Design 2 / Workflow C / Concept 05. Fictional brand, design-only approval, nonproduction scope.

A standalone Next.js 16 + React 19 + TypeScript package for the approved flooring homepage. Includes full desktop and mobile composition; brand, contrast-aware accent, content, and art-direction controls; finish selector; gallery filtering; a local-only synthetic inquiry; JSON manifest export; and image-art-direction prompt export.

## Running this package

```bash
cd packages/prime-surfaces-next
npm install
npm run dev
# http://localhost:3000
npm run typecheck
npm run lint
npm test
npm run build
```

Node >=20.9 is required. No environment variables, credentials, external backend, or database are needed to explore this design package. No `package-lock.json` was generated because this execution environment could not run npm; dependency resolution and a lockfile remain required before release.

## Source and live preview

The canonical source for the static Website Launch Engine was recovered in the pinned production-source review branch. This package is **not** yet merged with that source. The isolated static preview counterpart lives at `src/templates/prime-surfaces.html`, using `prime.css` and `prime.js` with the same approved structure and interaction contract.

**Important:** The website project uses Vercel rootDirectory `src` and serves static HTML. That root does not automatically build this nested Next.js package. To host this Next package later, use a separately approved root/build configuration or fold the components into a verified Next application. Do not modify the existing Vercel project root by inference.

## Security / truth boundaries

- Fictitious concept brand; all gallery imagery is illustrative, externally hosted, and not endorsed as completed installations.
- No direct API, CRM, payment, email, uploads, cookie tracking or long-lived storage.
- Brand/LLM/image "generators" currently mean local typed transformations, copy presets, and exportable art prompts. They do NOT call image models or a production inference endpoint.
- Both the Next.js app and the branch HTML preview declare noindex. The preview route has additional Vercel noindex + no-store headers.
- Default-deny: production use requires separate approval, real asset provenance, server-side authenticated submission, RLS/tenant verification, consent, independent QA, and release receipt.

## Rollback

Changes exist only on branch `feature/prime-surfaces-brand-b-design2-20261014` based on `aed388468f17916f43a2ccc593981e4fbf1e8603`. To cancel: close its draft PR and remove its preview deployment after separately authorizing deletion; do not merge or change the current production deployment.

See `project-packet/` for design manifest, QA, contract and validation evidence.
