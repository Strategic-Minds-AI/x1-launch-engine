# 05 BUILD PACKET
## Implemented as source
1. Static preview files: src/templates/prime-surfaces.html + prime-surfaces/prime.css + prime-surfaces/prime.js.
2. Typed Next.js package: packages/prime-surfaces-next/app, components, lib, tests.
3. Browser-local modules: brand name, accent palette/action contrast, content variant, image art-direction reference, finish variation, gallery filter, locally summarized project brief, downloaded manifest and image prompt packet.
4. A noindex Vercel header scoped ONLY to /templates/prime-surfaces(.*) on the isolated feature branch.

## Acceptance
- Full route, CSS and JS return 200 from branch preview with zero observed page errors.
- Correct responsive header, hero composition, full-page layout; mobile menu and sticky customizer, no horizontal overflow.
- Form validates required category/area/substrate; no browser-to-server transmission, no network upload or storage.
- Noindex meta + X-Robots-Tag; no production routes mutated.
- Subsequent Next.js install/build/typecheck/lint/test and screenshot parity remain required.
