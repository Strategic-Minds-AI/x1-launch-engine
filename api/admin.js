// X1 admin: server-only privileged access, explicit operator allowlist, no client secret exposure.
const endpoint=()=>process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey=()=>process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey=()=>process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
async function call(url,token,path,options={}){
 const response=await fetch(url+path,{...options,headers:{apikey:token,Authorization:'Bearer '+token,'Content-Type':'application/json',...(options.headers||{})}});
 if(!response.ok)throw Error('Upstream request failed: '+response.status);
 if(response.status===204)return [];return response.json();
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const url=endpoint(),key=serviceKey(),anon=publicKey(),allow=(process.env.X1_ADMIN_USER_IDS||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(!url||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)||!key||!anon||!allow.length)return res.status(503).json({error:'Admin backend is not configured'});
 const bearer=(req.headers.authorization||'').match(/^Bearer ([A-Za-z0-9._-]+)$/);
 if(!bearer)return res.status(401).json({error:'Sign in required'});
 try{
  const verified=await fetch(url+'/auth/v1/user',{headers:{apikey:anon,Authorization:'Bearer '+bearer[1]}});
  if(!verified.ok)return res.status(401).json({error:'Invalid session'});
  const user=await verified.json();
  if(!user.id||!allow.includes(user.id))return res.status(403).json({error:'Admin permission required'});
  if(req.method==='GET'){
   const [sites,approvals]=await Promise.all([
    call(url,key,'/rest/v1/wle_sites?select=id,owner_id,business_name,industry,city,status,created_at&order=created_at.desc&limit=100'),
    call(url,key,'/rest/v1/wle_site_approvals?select=id,site_id,requester_id,revision,status,note,created_at&order=created_at.desc&limit=100')
   ]);
   return res.status(200).json({sites,approvals});
  }
  if(req.method==='PATCH'){
   const {id,status}=req.body||{};
   if(!/^[0-9a-f-]{36}$/i.test(String(id))||!['approved','changes_requested'].includes(status))return res.status(400).json({error:'Invalid request'});
   const rows=await call(url,key,'/rest/v1/wle_site_approvals?id=eq.'+encodeURIComponent(id)+'&status=eq.pending',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status,reviewer_id:user.id,reviewed_at:new Date().toISOString()})});
   if(!rows.length)return res.status(409).json({error:'Approval no longer pending'});
   return res.status(200).json({approval:rows[0]});
  }
  res.setHeader('Allow','GET,PATCH');return res.status(405).json({error:'Unsupported action'});
 }catch(error){return res.status(502).json({error:'Admin provider request failed'});}
}
