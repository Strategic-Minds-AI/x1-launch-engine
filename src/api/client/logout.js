import {common,respond,stageConfig,checkOrigin,clearSession,session} from '../../_internal/wle-customer-session.js';
export default async function handler(req,res){
 common(res);
 if(req.method!=='POST'){res.setHeader('Allow','POST');return respond(res,405,'METHOD_NOT_ALLOWED')}
 const conf=stageConfig();
 if(!conf)return respond(res,503,'STAGING_CUSTOMER_AUTH_NOT_CONFIGURED',{customerDataAccepted:false});
 if(!checkOrigin(req))return respond(res,403,'SAME_ORIGIN_REQUIRED');
 // Clear the browser tokens even during provider outages. Revocation failures
 // are NOT proof of a fully terminated remote session.
 try{
  const who=await session(req,res,conf);
  if(!who){clearSession(res);return respond(res,200,'SIGNED_OUT_LOCAL')}
  // A later guarded release must independently test server-side Auth session
  // revocation before enabling long-lived customer accounts.
  clearSession(res);
  return respond(res,200,'SIGNED_OUT_LOCAL',{remoteSessionRevoked:false});
 }catch{
  clearSession(res);
  return respond(res,503,'REMOTE_SESSION_STATE_UNKNOWN',{localCookiesCleared:true});
 }
}
