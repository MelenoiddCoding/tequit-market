export const WEBSITE_OFFER = {
  initialPrice: 699,
  renewalPrice: 499,
  months: 12,
  services: 5,
  photos: 5,
  faqs: 3,
  corrections: 1,
  proMonths: 3,
} as const;

export const PREVIOUS_WEBSITE_TEMPLATES = [
  { id: "esencial", name: "Esencial", description: "Una página breve: presentación, servicios, fotografías y WhatsApp. Inspirada en una ficha de negocio.", accent: "#0f2942" },
  { id: "tecnico", name: "Servicio técnico", description: "Servicios claros, cobertura y contacto. Para plomería, electricidad y refrigeración.", accent: "#214C70" },
  { id: "oficio", name: "Taller y oficio", description: "Fotografías amplias y detalles del trabajo. Para carpintería, herrería y tapicería.", accent: "#794631" },
  { id: "hogar", name: "Casa y mantenimiento", description: "Una presentación abierta y cercana. Para limpieza, pintura y jardinería.", accent: "#254432" },
] as const;
export const WEBSITE_TEMPLATES = [
  {id:"base",name:"Base",description:"La composición original: presentación, servicios, trabajos y contacto.",accent:"#0f2942",design:"base",demo:"servibombas",fonts:"Space+Grotesk:wght@600;700&family=Hanken+Grotesk:wght@400;500;600"},
  {id:"industrial",name:"Industrial",description:"Títulos contundentes, filas numeradas y bordes rectos.",accent:"#a43913",design:"industrial",demo:"servibombas-industrial",fonts:"Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700"},
  {id:"editorial",name:"Editorial",description:"Títulos serif, espacio abierto y fotografías verticales.",accent:"#714337",design:"editorial",demo:"servibombas-editorial",fonts:"DM+Sans:wght@400;500;600;700&family=DM+Serif+Display"},
  {id:"clasico",name:"Clásico",description:"Papel cálido, presentación centrada y detalles tradicionales.",accent:"#9b3f25",design:"taller",demo:"servibombas-taller",fonts:"Libre+Franklin:wght@400;500;600;700&family=Bitter:wght@500;600;700"},
  {id:"tecnica",name:"Técnico",description:"Retícula, numeración y líneas precisas.",accent:"#1858ad",design:"tecnico",demo:"servibombas-tecnico",fonts:"IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600"},
  {id:"cercano",name:"Cercano",description:"Identidad centrada y formas suaves.",accent:"#174d46",design:"cercano",demo:"servibombas-cercano",fonts:"Nunito+Sans:wght@400;500;600;700;800&family=Nunito:wght@600;700;800"},
  {id:"profesional",name:"Profesional",description:"Grafito, acentos rojos y servicios en un catálogo compacto.",accent:"#ad2728",design:"mecanico",demo:"servibombas-mecanico",fonts:"Oswald:wght@500;600;700&family=Roboto:wght@400;500;700"},
  {id:"clean",name:"Clean",description:"Blanco, espacio y lectura tranquila.",accent:"#44685c",design:"clean",demo:"servibombas-clean",fonts:"Manrope:wght@400;500;600;700&family=Outfit:wght@400;500;600"},
  {id:"urbano",name:"Urbano",description:"Bordes negros, bloques sólidos y tipografía grande.",accent:"#4a29c7",design:"brutalista",demo:"servibombas-brutalista",fonts:"Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700"},
  {id:"digital",name:"Digital",description:"Superficies oscuras y acentos fríos discretos.",accent:"#83d8de",design:"tecnologia",demo:"servibombas-tecnologia",fonts:"Sora:wght@400;500;600;700&family=Inter:wght@400;500;600"},
  {id:"catalogo",name:"Catálogo",description:"Servicios en fichas y fotografías amplias.",accent:"#126485",design:"marketplace",demo:"servibombas-marketplace",fonts:"Plus+Jakarta+Sans:wght@400;500;600;700;800"},
] as const;
export const WEBSITE_TEMPLATE_IDS = ["legacy", ...PREVIOUS_WEBSITE_TEMPLATES.map(t=>t.id), ...WEBSITE_TEMPLATES.map(t=>t.id)] as const;
export type WebsiteTemplateId = typeof WEBSITE_TEMPLATE_IDS[number];
export function websiteTemplate(id?: WebsiteTemplateId) {
  return [...WEBSITE_TEMPLATES,...PREVIOUS_WEBSITE_TEMPLATES].find(template => template.id === id);
}
