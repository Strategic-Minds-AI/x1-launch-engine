"use client";

/* eslint-disable @next/next/no-img-element */
/** Prime Surfaces Template 05: layout locked, browser-local generators.
 * No network submit or production integrations. Replace demo assets before client release.
 */
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  ACCENTS, COPY, IMAGES, FINISHES, SERVICES, GALLERY,
  DEFAULT_STUDIO, APPROVAL_LOCK,
  makeDraftManifest, makeImageBrief, sanitizeBrand
} from "@/lib/template";
import type {CopyPreset, ImageDirection, FinishId, StudioState} from "@/lib/template";

const FILTERS = [
  ["all", "ALL ENVIRONMENTS"], ["garage","GARAGES"],
  ["commercial","COMMERCIAL"], ["residential","RESIDENTIAL"]
] as const;
type GalleryFilter = typeof FILTERS[number][0];

function saveJson(name: string, value: unknown) {
  const objectUrl=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)], {type:"application/json"}));
  const link=document.createElement("a");
  link.href=objectUrl;link.download=name;document.body.appendChild(link);link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
}

export default function PrimeSite() {
  const [state,setState] = useState<StudioState>({...DEFAULT_STUDIO});
  const [studioOpen,setStudioOpen] = useState(false);
  const [navOpen,setNavOpen] = useState(false);
  const [filter,setFilter] = useState<GalleryFilter>("all");
  const [formResult,setFormResult] = useState("");
  const [fileMessage,setFileMessage] = useState("Choose an optional image; it will not upload.");
  const brandRef=useRef<HTMLInputElement>(null);
  const triggerRef=useRef<HTMLButtonElement>(null);
  const panelRef=useRef<HTMLElement>(null);
  const acc=ACCENTS.find(x=>x.id===state.accent)??ACCENTS[0];
  const copy=COPY[state.copy];
  const hero=IMAGES[state.image];
  const theme={
    "--accent":acc.color,"--accent-dark":acc.action,
    "--action":acc.action,"--action-ink":acc.actionInk
  } as CSSProperties;

  function patch<K extends keyof StudioState>(key:K,value:StudioState[K]) {
    setState(prev=>({...prev,[key]:value}));
  }
  function closeStudio(){setStudioOpen(false);triggerRef.current?.focus()}
  useEffect(()=>{
    if(!studioOpen)return;
    document.body.classList.add("lock-scroll");
    brandRef.current?.focus();
    const handleKey=(e:KeyboardEvent)=>{
      if(e.key==="Escape"){setStudioOpen(false);triggerRef.current?.focus();return}
      if(e.key!=="Tab")return;
      const elements=Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled])')??[]).filter(x=>x.offsetWidth>0);
      if(!elements.length)return;
      const first=elements[0],last=elements[elements.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    };
    document.addEventListener("keydown",handleKey);
    return ()=>{document.body.classList.remove("lock-scroll");document.removeEventListener("keydown",handleKey)};
  },[studioOpen]);

  function submitProject(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form=e.currentTarget;
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const area=Number(data.get("area"));
    if(!Number.isFinite(area)||area<1||area>1000000)return;
    const category=String(data.get("category")??"").slice(0,70);
    const condition=String(data.get("condition")??"").slice(0,70);
    const timeline=String(data.get("timeline")??"").slice(0,70);
    setFormResult("LOCAL DEMO ONLY\nProject: "+category+
      "\nApproximate area: "+area.toLocaleString()+" sq ft\nSubstrate: "+
      condition+"\nTiming: "+timeline+"\nNothing transmitted, quoted, persisted, or routed to a CRM.");
    // Never store an inquiry in localStorage, cookies or remote APIs.
  }
  return <div className="prime-app" style={theme}>
    <div className="preview-ribbon"><span className="preview-pulse" aria-hidden="true"/> CONCEPT 05 <span className="divider">/</span> BRAND B <span className="divider">/</span> DESIGN 2 <span className="divider">/</span> NONPRODUCTION NOINDEX DEMO <a href="#top">BACK TO TOP ↗</a></div>
    <header className="site-header" id="top"><div className="nav-shell">
      <a className="wordmark" href="#top" aria-label={sanitizeBrand(state.brand)+" Surfaces, back to top"}>
        <span className="mark" aria-hidden="true"><i/><i/><i/></span><span className="wordstack"><b>{sanitizeBrand(state.brand)}</b><small>SURFACES / CONCEPT</small></span>
      </a>
      <button type="button" className="menu-toggle" aria-controls="mainNav" aria-label="Toggle navigation" aria-expanded={navOpen} onClick={()=>setNavOpen(v=>!v)}><span/><span/><span/></button>
      <nav id="mainNav" className={"navlinks"+(navOpen?" open":"")} aria-label="Primary">
        {([["Solutions","services"],["Finishes","materials"],["Inspiration","portfolio"],["Our approach","method"],["Project inquiry","inquiry"]] as const).map(([label,id])=><a key={id} href={"#"+id} onClick={()=>setNavOpen(false)}>{label}</a>)}
      </nav>
      <div className="nav-actions"><button ref={triggerRef} className="nav-studio" type="button" onClick={()=>setStudioOpen(true)}>Customize <span>↗</span></button><a href="#inquiry" className="button button-accent nav-quote">Plan a project <span>↗</span></a></div>
    </div></header>
    <main>
      <section className="hero" aria-labelledby="heroTitle">
        <div className="hero-photo image-direction" role="img" aria-label={hero.alt} style={{backgroundImage:"url("+hero.url+")"}}/>
        <div className="hero-vignette"/><div className="hero-rail"><span>01 / 05</span><span className="hero-vertical">CONCRETE REIMAGINED</span><span className="hero-rule"/></div>
        <div className="hero-content shell">
          <p className="overline"><span className="slash" aria-hidden="true">{"///"}</span> CUSTOM EPOXY & DECORATIVE CONCRETE</p>
          <h1 id="heroTitle">{copy.headingA}<br/>{copy.headingB} <em>{copy.headingAccent}</em></h1>
          <p className="hero-subtitle">{copy.description}</p>
          <div className="hero-cta"><a className="button button-accent" href="#inquiry">DESIGN YOUR FLOOR <span>↗</span></a><a className="button button-outline" href="#portfolio">EXPLORE THE WORK <span>↓</span></a></div>
          <div className="hero-tagline"><span className="tag-dot"/> Built for impact. Considered for everyday use.</div>
        </div>
        <div className="hero-bottom shell"><div className="hero-step"><b>01</b><span>DISCOVER</span></div><div className="hero-step"><b>02</b><span>SPECIFY</span></div><div className="hero-step"><b>03</b><span>TRANSFORM</span></div><span className="hero-scroll">SCROLL TO EXPLORE <span>↓</span></span></div>
      </section>
      <section className="intro section-padding" id="about">
        <div className="shell intro-grid">
          <div><p className="eyebrow">AN UNEXPECTED POINT OF VIEW</p><h2>THE FOUNDATION<br/>OF A <span>BETTER SPACE.</span></h2></div>
          <div className="intro-aside"><p>Not merely a coating. A thoughtfully chosen surface can change the identity of a garage, showroom, workspace, or contemporary interior.</p><p>Every real project starts with an assessment of substrate conditions, usage requirements, design intent, and preparation needs.</p><a className="text-arrow" href="#method">DISCOVER OUR APPROACH <span>↗</span></a></div>
        </div>
        <div className="intro-rule shell"><span>DESIGNED AROUND YOUR SPACE</span><span>FORM / FUNCTION / FINISH</span></div>
      </section>
      <section className="services section-padding" id="services" aria-labelledby="servicesTitle">
        <div className="shell"><div className="section-head lighthead"><p className="eyebrow">01 / OUR CAPABILITIES</p><div className="headrow"><h2 id="servicesTitle">SURFACES WITH<br/><em>PURPOSE.</em></h2><p>Three expressions of the same philosophy: design worth noticing, paired with an honest conversation about what a surface needs to do.</p></div></div>
          <div className="service-grid">{SERVICES.map(service=><a href="#inquiry" className={"service-card "+service.className} key={service.id}><span className="service-image" role="img" aria-label={"Illustrative "+service.id+" environment"}/><span className="service-shade"/><span className="service-content"><span className="service-number">{service.number}</span><strong>{service.titleLines[0]}<br/>{service.titleLines[1]}</strong><span>{service.teaser}</span><span className="service-link">EXPLORE THE SYSTEM <b>↗</b></span></span></a>)}</div>
        </div>
      </section>
      <section className="materials section-padding" id="materials" aria-labelledby="materialsTitle">
        <div className="shell"><div className="section-head"><p className="eyebrow">02 / DESIGN LAB</p><div className="headrow"><h2 id="materialsTitle">FIND YOUR<br/><span>FINISH.</span></h2><p>Explore illustrative color and material directions. Final appearance and suitability depend on products, lighting, preparation, and site conditions.</p></div></div>
          <div className="finish-layout"><div className="finish-visual" data-finish={state.finish}><span className="finish-image" role="img" aria-label="Architectural material study"/><span className="finish-overlay"/><span className="finish-label"><small>DESIGN STUDY / 01</small><strong>{FINISHES[state.finish].title}</strong></span></div>
            <div className="finish-controls"><span className="tiny-rule"/><h3>A DIFFERENT<br/>KIND OF CANVAS.</h3><p>Choose a finish family to explore its visual language and the questions to ask before selecting a system.</p>
              <div className="finish-options" role="group" aria-label="Finish type">{(Object.keys(FINISHES) as FinishId[]).map(f=><button type="button" key={f} data-finish={f} aria-pressed={state.finish===f} onClick={()=>patch("finish",f)}><span className={"finish-circle "+f}/><span><b>{FINISHES[f].title}</b><small>{FINISHES[f].subtitle}</small></span><i>↗</i></button>)}</div>
              <a href="#inquiry" className="button button-dark">DISCUSS MY FINISH <span>↗</span></a>
            </div>
          </div>
        </div>
      </section>
      <section className="portfolio section-padding" id="portfolio" aria-labelledby="portfolioTitle">
        <div className="shell"><div className="section-head lighthead"><p className="eyebrow">03 / INSPIRATION GALLERY</p><div className="headrow"><h2 id="portfolioTitle">BUILT TO<br/><em>STAND APART.</em></h2><p>Explore design references for real-world environments. These are illustrative photographs, not verified Prime Surfaces installations.</p></div></div>
          <div className="portfolio-tabs" role="group" aria-label="Filter inspiration">{FILTERS.map(([id,label])=><button key={id} type="button" className={filter===id?"active":""} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label} {id==="all"&&<span>05</span>}</button>)}</div>
          <div className="portfolio-grid">{GALLERY.map((item,i)=><figure key={item.id} data-cat={item.cat} hidden={filter!=="all"&&filter!==item.cat} className={"portfolio-item"+(i===0?" portfolio-lead":"")}><img loading="lazy" src={item.src} alt={item.alt}/><figcaption><b>{String(i+1).padStart(2,"0")} / {item.name}</b><span>{item.label} ↗</span></figcaption></figure>)}</div>
        </div>
      </section>
      <section className="method section-padding" id="method" aria-labelledby="methodTitle"><div className="shell">
        <div className="section-head"><p className="eyebrow">04 / THE PROCESS</p><div className="headrow"><h2 id="methodTitle">DETAILS ARE<br/><span>THE DIFFERENCE.</span></h2><p>Beautiful images can inspire a direction. Good specification determines whether a flooring approach actually fits the project.</p></div></div>
        <div className="method-grid">{[
          ["01","DISCOVER.","Describe the space, intended uses, dimensions, design goals, and schedule."],
          ["02","ASSESS.","Consider existing coatings, cracks, moisture risks, surface condition, and inspection needs."],
          ["03","SPECIFY.","Compare finish systems, surface preparation, care expectations, and practical constraints."],
          ["04","PLAN.","Define an appropriate scope, access needs, downtime considerations, and next steps."]
        ].map(([id,title,text])=><article key={id}><b>{id}</b><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div></section>
      <section className="inquiry section-padding" id="inquiry" aria-labelledby="inquiryTitle"><div className="shell inquiry-grid">
        <div className="inquiry-copy"><p className="eyebrow">05 / THE NEXT STEP</p><h2 id="inquiryTitle">YOUR SPACE.<br/><em>REIMAGINED.</em></h2><p>Explore your project&apos;s design possibilities with an industry-specific intake. The production version requires a separately validated, authorized backend.</p><div className="inquiry-aside"><span className="signal"/> INTERACTIVE DESIGN DEMO <span className="smallpipe">/</span> NOTHING SUBMITTED</div><div className="inquiry-art" role="img" aria-label="Decorative architectural flooring illustration"/></div>
        <form onSubmit={submitProject} className="project-form" id="projectForm"><div className="form-heading"><span>PROJECT BRIEF / DEMO</span><span>01 / 01</span></div><h3>TELL US WHAT<br/>YOU HAVE IN MIND.</h3><p>All fields stay in your browser. We show a local summary only.</p>
          <div className="field-row"><label>PROJECT CATEGORY *<select name="category" required defaultValue=""><option value="">Select a project</option><option>Residential garage</option><option>Commercial workspace</option><option>Decorative concrete</option><option>Other / researching</option></select></label><label>APPROX. AREA (SQ FT) *<input name="area" type="number" min="1" max="1000000" inputMode="numeric" placeholder="e.g. 600" required/></label></div>
          <div className="field-row"><label>EXISTING SUBSTRATE *<select name="condition" required defaultValue=""><option value="">Select a condition</option><option>Bare concrete</option><option>Existing coating</option><option>Damage / cracks</option><option>Unknown</option></select></label><label>PROJECT TIMING<select name="timeline" defaultValue="Exploring possibilities"><option>Exploring possibilities</option><option>Within 30 days</option><option>Within 3 months</option><option>Later</option></select></label></div>
          <label>DESIGN NOTES<textarea name="notes" maxLength={320} placeholder="Finish, surface, goals or existing conditions (optional)"/></label>
          <label className="file-upload">REFERENCE PHOTO (LOCAL PREVIEW ONLY)<input type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="fileHelp" onChange={e=>{
            const file=e.target.files?.[0];
            if(!file){setFileMessage("Choose an optional image; it will not upload.");return}
            if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>10*1024*1024){e.target.value="";setFileMessage("Choose PNG, JPEG or WebP under 10 MB.");return}
            setFileMessage("Local file selected: "+file.name.slice(0,65)+" (not uploaded).");
          }}/><span id="fileHelp">{fileMessage}</span></label>
          <button className="button button-accent submit" type="submit">REVIEW MY PROJECT BRIEF <span>↗</span></button><p className="disclosure">No live pricing, scheduling, lead creation, email, or data transfer. This is a fictional brand and nonproduction template.</p>
          {formResult&&<div className="form-result" role="status" aria-live="polite">{formResult}</div>}
        </form>
      </div></section>
    </main>
    <footer className="site-footer"><div className="shell foot-grid"><div><div className="footer-logo">{sanitizeBrand(state.brand)} SURFACES<span>.</span></div><p>A bold design direction for concrete and epoxy flooring. Fictional sample brand.</p></div><nav aria-label="Footer" className="foot-links">{[["SOLUTIONS","services"],["FINISHES","materials"],["INSPIRATION","portfolio"],["PROCESS","method"],["PROJECT BRIEF","inquiry"]].map(([n,id])=><a href={"#"+id} key={id}>{n}</a>)}</nav><div className="foot-proof"><span>CONCEPT 05 / 20-INDUSTRY LIBRARY</span><span>WEBSITE LAUNCH ENGINE</span><span>NONPRODUCTION PREVIEW</span></div></div><div className="shell foot-bottom"><span>© 2026 DESIGN DEMONSTRATION. NOT A REAL FLOORING COMPANY.</span><a href="#top">BACK TO TOP ↗</a></div></footer>
    <button className="studio-tab" type="button" aria-controls="studioPanel" aria-expanded={studioOpen} onClick={()=>setStudioOpen(true)}>✦<span> BRAND STUDIO</span></button>
    {studioOpen&&<button type="button" className="studio-backdrop" aria-label="Close studio" onClick={closeStudio}/>}
    <aside ref={panelRef} id="studioPanel" className={"studio-panel"+(studioOpen?" open":"")} role="dialog" aria-modal="true" aria-labelledby="studioTitle" aria-hidden={!studioOpen}>
      <div className="panel-top"><span className="panel-eyebrow">THE APEX TEMPLATE ENGINE / V0.1</span><button type="button" className="icon-close" onClick={closeStudio} aria-label="Close design studio">×</button><h2 id="studioTitle">MAKE IT <em>YOURS.</em></h2><p>Four interchangeable generators. Approved layout and responsive logic remain unchanged.</p></div>
      <div className="panel-scroll">
        <div className="control-group"><span className="control-count">01 / BRAND GENERATOR</span><label htmlFor="brandName">BRAND WORDMARK</label><input ref={brandRef} id="brandName" value={state.brand} maxLength={24} onChange={e=>patch("brand",sanitizeBrand(e.target.value))}/><small>Preview only. Trademark and business claims require approval.</small></div>
        <div className="control-group"><span className="control-count">02 / ACCENT REGENERATOR</span><span className="control-label">ACCENT SYSTEM</span><div className="accent-row" role="group" aria-label="Accent color">{ACCENTS.map(c=><button key={c.id} type="button" style={{"--swatch":c.color} as CSSProperties} aria-pressed={state.accent===c.id} aria-label={c.label} title={c.label} onClick={()=>patch("accent",c.id)}/>)}</div><div className="control-note">{acc.label} / Contrast-aware CTA palette</div></div>
        <div className="control-group"><span className="control-count">03 / CONTENT GENERATOR</span><label htmlFor="copyPreset">POSITIONING VARIANT</label><select id="copyPreset" value={state.copy} onChange={e=>patch("copy",e.target.value as CopyPreset)}>{(Object.keys(COPY) as CopyPreset[]).map(k=><option key={k} value={k}>{COPY[k].title}</option>)}</select><small>Preset copy only. No unverified AI business claims.</small></div>
        <div className="control-group"><span className="control-count">04 / IMAGE DIRECTION</span><label htmlFor="imagePreset">CAMPAIGN ART DIRECTION</label><select id="imagePreset" value={state.image} onChange={e=>patch("image",e.target.value as ImageDirection)}>{(Object.keys(IMAGES) as ImageDirection[]).map(k=><option key={k} value={k}>{IMAGES[k].label}</option>)}</select><small>Image references are illustrative. Generate and approve original photography before client usage.</small></div>
        <div className="control-group"><span className="control-count">APPROVED MANIFEST</span><div className="manifest-display"><span>BRAND <b>{APPROVAL_LOCK.brandPack}</b></span><span>DESIGN <b>{APPROVAL_LOCK.websiteDesign}</b></span><span>WORKFLOW <b>{APPROVAL_LOCK.workflow}</b></span><span>CONCEPT <b>{APPROVAL_LOCK.concept}</b></span></div>
          <button className="button button-dark export" type="button" onClick={()=>saveJson("prime-surfaces-05-draft.json",makeDraftManifest(state))}>EXPORT DRAFT JSON ↗</button>
          <button className="button button-dark export" type="button" onClick={()=>saveJson("prime-surfaces-05-image-brief.json",makeImageBrief(state))}>EXPORT IMAGE GENERATION BRIEF ↗</button>
          <button className="reset" type="button" onClick={()=>setState({...DEFAULT_STUDIO})}>RESET TO APPROVED DEFAULT</button>
        </div>
      </div>
      <div className="panel-foot">Browser-local controls. No generator, CRM or website deployment requests are sent.</div>
    </aside>
  </div>;
}
