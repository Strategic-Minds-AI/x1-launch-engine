# 07 DATA SCHEMA / BACKEND PARITY
## Present: typed local-only
`StudioState { brand:string, accent:AccentId, copy:CopyPreset, image:ImageDirection, finish:FinishId }`.
`APPROVAL_LOCK { brandPack:'B', websiteDesign:'2', workflow:'C', concept:'05', templateId:'prime-surfaces-05', version:'0.1.0-preview' }`.
`makeDraftManifest(state)` and `makeImageBrief(state)` create operator-downloadable draft JSON only.

## Future real intake (NOT implemented)
- tenant_id, actor_id, consent_timestamp, lead_id, idempotency_key, request_created_at
- service_category, area_sq_ft, substrate_condition, project_timing, verified_location, selected_system, free_text
- attachment pointers only after authenticated upload and scoped Storage RLS
- server validation and PII minimization; tenant RLS and duplicate prevention
- receipts bound to exact source/deployment SHA; owned CRM integration; auditable notification preference
- two-tenant and unauthenticated negative tests required.
Do not attach an endpoint or claim a live CRM without source-truth and separate authorization.
