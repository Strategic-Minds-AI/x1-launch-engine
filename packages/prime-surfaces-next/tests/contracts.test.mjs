import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read=(f)=>readFileSync(new URL("../"+f,import.meta.url),"utf8");

test("approvals are locked to Brand B, Design 2, Workflow C, concept 05",()=>{
  const source=read("lib/template.ts");
  for(const token of ['brandPack: "B"','websiteDesign: "2"','workflow: "C"','concept: "05"']){
    assert.ok(source.includes(token),"Missing lock "+token);
  }
});
test("noindex is explicit for the demo Next app",()=>{
  const layout=read("app/layout.tsx");
  const robots=read("app/robots.ts");
  assert.match(layout,/index: false/);
  assert.match(robots,/disallow: "\/"/);
});
test("the React inquiry is strictly browser local",()=>{
  const source=read("components/PrimeSite.tsx");
  assert.match(source,/preventDefault\(\)/);
  assert.match(source,/Nothing transmitted, quoted, persisted/);
  assert.doesNotMatch(source,/fetch\(|navigator\.sendBeacon|localStorage\.setItem/);
});
test("four studio control surfaces and manifest export exist",()=>{
  const source=read("components/PrimeSite.tsx");
  for(const token of ["BRAND GENERATOR","ACCENT REGENERATOR","CONTENT GENERATOR","IMAGE DIRECTION","EXPORT DRAFT JSON","EXPORT IMAGE GENERATION BRIEF"]){
    assert.ok(source.includes(token),"Missing control "+token);
  }
});
test("each section has its own anchor and is represented on the page",()=>{
  const source=read("components/PrimeSite.tsx");
  for(const id of ["services","materials","portfolio","method","inquiry"]){
    assert.ok(source.includes('id="'+id+'"'),"Missing section "+id);
  }
});
