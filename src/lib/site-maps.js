/**
 * Canonical programmatic sitemap builder. Import only within a verified tenant
 * publishing job, never directly from browser-supplied site data.
 * Sitemap index: 50,000 URLs / 50MB uncompressed each per Google.
 * It excludes noindex, drafts, failed QA, and unverified URLs.
 */
const MAX_URLS=50000,MAX_BYTES=50*1024*1024;
const xml=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&apos;");
export function buildCanonicalSitemaps(origin,pages,{maxUrls=MAX_URLS,maxBytes=MAX_BYTES}={}){
 const base=new URL(origin);
 if(base.protocol!=="https:"||base.username||base.password||base.hash||base.search||base.pathname!=="/")throw Error("HTTPS_ROOT_ORIGIN_REQUIRED");
 if(!Number.isInteger(maxUrls)||maxUrls<1||maxUrls>MAX_URLS||!Number.isInteger(maxBytes)||maxBytes<1024||maxBytes>MAX_BYTES)throw Error("INVALID_LIMIT");
 const list=[],seen=new Set();
 for(const p of pages){
  if(!p||!p.verified||!p.indexable||p.status!=="VALIDATED")continue;
  const url=new URL(p.url,base);
  if(url.origin!==base.origin||url.protocol!=="https:"||url.hash||url.search||url.username||url.password)continue;
  const path=url.pathname;
  if(seen.has(path))continue;
  seen.add(path);
  const fragment="  <url><loc>"+xml(url.href)+"</loc>"+(p.lastmod&&/^\d{4}-\d\d-\d\d$/.test(p.lastmod)?"<lastmod>"+xml(p.lastmod)+"</lastmod>":"")+"</url>\n";
  if(new TextEncoder().encode(fragment).length+180>maxBytes)throw Error("SINGLE_URL_EXCEEDS_SITEMAP_LIMIT");
  list.push(fragment);
 }
 const open='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n',close='</urlset>\n';
 const entries=[],chunks=[];let current=[],bytes=new TextEncoder().encode(open+close).length;
 function flush(){if(!current.length)return;const name="sitemap-"+(entries.length+1)+".xml";entries.push({path:name,xml:open+current.join("")+close,count:current.length});current=[];bytes=new TextEncoder().encode(open+close).length;}
 for(const fragment of list){const size=new TextEncoder().encode(fragment).length;if(current.length>=maxUrls||bytes+size>maxBytes)flush();current.push(fragment);bytes+=size;}
 flush();
 const index='<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+entries.map(e=>'  <sitemap><loc>'+xml(base.origin+"/"+e.path)+'</loc></sitemap>\n').join("")+'</sitemapindex>\n';
 return {base:base.origin,verifiedUrlCount:list.length,sitemaps:entries,indexXml:index,robotsTxt:"User-agent: *\nAllow: /\nSitemap: "+base.origin+"/sitemap-index.xml\n"};
}
