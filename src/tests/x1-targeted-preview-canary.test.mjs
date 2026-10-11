import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { checkTargetedLease, buildRoofingCanary, processOneTargetedPreview } from "../lib/x1-targeted-preview-canary.mjs";

const workId = "d457ae30-f320-465e-8efa-93b5dbe54918";
const tenantId = "666f23bf-61bd-4be0-b5cb-4872e04fad9b";
const leaseId = "f3a8efee-bf1f-4a4b-a822-b12756e55cf8";
const sha = "a".repeat(40);
const worker = "wle-staging-targeted-bridge";
const template = readFileSync(new URL("../templates/roofing.html", import.meta.url), "utf8");
function work(overrides = {}) {
  return {
    work_id: workId, tenant_id: tenantId, source_sha: sha,
    work_packet_id: "WLE-SB-CANARY-20261011-001",
    task_id: "wle.synthetic.roofing.pompano.20261011",
    action_class: "NON_PRODUCTION_MUTATION",
    payload: {
      kind: "WLE_SYNTHETIC_ROOFING_PREVIEW_V1",
      release_mode: "preview_only", no_customer_data: true,
      location: "Pompano Beach, FL",
      uses_external_model: false, requires_domain_purchase: false
    },
    lease: {
      leaseId, taskId: "wle.synthetic.roofing.pompano.20261011",
      holderAgentId: worker,
      expiresAt: new Date(Date.now() + 300000).toISOString()
    },
    ...overrides
  };
}
const opts = {tenantId, workId, sourceSha:sha, workerId:worker};
function harness(overrides={}) {
  const calls=[];
  const functions={
    rpc:async (method, args)=>{calls.push({method,args});return method==="x1_lease_work_by_id"?work():undefined;},
    publishPreview:async ({sha256})=>({url:"https://wle-proof-example.vercel.app/proof/roofing-canary.html",deploymentId:"dpl_Ab123456",target:"preview"}),
    independentValidate:async ({sha256,deploymentId})=>({status:"PASS",validatorId:"independent-browser-validator",sha256,deploymentId,receiptId:"WLE-VAL-TEST-001"}),
    recordReceipt:async ({receiptId})=>({persisted:true,receiptId})
  };
  return {calls,options:{...opts,templateHtml:template,...functions,...overrides}};
}
test("valid synthetic preview packet is only preview mutation",()=>{
  const p=checkTargetedLease(work(),opts);
  assert.equal(p.location,"Pompano Beach, FL");
  assert.equal(p.leaseId,leaseId);
});
test("blocks cross tenant / unauthorized / nonpreview payloads",()=>{
  assert.throws(()=>checkTargetedLease(work({tenant_id:"12345678-1234-4123-8123-123456789123"}),opts),/WORK_CONTRACT/);
  assert.throws(()=>checkTargetedLease(work({action_class:"PRODUCTION_RELEASE"}),opts),/WORK_CONTRACT/);
  assert.throws(()=>checkTargetedLease(work({payload:{...work().payload,requires_domain_purchase:true}}),opts),/WORK_CONTRACT/);
  assert.throws(()=>checkTargetedLease(work({source_sha:"b".repeat(40)}),opts),/WORK_CONTRACT/);
});
test("premium roofing build keeps fictional/noindex and stable hash",()=>{
  const a=buildRoofingCanary(template,{packetId:"WLE-SB-CANARY-20261011-001"});
  const b=buildRoofingCanary(template,{packetId:"WLE-SB-CANARY-20261011-001"});
  assert.equal(a.sha256,b.sha256);
  assert.equal(a.sha256,createHash("sha256").update(a.html).digest("hex"));
  assert.match(a.html,/noindex,nofollow/);
  assert.match(a.html,/NOT A REAL CONTRACTOR/);
  assert.match(a.html,/X1 STAGING PREVIEW CANARY/);
});
test("one successful lease must prove preview + independent validator + receipt",async()=>{
  const {calls,options}=harness();
  const result=await processOneTargetedPreview(options);
  assert.equal(result.status,"COMPLETED");
  assert.deepEqual(calls.map(x=>x.method),["x1_lease_work_by_id","x1_finish_work"]);
  assert.equal(calls[0].args.p_environment,"preview");
  assert.equal(calls[0].args.p_work_id,workId);
  assert.equal(calls[1].args.p_status,"COMPLETED");
});
test("cannot complete without independent validation",async()=>{
  const {calls,options}=harness({independentValidate:async x=>({
    status:"PASS",validatorId:worker,sha256:x.sha256,
    deploymentId:x.deploymentId,receiptId:"WLE-VAL-SELF"
  })});
  await assert.rejects(()=>processOneTargetedPreview(options),/VALIDATION_REQUIRED/);
  assert.equal(calls.at(-1).args.p_status,"BLOCKED");
});
test("cannot complete when publishing targets production",async()=>{
  const {calls,options}=harness({publishPreview:async()=>({
    url:"https://www.example.com",deploymentId:"dpl_Ab123",target:"production"
  })});
  await assert.rejects(()=>processOneTargetedPreview(options),/ARTIFACT_REJECTED/);
  assert.equal(calls.at(-1).args.p_status,"BLOCKED");
});
test("cannot complete without persisted receipt",async()=>{
  const {calls,options}=harness({recordReceipt:async()=>({persisted:false})});
  await assert.rejects(()=>processOneTargetedPreview(options),/RECEIPT_REQUIRED/);
  assert.equal(calls.at(-1).args.p_status,"BLOCKED");
});
test("no matching work means no publish or completion",async()=>{
  const {calls,options}=harness({rpc:async(method,args)=>{calls.push({method,args});return null;}});
  const result=await processOneTargetedPreview(options);
  assert.equal(result.status,"NO_MATCHING_PENDING_WORK");
  assert.equal(calls.length,1);
});
