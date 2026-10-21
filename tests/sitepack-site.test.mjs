import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { buildSitepackSite, validateSitepack, readSourceSha, BuildGateError } from "../tools/build-sitepack-site.mjs";

const PACK_PATH = "sitepacks/commercial-kitchen-exhaust-cleaning/sitepack.json";
const pack = JSON.parse(readFileSync(PACK_PATH, "utf8"));
const SHA = "dd186b7de199f05998e5c69a41d8af1547e28eb2";
const OUT_A = "dist/test-preview-a";
const OUT_B = "dist/test-preview-b";

function tree(dir, prefix) {
  const base = prefix || "";
  const rows = [];
  readdirSync(dir).forEach(function (entry) {
    const full = join(dir, entry);
    const rel = base ? base + "/" + entry : entry;
    if (statSync(full).isDirectory()) { rows.push.apply(rows, tree(full, rel)); } else { rows.push(rel); }
  });
  return rows.sort();
}
function htmlFiles(dir) { return tree(dir).filter(function (p) { return p.endsWith(".html"); }); }
function resolveLink(fromPage, href) {
  const parts = join(fromPage, "..", href).split("/");
  const stack = [];
  parts.forEach(function (part) { if (part === "" || part === ".") return; if (part === "..") { stack.pop(); return; } stack.push(part); });
  return stack.join("/");
}

test("builds the same bytes twice: the artifact is deterministic", () => {
  const first = buildSitepackSite(pack, OUT_A, { env: {}, source_sha: SHA });
  const second = buildSitepackSite(pack, OUT_B, { env: {}, source_sha: SHA });
  assert.equal(first.artifact_digest, second.artifact_digest);
  assert.deepEqual(tree(OUT_A), tree(OUT_B));
  tree(OUT_A).forEach(function (rel) {
    assert.equal(readFileSync(join(OUT_A, rel), "utf8"), readFileSync(join(OUT_B, rel), "utf8"), rel + " differs between builds");
  });
});

test("every page carries noindex and no page declares a canonical host", () => {
  buildSitepackSite(pack, OUT_A, { env: {}, source_sha: SHA });
  const pages = htmlFiles(OUT_A);
  assert.equal(pages.length, 4);
  pages.forEach(function (rel) {
    const html = readFileSync(join(OUT_A, rel), "utf8");
    assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/, rel + " is missing the noindex directive");
    assert.ok(!/rel="canonical"/.test(html), rel + " must not declare a canonical host while noindex");
    assert.ok(!/sitemap/.test(html), rel + " must not reference a sitemap while noindex");
  });
  assert.match(readFileSync(join(OUT_A, "robots.txt"), "utf8"), /Disallow: \//);
});

test("structured data parses and matches the page content", () => {
  buildSitepackSite(pack, OUT_A, { env: {}, source_sha: SHA });
  const parse = function (block) { return JSON.parse(block.replace(/^<script type="application\/ld\+json">/, "").replace(/<\/script>$/, "")); };
  const blocksOf = function (html) { return (html.match(/<script type="application\/ld\+json">.+?<\/script>/g) || []).map(parse); };
  const home = blocksOf(readFileSync(join(OUT_A, "index.html"), "utf8"));
  const types = home.map(function (block) { return block["@type"]; });
  assert.ok(types.includes("LocalBusiness"));
  assert.ok(types.includes("FAQPage"));
  const faq = home.find(function (block) { return block["@type"] === "FAQPage"; });
  assert.equal(faq.mainEntity.length, pack.faq.length);
  assert.equal(faq.mainEntity[0].name, pack.faq[0].q);
  const services = blocksOf(readFileSync(join(OUT_A, "services/index.html"), "utf8"));
  assert.equal(services.length, pack.services.length + 1);
  assert.equal(services.filter(function (b) { return b["@type"] === "Service"; }).length, pack.services.length);
  assert.equal(services.find(function (b) { return b["@type"] === "BreadcrumbList"; }).itemListElement.length, 2);
});

test("navigation resolves to emitted files and the lead form is complete", () => {
  buildSitepackSite(pack, OUT_A, { env: {}, source_sha: SHA });
  const emitted = tree(OUT_A);
  htmlFiles(OUT_A).forEach(function (rel) {
    const html = readFileSync(join(OUT_A, rel), "utf8");
    const hrefs = (html.match(/href="([^"]+)"/g) || []).map(function (h) { return h.slice(6, -1); }).filter(function (h) { return h.indexOf(".html") !== -1; });
    assert.ok(hrefs.length >= 3, rel + " has no internal navigation");
    hrefs.forEach(function (h) {
      const resolved = resolveLink(rel, h.split("#")[0]);
      assert.ok(emitted.includes(resolved), rel + " links to a page that is not emitted: " + h);
    });
  });
  const contact = readFileSync(join(OUT_A, "contact/index.html"), "utf8");
  pack.lead_form.fields.forEach(function (field) {
    assert.ok(contact.includes('name="' + field.name + '"'), "lead form is missing field " + field.name);
  });
  assert.match(contact, /data-endpoint="DISABLED"/);
  assert.ok(!/action="https?:\/\//.test(contact), "the preview form must not post to a live endpoint");
});

test("manifest hashes describe the emitted bytes and gates record the fencing", () => {
  const manifest = buildSitepackSite(pack, OUT_A, { env: {}, source_sha: SHA });
  manifest.files.forEach(function (file) {
    const bytes = readFileSync(join(OUT_A, file.path), "utf8");
    assert.equal(createHash("sha256").update(bytes, "utf8").digest("hex"), file.sha256, file.path + " hash mismatch");
    assert.equal(Buffer.byteLength(bytes, "utf8"), file.bytes);
  });
  assert.equal(manifest.noindex, true);
  assert.equal(manifest.lead_mode, "DISABLED");
  assert.equal(manifest.sitemap, "OMITTED_WHILE_NOINDEX");
  assert.equal(manifest.gates.source_sha_pinned, true);
  assert.equal(manifest.gates.independent_qa_required, true);
  assert.equal(manifest.source_sha, SHA);
});

test("source SHA is pinned from the environment and never invented", () => {
  assert.equal(readSourceSha({}), null);
  assert.equal(readSourceSha({ X1_SOURCE_SHA: "not-a-sha" }), null);
  assert.equal(readSourceSha({ X1_SOURCE_SHA: SHA }), SHA);
  assert.equal(readSourceSha({ GITHUB_SHA: SHA }), SHA);
  const unpinned = buildSitepackSite(pack, OUT_B, { env: {}, write: false });
  assert.equal(unpinned.source_sha, "UNPINNED");
  assert.equal(unpinned.gates.source_sha_pinned, false);
});

test("gates refuse a sitepack that would leave the preview fence", () => {
  const cases = [[{ noindex: false }, "GATE_NOINDEX_REQUIRED"], [{ target_environment: "production" }, "GATE_TARGET_NOT_PREVIEW"], [{ phase: "production" }, "GATE_PHASE_NOT_PREVIEW"]];
  cases.forEach(function (pair) {
    const mutated = JSON.parse(JSON.stringify(pack));
    Object.assign(mutated, pair[0]);
    assert.throws(function () { validateSitepack(mutated); }, function (error) {
      assert.ok(error instanceof BuildGateError);
      assert.equal(error.code, pair[1]);
      return true;
    });
  });
  const liveLead = JSON.parse(JSON.stringify(pack));
  liveLead.lead_form.endpoint = "https://www.example.com/api/lead";
  assert.throws(function () { validateSitepack(liveLead); }, function (error) { return error.code === "GATE_LEAD_ENDPOINT_NOT_STAGING"; });
  const canonical = JSON.parse(JSON.stringify(pack));
  canonical.seo.canonical_base = "https://example.com";
  assert.throws(function () { validateSitepack(canonical); }, function (error) { return error.code === "GATE_PRODUCTION_REFERENCE_PRESENT"; });
  const productionDomain = JSON.parse(JSON.stringify(pack));
  productionDomain.brand.email = "service@cobalt-hoodworks.com";
  assert.throws(function () { validateSitepack(productionDomain); }, function (error) { return error.code === "GATE_PRODUCTION_REFERENCE_PRESENT"; });
});

test("a staging lead endpoint is allowed and recorded as staging", () => {
  const staging = JSON.parse(JSON.stringify(pack));
  staging.lead_form.endpoint = "https://staging.cobalt-hoodworks.example/api/lead";
  const manifest = buildSitepackSite(staging, OUT_B, { env: {}, source_sha: SHA, write: false });
  assert.equal(manifest.lead_mode, "STAGING");
  assert.equal(manifest.noindex, true);
});


test("rebuilds twice and compares every output hash, not just the artifact digest", () => {
  const first = buildSitepackSite(pack, OUT_A, { env: {}, source_sha: SHA });
  const second = buildSitepackSite(pack, OUT_B, { env: { X1_SOURCE_SHA: SHA } });
  assert.deepEqual(first.files, second.files, "the per-file hash lists differ between builds");
  assert.equal(first.artifact_digest, second.artifact_digest);
  tree(OUT_A).forEach(function (rel) {
    assert.equal(readFileSync(join(OUT_A, rel), "utf8"), readFileSync(join(OUT_B, rel), "utf8"), rel + " differs between the two builds");
  });
  first.files.forEach(function (file) {
    assert.equal(createHash("sha256").update(readFileSync(join(OUT_A, file.path), "utf8"), "utf8").digest("hex"), file.sha256, file.path + " hash mismatch");
  });
  const third = buildSitepackSite(pack, OUT_A, { env: { GITHUB_SHA: SHA }, write: false });
  assert.equal(third.artifact_digest, first.artifact_digest, "the same SHA from another environment variable must produce the same digest");
});

test("no emitted byte carries a timestamp", () => {
  buildSitepackSite(pack, OUT_A, { env: {}, source_sha: SHA });
  tree(OUT_A).forEach(function (rel) {
    assert.ok(!/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:/.test(readFileSync(join(OUT_A, rel), "utf8")), rel + " carries a timestamp");
  });
});

test("the example business is labelled synthetic on every page and in the manifest", () => {
  const manifest = buildSitepackSite(pack, OUT_A, { env: {}, source_sha: SHA });
  assert.equal(manifest.synthetic, true);
  assert.equal(manifest.verification_status, "SYNTHETIC_UNVERIFIED");
  assert.equal(manifest.gates.synthetic_label_required, true);
  assert.equal(manifest.gates.example_business_synthetic, true);
  htmlFiles(OUT_A).forEach(function (rel) {
    const html = readFileSync(join(OUT_A, rel), "utf8");
    assert.match(html, /class="synthetic-banner"/, rel + " carries no synthetic label");
    assert.match(html, /Synthetic example - not a real business/, rel + " does not name the example as synthetic");
  });
  const contact = readFileSync(join(OUT_A, "contact/index.html"), "utf8");
  assert.match(contact, /cobalt-hoodworks\.invalid/, "the example must not carry a live contact address");
  assert.match(contact, /555-0142/, "the example must keep a reserved fictional phone number");
});

test("a sitepack that drops the synthetic label or claims verification is refused", () => {
  const unlabelled = JSON.parse(JSON.stringify(pack));
  delete unlabelled.synthetic;
  assert.throws(function () { validateSitepack(unlabelled); }, function (error) { return error.code === "GATE_SYNTHETIC_LABEL_REQUIRED"; });
  const verified = JSON.parse(JSON.stringify(pack));
  verified.synthetic = false;
  verified.verification_status = "VERIFIED";
  const manifest = buildSitepackSite(verified, OUT_B, { env: {}, source_sha: SHA, write: false });
  assert.equal(manifest.synthetic, false);
});

test("the synthetic label changes nothing about noindex, the disabled form or staging-only behaviour", () => {
  const manifest = buildSitepackSite(pack, OUT_A, { env: {}, source_sha: SHA });
  assert.equal(manifest.noindex, true);
  assert.equal(manifest.lead_mode, "DISABLED");
  assert.equal(manifest.sitemap, "OMITTED_WHILE_NOINDEX");
  const contact = readFileSync(join(OUT_A, "contact/index.html"), "utf8");
  assert.match(contact, /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.match(contact, /data-endpoint="DISABLED"/);
  assert.ok(!/action="https?:\/\//.test(contact), "the preview form must not post to a live endpoint");
  const staging = JSON.parse(JSON.stringify(pack));
  staging.lead_form.endpoint = "https://staging.cobalt-hoodworks.example/api/lead";
  const stagingManifest = buildSitepackSite(staging, OUT_B, { env: {}, source_sha: SHA, write: false });
  assert.equal(stagingManifest.lead_mode, "STAGING");
  assert.equal(stagingManifest.noindex, true);
});

test("the manifest conforms to the shared cross-repo contract the runtime enforces", () => {
  const bytes = readFileSync("contracts/PREVIEW_PIPELINE_CONTRACT.json", "utf8");
  const contract = JSON.parse(bytes);
  assert.equal(createHash("sha256").update(bytes, "utf8").digest("hex"), readFileSync("contracts/PREVIEW_PIPELINE_CONTRACT.sha256", "utf8").trim());
  const manifest = buildSitepackSite(pack, OUT_A, { env: {}, source_sha: SHA });
  assert.equal(manifest.schema, contract.build_manifest.schema);
  contract.build_manifest.required_keys.forEach(function (key) {
    assert.ok(Object.prototype.hasOwnProperty.call(manifest, key), "the manifest is missing " + key);
  });
  assert.match(manifest.artifact_digest, new RegExp(contract.build_manifest.artifact_digest.pattern));
  assert.match(manifest.source_sha, new RegExp(contract.build_manifest.source_sha.pattern));
  contract.build_manifest.required_gates.forEach(function (key) {
    assert.equal(manifest.gates[key], true, "the manifest does not record the " + key + " gate");
  });
  manifest.files.forEach(function (file) {
    contract.build_manifest.files_entry.required_keys.forEach(function (key) {
      assert.ok(Object.prototype.hasOwnProperty.call(file, key), "an artifact file entry is missing " + key);
    });
    assert.match(file.sha256, new RegExp(contract.build_manifest.files_entry.sha256_pattern));
  });
});
