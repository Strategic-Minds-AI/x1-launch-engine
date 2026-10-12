# X1 batch website launcher: staging integration

STATUS: CANDIDATE ONLY. No queue submission, worker activation, production deployment or external publishing is authorized by this file.

## Verified existing infrastructure (2026-10-12)
- Supabase staging: uvdkzsbjackpjvpoxtyk
- Queue: public.x1_work_queue; execution ledger: public.x1_execution_ledger; leases: public.x1_task_leases.
- Idempotency key: unique lowercase 64-character SHA-256 hex.
- Railway Strategic Sandbox System: sandbox-code service worker-sandbox-code; deployment 4bc6d191-9067-4dae-9aeb-d932dee7e24f is SUCCESS, but queue consumer support is not verified.
- Local candidate X1_BATCH_LAUNCHER_STAGING_CANDIDATE.zip passed 8/8 local Node tests.

## Safe wiring requirements
1. Resolve verified tenant_id, template snapshot identifier, target repository immutable SHA, mission_id and authorized server-side dispatch endpoint.
2. Verify the deployed worker advertises the exact job type it consumes. Proposed type website.synthetic.preview.v1 is NOT established.
3. Persist template identity in each payload. Deterministic idempotency material: tenant, mission, version, template snapshot and normalized city/state. Use SHA-256.
4. Dispatch at most ONE synthetic website with action_class NON_PRODUCTION_MUTATION, capped spend, max_attempts <=3, no customer messages, no custom domains and no public production release.
5. Use the existing authenticated dispatch API, never a browser-side service-role credential; queue insertion must read back the work_id and deduplicate on idempotency_key.
6. Observe worker lease and execution ledger, then independently verify resulting Vercel PREVIEW deployment and browser smoke tests against the exact source SHA.
7. Fail closed if worker job kind, tenant, preview authorization or queue contract cannot be proved.

## Acceptance
1/1 synthetic mission passes: work_id, worker identity, lease, execution_id, build SHA, preview URL, test receipt and independent QA receipt. No assumed PASS from deployed status.

## Rollback
Remove only this feature-branch integration and any explicitly created synthetic test job according to approved retention procedures. Leave existing workers, scheduler and production untouched.
