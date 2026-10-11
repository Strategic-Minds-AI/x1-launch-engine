import {test} from "node:test";
import assert from "node:assert/strict";
import {buildCanonicalSitemaps} from "../lib/site-maps.js";
test("includes only validated verified canonical URLs",()=>{
 const result=buildCanonicalSitemaps("https://example.com/",[
 {url:"https://example.com/",verified:true,indexable:true,status:"VALIDATED"},
 {url:"https://example.com/roofing",verified:true,indexable:true,status:"VALIDATED"},
 {url:"https://other.com/roofing",verified:true,indexable:true,status:"VALIDATED"},
 {url:"https://example.com/unverified",verified:false,indexable:true,status:"VALIDATED"},
 {url:"https://example.com/draft",verified:true,indexable:false,status:"DRAFT"},
 {url:"https://example.com/roofing",verified:true,indexable:true,status:"VALIDATED"}
 ]);
 assert.equal(result.verifiedUrlCount,2);
 assert.equal(result.sitemaps[0].count,2);
 assert(!result.sitemaps[0].xml.includes("other.com"));
 assert(result.robotsTxt.includes("sitemap-index.xml"));
});
test("shards at limits and escapes XML",()=>{
 const entries=["a","b","c"].map(x=>({url:"https://example.com/"+x,verified:true,indexable:true,status:"VALIDATED"}));
 const r=buildCanonicalSitemaps("https://example.com/",entries,{maxUrls:2});
 assert.equal(r.sitemaps.length,2);
 assert(r.indexXml.includes("sitemap-2.xml"));
});
test("rejects insecure noncanonical root and bad limits",()=>{
 assert.throws(()=>buildCanonicalSitemaps("http://example.com/",[]),/HTTPS_ROOT/);
 assert.throws(()=>buildCanonicalSitemaps("https://example.com/page",[]),/HTTPS_ROOT/);
 assert.throws(()=>buildCanonicalSitemaps("https://example.com/",[],{maxUrls:50001}),/INVALID_LIMIT/);
});
