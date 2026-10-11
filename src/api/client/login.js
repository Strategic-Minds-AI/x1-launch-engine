import {common,respond,stageConfig,isSafeMutation,parseJsonBody,supa,memberships,setSession,clearSession,isUuid} from '../../_internal/wle-customer-session.js';
export default async function handler(req,res){
 common(res);
 if(req.method!=='POST'){res.setHeader('Allow','POST');return respond(res,405,'METHOD_NOT_ALLOWED')}
 const conf=stageConfig();
 if(!conf)return respond(res,503,'STAGING_CUSTOMER_AUTH_NOT_CONFIGURED',{customerDataAccepted:false});
 if(!isSafeMutation(req))return respond(res,403,'SAME_ORIGIN_JSON_REQUIRED');
 const body=parseJsonBody(req,1600);
 const email=body?.email,password=body?.password;
 if(typeof email!=='string'||email.length>254||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||
    typeof password!=='string'||password.length<1||password.length>512){
  return respond(res,400,'INVALID_SIGN_IN_REQUEST');
 }
 try{
  // Existing Supabase Auth passwords only. No signup, password reset email,
  // impersonation, magic-link send, or Google OAuth in this release.
  const signIn=await supa(conf,'/auth/v1/token?grant_type=password',{
   method:'POST',body:{email,password}
  });
  if(!signIn.ok||!signIn.data?.access_token||!signIn.data?.refresh_token){
   if(signIn.status===429)return respond(res,429,'SIGN_IN_RATE_LIMITED');
   if(signIn.status>=500)return respond(res,503,'AUTH_PROVIDER_UNAVAILABLE');
   return respond(res,401,'INVALID_CREDENTIALS_OR_UNAUTHORIZED');
  }
  const verify=await supa(conf,'/auth/v1/user',{token:signIn.data.access_token});
  const userId=verify.data?.id;
  if(!verify.ok||!isUuid(userId)||userId!==signIn.data.user?.id)return respond(res,401,'INVALID_CREDENTIALS_OR_UNAUTHORIZED');
  const allowed=await memberships(conf,userId);
  if(!allowed.length){clearSession(res);return respond(res,403,'CUSTOMER_MEMBERSHIP_REQUIRED')}
  setSession(res,signIn.data);
  return respond(res,200,'SIGNED_IN',{authenticated:true,tenantMemberships:allowed,accountEmail:String(verify.data.email||'').slice(0,250)});
 }catch{
  clearSession(res);
  return respond(res,503,'AUTH_PROVIDER_UNAVAILABLE');
 }
}
