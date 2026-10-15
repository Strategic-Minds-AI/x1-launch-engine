# 06 ROUTE MANIFEST
| Route / path | Type | Scope | Status |
| --- | --- | --- | --- |
| /templates/prime-surfaces.html | static HTML | Preview branch only | Browser loaded / 200 observed |
| /templates/prime-surfaces/prime.css | static stylesheet | Preview branch only | Network 200 observed |
| /templates/prime-surfaces/prime.js | static browser controls | Preview branch only | Network 200 observed |
| / | existing WLE storefront | Unchanged by this feature branch | Not revalidated in this mission |
| /admin.html, /client.html, /studio.html | existing WLE surfaces | Unchanged | Not modified |
| packages/prime-surfaces-next/ | Next.js App Router package | Nonproduction source only | Authored; build not run |
No separate cron, queue, domain, project, API or worker created. Form never POSTs.
