/**
 * Website Launch Engine: staging-only customer session boundary.
 * SERVER ONLY. No privileged keys, access tokens, passwords or customer rows
 * belong in browser JS, preview HTML, logs or API responses.
 * Existing X1 tenant/membership tables remain authoritative.
 * This module is intentionally inert until a separately approved, preview-scoped
 * WLE_CLIENT_STAGING_AUTH_ENABLED=true and dedicated WLE_STAGING_* env are set.
 */
const STAGING_URL='https://uvdkzsbjackpjvpoxtyk.supabase.co';
const ACCESS='__Host-wle_access';
const REFRESH='__Host-wle_refresh';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WRITE_ROLES=new Set(['OWNER','ADMIN','BUILDER','MARKETER','CLIENT']);
export function isUuid(s){return typeof s==='string'&&UUID.test(s)}
export function common(res){
 res.setHeader('Cache-Control','no-store, max-age=0');
 res.setHeader('Pragma','no-cache');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('Vary','Cookie');
}
export function respond(res,status,code,extra={}){
 return res.status(status).json({ok:status>=200&&status<300,code,...extra});
}
export function stageConfig(){
 if(process.env.VERCEL_ENV!=='preview'||process.env.WLE_CLIENT_STAGING_AUTH_ENABLED!=='true')return null;
 const base=process.env.WLE_STAGING_SUPABASE_URL;
 const publicKey=process.env.WLE_STAGING_SUPABASE_PUBLISHABLE_KEY;
 const serviceKey=process.env.WLE_STAGING_SUPABASE_SERVICE_ROLE_KEY;
 if(base!==STAGING_URL||!publicKey||!serviceKey||publicKey===serviceKey)return null;
 if(publicKey.length<16||serviceKey.length<24)return null;
 return {base,publicKey,serviceKey};
}
export function checkOrigin(req){
 const host=req.headers.host;
 const origin=req.headers.origin;
 if(typeof host!=='string'||typeof origin!=='string')return false;
 // No cross-origin, even same-site, mutation requests. No untrusted redirects.
 if(origin!=='https://'+host)return false;
 if(req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin')return false;
 return true;
}
function cookies(req){
 const map=new Map();
 for(const part of String(req.headers.cookie||'').split(';')){
  const index=part.indexOf('=');
  if(index<0)continue;
  try{map.set(part.slice(0,index).trim(),decodeURIComponent(part.slice(index+1).trim()));}
  catch{}
 }
 return map;
}
function cookie(name,value,age){
 return name+'='+encodeURIComponent(value)+'; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age='+age;
}
export async function revokeCurrentSession(req,conf){
 const access=cookies(req).get(ACCESS);
 if(!access||access.length>4096)return false;
 // Explicit local scope: do not sign customers out of unrelated devices.
 const r=await supa(conf,'/auth/v1/logout?scope=local',{method:'POST',token:access});
 return r.ok||r.status===401;
}
export function clearSession(res){
 res.setHeader('Set-Cookie',[cookie(ACCESS,'',0),cookie(REFRESH,'',0)]);
}
export function setSession(res,tokens){
 if(!tokens||typeof tokens.access_token!=='string'||typeof tokens.refresh_token!=='string')throw Error('SESSION_RESPONSE_INVALID');
 if(tokens.access_token.length>4096||tokens.refresh_token.length>4096)throw Error('SESSION_RESPONSE_TOO_LARGE');
 const ttl=Math.max(60,Math.min(3600,Number(tokens.expires_in)||3600));
 res.setHeader('Set-Cookie',[cookie(ACCESS,tokens.access_token,ttl),cookie(REFRESH,tokens.refresh_token,604800)]);
}
export async function supa(conf,path,{method='GET',body=null,privileged=false,token=null,headers={}}={}){
 // 'path' must be compiled by trusted server code, never a client-supplied URL.
 if(!/^(\/auth\/v1\/|\/rest\/v1\/)/.test(path))throw Error('UNSUPPORTED_SUPABASE_ROUTE');
 const h={'apikey':privileged?conf.serviceKey:conf.publicKey,'Accept':'application/json',...headers};
 if(privileged)h.Authorization='Bearer '+conf.serviceKey;
 else if(token)h.Authorization='Bearer '+token;
 if(body!==null)h['Content-Type']='application/json';
 const response=await fetch(conf.base+path,{
  method,headers:h,body:body===null?undefined:JSON.stringify(body),
  redirect:'error',signal:AbortSignal.timeout(6000)
 });
 let data=null;try{data=await response.json()}catch{}
 return {status:response.status,ok:response.ok,data};
}
async function authUser(conf,access){
 if(!access||access.length>4096)return {status:401,user:null};
 const r=await supa(conf,'/auth/v1/user',{token:access});
 const id=r.data?.id;
 return {status:r.status,user:r.ok&&isUuid(id)?{id,email:String(r.data.email||'').slice(0,250)}:null};
}
export async function memberships(conf,userId){
 if(!isUuid(userId))return [];
 const r=await supa(conf,'/rest/v1/x1_tenant_memberships?user_id=eq.'+userId+'&status=eq.ACTIVE&select=tenant_id,role&limit=50',{privileged:true});
 if(!r.ok||!Array.isArray(r.data))throw Error('MEMBERSHIP_LOOKUP_FAILED');
 const active=r.data.filter(x=>isUuid(x.tenant_id)&&typeof x.role==='string');
 if(!active.length)return [];
 const ids=active.map(x=>x.tenant_id);
 const t=await supa(conf,'/rest/v1/x1_tenants?tenant_id=in.('+ids.join(',')+')&status=eq.ACTIVE&select=tenant_id&limit=50',{privileged:true});
 if(!t.ok||!Array.isArray(t.data))throw Error('TENANT_LOOKUP_FAILED');
 const ok=new Set(t.data.filter(x=>isUuid(x.tenant_id)).map(x=>x.tenant_id));
 return active.filter(x=>ok.has(x.tenant_id)).map(x=>({tenant_id:x.tenant_id,role:x.role}));
}
export function canWrite(role){return WRITE_ROLES.has(role)}
export async function session(req,res,conf){
 const c=cookies(req),access=c.get(ACCESS),refresh=c.get(REFRESH);
 let who=await authUser(conf,access);
 if(!who.user&&who.status===401&&refresh&&refresh.length<=4096){
  const r=await supa(conf,'/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:refresh}});
  if(r.ok&&r.data?.access_token&&r.data?.refresh_token){
   setSession(res,r.data);
   who=await authUser(conf,r.data.access_token);
  }else if(r.status>=500){throw Error('AUTH_REFRESH_UNAVAILABLE')}
 }
 if(!who.user){
  if(who.status!==401&&who.status!==403)throw Error('AUTH_VERIFICATION_UNAVAILABLE');
  clearSession(res);
  return null;
 }
 const tenants=await memberships(conf,who.user.id);
 // User exists but does not belong to any active WLE/X1 customer tenant.
 if(!tenants.length){clearSession(res);return null;}
 return {user:who.user,tenants};
}
export function parseJsonBody(req,maxBytes=8000){
 const raw=req.body;
 let data=raw;
 if(typeof raw==='string'&&Buffer.byteLength(raw,'utf8')<=maxBytes){try{data=JSON.parse(raw)}catch{return null}}
 if(!data||typeof data!=='object'||Array.isArray(data))return null;
 if(Buffer.byteLength(JSON.stringify(data),'utf8')>maxBytes)return null;
 return data;
}
const fields={business:90,person:80,role:90,industry:80,phone:40,email:250,website:190,location:220,tagline:240,about:2400,services:1600,design:30,mark:30,accent:7};
export function cleanProfile(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 for(const key of Object.keys(input))if(!Object.hasOwn(fields,key))return null;
 const value={};
 for(const [key,max] of Object.entries(fields)){
  const raw=input[key]??'';
  if(typeof raw!=='string'||raw.length>max*2)return null;
  const clean=raw.trim();
  if(clean.length>max||/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(clean))return null;
  value[key]=clean;
 }
 if(value.website){
  try{
   const u=new URL(value.website);
   if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||u.hostname==='localhost')return null;
  }catch{return null}
 }
 if(value.accent&&!/^#[0-9a-fA-F]{6}$/.test(value.accent))return null;
 if(value.design&&!['modern','classic','bold'].includes(value.design))return null;
 if(value.mark&&!['orbit','crest','monogram'].includes(value.mark))return null;
 return {schema_version:1,...value};
}
export function isSafeMutation(req){
 return checkOrigin(req)&&String(req.headers['content-type']||'').split(';')[0]==='application/json';
}
