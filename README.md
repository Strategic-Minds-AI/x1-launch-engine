# Website Launch Engine 🚀

**A Strategic Minds AI System** · Florida · [(772) 209-0266](tel:+17722090266)

Premium conversion-focused Website Launch Engine, built around the operator-approved mountain-blue showcase and future approval-gated website factory.

### Open the approved site
- [Production marketing website](https://website-launch-engine-xps.vercel.app/) (unchanged; Vercel project `website-launch-engine-xps`)
- [Premium showroom preview](https://website-launch-engine-joj4ni51v-strategic-minds-advisory.vercel.app/)
- [Admin UI preview](https://website-launch-engine-joj4ni51v-strategic-minds-advisory.vercel.app/admin.html)
- [Client UI preview](https://website-launch-engine-joj4ni51v-strategic-minds-advisory.vercel.app/client.html)

### Source of truth
This independent repository contains the actual three HTML source documents recovered from the premium Vercel preview, plus a separately frozen production home page. It is **not** a redesign and is not currently connected to automated production deployments.

| Repo path | Purpose |
|---|---|
| `src/index.html` | Approved premium marketing showroom |
| `src/admin.html` | Admin portal UI preview (NOT authenticated) |
| `src/client.html` | Client portal UI preview (NOT authenticated) |
| `src/api/health.js` | Minimal non-sensitive API bootstrap health |
| `src/api/missions.js` | Fail-closed mission endpoint; returns 503 until secure bridge exists |
| `snapshots/production-2026-10-10/index.html` | Exact earlier live design baseline |
| `docs/SOURCE_TRUTH.md` | Locked design, canonical identities, approval gates |
| `docs/BACKEND_CONTRACT.md` | Future runtime/security contracts |
| `docs/RELEASE_CHECKLIST.md` | Independent QA and release requirements |

### Work locally
From the repository root: `cd src && npm test` (uses Node's built-in test runner, no dependencies). Serve the static `src/` folder with any development HTTP server to view the pages. The starter API is designed for Vercel Functions when deployed using `src/` as the Vercel project's root directory.

### Architecture
Website Launch Engine UI → authenticated API → existing X1/Supabase durable queue → isolated Railway sandbox workers → independent validation → approval → Vercel release. **Do not** introduce a duplicate queue, cron, or agent platform.

**Current state:** real static frontend sources are preserved. The admin/client pages are mock-data interfaces. Database, authentication, lead capture and AI provisioning are **not connected**. Original images generated during visual concept work are not claimed installed until an assets manifest and rendered requests verify them.

### Safety
Production is unchanged by this repository. Keep the default branch protected and perform changes in isolated feature branches. Production deployment, DNS, secrets, live messaging, customer data, spend and schema migrations require explicit approval. See `docs/SOURCE_TRUTH.md`.
