import {common,respond,stageConfig,session} from '../../_internal/wle-customer-session.js';
export default async function handler(req,res){
 common(res);
 if(req.method!=='GET'){res.setHeader('Allow','GET');return respond(res,405,'METHOD_NOT_ALLOWED')}
 const conf=stageConfig();
 if(!conf)return respond(res,503,'STAGING_CUSTOMER_AUTH_NOT_CONFIGURED',{authenticated:false,customerDataAccepted:false});
 try{
  const who=await session(req,res,conf);
  if(!who)return respond(res,401,'AUTH_REQUIRED',{authenticated:false});
  return respond(res,200,'AUTHENTICATED',{authenticated:true,tenantMemberships:who.tenants,accountEmail:who.user.email});
 }catch{
  return respond(res,503,'CUSTOMER_AUTH_UNAVAILABLE',{authenticated:false,customerDataAccepted:false});
 }
}
