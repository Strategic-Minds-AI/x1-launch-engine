// Deterministic, canonical sitemap and crawl control generation.
// Run only after production marketing pages and lead delivery pass release QA.
import fs from 'node:fs';
const origin=(process.env.PUBLIC_SITE_ORIGIN||'https://unlimitedwebsites.net').replace(/\/$/,'');
const u=new URL(origin);if(u.protocol!=='https:'||u.pathname!=='/'||u.search||u.hash)throw Error('Canonical origin must be HTTPS root');
const published=['/']; // Add only verified, distinct, public HTML landing pages.
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+published.map(p=>'  <url><loc>'+origin+p+'</loc></url>').join('\n')+'\n</urlset>\n';
fs.writeFileSync('sitemap.xml',xml);
fs.writeFileSync('robots.txt','User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /client.html\nDisallow: /academy.html\nDisallow: /designer.html\nDisallow: /api/\nSitemap: '+origin+'/sitemap.xml\n');
console.log('Generated canonical sitemap for',origin,'with',published.length,'approved public page(s)');
