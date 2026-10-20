-- Marketing lead inbox, read/write only through authorized server service role.
create table if not exists public.wle_marketing_inquiries (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 1 and 160),
 email text not null check (char_length(email) between 3 and 254),
 industry text not null check (char_length(industry) between 1 and 160),
 message text not null check (char_length(message) between 1 and 4000),
 source text not null default 'website-launch-engine',
 consent boolean not null default false,
 created_at timestamptz not null default now(),
 status text not null default 'new' check(status in ('new','contacted','qualified','closed'))
);
alter table public.wle_marketing_inquiries enable row level security;
revoke all on public.wle_marketing_inquiries from anon,authenticated;
grant select,insert,update on public.wle_marketing_inquiries to service_role;
create index if not exists wle_marketing_inquiries_created_idx on public.wle_marketing_inquiries(created_at desc);
