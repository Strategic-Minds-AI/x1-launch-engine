import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
const source=fs.readFileSync('api/runtime-status.js','utf8');
const admin=fs.readFileSync('admin.html','utf8');
const {default: handler}=await import(pathToFileURL(process.cwd()+'/api/runtime-status.js'));
function response(){
 return {statusCode:200,headers:{},body:null,setHeader(k,v){this.headers[k]=v;return this;},
 status(v){this.statusCode=v;return this;},json(v){this.body=v;return this;}};
}
const env=['SUPABASE_URL','SUPABASE_ANON_KEY','X1_ADMIN_USER_IDS','X1_RUNTIME_READ_TOKEN'];
function setup(){process.env.SUPABASE_URL='https://fixture.supabase.co';process.env.SUPABASE_ANON_KEY='public-key';process.env.X1_ADMIN_USER_IDS='approved-user';process.env.X1_RUNTIME_READ_TOKEN='private-fixture';}
test('runtime endpoint requires method and configured provider', async()=>{
 setup();const r=response();await handler({method:'POST',headers:{}},r);assert.equal(r.statusCode,405);
 const unauth=response();await handler({method:'GET',headers:{}},unauth);assert.equal(unauth.statusCode,401);
});
test('runtime denies non-admin even with valid authentication',async()=>{
 setup();const original=globalThis.fetch;
 globalThis.fetch=async()=>({ok:true,json:async()=>({id:'different-user'})});
 try {const r=response();await handler({method:'GET',headers:{authorization:'Bearer fixture.token'}},r);assert.equal(r.statusCode,403);}
 finally {globalThis.fetch=original;}
});
test('runtime returns redacted HTTP status only for allowed operators',async()=>{
 setup();const original=globalThis.fetch;const observed=[];
 globalThis.fetch=async(url, options)=>{observed.push({url,options});if(url.endsWith('/auth/v1/user'))return {ok:true,json:async()=>({id:'approved-user'})};return {ok:true,status:200};};
 try {const r=response();await handler({method:'GET',headers:{authorization:'Bearer fixture.token'}},r);
 assert.equal(r.statusCode,200);assert.equal(r.body.checks.length,6);
 assert.ok(r.body.checks.every(c=>c.level==='transport-only'));
 assert.ok(observed.filter(x=>x.url.includes('/api/x1/')).every(x=>x.url.startsWith('https://www.strategicmindsai.com/')));
 assert.ok(!JSON.stringify(r.body).includes('private-fixture'));
 assert.ok(!JSON.stringify(r.body).includes('fixture.token'));
 } finally {globalThis.fetch=original;}
});
test('launch console exposes explicit non-fabricated runtime status',()=>{assert.match(admin,/runtimeRefresh/);assert.match(admin,/api\/runtime-status/);assert.match(admin,/not an end-to-end QA receipt/);assert.ok(!source.includes('11434\/api'))});
