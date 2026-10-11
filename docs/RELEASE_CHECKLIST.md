# Release Checklist: approval required

- [ ] Confirm exact live project, branch, immutable commit SHA, preview deployment and rollback identity
- [ ] Preview source matches approved mountain-blue locked design on 1440px, tablet and 390px
- [ ] All 20 industry categories and six featured template previews render with accurate images
- [ ] Hero and typography parity evidence, distinct category template compositions and alt text
- [ ] All phone links use `tel:+17722090266`; all Florida claims are accurate
- [ ] Client and admin login use authenticated session protection (NOT implemented)
- [ ] RLS tests deny cross-tenant projects/leads/approvals
- [ ] GPT mission API bound to durable queue, idempotency and lease receipts
- [ ] Isolated build worker returns one actual synthetic website and independently validated URL
- [ ] Safe lead capture, consent, rate limits, delivery receipt and bot protection
- [ ] Security checks; no browser-side secrets or production credentials in worker
- [ ] Browser E2E; navigation, modal, multi-location workflow, error recovery
- [ ] Lighthouse/Core Web Vitals evidence, accessibility-critical tests, crawler policy
- [ ] Independent validator distinct from implementer; 100% declared tests executed
- [ ] Operator approves exact production deployment and rollback plan
- [ ] Production release and post-deploy smoke test receipt

**Status:** Release blocked until these gates pass. A READY Vercel preview does not certify customer-ready backend.
