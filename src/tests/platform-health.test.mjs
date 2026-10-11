import { test } from "node:test";
import assert from "node:assert/strict";
import handler from "../api/platform-health.js";
function request(method = "GET") {
  const res = { headers: {}, code: 200, body: undefined,
    setHeader(k, v) { this.headers[k] = v; },
    status(x) { this.code = x; return this; },
    json(x) { this.body = x; return this; } };
  return { req: {method}, res };
}
test("staging status fails closed without config", async () => {
  const prevUrl=process.env.WLE_STAGING_SUPABASE_URL,prevKey=process.env.WLE_STAGING_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.WLE_STAGING_SUPABASE_URL;delete process.env.WLE_STAGING_SUPABASE_PUBLISHABLE_KEY;
  const {req,res}=request();await handler(req,res);
  assert.equal(res.code,200);assert.equal(res.body.supabase,"NOT_CONFIGURED");
  assert.equal(res.body.missionSubmission,"DISABLED");
  assert.equal(res.body.railway,"ONLINE_WORKERS_NOT_BOUND");
  assert.equal(res.headers["Cache-Control"],"no-store, max-age=0");
  if(prevUrl)process.env.WLE_STAGING_SUPABASE_URL=prevUrl;
  if(prevKey)process.env.WLE_STAGING_SUPABASE_PUBLISHABLE_KEY=prevKey;
});
test("status endpoint rejects mutations",async()=>{
  const {req,res}=request("POST");await handler(req,res);
  assert.equal(res.code,405);assert.equal(res.body.error,"method_not_allowed");
});
test("staging endpoint hostname is pinned",async()=>{
  const oldUrl=process.env.WLE_STAGING_SUPABASE_URL,oldKey=process.env.WLE_STAGING_SUPABASE_PUBLISHABLE_KEY;
  process.env.WLE_STAGING_SUPABASE_URL="https://malicious.example/";process.env.WLE_STAGING_SUPABASE_PUBLISHABLE_KEY="test";
  const {req,res}=request();await handler(req,res);
  assert.equal(res.body.supabase,"CONFIGURATION_REJECTED");
  if(oldUrl)process.env.WLE_STAGING_SUPABASE_URL=oldUrl;else delete process.env.WLE_STAGING_SUPABASE_URL;
  if(oldKey)process.env.WLE_STAGING_SUPABASE_PUBLISHABLE_KEY=oldKey;else delete process.env.WLE_STAGING_SUPABASE_PUBLISHABLE_KEY;
});

test("production never exposes customer operations, even when configured",async()=>{
  const env=process.env.VERCEL_ENV,oldUrl=process.env.WLE_PROD_SUPABASE_URL,oldKey=process.env.WLE_PROD_SUPABASE_PUBLISHABLE_KEY;
  process.env.VERCEL_ENV="production";
  process.env.WLE_PROD_SUPABASE_URL="https://vgsmyhqqtkkluhypxyua.supabase.co";
  process.env.WLE_PROD_SUPABASE_PUBLISHABLE_KEY="test-publishable";
  const previousFetch=globalThis.fetch;
  globalThis.fetch=async()=>({ok:true});
  try {
    const {req,res}=request(); await handler(req,res);
    assert.equal(res.body.mode,"production_read_only");
    assert.equal(res.body.supabase,"CONNECTED_PRODUCTION_READ_ONLY");
    assert.equal(res.body.customerAuth,"DISABLED");
    assert.equal(res.body.missionSubmission,"DISABLED");
    assert.equal(res.body.socialPublishing,"DISABLED");
  } finally {
    globalThis.fetch=previousFetch;
    if(env===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=env;
    if(oldUrl===undefined)delete process.env.WLE_PROD_SUPABASE_URL;else process.env.WLE_PROD_SUPABASE_URL=oldUrl;
    if(oldKey===undefined)delete process.env.WLE_PROD_SUPABASE_PUBLISHABLE_KEY;else process.env.WLE_PROD_SUPABASE_PUBLISHABLE_KEY=oldKey;
  }
});
