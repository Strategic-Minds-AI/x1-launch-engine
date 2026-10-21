#!/usr/bin/env node
// Deterministic noindex preview builder for one X1 sitepack.
//   node tools/build-sitepack-site.mjs <sitepack.json> <outDir>
// Every gate is enforced here and nothing is deployed: this emits a byte-stable
// artifact plus a manifest, so a preview can be tested before any host sees it.
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";

export const GATE_CODES = Object.freeze({
  NOINDEX: "GATE_NOINDEX_REQUIRED",
  TARGET: "GATE_TARGET_NOT_PREVIEW",
  LEAD: "GATE_LEAD_ENDPOINT_NOT_STAGING",
  SHAPE: "GATE_SITEPACK_INCOMPLETE",
  PHASE: "GATE_PHASE_NOT_PREVIEW",
  PRODUCTION: "GATE_PRODUCTION_REFERENCE_PRESENT"
});

export class BuildGateError extends Error {
  constructor(code, reason) { super(code + ": " + reason); this.name = "BuildGateError"; this.code = code; this.reason = reason; }
}

const PRODUCTION_HINTS = ["cobalt-hoodworks.com", "www.cobalt-hoodworks.com"];

export function readSourceSha(env) {
  const candidates = [env && env.X1_SOURCE_SHA, env && env.GITHUB_SHA];
  for (const value of candidates) { if (value && /^[0-9a-f]{40}$/.test(String(value))) return String(value); }
  return null;
}

export function validateSitepack(pack) {
  if (!pack || typeof pack !== "object") throw new BuildGateError(GATE_CODES.SHAPE, "sitepack is empty");
  if (pack.phase !== "preview") throw new BuildGateError(GATE_CODES.PHASE, "phase must be preview");
  if (pack.noindex !== true) throw new BuildGateError(GATE_CODES.NOINDEX, "a preview sitepack must be noindex");
  if (pack.target_environment !== "preview") throw new BuildGateError(GATE_CODES.TARGET, "target_environment must be preview");
  const required = ["sitepack_id", "industry", "brand", "market", "services", "process", "faq", "lead_form", "seo"];
  for (const key of required) { if (!pack[key]) throw new BuildGateError(GATE_CODES.SHAPE, "missing sitepack section: " + key); }
  if (!Array.isArray(pack.services) || pack.services.length < 4) throw new BuildGateError(GATE_CODES.SHAPE, "at least four services are required");
  if (!Array.isArray(pack.market.cities) || pack.market.cities.length < 4) throw new BuildGateError(GATE_CODES.SHAPE, "at least four service areas are required");
  if (!Array.isArray(pack.faq) || pack.faq.length < 3) throw new BuildGateError(GATE_CODES.SHAPE, "at least three FAQ entries are required");
  if (!pack.brand.name || !pack.brand.phone || !pack.brand.email) throw new BuildGateError(GATE_CODES.SHAPE, "brand name, phone and email are required");
  const endpoint = String(pack.lead_form.endpoint || "");
  const isDisabled = endpoint === "DISABLED";
  const isStaging = /^https:\/\/[a-z0-9.-]*(staging|preview|stg)[a-z0-9.-]*\//.test(endpoint);
  if (!isDisabled && !isStaging) throw new BuildGateError(GATE_CODES.LEAD, "lead endpoint must be DISABLED or a staging/preview host, received: " + endpoint);
  if (pack.seo.canonical_base) throw new BuildGateError(GATE_CODES.PRODUCTION, "a noindex preview must not declare a canonical production base");
  const flat = JSON.stringify(pack);
  for (const hint of PRODUCTION_HINTS) { if (flat.indexOf(hint) !== -1) throw new BuildGateError(GATE_CODES.PRODUCTION, "sitepack references a production domain: " + hint); }
  return { ok: true, lead_mode: isDisabled ? "DISABLED" : "STAGING" };
}

function esc(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function lines(list) { return list.join("\n"); }
function tel(value) { return String(value).replace(/[^0-9+]/g, ""); }
function slugify(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function navBlock(pack, prefix, active) {
  const items = [["Home", prefix + "index.html", "home"], ["Services", prefix + "services/index.html", "services"], ["Service areas", prefix + "service-areas/index.html", "areas"], ["Contact", prefix + "contact/index.html", "contact"]];
  const links = items.map(function (item) {
    const current = item[2] === active ? ' aria-current="page"' : "";
    return '<li><a href="' + item[1] + '"' + current + ">" + esc(item[0]) + "</a></li>";
  });
  return lines([
    '<header class="site-header">',
    '  <div class="wrap header-inner">',
    '    <a class="brand" href="' + prefix + 'index.html"><span class="brand-mark" aria-hidden="true"></span><span class="brand-text">' + esc(pack.brand.name) + "</span></a>",
    '    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button>',
    '    <nav id="primary-nav" class="site-nav" aria-label="Primary"><ul>' + links.join("") + "</ul></nav>",
    '    <a class="header-phone" href="tel:' + esc(tel(pack.brand.phone)) + '">' + esc(pack.brand.phone) + "</a>",
    "  </div>",
    "</header>"
  ]);
}

function leadForm(pack, prefix, formId) {
  const form = pack.lead_form;
  const fields = form.fields.map(function (field) {
    const id = formId + "-" + field.name;
    const req = field.required ? " required" : "";
    let control;
    if (field.type === "textarea") {
      control = '<textarea id="' + id + '" name="' + field.name + '" rows="4"' + req + "></textarea>";
    } else if (field.type === "select") {
      const options = ['<option value="">Select</option>'].concat((field.options || []).map(function (option) { return '<option value="' + esc(option) + '">' + esc(option) + "</option>"; }));
      control = '<select id="' + id + '" name="' + field.name + '"' + req + ">" + options.join("") + "</select>";
    } else {
      control = '<input id="' + id + '" name="' + field.name + '" type="' + field.type + '"' + req + " />";
    }
    const mark = field.required ? ' <span class="req">required</span>' : "";
    return '<p class="field"><label for="' + id + '">' + esc(field.label) + mark + "</label>" + control + "</p>";
  });
  return lines([
    '<form id="' + formId + '" class="lead-form" data-endpoint="' + esc(form.endpoint) + '" data-mode="' + esc(form.submit_mode) + '" novalidate>',
    '  <h2>Request a cleaning quote</h2>',
    '  <p class="form-note">' + esc(form.notice) + "</p>",
    fields.join("\n"),
    '  <p class="field consent"><input id="' + formId + '-consent" type="checkbox" name="consent" required /> <label for="' + formId + '-consent">' + esc(form.consent) + "</label></p>",
    '  <p><button class="button primary" type="submit">Request my quote</button></p>',
    '  <p class="form-status" role="status" aria-live="polite"></p>',
    "</form>"
  ]);
}

function footerBlock(pack, prefix) {
  const areas = pack.market.cities.slice(0, 6).join(", ");
  return lines([
    '<footer class="site-footer">',
    '  <div class="wrap footer-grid">',
    "    <div>",
    '      <p class="footer-brand">' + esc(pack.brand.name) + "</p>",
    '      <p>' + esc(pack.brand.tagline) + "</p>",
    "    </div>",
    "    <div>",
    '      <p class="footer-head">Service area</p>',
    '      <p>' + esc(pack.market.region) + " - " + esc(areas) + " and surrounding communities.</p>",
    "    </div>",
    "    <div>",
    '      <p class="footer-head">Contact</p>',
    '      <p><a href="tel:' + esc(tel(pack.brand.phone)) + '">' + esc(pack.brand.phone) + '</a><br /><a href="mailto:' + esc(pack.brand.email) + '">' + esc(pack.brand.email) + "</a></p>",
    '      <p>' + esc(pack.brand.hours) + "</p>",
    "    </div>",
    "  </div>",
    '  <div class="wrap footer-legal"><p>Noindex preview build. Not a published site and not submitted for indexing.</p></div>',
    "</footer>"
  ]);
}

function jsonldBlocks(pack, page) {
  const brand = pack.brand;
  const blocks = [];
  if (page.jsonld.indexOf("LocalBusiness") !== -1) {
    blocks.push({
      "@context": "https://schema.org", "@type": "LocalBusiness", name: brand.name, description: pack.seo.description,
      telephone: brand.phone, email: brand.email,
      areaServed: pack.market.cities.map(function (city) { return { "@type": "City", name: city + ", " + pack.market.state }; }),
      address: { "@type": "PostalAddress", addressLocality: "Tampa", addressRegion: pack.market.state, addressCountry: pack.market.country },
      knowsAbout: pack.services.map(function (service) { return service.name; })
    });
  }
  if (page.jsonld.indexOf("Service") !== -1) {
    pack.services.forEach(function (service) {
      blocks.push({ "@context": "https://schema.org", "@type": "Service", name: service.name, description: service.summary, serviceType: service.name, provider: { "@type": "LocalBusiness", name: brand.name }, areaServed: pack.market.region });
    });
  }
  if (page.jsonld.indexOf("FAQPage") !== -1) {
    blocks.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: pack.faq.map(function (item) { return { "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } }; }) });
  }
  if (page.jsonld.indexOf("BreadcrumbList") !== -1) {
    blocks.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: page.crumbs.map(function (crumb, index) { return { "@type": "ListItem", position: index + 1, name: crumb.name, item: crumb.url }; }) });
  }
  return blocks.map(function (block) { return '<script type="application/ld+json">' + JSON.stringify(block) + "</script>"; });
}

function crumbsBlock(page) {
  const parts = page.crumbs.map(function (crumb, index) {
    const last = index === page.crumbs.length - 1;
    return last ? "<span>" + esc(crumb.name) + "</span>" : '<a href="' + crumb.url + '">' + esc(crumb.name) + "</a>";
  });
  return '<nav class="breadcrumbs" aria-label="Breadcrumb">' + parts.join(' <span aria-hidden="true">/</span> ') + "</nav>";
}

function pageShell(pack, page) {
  const prefix = page.prefix;
  const head = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '  <meta name="robots" content="' + esc(pack.seo.robots) + '" />',
    "  <title>" + esc(page.title) + "</title>",
    '  <meta name="description" content="' + esc(page.description) + '" />',
    '  <meta property="og:title" content="' + esc(page.title) + '" />',
    '  <meta property="og:description" content="' + esc(page.description) + '" />',
    '  <meta property="og:type" content="website" />',
    '  <meta name="theme-color" content="' + esc(pack.brand.primary) + '" />',
    '  <link rel="stylesheet" href="' + prefix + 'assets/site.css" />',
    jsonldBlocks(pack, page).join("\n"),
    "</head>",
    '<body class="page-' + page.slug + '">',
    '  <a class="skip" href="#main">Skip to content</a>'
  ];
  const tail = [
    footerBlock(pack, prefix),
    '  <script src="' + prefix + 'assets/site.js" defer></script>',
    "</body>",
    "</html>"
  ];
  return head.join("\n") + "\n" + navBlock(pack, prefix, page.slug) + "\n" + page.body + "\n" + tail.join("\n") + "\n";
}

export function renderSite(pack) {
  const cities = pack.market.cities;
  const serviceCards = pack.services.map(function (service) {
    return lines([
      '<li class="card">',
      '  <h3><a href="services/index.html#' + service.slug + '">' + esc(service.name) + "</a></h3>",
      "  <p>" + esc(service.summary) + "</p>",
      "</li>"
    ]);
  });
  const home = {
    slug: "home", prefix: "", jsonld: ["LocalBusiness", "FAQPage"],
    title: pack.seo.default_title,
    description: pack.seo.description,
    crumbs: [{ name: "Home", url: "index.html" }],
    body: lines([
      '<main id="main" class="wrap">',
      '  <section class="hero">',
      '    <p class="eyebrow">' + esc(pack.vertical) + "</p>",
      "    <h1>Commercial kitchen exhaust cleaning that stands up to inspection</h1>",
      '    <p class="lede">' + esc(pack.brand.tagline) + ". Hood, grease duct, fan and containment work for " + esc(pack.market.region) + ", documented on every visit.</p>",
      '    <p class="hero-actions"><a class="button primary" href="contact/index.html">Request a quote</a> <a class="button ghost" href="tel:' + esc(tel(pack.brand.phone)) + '">Call ' + esc(pack.brand.phone) + "</a></p>",
      '    <ul class="trust-row"><li>NFPA 96 frequency assessment</li><li>Photos before and after</li><li>Certificates in 24 hours</li></ul>',
      "  </section>",
      '  <section aria-labelledby="services-heading">',
      '    <h2 id="services-heading">Services</h2>',
      '    <ul class="cards">' + serviceCards.join("\n") + "</ul>",
      "  </section>",
      '  <section aria-labelledby="assurance-heading">',
      '    <h2 id="assurance-heading">Why operators keep us on schedule</h2>',
      '    <ul class="assurance">' + pack.assurance.map(function (item) { return "<li><h3>" + esc(item.title) + "</h3><p>" + esc(item.detail) + "</p></li>"; }).join("\n") + "</ul>",
      "  </section>",
      '  <section aria-labelledby="process-heading">',
      '    <h2 id="process-heading">How a cleaning visit runs</h2>',
      '    <ol class="process">' + pack.process.map(function (item) { return "<li><h3>" + esc(item.step) + "</h3><p>" + esc(item.detail) + "</p></li>"; }).join("\n") + "</ol>",
      "  </section>",
      '  <section aria-labelledby="areas-heading">',
      '    <h2 id="areas-heading">Service area</h2>',
      "    <p>" + esc(pack.market.region) + "</p>",
      '    <ul class="cities compact">' + cities.map(function (city) { return '<li><a href="service-areas/index.html#' + slugify(city) + '">' + esc(city) + "</a></li>"; }).join("\n") + "</ul>",
      "  </section>",
      '  <section aria-labelledby="faq-heading">',
      '    <h2 id="faq-heading">Questions operators ask</h2>',
      '    <div class="faq">' + pack.faq.map(function (item) { return "<details><summary>" + esc(item.q) + "</summary><p>" + esc(item.a) + "</p></details>"; }).join("\n") + "</div>",
      "  </section>",
      '  <section aria-labelledby="quote-heading">' + leadForm(pack, "", "home-form") + "</section>",
      "</main>"
    ])
  };
  const services = {
    slug: "services", prefix: "../", jsonld: ["Service", "BreadcrumbList"],
    title: "Kitchen exhaust, grease duct and fan services | " + pack.brand.name,
    description: "Hood cleaning, grease duct cleaning, fan service, filter programs, compliance reporting and grease containment for " + pack.market.region + ".",
    crumbs: [{ name: "Home", url: "../index.html" }, { name: "Services", url: "index.html" }],
    body: lines([
      '<main id="main" class="wrap">',
      "  " + crumbsBlock({ crumbs: [{ name: "Home", url: "../index.html" }, { name: "Services", url: "index.html" }] }),
      "  <h1>Services for commercial kitchens</h1>",
      '  <p class="lede">Every service below is delivered with photo documentation, grease-thickness notes and a certificate set issued within 24 hours.</p>',
      pack.services.map(function (service) {
        return lines([
          '  <section id="' + service.slug + '" class="service">',
          "    <h2>" + esc(service.name) + "</h2>",
          "    <p>" + esc(service.summary) + "</p>",
          "    <ul>" + service.bullets.map(function (bullet) { return "<li>" + esc(bullet) + "</li>"; }).join("") + "</ul>",
          '    <p><a class="button ghost" href="../contact/index.html">Request this service</a></p>',
          "  </section>"
        ]);
      }).join("\n"),
      "</main>"
    ])
  };
  const areas = {
    slug: "areas", path: "service-areas/index.html", prefix: "../", jsonld: ["LocalBusiness", "BreadcrumbList"],
    title: "Service areas across " + pack.market.region + " | " + pack.brand.name,
    description: "Commercial kitchen exhaust and grease duct cleaning serving " + cities.join(", ") + ".",
    crumbs: [{ name: "Home", url: "../index.html" }, { name: "Service areas", url: "index.html" }],
    body: lines([
      '<main id="main" class="wrap">',
      "  " + crumbsBlock({ crumbs: [{ name: "Home", url: "../index.html" }, { name: "Service areas", url: "index.html" }] }),
      "  <h1>Service areas</h1>",
      '  <p class="lede">Crews dispatch across ' + esc(pack.market.region) + " with overnight windows available in every city below.</p>",
      '  <ul class="cities">' + cities.map(function (city) { return '<li id="' + slugify(city) + '">' + esc(city) + "</li>"; }).join("\n") + "</ul>",
      "  <section><h2>Outside the listed cities</h2><p>Tell us the address and the hood count. If the drive is outside our dispatch radius we will say so directly and point you to the closest crew that can serve the system.</p></section>",
      '  <p><a class="button primary" href="../contact/index.html">Request a quote</a></p>',
      "</main>"
    ])
  };
  const contact = {
    slug: "contact", prefix: "../", jsonld: ["LocalBusiness", "BreadcrumbList"],
    title: "Request kitchen exhaust cleaning in " + pack.market.region + " | " + pack.brand.name,
    description: "Tell us about your hood, duct length and last cleaning date. Certificates, photo sets and deficiency lists are issued within 24 hours of every visit.",
    crumbs: [{ name: "Home", url: "../index.html" }, { name: "Contact", url: "index.html" }],
    body: lines([
      '<main id="main" class="wrap">',
      "  " + crumbsBlock({ crumbs: [{ name: "Home", url: "../index.html" }, { name: "Contact", url: "index.html" }] }),
      "  <h1>Request a cleaning quote</h1>",
      '  <p class="lede">Send the address, hood count and last cleaning date and we will return a written scope with the frequency basis attached.</p>',
      '  <div class="contact-grid">',
      '    <div><h2>Reach us directly</h2><p><a href="tel:' + esc(tel(pack.brand.phone)) + '">' + esc(pack.brand.phone) + '</a><br /><a href="mailto:' + esc(pack.brand.email) + '">' + esc(pack.brand.email) + "</a></p><p>" + esc(pack.brand.hours) + "</p></div>",
      '    <div><h2>What happens next</h2><ol class="process compact">' + pack.process.map(function (item) { return "<li><strong>" + esc(item.step) + "</strong> " + esc(item.detail) + "</li>"; }).join("") + "</ol></div>",
      "  </div>",
      '  <section aria-labelledby="form-heading">' + leadForm(pack, "", "contact-form") + "</section>",
      "</main>"
    ])
  };
  const pages = [home, services, areas, contact];
  return pages.map(function (page) { return { path: page.path ? page.path : (page.slug === "home" ? "index.html" : page.slug + "/index.html"), content: pageShell(pack, page) }; });
}

const CSS = [
  ":root{--primary:#0b2a3a;--accent:#0f8f8f;--surface:#f6f9fb;--ink:#111c24;--muted:#4a5b66;--line:#d7e2e8;--radius:14px}",
  "*,*::before,*::after{box-sizing:border-box}",
  "html{-webkit-text-size-adjust:100%}",
  "body{margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--surface);line-height:1.6}",
  "a{color:var(--primary)}",
  "a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:2px}",
  ".skip{position:absolute;left:-9999px}",
  ".skip:focus{left:1rem;top:1rem;background:#fff;padding:.5rem 1rem;border-radius:8px;z-index:20}",
  ".wrap{width:min(1080px,92vw);margin:0 auto}",
  ".site-header{background:var(--primary);color:#fff;position:sticky;top:0;z-index:10}",
  ".header-inner{display:flex;flex-wrap:wrap;align-items:center;gap:1rem;padding:.85rem 0}",
  ".brand{display:flex;align-items:center;gap:.6rem;color:#fff;text-decoration:none;font-weight:700}",
  ".brand-mark{width:1.1rem;height:1.1rem;border-radius:50%;background:var(--accent);display:inline-block}",
  ".site-nav ul{display:flex;flex-wrap:wrap;gap:1rem;list-style:none;margin:0;padding:0}",
  ".site-nav a{color:#dceaf0;text-decoration:none;font-size:.95rem}",
  ".site-nav a[aria-current=page]{color:#fff;border-bottom:2px solid var(--accent)}",
  ".header-phone{margin-left:auto;color:#fff;font-weight:600;text-decoration:none}",
  ".nav-toggle{display:none;background:transparent;border:1px solid rgba(255,255,255,.5);color:#fff;border-radius:999px;padding:.35rem .9rem}",
  "main{padding:2.5rem 0 3rem}",
  "h1{font-size:clamp(1.9rem,4vw,2.7rem);line-height:1.15;margin:0 0 1rem}",
  "h2{font-size:clamp(1.35rem,2.6vw,1.9rem);margin:2.5rem 0 .75rem}",
  "h3{font-size:1.1rem;margin:0 0 .4rem}",
  ".eyebrow{text-transform:uppercase;letter-spacing:.16em;font-size:.75rem;color:var(--accent);margin:0 0 .5rem}",
  ".lede{font-size:1.1rem;color:var(--muted);max-width:62ch}",
  ".hero{padding-bottom:1rem}",
  ".hero-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin:1.25rem 0}",
  ".button{display:inline-block;border-radius:999px;padding:.7rem 1.3rem;font-weight:600;text-decoration:none;border:1px solid transparent}",
  ".button.primary{background:var(--accent);color:#fff}",
  ".button.ghost{border-color:var(--primary);color:var(--primary);background:#fff}",
  ".trust-row{display:flex;flex-wrap:wrap;gap:1rem;list-style:none;padding:0;color:var(--muted);font-size:.95rem}",
  ".cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;list-style:none;padding:0}",
  ".card{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:1.25rem}",
  ".assurance{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;list-style:none;padding:0}",
  ".assurance li{background:#fff;border-left:4px solid var(--accent);border-radius:10px;padding:1rem}",
  ".process{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));padding-left:1.2rem}",
  ".process.compact{grid-template-columns:1fr;padding-left:1.2rem}",
  ".cities{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.5rem;list-style:none;padding:0}",
  ".cities li{background:#fff;border:1px solid var(--line);border-radius:999px;padding:.4rem .9rem;text-align:center}",
  ".cities a{text-decoration:none}",
  ".faq details{background:#fff;border:1px solid var(--line);border-radius:12px;padding:.9rem 1.1rem;margin-bottom:.6rem}",
  ".faq summary{cursor:pointer;font-weight:600}",
  ".lead-form{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:1.5rem;max-width:720px}",
  ".field{display:flex;flex-direction:column;gap:.35rem;margin:0 0 1rem}",
  ".field label{font-weight:600;font-size:.95rem}",
  ".field .req{font-weight:400;color:var(--muted);font-size:.8rem}",
  ".field input,.field select,.field textarea{border:1px solid var(--line);border-radius:10px;padding:.6rem .7rem;font:inherit;background:#fff}",
  ".field.consent{flex-direction:row;align-items:flex-start;gap:.6rem}",
  ".field.consent label{font-weight:400;font-size:.9rem}",
  ".form-note{color:var(--muted);font-size:.9rem;margin:0 0 1rem}",
  ".form-status{font-weight:600;color:var(--primary);min-height:1.3rem}",
  ".breadcrumbs{font-size:.9rem;color:var(--muted);margin-bottom:1rem}",
  ".service{border-top:1px solid var(--line);padding-top:1.25rem}",
  ".contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;margin:1.5rem 0}",
  ".site-footer{background:var(--primary);color:#dceaf0;padding:2.5rem 0 1.5rem;margin-top:3rem}",
  ".footer-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem}",
  ".footer-brand{font-weight:700;color:#fff;font-size:1.05rem;margin:0 0 .4rem}",
  ".footer-head{text-transform:uppercase;letter-spacing:.14em;font-size:.72rem;color:#9fc4d2;margin:0 0 .4rem}",
  ".site-footer a{color:#fff}",
  ".footer-legal{border-top:1px solid rgba(255,255,255,.2);margin-top:1.5rem;padding-top:1rem;font-size:.85rem;color:#9fc4d2}",
  "@media (max-width:720px){.nav-toggle{display:inline-block}.site-nav{display:none;width:100%}.site-nav.open{display:block}.site-nav ul{flex-direction:column;gap:.6rem}.header-phone{margin-left:0}}",
  "@media print{.site-header,.lead-form,.nav-toggle{display:none}}"
];

const JS = [
  "// Preview-build behaviour only: no network calls, no tracking.",
  "(function () {",
  '  var toggle = document.querySelector(".nav-toggle");',
  '  var nav = document.getElementById("primary-nav");',
  "  if (toggle && nav) {",
  '    toggle.addEventListener("click", function () {',
  "      var open = nav.classList.toggle(\"open\");",
  '      toggle.setAttribute("aria-expanded", open ? "true" : "false");',
  "    });",
  "  }",
  '  document.querySelectorAll("form.lead-form").forEach(function (form) {',
  '    form.addEventListener("submit", function (event) {',
  "      event.preventDefault();",
  '      var status = form.querySelector(".form-status");',
  "      var missing = [];",
  '      var fields = form.querySelectorAll("input[required], select[required], textarea[required]");',
  "      for (var i = 0; i < fields.length; i += 1) {",
  "        if (!String(fields[i].value || \"\").trim()) { missing.push(fields[i].name); }",
  "      }",
  "      if (missing.length) {",
  '        if (status) { status.textContent = "Please complete: " + missing.join(", "); }',
  "        return;",
  "      }",
  '      if (status) { status.textContent = "Preview build: submission is disabled until the staging endpoint and independent QA are approved."; }',
  "    });",
  "  });",
  "})();"
];

const ROBOTS = lines(["User-agent: *", "Disallow: /", "Noindex preview build. Indexing returns only after approved production promotion.", ""]);

function sha256(text) { return createHash("sha256").update(text, "utf8").digest("hex"); }

export function buildSitepackSite(pack, outDir, options) {
  const opts = options || {};
  const validation = validateSitepack(pack);
  const sourceSha = opts.source_sha || readSourceSha(opts.env || process.env) || null;
  const files = renderSite(pack).concat([
    { path: "assets/site.css", content: CSS.join("\n") + "\n" },
    { path: "assets/site.js", content: JS.join("\n") + "\n" },
    { path: "robots.txt", content: ROBOTS }
  ]);
  files.sort(function (a, b) { return a.path < b.path ? -1 : a.path > b.path ? 1 : 0; });
  const manifestFiles = files.map(function (file) { return { path: file.path, bytes: Buffer.byteLength(file.content, "utf8"), sha256: sha256(file.content) }; });
  const digestInput = manifestFiles.map(function (file) { return file.path + ":" + file.sha256; }).join("\n") + "\n";
  const manifest = {
    schema: "strategic-minds/sitepack-build-manifest/v1",
    sitepack_id: pack.sitepack_id,
    industry_slug: pack.industry_slug,
    phase: pack.phase,
    target_environment: pack.target_environment,
    noindex: true,
    sitemap: pack.seo.sitemap,
    lead_mode: validation.lead_mode,
    source_sha: sourceSha || "UNPINNED",
    gates: {
      noindex_enforced: true,
      preview_target_enforced: true,
      lead_endpoint_staging_fenced: true,
      production_reference_absent: true,
      structured_data_present: true,
      source_sha_pinned: Boolean(sourceSha),
      independent_qa_required: Boolean(pack.gates.independent_qa_required),
      guardian_receipt_required_before_promotion: Boolean(pack.gates.guardian_receipt_required_before_promotion)
    },
    artifact_digest: sha256(digestInput),
    files: manifestFiles
  };
  if (opts.write !== false) {
    rmSync(outDir, { recursive: true, force: true });
    files.forEach(function (file) {
      const target = join(outDir, file.path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, file.content, "utf8");
    });
    writeFileSync(join(outDir, "build-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  }
  return manifest;
}

function main() {
  const sitepackPath = process.argv[2];
  const outDir = process.argv[3] || "dist/preview-site";
  if (!sitepackPath) { console.error("usage: node tools/build-sitepack-site.mjs <sitepack.json> <outDir>"); process.exit(2); }
  const pack = JSON.parse(readFileSync(sitepackPath, "utf8"));
  const manifest = buildSitepackSite(pack, outDir);
  console.log("built " + manifest.files.length + " files, artifact_digest=" + manifest.artifact_digest + ", source_sha=" + manifest.source_sha);
}

if (process.argv[1] && process.argv[1].indexOf("build-sitepack-site.mjs") !== -1) main();
