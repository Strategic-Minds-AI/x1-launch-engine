/* PRIME SURFACES / browser-local nonproduction generator controls.
 * No API requests, cookies, localStorage, analytics, service workers, or customer data transmission.
 */
(function () {
  "use strict";
  const qs=(s)=>document.querySelector(s);
  const qsa=(s)=>Array.from(document.querySelectorAll(s));
  const state={brand:"PRIME",accent:"#e73b30",accentName:"Signal Red",copy:"premium",image:"garage",finish:"flake"};
  const originalFocus={value:null};
  const copyVariants={
    premium:{
      hero:'THE SURFACE<br>CHANGES <em>EVERYTHING.</em>',
      description:"Remarkable spaces begin beneath your feet. Explore distinctive floor coating and decorative concrete concepts for the places you care about."
    },
    commercial:{
      hero:'PERFORMANCE<br>STARTS <em>BELOW.</em>',
      description:"Explore commercial surface concepts shaped by site requirements, maintenance needs, operational schedules, and intended traffic."
    },
    design:{
      hero:'MATERIALS<br>MAKE THE <em>STATEMENT.</em>',
      description:"Give architecture a stronger foundation. Explore decorative concrete concepts centered on texture, reflection, depth, and restraint."
    }
  };
  const art={
    garage:{url:"https://xtremepolishingsystems.com/cdn/shop/files/IMG_0682-Enhanced-NR-min_6c6d7b7a-16b7-44e4-9744-79aa1992824e.jpg?v=1721927781&width=2800",name:"XPS training reference: broadcast epoxy flake coating"},
    interior:{url:"https://xtremepolishingsystems.com/cdn/shop/files/IMG_5783-min.jpg?v=1721928098&width=2025",name:"XPS metallic epoxy floor training reference"},
    workplace:{url:"https://xtremepolishingsystems.com/cdn/shop/files/IMG_7400-Enhanced-NR-min_9d6c666a-3dbb-4ad8-b3d9-b79f0e0175be.jpg?v=1721928197&width=2700",name:"XPS metallic epoxy finish reference"}
  };
  const finishes={flake:"ARCHITECTURAL FLAKE",metallic:"METALLIC EFFECT",polished:"POLISHED CONCRETE"};
  function sanitiseBrand(value) {
    return String(value||"").replace(/[^a-zA-Z0-9 &.'-]/g,"").slice(0,24).trim().toUpperCase()||"PRIME";
  }
  function colorLuminance(hex) {
    const values=hex.replace("#","").match(/.{2}/g).map(x=>parseInt(x,16)/255);
    const linear=values.map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
    return .2126*linear[0]+.7152*linear[1]+.0722*linear[2];
  }
  function applyAccent(hex,name) {
    const accepted=["#e73b30","#bd945a","#377fbd","#268573"];
    if(!accepted.includes(hex))return;
    state.accent=hex;state.accentName=name;
    document.documentElement.style.setProperty("--accent",hex);
    // Favor contrast-safe action surfaces; red accent is an art-direction token, not automatically button background.
    const darkAction=hex==="#e73b30"?"#b9231e":hex==="#bd945a"?"#79541e":hex==="#377fbd"?"#225983":"#195f50";
    document.documentElement.style.setProperty("--accent-dark",darkAction);
    document.documentElement.style.setProperty("--action",darkAction);
    document.documentElement.style.setProperty("--action-ink",colorLuminance(darkAction)>.18?"#101318":"#ffffff");
    qsa("[data-accent]").forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.accent===hex)));
    qs("#accentName").textContent=name+" / Contrast-aware CTA palette";
  }
  function applyState(){
    qsa("[data-brand]").forEach(el=>{el.textContent=state.brand});
    const logo=qs(".wordmark");if(logo)logo.setAttribute("aria-label",state.brand+" Surfaces, top of page");
    document.title=state.brand+" Surfaces | Premium Concrete & Coatings | Demo";
    const cv=copyVariants[state.copy];
    qs("#heroTitle").innerHTML=cv.hero;
    qs("#heroSubtitle").textContent=cv.description;
    const photo=qs("#heroPhoto");
    photo.style.backgroundImage='url("'+art[state.image].url+'")';
    photo.setAttribute("aria-label",art[state.image].name);
    qs("#finishVisual").dataset.finish=state.finish;
    qs("#finishTitle").textContent=finishes[state.finish];
    qsa("[data-finish]").forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.finish===state.finish)));
  }
  function setStudio(open){
    const panel=qs("#studioPanel");
    const backdrop=qs("#studioBackdrop");
    if(open){originalFocus.value=document.activeElement;panel.classList.add("open");panel.setAttribute("aria-hidden","false");backdrop.hidden=false;document.body.classList.add("lock-scroll");qs("#studioTab").setAttribute("aria-expanded","true");qs("#brandName").focus()}
    else {panel.classList.remove("open");panel.setAttribute("aria-hidden","true");backdrop.hidden=true;document.body.classList.remove("lock-scroll");qs("#studioTab").setAttribute("aria-expanded","false");if(originalFocus.value&&typeof originalFocus.value.focus==="function")originalFocus.value.focus()}
  }
  function trapFocus(e){
    const panel=qs("#studioPanel");
    if(!panel.classList.contains("open"))return;
    if(e.key==="Escape"){e.preventDefault();setStudio(false);return}
    if(e.key!=="Tab")return;
    const focusable=qsa('#studioPanel button:not([disabled]), #studioPanel input:not([disabled]), #studioPanel select:not([disabled])').filter(el=>el.offsetWidth>0);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
  function bind(){
    const menu=qs("#menuToggle"),links=qs("#mainNav");
    menu.addEventListener("click",function(){
      const open=links.classList.toggle("open");
      menu.setAttribute("aria-expanded",String(open));
    });
    qsa(".navlinks a").forEach(a=>a.addEventListener("click",function(){links.classList.remove("open");menu.setAttribute("aria-expanded","false")}));
    ["studioTab","studioOpen"].forEach(id=>qs("#"+id).addEventListener("click",()=>setStudio(true)));
    qs("#studioClose").addEventListener("click",()=>setStudio(false));
    qs("#studioBackdrop").addEventListener("click",()=>setStudio(false));
    document.addEventListener("keydown",trapFocus);
    qs("#brandName").addEventListener("input",function(){state.brand=sanitiseBrand(this.value);applyState()});
    qsa("[data-accent]").forEach(btn=>btn.addEventListener("click",function(){applyAccent(this.dataset.accent,this.dataset.accentName)}));
    qs("#copyPreset").addEventListener("change",function(){state.copy=this.value in copyVariants?this.value:"premium";applyState()});
    qs("#imagePreset").addEventListener("change",function(){state.image=this.value in art?this.value:"garage";applyState()});
    qsa("[data-finish]").forEach(btn=>btn.addEventListener("click",function(){state.finish=this.dataset.finish in finishes?this.dataset.finish:"flake";applyState()}));
    qsa("[data-filter]").forEach(btn=>btn.addEventListener("click",function(){
      const chosen=this.dataset.filter;
      qsa("[data-filter]").forEach(b=>{b.setAttribute("aria-pressed",String(b===this));b.classList.toggle("active",b===this)});
      qsa(".portfolio-item").forEach(item=>{item.hidden=!(chosen==="all"||item.dataset.cat===chosen)});
    }));
    qs("#resetStudio").addEventListener("click",function(){
      Object.assign(state,{brand:"PRIME",accent:"#e73b30",accentName:"Signal Red",copy:"premium",image:"garage",finish:"flake"});
      qs("#brandName").value="PRIME";qs("#copyPreset").value="premium";qs("#imagePreset").value="garage";
      applyAccent(state.accent,state.accentName);applyState();
    });
    qs("#exportManifest").addEventListener("click",function(){
      const manifest={
        schema_version:"1.0.0",
        template_id:"prime-surfaces-05",
        template_version:"0.1.0-preview",
        approval:{brand_pack:"B",website_design:"2",workflow:"C",concept:"05",scope:"nonproduction-design-only"},
        customizations:{brand:state.brand,accent:state.accent,accent_name:state.accentName,copy_preset:state.copy,image_direction:state.image,finish_preset:state.finish},
        asset_provenance:"external_illustrative_references_unapproved",
        deployment:{production_approved:false,noindex_required:true},
        generated_at:new Date().toISOString()
      };
      const blob=new Blob([JSON.stringify(manifest,null,2)],{type:"application/json"});
      const objectUrl=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=objectUrl;a.download="prime-surfaces-05-draft.json";document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
    });
    qs("#referenceFile").addEventListener("change",function(){
      const file=this.files&&this.files[0];const text=qs("#fileHelp");
      if(!file){text.textContent="Choose an optional image; it will not upload.";return}
      if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>10*1024*1024){this.value="";text.textContent="Choose PNG, JPEG or WebP under 10 MB.";return}
      text.textContent="Local file selected: "+file.name.slice(0,65)+" (not uploaded).";
    });
    qs("#projectForm").addEventListener("submit",function(event){
      event.preventDefault();
      if(!this.reportValidity())return;
      const fields=new FormData(this);
      const category=String(fields.get("category")||"").slice(0,75);
      const area=Number(fields.get("area"));
      const substrate=String(fields.get("condition")||"").slice(0,75);
      const timeline=String(fields.get("timeline")||"").slice(0,75);
      if(!Number.isFinite(area)||area<1||area>1000000)return;
      const response=qs("#formResult");
      response.hidden=false;
      response.textContent="LOCAL DEMO ONLY\nProject: "+category+"\nApproximate area: "+area.toLocaleString()+" sq ft\nSubstrate: "+substrate+"\nTiming: "+timeline+"\nThis brief was not transmitted, persisted, quoted, or routed to a CRM.";
      response.scrollIntoView({behavior:"smooth",block:"nearest"});
    });
    applyAccent(state.accent,state.accentName);applyState();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
})();
