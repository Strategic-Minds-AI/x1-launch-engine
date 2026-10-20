// Public configuration endpoint; never expose service-role secrets.
export default function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 res.setHeader('Cache-Control','no-store');
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
 if(!url||!key) return res.status(503).json({ready:false,error:'Authentication provider not configured'});
 if(!/^https:\/\/[\w-]+\.supabase\.co$/.test(url))return res.status(503).json({ready:false,error:'Invalid provider configuration'});
 return res.status(200).json({ready:true,url,anonKey:key});
}
