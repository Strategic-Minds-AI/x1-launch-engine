import { test } from 'node:test';
import assert from 'node:assert/strict';
const base=process.env.WLE_TARGET_URL||'https://website-launch-engine.vercel.app';
const routes=['/','/designer.html','/client.html','/admin.html','/api/config'];
for(const path of routes)test('HTTP route '+path,async()=>{
 const target=new URL(path,base);
 const response=await fetch(target,{redirect:'follow',signal:AbortSignal.timeout(12000),headers:{'User-Agent':'X1-WLE-Release-Smoke/1.0'}});
 const body=await response.text();
 console.log(JSON.stringify({route:path,status:response.status,finalURL:response.url,bytes:body.length}));
 assert.ok(response.status===200, 'Expected 200, received '+response.status+' for '+path);
 if(path==='/api/config') {
  const json=JSON.parse(body);
  assert.equal(json.ready,true,'Auth provider is not configured');
  assert.ok(typeof json.url==='string');
 }else{
  assert.match(body,/<html[\s>]/i);
  assert.doesNotMatch(body,/PREVIEW ONLY|DEVELOPMENT PREVIEW|This portal uses only static/i);
 }
});
test('Admin API rejects unauthenticated requests',async()=>{
 const response=await fetch(new URL('/api/admin',base),{signal:AbortSignal.timeout(12000)});
 assert.equal(response.status,401,'Unauthenticated admin endpoint must reject with 401');
});
