/** Immutable design choices and typed, reversible local customization.
 * No remotely executable generator or customer-data API is connected.
 */
export const APPROVAL_LOCK = Object.freeze({
  brandPack: "B", websiteDesign: "2", workflow: "C", concept: "05",
  templateId: "prime-surfaces-05", version: "0.1.0-preview",
  scope: "nonproduction_design_only"
} as const);

export const ACCENTS = [
  { id: "red", label: "Signal Red", color: "#e73b30", action: "#b9231e", actionInk: "#ffffff" },
  { id: "gold", label: "Champagne Gold", color: "#bd945a", action: "#79541e", actionInk: "#ffffff" },
  { id: "blue", label: "Architectural Blue", color: "#377fbd", action: "#225983", actionInk: "#ffffff" },
  { id: "green", label: "Deep Emerald", color: "#268573", action: "#195f50", actionInk: "#ffffff" }
] as const;
export type AccentId = typeof ACCENTS[number]["id"];

export const COPY = {
  premium: {
    headingA: "THE SURFACE", headingB: "CHANGES", headingAccent: "EVERYTHING.",
    description: "Remarkable spaces begin beneath your feet. Explore distinctive floor coating and decorative concrete concepts for the places you care about.",
    title: "Premium residential"
  },
  commercial: {
    headingA: "PERFORMANCE", headingB: "STARTS", headingAccent: "BELOW.",
    description: "Explore commercial surface concepts shaped by site requirements, maintenance needs, operational schedules, and intended traffic.",
    title: "Commercial specialist"
  },
  design: {
    headingA: "MATERIALS", headingB: "MAKE THE", headingAccent: "STATEMENT.",
    description: "Give architecture a stronger foundation. Explore decorative concrete concepts centered on texture, reflection, depth, and restraint.",
    title: "Architectural design"
  }
} as const;
export type CopyPreset = keyof typeof COPY;

export const IMAGES = {
  garage: {
    label: "Garage / Automotive",
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=88",
    alt: "Illustrative high-end automotive design environment",
    prompt: "Wide cinematic editorial architectural photograph of a pristine premium garage with authentic coated concrete surface, grounded natural light, dark steel accents, no logos or people, horizontal 16:9 framing."
  },
  interior: {
    label: "Architectural / Interior",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=88",
    alt: "Illustrative modern architectural interior",
    prompt: "Luxury minimalist residential architecture emphasizing actual decorative concrete, tactile material detail, realistic surface microtexture and raking sunlight, no brands or people, 16:9 editorial framing."
  },
  workplace: {
    label: "Commercial / Workspace",
    url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=88",
    alt: "Illustrative contemporary commercial environment",
    prompt: "Realistic spacious commercial studio showing maintainable polished concrete, authentic joints and light reflection, professional architecture photography, no signage or people, 16:9."
  }
} as const;
export type ImageDirection = keyof typeof IMAGES;

export const FINISHES = {
  flake: { title: "ARCHITECTURAL FLAKE", subtitle: "Texture / movement / utility", question: "What slip-resistance, broadcast density, color blends and maintenance expectations apply?" },
  metallic: { title: "METALLIC EFFECT", subtitle: "Depth / reflection / statement", question: "What gloss, abrasion, color variation and substrate requirements apply?" },
  polished: { title: "POLISHED CONCRETE", subtitle: "Mineral / understated / architectural", question: "What slab, aggregate exposure, densifier, joint and maintenance requirements apply?" }
} as const;
export type FinishId = keyof typeof FINISHES;

export const SERVICES = [
  {id: "garage", number: "01 / RESIDENTIAL", titleLines: ["GARAGE FLOOR", "COATINGS."], teaser: "Refined finishes for hard-working spaces.", className: "service-one"},
  {id: "commercial",number: "02 / BUSINESS",titleLines: ["COMMERCIAL","FLOORING."],teaser: "Surface solutions informed by daily demands.", className:"service-two"},
  {id: "decorative", number: "03 / DESIGN",titleLines: ["DECORATIVE","CONCRETE."],teaser: "Material character for distinctive environments.",className:"service-three"}
] as const;
export const GALLERY = [
  {id:"performance",cat:"garage",name:"PERFORMANCE SPACES",label:"GARAGE DESIGN STUDY",src:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1450&q=84",alt:"Illustrative sports car environment with strong material contrast"},
  {id:"workplace",cat:"commercial",name:"COMMERCIAL",label:"WORKPLACE STUDY",src:"https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=82",alt:"Modern commercial environment, visual inspiration"},
  {id:"architecture",cat:"residential",name:"ARCHITECTURAL",label:"INTERIOR STUDY",src:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=82",alt:"Minimal contemporary interior, material inspiration"},
  {id:"showcase",cat:"garage",name:"SHOWCASE",label:"GARAGE STUDY",src:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=82",alt:"Illustrative premium automotive setting"},
  {id:"living",cat:"residential",name:"LIVING",label:"RESIDENTIAL STUDY",src:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=82",alt:"Premium residential interior materials"}
] as const;

export type StudioState = {
  brand: string;
  accent: AccentId;
  copy: CopyPreset;
  image: ImageDirection;
  finish: FinishId;
};
export const DEFAULT_STUDIO: StudioState = {
  brand:"PRIME", accent:"red", copy:"premium", image:"garage", finish:"flake"
};

export function sanitizeBrand(input: string): string {
  return input.replace(/[^a-zA-Z0-9 &.'-]/g, "").slice(0,24).trim().toUpperCase() || "PRIME";
}
export function makeDraftManifest(state: StudioState) {
  return {
    schema_version:"1.0.0",
    approval: APPROVAL_LOCK,
    customizations: { ...state, brand: sanitizeBrand(state.brand) },
    asset_provenance: "illustrative_third_party_references_unapproved",
    generation_mode: "deterministic_local_preview",
    production_approved: false,
    noindex_required: true
  } as const;
}
export function makeImageBrief(state: StudioState) {
  return {
    schema_version:"1.0.0",
    template_id:APPROVAL_LOCK.templateId,
    brand:sanitizeBrand(state.brand),
    direction:state.image,
    status:"DRAFT_PROMPTS_ONLY_NOT_RENDERED",
    required_realism:["authentic material texture","plausible concrete finish","realistic lighting","no invented completed projects","no branding"],
    shots:[
      {role:"hero",ratio:"16:9",prompt:IMAGES[state.image].prompt},
      {role:"service_garage",ratio:"4:5",prompt:"Authentic decorated concrete or epoxy garage flooring, close-up texture with realistic edges, no stock overlay."},
      {role:"service_commercial",ratio:"4:5",prompt:"Commercial flooring with plausible joints, preparation and wear characteristics, no fake staff or corporate logos."},
      {role:"service_decorative",ratio:"4:5",prompt:"Premium architectural interior with honest flooring material geometry and visually accurate scale."},
      {role:"social",ratio:"1:1",prompt:"Original marketing-safe concrete surface detail abstract composition, no claims, no logos."}
    ],
    provenance_requirements:["generation model","prompt hash","source license","approval identity","human review","actual installation distinction"]
  } as const;
}
