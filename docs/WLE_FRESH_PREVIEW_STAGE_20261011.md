# Website Launch Engine: fresh Vercel preview provisioning (staging)

Date: 2026-10-11
Mission: WLE-X1-FRESH-PREVIEW-20261011-002
System: Strategic-Minds-AI/website-launch-engine
Scope: REVERSIBLE PREVIEW + DEVELOPMENT BRANCH ONLY
Production status: left untouched

## Source-truth and unchanged baseline
- GitHub private repository exists; canonical prior PR #6 is open, head 791e50f52c99699835c989d579faf6716a63a4b9.
- Previous Railway agent-worker staging deployment 6da10bdf-4c4b-4e35-8d01-74ebe1b87d4a is SUCCESS, with no staged changes; original worker-sandbox-code unchanged.
- X1 staging (uvdkzsbjackpjvpoxtyk): 1 targeted canary result and 1 matching independent audit receipt WLE-VAL-RAILWAY-20261011-001.
- New Vercel project website-launch-engine: prj_JbkX4yKWygqBFRhkHL6nbeQXM46f, public production alias website-launch-engine.vercel.app. Root and admin.html HTTP 200 at inspection.
- GitHub main is README-only; the new project's automatic production deploy from main can regress to a 404. Releasing a corrected production branch is a separate protected action.

## Actual new preview provisioned
- Unique preview deployment: dpl_2KNwWsRj9nBZRAoyxy6WY1GhjHc3
- URL: https://website-launch-engine-93x0z77dy-strategic-minds-advisory.vercel.app/
- Vercel state: READY; target is preview (null); alias list empty.
- Independent URL GET: HTTP 200; 13,162 HTML characters; contains exact mission marker, fictional brand and NOT A REAL CONTRACTOR; contains noindex,nofollow.
- Source: existing reviewed synthetic roofing fixture in prior PR #6, transformed deterministically with a unique synthetic mission marker. No client records, domains, payments, production DB, social publishing or customer messaging.
- Initial preview creation attempt used src/index.html and yielded READY/HTTP 404 because the Vercel project's root was already src/. Corrected source path to index.html relative to root; subsequent unique preview passed. Earlier broken preview: dpl_6Kujmw4JzJHPCgrKnd4fAYbfdEWq. No production impact.

## Staged engineering
- Branch: feature/wle-auditable-preview-runner-20261011 (from prior PR #6 head), no main merge.
- New source: src/wle-staging-runner/provision-preview.mjs, offline tests, a Dockerfile recipe, operational notes.
- Provisioning library is fixed to one Vercel project/team, synthetic/noindex content, one POST attempt, preview/null target and zero public aliases; it returns a pending-QA receipt, not a published-customer-site claim.
- No Railway runtime mutation; no Vercel token retrieved or written. No image build/push yet.

## Gates before saying 'autonomous'
- Reviewed image/commit and deploy identity, least-privilege preview credential (separately approved), X1 per-work capability migration without production RLS, real Railway worker-initiated create-preview call, failure/idempotency tests, and independent proof receipt linked to X1 work/lease.
- Customer auth/isolation, domains, Google integrations, SEO location replication, public publishing and pixel parity remain unproven and protected.
- Existing preview proves URL provisioning from the operator tool, not unattended Railway automation.

Rollback: remove/disable these branch-only changes; leave production, current Railway image/configuration, Supabase staging one-shot receipt, and both existing Vercel public sites untouched.
