# Florida legal design study

Mission X1UF-EFE517EDDDE488C1. This additive Launch Engine module produces ten original unbranded responsive concepts and six sourced educational draft resources. It does not replace the marketing site or enable legal intake. Advertiser, tenant, design and legal approvals remain unresolved.

## Architecture choice

The canonical repository at baseline 86c7e5b6af372f59c464a0f0a20398ce26faf871 is static HTML with native Node tests and Vercel functions. The existing noindex sitepack branch at 5c920338e92edc631da7d1b7ef0f1fff217d1bda was inspected first. Its kitchen-exhaust renderer hardcodes industry claims, fake contact requirements and LocalBusiness output. It is unsuitable for an unidentified legal advertiser. This renderer follows its deterministic artifact/manifest pattern while removing those assumptions. No new frontend framework, scheduler, queue, CRM table or production dependency is introduced.

## Build and validate

Use Node 24.14.0. From the repo root, set X1_SOURCE_SHA to the exact 40-character candidate commit and run:

    node tools/build-legal-study.mjs sitepacks/florida-legal-study/mission.json work/legal-dist
    node --test tests/*.test.mjs
    node tools/serve-legal-study.mjs work/legal-dist

Default loopback port is 8080. The container binds 0.0.0.0 and honors PORT. The build fails without the original image or source SHA. No dependency installation is required for this module.

The static preview has no backend API. Vercel applies noindex and restrictive headers. robots.txt excludes every path. There is no sitemap or production canonical, legal business schema or analytics tag. The local /api/legal-intake endpoint deliberately returns 503 without processing the body. The sample browser journey accepts only enumerated topics, stays in memory and resets on close. This is not a live funnel or CRM persistence test.

## Preview and rollback

Deploy only the generated static artifact to the existing website-launch-engine Vercel project, target preview, with immutable source metadata. Do not deploy the root marketing site or change the project root, domains, production environment or aliases. Bind the generated manifest digest to the deployment receipt. Rollback is the prior preview deployment reference or deletion of this isolated candidate; no production promotion is part of this task.

## Before a real legal intake build

Resolve a legitimate advertiser and responsible lawyer/qualifying-provider model. Verify Florida credentials, owner authority, actual office and service area, phone ownership, photography rights and approved fee/claims language. Obtain design and Florida legal review. Map a real tenant-scoped intake contract using the existing Supabase authority, with immutable consent version, idempotency, anti-spam, access controls and retention. The existing marketing-inquiry table lacks a legal tenant boundary and must not be repurposed for sensitive case intake. A real integration must be implemented and tested against that verified contract, including cross-tenant denials, durable positive/negative readback and retention controls. No guessed RPC is included.

Connect verified GA4/GSC properties only after the quality and owner/legal release gates. Never send case type, incident dates, county, contact details, free text or medical information to analytics. Ordinary pages do not use the Google Indexing API. See the mission evidence workbook for current gaps and source research. A source review or local test cannot establish independent Guardian or CloudBrowser acceptance.
