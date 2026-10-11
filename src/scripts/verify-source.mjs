import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const root = resolve(import.meta.dirname, "..");
const home = readFileSync(resolve(root, "index.html"), "utf8");
const admin = readFileSync(resolve(root, "admin.html"), "utf8");
const client = readFileSync(resolve(root, "client.html"), "utf8");
for (const s of ["Launch <em>100s</em>", "tel:+17722090266", "WLE PREMIUM V2", "expandedTemplateLibrary", "/admin.html", "/client.html", "Fort Lauderdale"]) {
  assert(home.includes(s), `Missing approved site element: ${s}`);
}
assert(!/utah|555[\\s-]*0123/i.test(home), "Outdated location or placeholder phone");
assert(admin.includes("Admin Control Center") && /noindex/.test(admin), "Admin preview missing or indexable");
assert(client.includes("Client Workspace") && /noindex/.test(client), "Client preview missing or indexable");
console.log("PASS: premium design, phone, industry library, portal references and preview protections preserved");
