import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build,validate,esc} from '../tools/build-legal-study.mjs';
import {createStudyServer} from '../tools/serve-legal-study.mjs';
const pack=JSON.parse(readFileSync('sitepacks/florida-legal-study/mission.json','utf8'));
const sha='a'.repeat(40);
test('unsafe preview states and source-less content fail closed',()=>{
  for(const changes of [{noindex:false},{production_approved:true},{lead_mode:'LIVE'},{advertiser:{name:'Unverified'}},{concepts:pack.concepts.slice(0,9)}])assert.throws(()=>validate({...pack,...changes}),/GATE/);
  assert.throws(()=>validate({...pack,resources:[{...pack.resources[0],source_ids:['MISSING']}]}),/GATE/);
});
test('all external text is escaped',()=>assert.equal(esc('<script a="x">&\''),'&lt;script a=&quot;x&quot;&gt;&amp;&#39;'));
test('reused output folders cannot publish stray files',()=>{
  const root=mkdtempSync(join(tmpdir(),'x1-output-'));
  try{writeFileSync(join(root,'stray-document.txt'),'innocuous fixture');assert.throws(()=>build(pack,root,sha),/output directory must be empty/);assert.equal(readFileSync(join(root,'stray-document.txt'),'utf8'),'innocuous fixture');}
  finally{rmSync(root,{recursive:true,force:true});}
});
test('artifact build is byte deterministic, linked and noindex',()=>{
  const root=mkdtempSync(join(tmpdir(),'x1-legal-'));
  try{
    const first=build(pack,join(root,'one'),sha),second=build(pack,join(root,'two'),sha);assert.deepEqual(first,second);
    assert.equal(first.concept_count,10);assert.equal(first.resource_count,6);
    for(const file of first.files.filter(f=>f.path.endsWith('.html'))){
      const html=readFileSync(join(root,'one',file.path),'utf8');assert.match(html,/noindex,nofollow,noarchive/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file.path);
      assert.doesNotMatch(html,/application\/ld\+json|googletagmanager|google-analytics|tel:|mailto:|localStorage|sessionStorage/);
      for(const [,link] of html.matchAll(/(?:href|src)="([^"#]+)"/g))if(!link.startsWith('https:')){
        const url=new URL(link,'http://test/'+file.path);const target=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;assert.ok(first.files.some(f=>'/'+f.path===target),file.path+': '+link);
      }
    }
    assert.equal(first.files.some(f=>f.path==='sitemap.xml'),false);
    assert.throws(()=>build(pack,join(root,'bad'),'UNKNOWN'),/exact source SHA/);
  }finally{rmSync(root,{recursive:true,force:true});}
});
test('runtime rejects intake, mutation, bad paths and serves exact SHA health',async()=>{
  const root=mkdtempSync(join(tmpdir(),'x1-http-'));build(pack,root,sha);const server=createStudyServer(root);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  try{
    const home=await fetch(base+'/');assert.equal(home.status,200);assert.match(home.headers.get('x-robots-tag'),/noindex/);assert.match(home.headers.get('content-security-policy'),/connect-src 'none'/);
    assert.equal((await(await fetch(base+'/healthz')).json()).source_sha,sha);
    const denied=await fetch(base+'/api/legal-intake',{method:'POST',body:'synthetic'});assert.equal(denied.status,503);assert.equal((await denied.json()).received,false);
    assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
    assert.equal((await fetch(base+'/%00')).status,400);
    assert.equal((await fetch(base+'/%5c..%5cpackage.json')).status,400);
    assert.equal((await fetch(base+'/missing')).status,404);
    assert.equal((await fetch(base+'/',{method:'HEAD'})).status,200);
  }finally{await new Promise(resolve=>server.close(resolve));rmSync(root,{recursive:true,force:true});}
});
