// Public marketing inquiry acceptance. Writes only through server credentials; no public list endpoint.
const allowedOrigins = new Set(['https://website-launch-engine.vercel.app','https://website-launch-engine-strategic-minds-advisory.vercel.app']);
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 const url=process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url))return res.status(503).json({error:'Inquiry service is not configured'});
 const origin=String(req.headers.origin||'');
 const host=String(req.headers.host||'').toLowerCase();
 const thisOrigin='https://'+host;
 if(origin && origin!==thisOrigin && !allowedOrigins.has(origin))return res.status(403).json({error:'Origin not allowed'});
 const size=Number(req.headers['content-length']||0);if(size>12000)return res.status(413).json({error:'Request too large'});
 const d=req.body||{};
 if(typeof d.website!=='undefined'&&String(d.website).trim())return res.status(200).json({received:true});
 const name=String(d.name||'').trim(),email=String(d.email||'').trim().toLowerCase(),industry=String(d.industry||'').trim(),message=String(d.message||'').trim();
 if(!name||name.length>160||!email||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!industry||industry.length>160||!message||message.length>4000||d.consent!==true)return res.status(400).json({error:'Provide valid contact details and consent'});
 try {
  const upstream=await fetch(url+'/rest/v1/wle_marketing_inquiries',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({name,email,industry,message,consent:true,source:'website-launch-engine'})});
  if(!upstream.ok)return res.status(503).json({error:'Inquiry could not be recorded'});
  return res.status(201).json({received:true});
 }catch{return res.status(503).json({error:'Inquiry service unavailable'});}
}
