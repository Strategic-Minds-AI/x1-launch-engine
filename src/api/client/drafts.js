import {common,respond,stageConfig,session,isSafeMutation,parseJsonBody,cleanProfile,canWrite,isUuid,supa} from '../../_internal/wle-customer-session.js';
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
  // Prevent service-role upsert from taking ownership of another customer's
  // draft ID (including a guessed or leaked ID from another tenant).
  const prior=await supa(conf,'/rest/v1/wle_studio_drafts?draft_id=eq.'+draftId+
    '&select=tenant_id,created_by,status,kind&limit=1',{privileged:true});
  if(!prior.ok||!Array.isArray(prior.data))throw Error('OWNERSHIP_LOOKUP_FAILED');
  if(prior.data.length){
   const previous=prior.data[0];
   if(previous.tenant_id!==tenantId||previous.created_by!==verified.user.id||
      previous.kind!==kind||previous.status!=='DRAFT')return respond(res,403,'DRAFT_IMMUTABLE_OR_NOT_OWNED');
  }
  const payload={...profile,saved_by:verified.user.id};
  const entry={draft_id:draftId,tenant_id:tenantId,created_by:verified.user.id,
     kind,status:'DRAFT',payload};
  const saved=await supa(conf,'/rest/v1/wle_studio_drafts?on_conflict=draft_id&select=draft_id,updated_at',{
    privileged:true,method:'POST',body:entry,
    headers:{Prefer:'resolution=merge-duplicates,return=representation'}
  });
  if(!saved.ok||!Array.isArray(saved.data)||saved.data.length!==1)throw Error('DRAFT_WRITE_FAILED');
  return respond(res,200,'DRAFT_SAVED',{draft_id:draftId,tenant_id:tenantId,updated_at:saved.data[0].updated_at});
 }catch{
  return respond(res,503,'DRAFT_OPERATION_UNAVAILABLE',{customerDataAccepted:false});
 }
}
