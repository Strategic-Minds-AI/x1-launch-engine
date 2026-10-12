import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInquiryHandler } from "../src/api/inquiry.js";

const TENANT="666f23bf-61bd-4be0-b5cb-4872e04fad9b";
const ORIGIN="https://website-launch-engine-a1b2c3-strategic-minds-advisory.vercel.app";
const ID="11111111-2222-4333-8444-555555555555";
const RECEIPT="aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const STORED=Object.freeze({id:RECEIPT,contact_name:"Synthetic WLE QA",
  email:"qa@example.invalid",industry:"Roofing",
  details:"Synthetic preview-only validation. No customer contact.",
  source_site:"website-launch-engine"});
function env(patch={}) {
  return {
    VERCEL_ENV:"preview",WLE_LEAD_INTAKE_ENABLED:"true",
    WLE_LEAD_RATE_LIMIT_VERIFIED:"true",
    WLE_STAGING_SUPABASE_URL:"https://uvdkzsbjackpjvpoxtyk.supabase.co",
    WLE_LEAD_TENANT_ID:TENANT,
    WLE_LEAD_SERVICE_ROLE_KEY:"FAKE_SERVER_SECRET_FOR_TESTS_ONLY_123456789",
    WLE_LEAD_ALLOWED_ORIGIN:ORIGIN,
    ...patch,
  };
}
function fields(patch={}) {
  return {requestId:ID,name:"Synthetic WLE QA",email:"qa@example.invalid",
    industry:"Roofing",message:"Synthetic preview-only validation. No customer contact.",website:"",...patch};
}
function request(patch={}) {
  return {method:"POST",headers:{"origin":ORIGIN,"host":new URL(ORIGIN).host,
    "content-type":"application/json","content-length":"300"},
    body:fields(),...patch};
}
function response(){
  return {code:200,headers:{},body:null,
    setHeader(name,value){this.headers[name]=value;return this},
    status(code){this.code=code;return this},
    json(body){this.body=body;return this},
  };
}
async function run({environment=env(),req=request(),fetchImpl=async()=>{throw new Error("network attempted")}}={}){
  const res=response();
  await createInquiryHandler({env:environment,fetchImpl})(req,res);
  return res;
}
test("staging intake is OFF by default and never connects to provider",async()=>{
  let calls=0;const result=await run({environment:{},fetchImpl:async()=>{calls++;}});
  assert.equal(result.code,503);
  assert.equal(result.body.code,"WLE_LEAD_INTAKE_NOT_BOUND");
  assert.equal(result.body.customerDataAccepted,false);
  assert.equal(calls,0);
});
test("production, invalid project, missing rate limit, missing key and unbound tenant fail closed",async(t)=>{
  for(const patch of [
    {VERCEL_ENV:"production"},{VERCEL_ENV:"development"},
    {WLE_LEAD_INTAKE_ENABLED:"false"},{WLE_LEAD_RATE_LIMIT_VERIFIED:"false"},
    {WLE_STAGING_SUPABASE_URL:"https://vgsmyhqqtkkluhypxyua.supabase.co"},
    {WLE_LEAD_SERVICE_ROLE_KEY:""},{WLE_LEAD_TENANT_ID:"not-a-uuid"},
    {WLE_LEAD_ALLOWED_ORIGIN:"https://evil.example"},
  ]) {
    await t.test(JSON.stringify(patch),async()=>{
      const result=await run({environment:env(patch)});
      assert.equal(result.code,503);
      assert.equal(result.body.customerDataAccepted,false);
    });
  }
});
test("GET rejected without ever touching storage",async()=>{
  const result=await run({req:request({method:"GET"})});
  assert.equal(result.code,405);
  assert.equal(result.headers.Allow,"POST");
});
test("same-origin and JSON content type are mandatory",async()=>{
  const forged=await run({req:request({headers:{...request().headers,origin:"https://attacker.example"}})});
  assert.equal(forged.code,403);
  const otherHost=await run({req:request({headers:{...request().headers,host:"attacker.example"}})});
  assert.equal(otherHost.code,403);
  const invalidMedia=await run({req:request({headers:{...request().headers,"content-type":"text/plain"}})});
  assert.equal(invalidMedia.code,415);
});
test("oversized or malformed body rejected before storage call",async()=>{
  const oversize=await run({req:request({headers:{...request().headers,"content-length":"5000"}})});
  assert.equal(oversize.code,413);
  const longMessage=await run({req:request({body:fields({message:"X".repeat(5000)})})});
  assert.equal(longMessage.code,413);
  const invalidJson=await run({req:request({body:"{not-json"})});
  assert.equal(invalidJson.code,400);
});
test("required fields, known industries, honeypot, request id and cross-tenant inputs are validated",async(t)=>{
  const variants=[
    fields({name:"x"}),fields({email:"not-an-email"}),fields({industry:"Unlisted"}),
    fields({message:"short"}),fields({website:"https://spam.example"}),
    fields({requestId:"not-a-uuid"}),fields({tenant_id:"aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"}),
    fields({email:"x".repeat(270)+"@example.invalid"}),
    fields({name:"x\u0000y"}),
  ];
  for(const item of variants){
    await t.test(JSON.stringify(item).slice(0,60),async()=>{
      const r=await run({req:request({body:item})});
      assert.equal(r.code,422);
      assert.equal(r.body.customerDataAccepted,false);
    });
  }
});
test("one synthetic staging write + independently checked readback confirms persisted lead",async()=>{
  const calls=[];
  const fakeFetch=async(url,options)=>{
    calls.push({url,options});
    if(options.method==="POST") return new Response(null,{status:201});
    if(options.method==="GET") return new Response(JSON.stringify([STORED]),{status:200,
      headers:{"content-type":"application/json"}});
    throw new Error("UNKNOWN_METHOD");
  };
  const result=await run({fetchImpl:fakeFetch});
  assert.equal(result.code,202);
  assert.equal(result.body.ok,true);
  assert.equal(result.body.customerDataAccepted,true);
  assert.equal(result.body.messageSent,false);
  assert.equal(result.body.requestId,ID);
  assert.equal(result.body.receiptId,RECEIPT);
  assert.equal(calls.length,2);
  assert.deepEqual(calls.map(x=>x.options.method),["POST","GET"]);
  assert.equal(new URL(calls[0].url).hostname,"uvdkzsbjackpjvpoxtyk.supabase.co");
  assert.equal(new URL(calls[0].url).pathname,"/rest/v1/wle_lead_inquiries");
  assert.match(calls[0].options.headers.Prefer,/ignore-duplicates/);
  const saved=JSON.parse(calls[0].options.body);
  assert.equal(saved.length,1);
  assert.equal(saved[0].tenant_id,TENANT);
  assert.equal(saved[0].source_site,"website-launch-engine");
  assert.equal(saved[0].status,"new");
  assert.equal(saved[0].contact_name,"Synthetic WLE QA");
  assert.equal(new URL(calls[1].url).searchParams.get("tenant_id"),"eq."+TENANT);
  assert.equal(new URL(calls[1].url).searchParams.get("request_id"),"eq."+ID);
  assert.equal(JSON.stringify(result.body).includes("qa@example.invalid"),false);
  assert.equal(JSON.stringify(result.body).includes("FAKE_SERVER_SECRET"),false);
});
test("409 duplicate is accepted ONLY when matching stored receipt exists",async()=>{
  const methods=[];
  const fakeFetch=async(url,options)=>{
    methods.push(options.method);
    return options.method==="POST" ? new Response("conflict",{status:409}) :
      new Response(JSON.stringify([STORED]),{status:200});
  };
  const r=await run({fetchImpl:fakeFetch});
  assert.equal(r.code,202);
  assert.deepEqual(methods,["POST","GET"]);
});
test("ambiguous upload timeout cannot count as failure or success unless independently read back",async()=>{
  const readBackSuccess=async(_url,options)=>{
    if(options.method==="POST") throw Error("socket_timeout");
    return new Response(JSON.stringify([STORED]),{status:200});
  };
  const r=await run({fetchImpl:readBackSuccess});
  assert.equal(r.code,202);
  const missing=await run({fetchImpl:async(_url,options)=>{
    if(options.method==="POST") throw Error("socket_timeout");
    return new Response("[]",{status:200});
  }});
  assert.equal(missing.code,503);
  assert.equal(missing.body.customerDataAccepted,false);
  assert.equal(missing.body.code,"WLE_INQUIRY_PERSISTENCE_UNVERIFIED");
});
test("duplicate or malformed receipt never returns success",async()=>{
  const x=await run({fetchImpl:async(_url,options)=>options.method==="POST"
    ?new Response(null,{status:201})
    :new Response(JSON.stringify([STORED,{...STORED,id:ID}]),{status:200})});
  assert.equal(x.code,503);
  assert.equal(x.body.customerDataAccepted,false);
});
test("idempotency key reuse with a different saved payload is blocked",async()=>{
  const fetchImpl=async(_url,options)=>options.method==="POST"
    ?new Response("conflict",{status:409})
    :new Response(JSON.stringify([{...STORED,details:"Different tenant-sourced inquiry"}]),{status:200});
  const r=await run({fetchImpl});
  assert.equal(r.code,503);
  assert.equal(r.body.customerDataAccepted,false);
  assert.equal(r.body.code,"WLE_INQUIRY_PERSISTENCE_UNVERIFIED");
});
test("homepage keeps twenty industries and routes without auto-sending mail",()=>{
  const html=readFileSync(new URL("../src/index.html",import.meta.url),"utf8");
  const section=html.match(/<form class="contact-form" id="contactForm"[\s\S]*?<\/form>/)?.[0];
  assert.ok(section,"contact form");
  assert.equal((section.match(/<option(?! value="")/g)||[]).length,20);
  assert.match(section,/Request a Consultation/);
  assert.match(section,/name="website"/);
  assert.match(html,/tel:\+17722090266/);
  assert.match(html,/fetch\("\/api\/inquiry"/);
  assert.doesNotMatch(html,/window\.location\.href="mailto:/);
  assert.match(html,/pendingInquiryIds=new WeakMap\(\)/);
  assert.match(html,/customerDataAccepted===true/);
});
test("schema contract is draft-only, separated from Phoenix and denies anon",()=>{
  const sql=readFileSync(new URL("../docs/WLE_STAGING_LEAD_SCHEMA_DRAFT.sql",import.meta.url),"utf8");
  assert.match(sql,/DRAFT ONLY: DO NOT EXECUTE/);
  assert.match(sql,/wle_lead_inquiries/);
  assert.match(sql,/tenant_id,request_id/);
  assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
  assert.match(sql,/REVOKE ALL ON TABLE .* FROM PUBLIC, anon, authenticated/);
  assert.doesNotMatch(sql,/ALTER TABLE public\.website_leads/);
});
