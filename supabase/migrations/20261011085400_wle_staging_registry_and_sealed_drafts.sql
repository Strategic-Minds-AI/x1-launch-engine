-- WLE staging-only binding manifest and sealed draft tables.
-- Already APPLIED on 2026-10-11 to Supabase STAGING uvd... via MCP migration.
-- DO NOT run against production without an independent migration approval.
create table if not exists public.wle_integration_bindings (
  binding_key text primary key check (length(binding_key) between 3 and 120),
  provider text not null check (provider in ('supabase','railway','vercel','github')),
  environment text not null,
  resource_id text not null,
  binding_state text not null check (binding_state in ('DISCOVERED','ONLINE_UNBOUND','CONNECTED_VERIFIED','BLOCKED')),
  linked_runtime boolean not null default false,
  customer_operations_enabled boolean not null default false,
  source_ref text not null,
  validation_note text not null default '',
  checked_at timestamptz not null default now()
);
alter table public.wle_integration_bindings enable row level security;
revoke all on table public.wle_integration_bindings from public, anon, authenticated;
grant select, insert, update, delete on public.wle_integration_bindings to service_role;
drop policy if exists wle_integrations_service_role_only on public.wle_integration_bindings;
create policy wle_integrations_service_role_only on public.wle_integration_bindings
for all to service_role using (true) with check (true);

create table if not exists public.wle_studio_drafts (
  draft_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.x1_tenants(tenant_id),
  created_by uuid not null,
  kind text not null check (kind in ('social','content','image_brief','video_storyboard','business_card')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload)='object' and octet_length(payload::text)<65536),
  status text not null default 'DRAFT' check (status in ('DRAFT','PENDING_REVIEW','APPROVED','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists wle_studio_drafts_tenant_time_idx on public.wle_studio_drafts (tenant_id,created_at desc);
alter table public.wle_studio_drafts enable row level security;
revoke all on table public.wle_studio_drafts from public, anon, authenticated;
grant select, insert, update, delete on public.wle_studio_drafts to service_role;
drop policy if exists wle_drafts_service_role_only on public.wle_studio_drafts;
create policy wle_drafts_service_role_only on public.wle_studio_drafts
for all to service_role using (true) with check (true);

insert into public.wle_integration_bindings(binding_key,provider,environment,resource_id,binding_state,linked_runtime,customer_operations_enabled,source_ref,validation_note)
values
('supabase_x1_staging','supabase','staging','uvdkzsbjackpjvpoxtyk','DISCOVERED',false,false,'supabase:uvdkzsbjackpjvpoxtyk','Staging queue and RLS present; worker relay unbound'),
('railway_sandbox_orchestrator','railway','sandbox-orchestrator','3fc125a8-295e-4dd2-8a76-c695d911f4d3','ONLINE_UNBOUND',false,false,'railway:15f90272-e2f6-4739-8286-91447f545d71','Worker online; X1 binding not verified'),
('railway_sandbox_code','railway','sandbox-code','f21a857e-bf86-4f84-b478-4df2ff4692c1','ONLINE_UNBOUND',false,false,'railway:15f90272-e2f6-4739-8286-91447f545d71','Worker online; X1 binding not verified'),
('railway_sandbox_social','railway','sandbox-social','c98f95d0-cf86-4b55-a286-0175d2c7d3cb','ONLINE_UNBOUND',false,false,'railway:15f90272-e2f6-4739-8286-91447f545d71','Worker online; channel publishing disabled'),
('vercel_wle_production','vercel','production','prj_70bwCwyXR7yqb0Yicku8rHzRVAZc','CONNECTED_VERIFIED',true,false,'vercel:dpl_7zLZWjYUW3SeFW8xir6XmX1Xt38U','WLE static site deployed, current deployment may change independently'),
('github_wle_source','github','feature/premium-sites-business-studio-v1','Strategic-Minds-AI/website-launch-engine','CONNECTED_VERIFIED',true,false,'github:10a68f2ec967d4b0f56a5bf39ac009d7e4d3287e','Canonical approved frontend source')
on conflict (binding_key) do update
set binding_state=excluded.binding_state,
linked_runtime=excluded.linked_runtime,
customer_operations_enabled=excluded.customer_operations_enabled,
source_ref=excluded.source_ref,
validation_note=excluded.validation_note,
checked_at=now();
