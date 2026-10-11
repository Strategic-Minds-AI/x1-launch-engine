# Website Launch Engine: Vercel 404 Recovery and Production Deployment

Date: 2026-10-11
Operator request: "dont you need to push to production"
Scope: Exact new project `website-launch-engine`, domain `website-launch-engine.vercel.app`.
Action classification: scoped authorized PRODUCTION DEPLOY of already-approved static website; no GitHub main merge, payment, DNS, database or external publishing integrations.

## Root cause (independently verified)
- A second Vercel project was created: `website-launch-engine`, ID `prj_JbkX4yKWygqBFRhkHL6nbeQXM46f`.
- First deployment `dpl_ZsJswRnzLGvWRWAxAHoSwQaqQok7`, Git ref `main`, commit `22429acb2a85a4f740718c5caea71d5505d7ea14`, was READY but root returned HTTP 404.
- At the time of audit GitHub `main` held only README and did not contain the approved `src/index.html`.
- Separate original Vercel production project `website-launch-engine-xps`, ID `prj_70bwCwyXR7yqb0Yicku8rHzRVAZc`, was healthy and returned HTTP 200. It was NOT modified.

## Correction
- Re-fetched and verified original running homepage exactly matches canonical Git blob `e63a3cd3e6c2170a9228b6bb33a856cdd10da820` on branch `feature/wle-supabase-railway-staging-bridge-20261011`.
- Deployed exactly 9 approved source files to new Vercel project using deployment file API, `framework=null`, `rootDirectory=src`, `nodeVersion=22.x`, target `production`.
- New production deployment `dpl_B66U7WBQagTrPbyQgkozXCuUufGu`, target production, READY, alias `website-launch-engine.vercel.app`.
- Verified 4 HTML routes HTTP 200: /, /admin.html, /studio.html, /templates/roofing.html. API /api/health and /api/platform-health returned HTTP 200; /api/missions GET returned 405 (mutation protected).
- Independent browser sessions 1440x900 and 390x844: homepage loads, 20 industry cards, six featured templates, no reported JavaScript errors or failing requested images.
- Original `website-launch-engine-xps.vercel.app` remained HTTP 200 and READY, deployment `dpl_3ou9SX8CpMZEhTYbTDDmtrEdwrFi`.

## Critical outstanding operations
- The NEW project's GitHub connection still has production branch `main` at README-only source. This one-off deployment fixes the current 404, but the next automatic deployment from `main` could overwrite it and reintroduce the error. Prevent this by approving one **reviewed and merged release to main** or selecting an approved release branch in Vercel Project Settings → Git → Production Branch, with root directory `src`. Neither protected operation performed.
- This new Vercel project is distinct from original `website-launch-engine-xps`. Do not silently delete, transfer domains, or overwrite the original.
- New project's /api/platform-health: `supabase=NOT_CONFIGURED`, `railway=ONLINE_WORKERS_NOT_BOUND`, `customerAuth=DISABLED`, `missionSubmission=DISABLED`. Source copied but backend credentials were NOT moved; this is an approved website publication, NOT full platform backend activation.
- Screenshot/pixel visual parity not independently certified because screenshot backend storage unavailable.
- Rollback for new project: prior `dpl_ZsJswRnzLGvWRWAxAHoSwQaqQok7` exists but served HTTP 404; preferred recovery is redeploy the validated 9 source files. Original XPS production remains the safe visual reference.

## Next action
Converge to one canonical Vercel project and one approved GitHub production branch after operator decision. Preserve tested source and avoid a premature merge with staging-only worker/database artifacts.
