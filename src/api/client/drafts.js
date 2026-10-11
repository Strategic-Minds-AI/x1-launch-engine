import {common,respond,stageConfig,session,isSafeMutation,parseJsonBody,cleanProfile,canWrite,isUuid,supa} from '../_internal/wle-customer-session.js';
const kind='business_card';
function tenantArg(req,body){
 const value=req.method==='GET'?req.query?.tenant_id:body?.tenant_id;
 return isUuid(value)?value:null;
}
export default async function handler(req,res){
 common(res);
 if(req.method!=='GET'&&req.method!=='POST'){
  res.setHeader('Allow','GET, POST');return respond(res,405,'METHOD_NOT_ALLOWED');
 }
 const conf=stageConfig();
 if(!conf)return respond(res,503,'STAGING_CUSTOMER_AUTH_NOT_CONFIGURED',{customerDataAccepted:false});
 if(req.method==='POST'&&!isSafeMutation(req))return respond(res,403,'SAME_ORIGIN_JSON_REQUIRED');
 const body=req.method==='POST'?parseJsonBody(req,8000):null;
 if(req.method==='POST'&&!body)return respond(res,400,'INVALID_DRAFT_REQUEST');
 const tenantId=tenantArg(req,body);
 if(!tenantId)return respond(res,400,'TENANT_ID_REQUIRED');
 try{
  const verified=await session(req,res,conf);
  if(!verified)return respond(res,401,'AUTH_REQUIRED');
  const member=verified.tenants.find(x=>x.tenant_id===tenantId);
  if(!member)return respond(res,403,'TENANT_ACCESS_DENIED');
  if(req.method==='GET'){
   const params='tenant_id=eq.'+tenantId+'&created_by=eq.'+verified.user.id+
     '&kind=eq.'+kind+'&status=eq.DRAFT&select=draft_id,payload,updated_at&order=updated_at.desc&limit=1';
   const data=await supa(conf,'/rest/v1/wle_studio_drafts?'+params,{privileged:true});
   if(!data.ok||!Array.isArray(data.data))throw Error('DRAFT_READ_FAILED');
   return respond(res,200,'DRAFTS_READ',{draft:data.data[0]??null,tenant_id:tenantId});
  }
  if(!canWrite(member.role))return respond(res,403,'ROLE_CANNOT_EDIT');
  const profile=cleanProfile(body.profile),draftId=body.draft_id;
  if(!profile||!isUuid(draftId))return respond(res,400,'INVALID_PROFILE_OR_DRAFT_ID');
  // Prevent a TOCTOU ownership bypass: insert ignores duplicate IDs, and
  // updates are separately filtered by tenant, user, kind and draft state.
  // Never upsert with a service key directly against an unscoped primary key.
  const payload={...profile,saved_by:verified.user.id};
  const entry={draft_id:draftId,tenant_id:tenantId,created_by:verified.user.id,
     kind,status:'DRAFT',payload};
  const added=await supa(conf,'/rest/v1/wle_studio_drafts?on_conflict=draft_id&select=draft_id,updated_at',{
    privileged:true,method:'POST',body:entry,
    headers:{Prefer:'resolution=ignore-duplicates,return=representation'}
  });
  if(!added.ok||!Array.isArray(added.data))throw Error('DRAFT_INSERT_FAILED');
  let saved=added;
  if(!added.data.length){
   const target='draft_id=eq.'+draftId+'&tenant_id=eq.'+tenantId+
     '&created_by=eq.'+verified.user.id+'&kind=eq.'+kind+'&status=eq.DRAFT';
   saved=await supa(conf,'/rest/v1/wle_studio_drafts?'+target+'&select=draft_id,updated_at',{
     privileged:true,method:'PATCH',body:{payload,updated_at:new Date().toISOString()},
     headers:{Prefer:'return=representation'}
   });
  }
  if(!saved.ok||!Array.isArray(saved.data)||saved.data.length!==1){
   return respond(res,403,'DRAFT_IMMUTABLE_OR_NOT_OWNED');
  }
  return respond(res,200,'DRAFT_SAVED',{draft_id:draftId,tenant_id:tenantId,updated_at:saved.data[0].updated_at});
 }catch{
  return respond(res,503,'DRAFT_OPERATION_UNAVAILABLE',{customerDataAccepted:false});
 }
}
