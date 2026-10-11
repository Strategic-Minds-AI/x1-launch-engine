import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const home = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const admin = readFileSync(new URL("../admin.html", import.meta.url), "utf8");
const client = readFileSync(new URL("../client.html", import.meta.url), "utf8");

for (const expected of ["Launch <em>100s</em>", "tel:+17722090266", "WLE PREMIUM V2", "expandedTemplateLibrary", "/admin.html", "/client.html", "Fort Lauderdale"]) {
  assert(home.includes(expected), `Missing approved site element: ${expected}`);
}
assert(!/utah|555.{0,3}0123/i.test(home), "Outdated location or placeholder phone");
assert(admin.includes("Admin Control Center") && /noindex/i.test(admin), "Admin preview missing or indexable");
assert(client.includes("Client Workspace") && /noindex/i.test(client), "Client preview missing or indexable");
console.log("PASS: approved design, phone, gallery, portal routes and index safety remain intact");
