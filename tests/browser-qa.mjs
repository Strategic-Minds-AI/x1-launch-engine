/**
 * Headless, read-only WLE visual/regression QA.
 * Set WLE_BASELINE_DIR, WLE_PLAYWRIGHT_CORE and CHROME_EXE.
 * This serves private local copies and NEVER writes real leads.
 */
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, extname, sep, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const playwrightPath=process.env.WLE_PLAYWRIGHT_CORE;
const chromeExe=process.env.CHROME_EXE;
const baselineDir=process.env.WLE_BASELINE_DIR;
if(!playwrightPath || !chromeExe || !baselineDir)
  throw Error("QA_REQUIRES_EXPLICIT_PLAYWRIGHT_CHROME_AND_APPROVED_BASELINE");
const { chromium } = require(playwrightPath);
const candidate=resolve(dirname(fileURLToPath(import.meta.url)),"../src");
const baseline=resolve(baselineDir);
if(!existsSync(join(baseline,"index.html"))) throw Error("BASELINE_NOT_FOUND");
const output=resolve(dirname(fileURLToPath(import.meta.url)),"qa-output");
await mkdir(output,{recursive:true});
const logs=[];
let server;
let browser;
const report={schema:"wle-headless-browser-qa/1.0",createdAt:new Date().toISOString(),
  baseline,candidate,viewports:[],checks:[],nonproduction:true,
  leadRequestsObserved:0,leadRequestsSentToProvider:0,errors:[]};
function check(name,pass,details) {
  report.checks.push({name,status:pass?"PASS":"FAIL",details});
  if(!pass) report.errors.push(name);
}
function json(res,status,body) {
  res.statusCode=status;
  res.setHeader("content-type","application/json; charset=utf-8");
  res.setHeader("cache-control","no-store");
  res.end(JSON.stringify(body));
}
function srcRoot(pathname){
  if(pathname.startsWith("/baseline/"))return {root:baseline,relative:pathname.slice(10)};
  if(pathname.startsWith("/candidate/"))return {root:candidate,relative:pathname.slice(11)};
  return {root:candidate,relative:pathname.slice(1)};
}
server=createServer(async(req,res)=>{
  const url=new URL(req.url??"/","http://127.0.0.1");
  if(url.pathname==="/api/inquiry") {
    report.leadRequestsObserved++;
    req.resume(); // intentionally never collect any customer text or save it
    return json(res,503,{ok:false,code:"WLE_LEAD_INTAKE_NOT_BOUND",
      customerDataAccepted:false,retryable:false});
  }
  const {root,relative}=srcRoot(url.pathname);
  const target=resolve(root,relative||"index.html");
  if(!(target===root || target.startsWith(root+sep)))
    return json(res,403,{error:"FORBIDDEN"});
  try {
    const content=await readFile(target);
    const types={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",
      ".css":"text/css; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json"};
    res.setHeader("content-type",types[extname(target)]||"application/octet-stream");
    res.statusCode=200;res.end(content);
  } catch {json(res,404,{error:"NOT_FOUND"})}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const port=server.address().port;
const host="http://127.0.0.1:"+port;
async function screenshotAndStats(viewport,label,variant){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  await page.goto(host+"/"+variant+"/index.html",{waitUntil:"domcontentloaded",timeout:20000});
  await page.addStyleTag({content:"*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}"});
  await page.waitForTimeout(900);
  const screenshot=await page.screenshot({path:join(output,label+"-"+variant+".png"),fullPage:false});
  const metadata=await page.evaluate(()=>({
    title:document.title,
    form:!!document.getElementById("contactForm"),
    options:document.querySelectorAll('#contactForm select[name="industry"] option:not([value=""])').length,
    phoneLinks:document.querySelectorAll('a[href="tel:+17722090266"]').length,
    images:[...document.images].length,
    brokenImages:[...document.images].filter(img=>img.complete && img.naturalWidth===0).length,
    previewDialog:!!document.getElementById("previewDialog"),
    hasHorizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+2,
    documentHeight:document.documentElement.scrollHeight,
  }));
  return {page,metadata,errors,screenshot};
}
async function pixelParity(page,a,b) {
  return page.evaluate(async({oldPng,newPng})=>{
    const rgba=async(base64)=>{
      const img=new Image();
      img.src="data:image/png;base64,"+base64;
      await img.decode();
      const c=document.createElement("canvas");c.width=img.width;c.height=img.height;
      const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(img,0,0);
      return {width:img.width,height:img.height,data:x.getImageData(0,0,img.width,img.height).data};
    };
    const old=await rgba(oldPng),curr=await rgba(newPng);
    if(old.width!==curr.width || old.height!==curr.height)
      return {parity:null,reason:"DIFFERENT_DIMENSIONS"};
    let matches=0;const total=old.width*old.height,arrA=old.data,arrB=curr.data;
    for(let i=0;i<arrA.length;i+=4){
      if(Math.abs(arrA[i]-arrB[i])<=12 &&
         Math.abs(arrA[i+1]-arrB[i+1])<=12 &&
         Math.abs(arrA[i+2]-arrB[i+2])<=12)matches++;
    }
    return {parity:Math.round((matches/total)*10000)/100,matchedPixels:matches,totalPixels:total,
      tolerance:12,scope:"viewport_before_any_form_interaction"};
  },{oldPng:a.toString("base64"),newPng:b.toString("base64")});
}
try {
  browser=await chromium.launch({headless:true,executablePath:chromeExe,args:["--no-sandbox","--disable-extensions","--disable-sync","--no-first-run"]});
  for(const [label,viewport] of [
    ["desktop",{width:1440,height:900}],
    ["tablet",{width:768,height:1024}],
    ["mobile",{width:390,height:844}],
  ]) {
    const prev=await screenshotAndStats(viewport,label,"baseline");
    const next=await screenshotAndStats(viewport,label,"candidate");
    const parity=await pixelParity(next.page,prev.screenshot,next.screenshot);
    check(label+"_visual_reference_parity",parity.parity!==null && parity.parity>=99,{...parity,baselineSha:"aed388468f17916f43a2ccc593981e4fbf1e8603"});
    check(label+"_no_overflow",!next.metadata.hasHorizontalOverflow,next.metadata);
    check(label+"_twenty_categories",next.metadata.options===20,next.metadata.options);
    check(label+"_phone_function",next.metadata.phoneLinks>=1,next.metadata.phoneLinks);
    check(label+"_no_runtime_exception",next.errors.length===0,next.errors);
    report.viewports.push({label,viewport,baseline:prev.metadata,candidate:next.metadata,parity,
      pageErrors:next.errors});
    if(label==="desktop") {
      const form=next.page.locator("#contactForm");
      await form.locator('input[name="name"]').fill("Synthetic Browser QA");
      await form.locator('input[name="email"]').fill("browser-qa@example.invalid");
      await form.locator('select[name="industry"]').selectOption({label:"Roofing"});
      await form.locator('textarea[name="message"]').fill("Synthetic staging browser inspection; do not contact anyone.");
      await form.locator('button[type="submit"]').click();
      await next.page.waitForTimeout(800);
      const status=await next.page.locator("#contactStatus").textContent();
      check("form_never_claims_success_when_backend_unbound",
        /cannot confirm secure delivery|could not confirm/i.test(status??""),status);
      check("form_no_external_mailto_navigation",
        next.page.url().startsWith(host+"/candidate/"),next.page.url());
      check("form_fallback_is_manual",
        (await form.locator('a[href="mailto:jeremy@strategicmindsai.com"]').count())===1,"mailto link is only an explicit opt-in");
    }
    await prev.page.close();
    await next.page.close();
  }
  check("local_stub_only_no_provider_post",report.leadRequestsObserved===1 && report.leadRequestsSentToProvider===0,
    {stubRequests:report.leadRequestsObserved,externalWrites:report.leadRequestsSentToProvider});
} catch(err){
  report.errors.push("BROWSER_EXECUTION_ERROR");
  report.executionError=String(err);
} finally {
  await browser?.close().catch(()=>{});
  await new Promise(ok=>server.close(ok));
}
report.passed=report.checks.filter(x=>x.status==="PASS").length;
report.failed=report.checks.filter(x=>x.status==="FAIL").length;
report.status=report.failed===0 && report.errors.length===0?"PASS":"FAIL";
await writeFile(join(output,"report.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,
  errors:report.errors,viewports:report.viewports.map(v=>({label:v.label,parity:v.parity,metadata:v.candidate})),
  output}));
if(report.status!=="PASS")process.exitCode=1;
