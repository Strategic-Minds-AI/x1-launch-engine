-- X1 Website Launch Engine: tenant-scoped production data model
create table if not exists public.wle_sites (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 business_name text not null check (length(business_name) between 1 and 180),
 industry text not null,
 city text not null default '',
 template_id text not null default 'standard',
 status text not null default 'draft' check(status in ('draft','review','approved','published','archived')),
 content jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.wle_site_approvals (
 id uuid primary key default gen_random_uuid(),
 site_id uuid not null references public.wle_sites(id) on delete cascade,
 requester_id uuid not null references auth.users(id),
 reviewer_id uuid references auth.users(id),
 revision text not null,
 status text not null default 'pending' check(status in ('pending','approved','changes_requested')),
 note text not null default '',
 created_at timestamptz not null default now(),
 reviewed_at timestamptz
);
create index if not exists wle_sites_owner_idx on public.wle_sites(owner_id,created_at desc);
create index if not exists wle_approvals_site_idx on public.wle_site_approvals(site_id,created_at desc);
alter table public.wle_sites enable row level security;
alter table public.wle_site_approvals enable row level security;
revoke all on public.wle_sites,public.wle_site_approvals from anon;
grant select,insert,update,delete on public.wle_sites to authenticated;
grant select,insert on public.wle_site_approvals to authenticated;
drop policy if exists wle_sites_owner_select on public.wle_sites;
create policy wle_sites_owner_select on public.wle_sites for select to authenticated using(owner_id=(select auth.uid()));
drop policy if exists wle_sites_owner_insert on public.wle_sites;
create policy wle_sites_owner_insert on public.wle_sites for insert to authenticated with check(owner_id=(select auth.uid()));
drop policy if exists wle_sites_owner_update on public.wle_sites;
create policy wle_sites_owner_update on public.wle_sites for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
drop policy if exists wle_sites_owner_delete on public.wle_sites;
create policy wle_sites_owner_delete on public.wle_sites for delete to authenticated using(owner_id=(select auth.uid()));
drop policy if exists wle_approvals_owner_select on public.wle_site_approvals;
create policy wle_approvals_owner_select on public.wle_site_approvals for select to authenticated using(exists(select 1 from public.wle_sites s where s.id=site_id and s.owner_id=(select auth.uid())));
drop policy if exists wle_approvals_owner_insert on public.wle_site_approvals;
create policy wle_approvals_owner_insert on public.wle_site_approvals for insert to authenticated with check(requester_id=(select auth.uid()) and exists(select 1 from public.wle_sites s where s.id=site_id and s.owner_id=(select auth.uid())));
