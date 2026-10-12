-- DRAFT ONLY: DO NOT EXECUTE without explicit scoped approval.
-- WLE synthetic/staging intake requires a dedicated table, never the Phoenix
-- Epoxy public.website_leads table. This file is NOT migration history.
-- Verify target project uvdkzsbjackpjvpoxtyk and privileges before apply.
-- For an approved migration, use Supabase CLI 'supabase migration new'.
BEGIN;

CREATE TABLE IF NOT EXISTS public.wle_lead_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  request_id uuid NOT NULL,
  contact_name text NOT NULL CHECK (char_length(contact_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  industry text NOT NULL CHECK (char_length(industry) BETWEEN 2 AND 60),
  details text NOT NULL CHECK (char_length(details) BETWEEN 10 AND 2000),
  source_site text NOT NULL DEFAULT 'website-launch-engine'
    CHECK (source_site = 'website-launch-engine'),
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','qualified','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wle_lead_inquiries_tenant_request_unique UNIQUE (tenant_id,request_id)
);

ALTER TABLE public.wle_lead_inquiries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.wle_lead_inquiries FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT ON TABLE public.wle_lead_inquiries TO service_role;

-- No authenticated or anon INSERT/SELECT policies. Service-role requests
-- must be server-side only, with tenant derived from verified environment,
-- origin enforcement, bounded input, verified rate limiting and no logs of PII.
-- Do NOT expose this table in browser bundles, client keys, or public GraphQL.
COMMIT;
