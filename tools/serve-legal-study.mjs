import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
export function createStudyServer(root) {
  const base=resolve(root);
  return createServer(async(req,res)=>{
    res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'none'; img-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; connect-src 'none'");
    res.setHeader('Cache-Control','no-store');
    try{
      const url=new URL(req.url,'http://localhost');
      if(url.pathname==='/api/legal-intake'){res.statusCode=503;res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({received:false,code:'LEGAL_ADVERTISER_NOT_BOUND',message:'Live legal intake is not enabled.'}));}
      if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end('Method not allowed');}
      if(url.pathname==='/healthz'){const manifest=JSON.parse(await readFile(resolve(base,'manifest.json'),'utf8'));res.setHeader('Content-Type','application/json');return res.end(req.method==='HEAD'?'':JSON.stringify({ok:true,mode:manifest.mode,source_sha:manifest.source_sha,lead_mode:manifest.lead_mode}));}
      const decoded=decodeURIComponent(url.pathname);
      if(decoded.includes('\0')||decoded.includes('\\')){res.statusCode=400;return res.end('Invalid path');}
      let target=resolve(base,'.'+decoded);
      if(target!==base&&!target.startsWith(base+sep)){res.statusCode=403;return res.end('Forbidden');}
      if((await stat(target)).isDirectory())target=resolve(target,'index.html');
      const data=await readFile(target);
      res.setHeader('Content-Type',types[extname(target)]||'application/octet-stream');res.setHeader('Content-Length',data.length);
      res.end(req.method==='HEAD'?undefined:data);
    }catch(error){res.statusCode=error instanceof URIError?400:404;res.setHeader('Content-Type','text/plain; charset=utf-8');res.end(res.statusCode===400?'Invalid path':'Not found');}
  });
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const port=Number(process.env.PORT||8080);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');
  const root=resolve(process.env.STUDY_ROOT||process.argv[2]||'work/legal-dist');
  const server=createStudyServer(root);server.on('error',error=>{console.error(JSON.stringify({event:'startup_failed',code:error.code}));process.exit(1);});
  server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(JSON.stringify({event:'listening',port,mode:'UNBRANDED_DESIGN_STUDY'})));
  for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
}
