# X1 Launch Engine / Visual X1 Sandbox Integration Contract
Mission X1-VISUAL-SANDBOX-20261020 · Stage: feature branch only.

## Implementation
- `admin.html` shows "X1 Autonomous Coding Sandbox" with an operator-only button. It uses the admin's in-memory Supabase session token.
- `GET /api/runtime-status` verifies the user with Supabase Auth and the existing `X1_ADMIN_USER_IDS` allowlist. No anonymous results or user-selected URLs are supported.
- Server probes six fixed, HTTPS `www.strategicmindsai.com/api/x1/*` endpoints; it returns *only* HTTP status codes, check names, timestamps and transport-evidence labels.
- Protected upstream telemetry needs the optional **server-only** `X1_RUNTIME_READ_TOKEN` and `X1_RUNTIME_TENANT_ID` references. These values must be provisioned explicitly for this deployment after policy review; do not copy service-role or user credentials into browser JS.
- Docker/Ollama remain on JARVIS loopback and are NOT callable from the public frontend. A future authenticated, signed, existing-X1 control-plane snapshot contract is required to show actual model or container health.

## Non-goals
No duplicate queue, orchestrator, scheduler, browser instance, privileged sidecar, automatic production deployment, cloned ChatGPT account, or host Docker API exposure.

## Tests / deployment gate
`node --test tests/wle-contracts.test.mjs tests/wle-academy-integration.test.mjs tests/x1-sandbox-contracts.test.mjs`
CI: `.github/workflows/wle-validation.yml`.
Independent Guardian must verify the exact SHA and permissions. Full user experience requires authenticated browser session, negative access tests, real queue canary, and verified preview deploy. A successful API HTTP response is not proof that autonomous coding works.

## Handoff
Read `docs/X1_VISUAL_SANDBOX_MASTER_WORKBOOK.md` in `Strategic-Minds-AI/visual-x1-platform` feature branch `feat/x1-visual-sandbox-runtime-20261020`. Keep this repo's PR in draft until the dependency/CI/Guardian gates pass. The admin's Visual X1 deep link must be configured only after verifying the exact public site URL and its auth/session behavior; do not guess a domain.
