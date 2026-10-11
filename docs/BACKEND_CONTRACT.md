# Backend V1 Integration Contract (Proposed, not bound)

**Goal:** make Website Launch Engine a single sellable product with secure client/admin operations while reusing existing Strategic Minds AI systems. This file does not authorize a deployment.

## Existing authorities
- GitHub: this standalone private repository (feature branches first)
- Vercel: existing WLE production project; do not switch Git integration without approval
- Supabase: discover exact X1 project and tenant schema before writing, then nonproduction RLS
- Railway: existing Strategic Sandbox System orchestrator and code workers; reuse, never duplicate cron/queue
- Apex X1: orchestrates planning; no independent production release authority
- Browser + Fault Line: independent browser/QA validators

## Contract
- `GET /api/health`: reports bootstrap availability only, NOT worker readiness.
- `POST /api/missions`: disabled until authenticated, tenant-scoped queue contract is verified.
- Future routes (not implemented): `GET /api/missions/:id`, `POST /api/missions/:id/revisions`, `GET /api/missions/:id/events`, `POST /api/missions/:id/release-request`, `POST /api/missions/:id/cancel`.
- Future resources: tenants, accounts, sites, site_versions, template_versions, approvals, leads, campaigns, jobs, leases, receipts and audit_events.
- Every mutation: authenticated actor, tenant ID, role, idempotency key, immutable artifact SHA, expected state and signed validator receipt.
- Roles: platform_admin, tenant_owner, editor, viewer.
- Release state: DRAFT -> QUEUED -> BUILDING -> PREVIEW_READY -> VALIDATING -> VALIDATED -> AWAITING_APPROVAL -> LIVE, with FAILED/CANCELLED and rollback.

## Priority implementation order
1. Reconcile existing Supabase project/queue, auth provider, Railway services, Vercel runtime and GitHub source SHA; classify conflicts.
2. Write nonproduction tenant/RLS migrations; negative tests for account crossover.
3. Introduce authenticated mission intake with fail-closed policy and rate limiting.
4. Connect idempotent X1/Railway worker with one heartbeat; record lease, timeout, budget and retry.
5. Produce one synthetic customer preview with verifiable Vercel URL and immutable proof.
6. Independently test every supported route and error state, browser responsiveness, accessibility, RLS, rollback.
7. Request scoped approval for production backend activation and live messaging.

## Explicitly out of scope for this bootstrap
New Supabase project, new cron forest, payment acceptance, domains/DNS, real client communication, sample data masquerading as revenue, fake local presence, automatic publishing, storing credentials in GitHub. Demo UIs must not be treated as access-controlled.
