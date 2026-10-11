/* WEBSITE LAUNCH ENGINE: PRIVATE, ZERO-BACKEND BUSINESS CREATIVE STUDIO
 * Preview code: no external data writes, OAuth, Gmail sends, SMS sends or file uploads.
 * MIT QR library is pinned and served locally from /vendor/qrcode-generator.js.
 * All text comes from user-entered facts, not invented business claims.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const dataIds=['business','person','role','industry','phone','email','website','location','tagline','about','services'];
const state={accent:'#34caff',design:'modern',mark:'orbit',qrSvg:'',logoSvg:'',photos:{portrait:'',project:'',logo:''},generatedBrief:'',generatedSocial:''};
const get=id=>($(id)?.value||'').trim();
const setText=(id,value)=>{const el=$(id);if(el)el.textContent=value||'';};
const escapeXml=value=>String(value||'').replace(/[<>&"']/g,ch=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[ch]));
const safelyColor=value=>/^#[0-9a-fA-F]{6}$/.test(value||'')?value:'#34caff';
const safeWebsite=()=>{
 const v=get('website');if(!v)return '';
 try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}
};
const company=()=>get('business')||'Your Business';
const serviceList=()=>get('services').split(/[\n,]+/).map(x=>x.trim()).filter(Boolean).slice(0,6);
const initials=()=>company().split(/\s+/).slice(0,2).map(x=>x.charAt(0).toUpperCase()).join('').replace(/[^A-Z0-9]/g,'')||'B';
function toast(message){
 const t=$('toast');t.textContent=message;t.classList.add('show');
 if(toast.timeout)clearTimeout(toast.timeout);
 toast.timeout=setTimeout(()=>t.classList.remove('show'),4400);
}
function download(name,content,type){
 const blob=content instanceof Blob?content:new Blob([content],{type:type||'text/plain;charset=utf-8'});
 const object=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=object;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(object),4000);
}
function slug(s){return String(s||'business').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55)||'business'}
function vEsc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,').slice(0,350)}
function vCard(){
 const lines=['BEGIN:VCARD','VERSION:3.0','FN:'+vEsc(get('person')||company()),'ORG:'+vEsc(company())];
 if(get('role'))lines.push('TITLE:'+vEsc(get('role')));
 if(get('phone'))lines.push('TEL;TYPE=WORK:'+vEsc(get('phone')));
 if(get('email'))lines.push('EMAIL;TYPE=WORK:'+vEsc(get('email')));
 if(safeWebsite())lines.push('URL:'+safeWebsite());
 if(get('location'))lines.push('ADR;TYPE=WORK:;;'+vEsc(get('location'))+';;;;');
 lines.push('END:VCARD');return lines.join('\r\n')+'\r\n';
}
function markSvg(){
 const color=safelyColor(state.accent),mark=escapeXml(initials());
 let shape='';
 if(state.mark==='crest')shape='<rect x="19" y="12" width="82" height="92" rx="17" fill="none" stroke="'+color+'" stroke-width="8"/><path d="M32 18V38 M88 18V38 M24 78H96" stroke="'+color+'" stroke-width="4" opacity=".45"/>';
 else if(state.mark==='monogram')shape='<path d="M14 100H106 M14 17H106" stroke="'+color+'" stroke-width="8" stroke-linecap="round"/>';
 else shape='<circle cx="60" cy="60" r="43" fill="none" stroke="'+color+'" stroke-width="7"/><circle cx="99" cy="23" r="8" fill="'+color+'"/><path d="M9 78C37 110 87 96 115 56" fill="none" stroke="'+color+'" stroke-width="3" opacity=".6"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="220" viewBox="0 0 900 220" role="img" aria-label="Transparent generated logo for '+escapeXml(company())+'"><g transform="translate(37 49) scale(1.05)">'+shape+'<text x="60" y="82" text-anchor="middle" font-family="Arial,sans-serif" font-size="43" font-weight="900" fill="'+color+'">'+mark+'</text></g><text x="205" y="112" font-family="Arial,sans-serif" font-size="51" font-weight="900" letter-spacing="-2" fill="'+color+'">'+escapeXml(company().slice(0,30))+'</text><text x="208" y="146" font-family="Arial,sans-serif" font-size="15" letter-spacing="4" fill="'+color+'" opacity=".82">'+escapeXml(get('industry').toUpperCase().slice(0,40))+'</text></svg>';
}
function logoUrl(svg){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
function updateLogo(){
 state.logoSvg=markSvg();
 $('logo-preview').innerHTML=state.logoSvg;
 if(state.photos.logo){$('card-logo').src=state.photos.logo}
 else $('card-logo').src=logoUrl(state.logoSvg);
 $('card-logo').style.display='block';
}
function qrContent(){const url=safeWebsite();return get('qr-mode')==='website'&&url?url:vCard()}
function updateQr(){
 const content=qrContent();
 try{
  if(typeof qrcode!=='function')throw Error('LOCAL_QR_LIBRARY_NOT_LOADED');
  if(content.length>1200)throw Error('QR_DATA_TOO_LARGE');
  const qr=qrcode(0,'M');qr.addData(content,'Byte');qr.make();
  state.qrSvg=qr.createSvgTag({cellSize:6,margin:2,scalable:true});
  $('qr-preview').innerHTML=state.qrSvg;
  $('qr-preview').setAttribute('data-qr-state','ready');
 }catch(e){
  state.qrSvg='';$('qr-preview').replaceChildren();
  const p=document.createElement('div');p.className='qr-placeholder';p.textContent='QR unavailable';$('qr-preview').append(p);
  $('qr-preview').setAttribute('data-qr-state','error');
 }
}
function updateCard(){
 $('card-preview').className='digital-card layout-'+state.design;
 $('card-preview').style.setProperty('--brand-accent',state.accent);
 setText('card-business',company().toUpperCase());
 setText('card-name',get('person')||'Your Name');
 setText('card-job',get('role')||'Your role');
 setText('card-tagline',get('tagline')||'A better way to connect.');
 setText('card-phone',get('phone'));
 setText('card-email',get('email'));
 setText('card-website',safeWebsite()?new URL(safeWebsite()).hostname:'');
 setText('brand-summary',state.design.toUpperCase()+' / '+state.accent.toUpperCase());
 $('accent-hex').textContent=state.accent.toUpperCase();
 $('card-preview').style.borderColor=state.accent;
 if($('card-portrait')){$('card-portrait').src=state.photos.portrait||'';$('card-portrait').style.display=state.photos.portrait?'block':'none'}
}
function updatePaper(){
 $('print-sheet').style.setProperty('--brand-accent',state.accent);
 const brochure=get('print-type')==='brochure';
 setText('sheet-label',brochure?'BUSINESS SERVICES & OVERVIEW':'BUSINESS INTRODUCTION');
 setText('sheet-title',company());
 setText('sheet-tagline',get('tagline')||'Explore our services and contact us to learn more.');
 const about=get('about')||'This is a draft. Add a factual business description in the profile to complete your brochure.';
 setText('sheet-about',about);
 const services=serviceList();$('sheet-services').replaceChildren();
 (services.length?services:['Add your verified services to this document']).forEach(s=>{
  const d=document.createElement('div');d.className='sheet-service';d.textContent=s;$('sheet-services').appendChild(d);
 });
 setText('sheet-cta',[get('phone'),get('email'),get('location')].filter(Boolean).join(' · ')||'Contact information will appear here.');
 const img=state.photos.project||state.photos.portrait;$('sheet-project-img').src=img||'';$('sheet-project-img').style.display=img?'block':'none';
 const bg=state.photos.project?'linear-gradient(90deg,#041627da,#07517380),url("'+state.photos.project+'")':'linear-gradient(135deg,#072743,#0d5f78)';
 $('sheet-hero').style.backgroundImage=bg;
}
function buildBrandBrief(){
 const direction={modern:'Modern / Architectural',classic:'Classic / Refined',bold:'Bold / Contemporary'}[state.design];
 const tagline=get('tagline')||'Explore '+get('industry')+' services from '+company()+'.';
 return 'BUSINESS IDENTITY · DRAFT\n\nCompany: '+company()+'\nIndustry: '+get('industry')+
 '\nDirection: '+direction+'\nAccent: '+state.accent.toUpperCase()+
 '\nMark: '+state.mark+'\nTagline: '+tagline+
 '\nTypography: system sans-serif; accessible print and digital fallback\n\nBusiness information:\n'+
 [get('person'),get('role'),get('phone'),get('email'),safeWebsite(),get('location')].filter(Boolean).join('\n')+
 '\n\nServices:\n'+serviceList().map(s=>'• '+s).join('\n')+
 '\n\nAbout:\n'+(get('about')||'Business information awaiting owner verification.')+
 '\n\nSTATUS: LOCAL CONCEPT. Review all claims, rights and availability before publication.';
}
function refresh(){updateCard();updateLogo();updateQr();updatePaper()}
function setTab(tab){
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
 document.querySelectorAll('.tab-pane').forEach(p=>p.classList.toggle('active',p.id==='pane-'+tab));
 const u=new URL(location.href);u.hash=tab;history.replaceState({},'',u);
}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
dataIds.forEach(id=>$(id).addEventListener('input',refresh));
for(const id of ['design','mark','qr-mode','print-type']){
 $(id).addEventListener('change',()=>{
  if(id==='design')state.design=get('design');
  if(id==='mark')state.mark=get('mark');
  refresh();
 });
}
$('accent').addEventListener('input',()=>{state.accent=safelyColor(get('accent'));refresh()});
$('create-brands').addEventListener('click',()=>{
 const opts=[
  {name:'AQUA | Coastal Precision',design:'modern',mark:'orbit',accent:'#34caff',note:'Crisp, contemporary, blue-forward'},
  {name:'ONYX | Architectural Authority',design:'classic',mark:'crest',accent:'#dbb978',note:'Elegant dark neutrals with warm accent'},
  {name:'ELECTRIC | Future-Ready',design:'bold',mark:'monogram',accent:'#8ee8ab',note:'Energetic, high contrast, confident'}
 ];
 $('brand-directions').replaceChildren();
 opts.forEach(o=>{
  const b=document.createElement('button');b.type='button';b.className='pill-button';
  const label=document.createElement('span');label.textContent=o.name;
  const sub=document.createElement('small');sub.textContent=o.note;
  b.append(label,sub);b.style.borderLeft='5px solid '+o.accent;
  b.addEventListener('click',()=>{
   document.querySelectorAll('.pill-button').forEach(el=>el.classList.remove('selected'));b.classList.add('selected');
   state.accent=o.accent;state.design=o.design;state.mark=o.mark;
   $('accent').value=o.accent;$('design').value=o.design;$('mark').value=o.mark;
   state.generatedBrief=buildBrandBrief();refresh();toast(o.name+' applied across all assets');
  });
  $('brand-directions').append(b);
 });
 state.generatedBrief=buildBrandBrief();
 toast('Three local brand directions generated. Select one to preview.');
});
$('save-logo-svg').addEventListener('click',()=>{download(slug(company())+'-transparent-logo.svg',state.logoSvg,'image/svg+xml;charset=utf-8');toast('Transparent SVG logo prepared')});
$('save-logo-png').addEventListener('click',()=>{
 const blob=new Blob([state.logoSvg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);
 const im=new Image();im.onload=()=>{
  const cv=document.createElement('canvas');cv.width=1800;cv.height=440;
  const ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(im,0,0,cv.width,cv.height);
  cv.toBlob(png=>{if(png){download(slug(company())+'-transparent-logo.png',png,'image/png');toast('Transparent PNG generated');}else toast('PNG export is unavailable in this browser');URL.revokeObjectURL(url)},'image/png');
 };
 im.onerror=()=>{URL.revokeObjectURL(url);toast('PNG render error')};im.src=url;
});
$('save-brand').addEventListener('click',()=>download(slug(company())+'-brand-brief.txt',buildBrandBrief(),'text/plain;charset=utf-8'));
$('save-vcard').addEventListener('click',()=>download(slug(company())+'-contact.vcf',vCard(),'text/vcard;charset=utf-8'));
$('save-qr').addEventListener('click',()=>{
 if(!state.qrSvg){toast('Enter a valid website or contact details for QR');return;}
 download(slug(company())+'-qr.svg',state.qrSvg,'image/svg+xml;charset=utf-8');
});
function shareText(){
 const lines=[get('person')||company(),get('role'),company(),get('phone'),get('email'),safeWebsite()].filter(Boolean);
 return lines.join(' | ');
}
$('share-email').addEventListener('click',()=>{
 const subject='Business card: '+company(),body=shareText()+'\n\nSave my contact details from the vCard attachment if supplied by the sender.';
 location.href='mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 toast('Email draft opened in your device app. No email sent by this site.');
});
$('share-sms').addEventListener('click',()=>{
 location.href='sms:?&body='+encodeURIComponent(shareText());
 toast('SMS draft opened in your device app. No text sent by this site.');
});
$('share-copy').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(shareText());toast('Business card details copied')}
 catch{toast('Clipboard permission was declined. Use the vCard download instead.')}
});
function cardSvg(){
 const color=state.accent,business=escapeXml(company()),name=escapeXml(get('person')||'Your Name'),role=escapeXml(get('role')),phone=escapeXml(get('phone')),email=escapeXml(get('email')),website=escapeXml(safeWebsite());
 const qr=state.qrSvg?state.qrSvg.replace('<svg ', '<svg x="895" y="350" width="195" height="195" '):'';
 const logo=logoUrl(state.logoSvg);
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="680" viewBox="0 0 1200 680" role="img" aria-label="Business card for '+business+'">'+
 '<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#071528"/><stop offset="1" stop-color="#0e4b6f"/></linearGradient></defs>'+
 '<rect width="1200" height="680" rx="28" fill="url(#bg)"/>'+
 '<circle cx="1090" cy="60" r="230" fill="none" stroke="'+color+'" stroke-width="75" opacity=".2"/>'+
 '<rect x="48" y="50" width="1104" height="580" rx="24" stroke="'+color+'" opacity=".3" fill="none"/>'+
 '<image href="'+logo+'" x="65" y="60" width="430" height="120"/>'+
 '<text x="78" y="292" font-family="Arial" font-size="31" letter-spacing="7" fill="'+color+'">'+business+'</text>'+
 '<text x="75" y="384" font-family="Arial" font-size="69" font-weight="bold" fill="#ffffff">'+name+'</text>'+
 '<text x="79" y="435" font-family="Arial" font-size="31" fill="#a8def7">'+role+'</text>'+
 '<path d="M75 485H830" stroke="'+color+'" opacity=".7"/>'+
 '<text x="80" y="533" font-family="Arial" font-size="22" fill="#ffffff">'+phone+'</text>'+
 '<text x="80" y="569" font-family="Arial" font-size="22" fill="#ffffff">'+email+'</text>'+
 '<text x="80" y="605" font-family="Arial" font-size="20" fill="#a8def7">'+website+'</text>'+
 qr+'</svg>';
}
$('save-card').addEventListener('click',()=>download(slug(company())+'-digital-business-card.svg',cardSvg(),'image/svg+xml;charset=utf-8'));
function brochureText(){
 return company().toUpperCase()+'\n'+(get('tagline')||'Our business and services')+
 '\n\n'+(get('about')||'Add your verified company profile before distribution.')+
 '\n\nSERVICES\n'+serviceList().map(s=>'• '+s).join('\n')+
 '\n\nCONTACT\n'+[get('phone'),get('email'),safeWebsite(),get('location')].filter(Boolean).join(' · ')+
 '\n\nDRAFT ONLY: owner review required before publishing.';
}
$('make-copy').addEventListener('click',()=>{
 if(!get('tagline'))$('tagline').value='Explore '+get('industry')+' services with '+company()+'.';
 if(!get('about')&&serviceList().length)$('about').value=company()+' provides information about '+serviceList().join(', ')+'. Contact the team to discuss your needs.';
 refresh();toast('Draft brochure content prepared from your profile. Verify before use.');
});
$('copy-brochure').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(brochureText());toast('Brochure text copied')}
 catch{download(slug(company())+'-brochure-copy.txt',brochureText());toast('Brochure text downloaded instead')}
});
$('print-pdf').addEventListener('click',()=>{toast('Choose Save as PDF in your browser print dialog');window.print()});
$('make-social').addEventListener('click',()=>{
 const service=serviceList()[0]||get('industry')+' services';
 const lead='Looking for '+service.toLowerCase()+'?';
 const body=get('about')?get('about').slice(0,250):'Explore '+company()+' and the services we provide.';
 const ending=safeWebsite()?'Learn more: '+safeWebsite():'Contact us for details: '+get('phone');
 const hashtag='#'+get('industry').replace(/[^A-Za-z0-9]/g,'')+' #LocalBusiness';
 $('social-output').value=lead+'\n\n'+body+'\n\n'+ending+'\n\n'+hashtag+'\n\nDRAFT FOR OWNER REVIEW';
 toast(get('social-network')+' caption generated as a local draft');
});
$('copy-social').addEventListener('click',async()=>{const s=$('social-output').value;if(!s){toast('Generate a caption first');return}try{await navigator.clipboard.writeText(s);toast('Caption copied')}catch{toast('Copy permission was declined')}});
function suggestFromPaste(){
 const source=get('paste-source').slice(0,5000),root=$('source-suggestions');root.replaceChildren();
 if(!source){root.textContent='Paste website information first. It stays on this device.';return}
 const patterns=[
  {id:'email',label:'Email',rx:/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/},
  {id:'phone',label:'Phone',rx:/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/},
  {id:'website',label:'Website',rx:/https:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s<>"]*)?/}
 ];
 let n=0;const desc=document.createElement('div');desc.textContent='Suggestions based on the text you pasted. Click each field to apply after reviewing.';root.append(desc);
 for(const p of patterns){const m=source.match(p.rx);if(!m)continue;const v=m[0];n++;
  const b=document.createElement('button');b.type='button';b.className='btn ghost small';b.style.margin='5px 6px 0 0';b.textContent='Use '+p.label+': '+v.slice(0,38);
  b.addEventListener('click',()=>{$(p.id).value=v;refresh();toast(p.label+' applied after owner review')});
  root.append(b);
 }
 if(!n){const note=document.createElement('p');note.textContent='No email, phone or HTTPS website address found. Edit your profile manually.';root.append(note)}
}
$('suggest-from-paste').addEventListener('click',suggestFromPaste);
for(const [type,id] of [['portrait','portrait-file'],['project','project-file'],['logo','logo-file']]){
 $(id).addEventListener('change',event=>{
  const file=event.target.files?.[0];if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024||file.size===0){toast('Please choose PNG, JPG or WebP under 5 MB');event.target.value='';return}
  const reader=new FileReader();
  reader.onload=()=>{
   if(typeof reader.result!=='string'||!reader.result.startsWith('data:image/')){toast('Invalid image data');return}
   state.photos[type]=reader.result;const img=$(type+'-img');img.src=reader.result;$(type+'-tile').classList.add('has-image');refresh();toast(type+' image added to this browser preview only');
  };
  reader.onerror=()=>toast('Could not read the image');
  reader.readAsDataURL(file);
 });
}
state.design=get('design');state.mark=get('mark');state.accent=safelyColor(get('accent'));refresh();
const requested=location.hash.replace('#','');if(['card','brand','print','social','connect'].includes(requested))setTab(requested);
})();