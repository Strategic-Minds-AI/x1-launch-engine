import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {stageConfig,cleanProfile,canWrite,isUuid,checkOrigin} from '../src/api/_internal/wle-customer-session.js';
import sessionHandler from '../src/api/client/session.js';
import loginHandler from '../src/api/client/login.js';
import draftHandler from '../src/api/client/drafts.js';
import logoutHandler from '../src/api/client/logout.js';

const T1='11111111-1111-4111-8111-111111111111',T2='22222222-2222-4222-8222-222222222222';
const A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const staging='https://uvdkzsbjackpjvpoxtyk.supabase.co';
const oldEnv={...process.env},oldFetch=globalThis.fetch;
function env(enabled=true){
 process.env.VERCEL_ENV='preview';
 process.env.WLE_CLIENT_STAGING_AUTH_ENABLED=enabled?'true':'false';
 process.env.WLE_STAGING_SUPABASE_URL=staging;
 process.env.WLE_STAGING_SUPABASE_PUBLISHABLE_KEY='test-public-key-0123456789';
 process.env.WLE_STAGING_SUPABASE_SERVICE_ROLE_KEY='test-secret-key-0123456789XYZ';
}
function res(){
 return {
  headers:new Map(),statusCode:200,body:null,
  setHeader(k,v){this.headers.set(k.toLowerCase(),v);return this},
  getHeader(k){return this.headers.get(k.toLowerCase())},
  status(c){this.statusCode=c;return this},
  json(v){this.body=v;return this}
 };
}
function req(method='GET',extra={}){
 return {method,headers:{host:'preview.test',origin:'https://preview.test','sec-fetch-site':'same-origin','content-type':'application/json',...(extra.headers??{})},
  body:extra.body??{},query:extra.query??{}};
}
function reply(data,status=200){return {status,ok:status>=200&&status<300,async json(){return data}}}
function network({memberRole='CLIENT',memberTenant=T1,memberStatus=true,userId=A,revoked=true,ownDrafts=[],insertRows=null,patchRows=null}={}){
 const routes=[];globalThis.fetch=async(url,opts={})=>{
  const u=new URL(url);routes.push({path:u.pathname,query:u.search,method:opts.method??'GET',auth:!!opts.headers?.Authorization,body:opts.body});
  if(u.pathname==='/auth/v1/token')return reply({access_token:'access_example',refresh_token:'refresh_example',expires_in:600,user:{id:userId}});
  if(u.pathname==='/auth/v1/user')return reply({id:userId,email:'sample@example.test'});
  if(u.pathname==='/auth/v1/logout')return reply(null,revoked?204:500);
  if(u.pathname==='/rest/v1/x1_tenant_memberships')
   return reply(memberStatus?[{tenant_id:memberTenant,role:memberRole}]:[]);
  if(u.pathname==='/rest/v1/x1_tenants')
   return reply([{tenant_id:memberTenant,status:'ACTIVE'}]);
  if(u.pathname==='/rest/v1/wle_studio_drafts'){
   if(opts.method==='POST')return reply(insertRows??[{draft_id:T2,updated_at:'2026-10-11T21:00:00Z'}],201);
   if(opts.method==='PATCH')return reply(patchRows??[{draft_id:T2,updated_at:'2026-10-11T21:00:01Z'}],200);
   return reply(ownDrafts);
  }
  throw Error('Unexpected URL '+u.pathname);
 };
 return routes;
}
function cookieHeaders(){
 return {cookie:'__Host-wle_access=access_example; __Host-wle_refresh=refresh_example'};
}
const goodProfile={
 business:'Synthetic Roofing',person:'Demo Tester',role:'Owner',industry:'Construction',
 phone:'(772) 209-0266',email:'demo@example.com',website:'https://example.com',
 location:'Florida',tagline:'Test-only business',about:'Synthetic data.',services:'Roofing',
 design:'modern',mark:'orbit',accent:'#0675f9'
};
after(()=>{globalThis.fetch=oldFetch;for(const [k,v] of Object.entries(oldEnv))process.env[k]=v;});

test('staging feature is disabled by default and on production',()=>{
 env(false);assert.equal(stageConfig(),null);
 env(true);assert.equal(stageConfig()?.base,staging);
 process.env.VERCEL_ENV='production';assert.equal(stageConfig(),null);
 process.env.VERCEL_ENV='preview';process.env.WLE_STAGING_SUPABASE_URL='https://vgsmyhqqtkkluhypxyua.supabase.co';
 assert.equal(stageConfig(),null);
});
test('all customer endpoints fail-closed without approved env',async()=>{
 env(false);globalThis.fetch=()=>{throw Error('FORBIDDEN NETWORK')};
 for(const [handler,r] of [[sessionHandler,req('GET')],[loginHandler,req('POST',{body:{email:'x@y.com',password:'test'}})],
   [draftHandler,req('POST',{body:{tenant_id:T1,draft_id:T2,profile:goodProfile}})],[logoutHandler,req('POST')]]){
  const result=res();await handler(r,result);
  assert.equal(result.statusCode,503);assert.equal(result.body.code,'STAGING_CUSTOMER_AUTH_NOT_CONFIGURED');
  assert.ok(!JSON.stringify(result.body).includes('test-secret'));
 }
});
test('sign-in requires same-origin JSON, valid password and active tenant',async()=>{
 env(true);const calls=network();
 const cross=req('POST',{headers:{origin:'https://attacker.test'},body:{email:'sample@example.com',password:'pass'}});
 const r0=res();await loginHandler(cross,r0);assert.equal(r0.statusCode,403);assert.equal(calls.length,0);
 const bad=res();await loginHandler(req('POST',{body:{email:'bad',password:'x'}}),bad);assert.equal(bad.statusCode,400);
 const yes=res();await loginHandler(req('POST',{body:{email:'sample@example.com',password:'testing-only'}}),yes);
 assert.equal(yes.statusCode,200);assert.equal(yes.body.authenticated,true);
 const set=yes.getHeader('Set-Cookie');assert.ok(Array.isArray(set)&&set.length===2);
 assert.ok(set.every(x=>x.includes('HttpOnly')&&x.includes('SameSite=Strict')&&x.includes('Secure')));
 assert.ok(!JSON.stringify(yes.body).includes('refresh_example'));
});
test('authenticated Supabase identity without X1 membership cannot log in',async()=>{
 env(true);network({memberStatus:false});
 const r=res();await loginHandler(req('POST',{body:{email:'sample@example.com',password:'password'}}),r);
 assert.equal(r.statusCode,403);assert.equal(r.body.code,'CUSTOMER_MEMBERSHIP_REQUIRED');
});
test('active membership is verified server side for session',async()=>{
 env(true);network();
 const r=res();await sessionHandler(req('GET',{headers:cookieHeaders()}),r);
 assert.equal(r.statusCode,200);assert.equal(r.body.authenticated,true);
 assert.deepEqual(r.body.tenantMemberships,[{tenant_id:T1,role:'CLIENT'}]);
});
test('cross-tenant draft read is rejected before privileged draft fetch',async()=>{
 env(true);const calls=network();
 const r=res();await draftHandler(req('GET',{headers:cookieHeaders(),query:{tenant_id:T2}}),r);
 assert.equal(r.statusCode,403);assert.equal(r.body.code,'TENANT_ACCESS_DENIED');
 assert.equal(calls.filter(x=>x.path==='/rest/v1/wle_studio_drafts').length,0);
});
test('active VIEWER cannot modify tenant drafts',async()=>{
 env(true);const calls=network({memberRole:'VIEWER'});
 const r=res();await draftHandler(req('POST',{headers:cookieHeaders(),body:{tenant_id:T1,draft_id:T2,profile:goodProfile}}),r);
 assert.equal(r.statusCode,403);assert.equal(r.body.code,'ROLE_CANNOT_EDIT');
 assert.equal(calls.filter(x=>x.path==='/rest/v1/wle_studio_drafts').length,0);
});
test('owner draft insert is scoped and idempotent, never blind upsert',async()=>{
 env(true);const calls=network({memberRole:'OWNER'});
 const r=res();await draftHandler(req('POST',{headers:cookieHeaders(),body:{tenant_id:T1,draft_id:T2,profile:goodProfile}}),r);
 assert.equal(r.statusCode,200);assert.equal(r.body.code,'DRAFT_SAVED');
 const writes=calls.filter(x=>x.path==='/rest/v1/wle_studio_drafts');
 assert.equal(writes.length,1);assert.equal(writes[0].method,'POST');
 assert.ok(writes[0].query.includes('on_conflict=draft_id'));
 const entry=JSON.parse(writes[0].body);assert.equal(entry.created_by,A);assert.equal(entry.tenant_id,T1);
 assert.equal(entry.kind,'business_card');assert.equal(entry.status,'DRAFT');
});
test('conflict cannot overwrite a different tenant draft',async()=>{
 env(true);const calls=network({insertRows:[],patchRows:[]});
 const r=res();await draftHandler(req('POST',{headers:cookieHeaders(),body:{tenant_id:T1,draft_id:T2,profile:goodProfile}}),r);
 assert.equal(r.statusCode,403);assert.equal(r.body.code,'DRAFT_IMMUTABLE_OR_NOT_OWNED');
 const patch=calls.find(x=>x.method==='PATCH');
 assert.ok(patch.query.includes('tenant_id=eq.'+T1));
 assert.ok(patch.query.includes('created_by=eq.'+A));
 assert.ok(patch.query.includes('status=eq.DRAFT'));
});
test('invalid profile and user-controlled fields denied',()=>{
 const good=cleanProfile(goodProfile);assert.equal(good?.schema_version,1);
 assert.equal(cleanProfile({...goodProfile,evil:'value'}),null);
 assert.equal(cleanProfile({...goodProfile,website:'https://name:password@example.com'}),null);
 assert.equal(cleanProfile({...goodProfile,accent:'red'}),null);
 assert.equal(canWrite('VIEWER'),false);assert.equal(canWrite('CLIENT'),true);
 assert.equal(isUuid('not-a-uuid'),false);
 assert.equal(checkOrigin(req('POST',{headers:{origin:'https://wrong.test'}})),false);
});
test('user-initiated signout clears cookies, queries provider local-scope revoke',async()=>{
 env(true);const calls=network();
 const r=res();await logoutHandler(req('POST',{headers:cookieHeaders()}),r);
 assert.equal(r.statusCode,200);assert.equal(r.body.remoteSessionRevoked,true);
 assert.equal(calls.filter(x=>x.path==='/auth/v1/logout').length,1);
 const reset=r.getHeader('Set-Cookie');assert.ok(reset.every(x=>x.includes('Max-Age=0')));
});
