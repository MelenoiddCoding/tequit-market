import type { Business, Provider, Review, Service } from "@/types";

const service = (id: string, name: string, category: string, aliases: string[] = []): Service => ({ id, slug: id, name, category, aliases });
export const services = {
  albanileria: service("albanileria", "Albañilería", "Construcción", ["albañil", "mampostería"]),
  piso: service("pegado-de-piso", "Pegado de piso", "Construcción", ["poner piso", "pegar piso", "pisos"]),
  enjarre: service("enjarre", "Enjarre", "Construcción"),
  muros: service("construccion-de-muros", "Construcción de muros", "Construcción"),
  banquetas: service("banquetas", "Banquetas", "Construcción"),
  impermeabilizacion: service("impermeabilizacion", "Impermeabilización", "Construcción"),
  concreto: service("concreto-estampado", "Concreto estampado", "Construcción", ["cochera estampada"]),
  plomeria: service("plomeria", "Plomería", "Plomería", ["plomero", "fontanero", "fontanería", "fugas"]),
  electricidad: service("electricidad", "Electricidad", "Electricidad", ["electricista", "contactos", "centro de carga"]),
  lavadoras: service("reparacion-de-lavadoras", "Reparación de lavadoras", "Electrodomésticos", ["lavadora descompuesta"]),
  minisplit: service("minisplits", "Minisplits", "Climatización", ["clima", "aire acondicionado"]),
  pintura: service("pintura", "Pintura", "Construcción", ["pintar casa", "pintor"]),
  carpinteria: service("carpinteria", "Carpintería", "Hogar", ["carpintero"]),
  soldadura: service("soldadura", "Soldadura", "Hogar", ["soldador"]),
  jardineria: service("jardineria", "Jardinería", "Hogar", ["jardinero"]),
  limpieza: service("limpieza", "Limpieza", "Hogar"),
  flores: service("arreglos-florales", "Arreglos florales", "Eventos", ["flores", "ramo"]),
  bodas: service("decoracion-de-bodas", "Decoración de bodas", "Eventos", ["boda", "decorar boda"]),
  eventos: service("decoracion-de-eventos", "Decoración de eventos", "Eventos", ["xv años", "fiesta"]),
};

const reviews: Review[] = [
  { id: "r1", author: "María G.", rating: 5, comment: "Trabajó muy limpio y explicó cada paso. El piso quedó excelente.", date: "2026-08-04", status: "approved", source: "tequit_lead" },
  { id: "r2", author: "Carlos R.", rating: 5, comment: "Puntual, claro con los materiales y muy cuidadoso.", date: "2026-07-18", status: "approved", source: "invited_customer" },
  { id: "r3", author: "Ana L.", rating: 4, comment: "Buen trabajo y comunicación rápida por WhatsApp.", date: "2026-06-29", status: "approved", source: "tequit_lead" },
  { id: "r4", author: "Demo pendiente", rating: 1, comment: "Esta reseña no debe mostrarse.", date: "2026-08-20", status: "pending", source: "invited_customer" },
];

const base = (id: string, name: string, profession: string, zone: string, offered: Service[], rating: number): Provider => ({
  id, slug: id, name, profession, zone, services: offered, rating, reviewCount: Math.max(4, Math.round(rating * 4)),
  bio: `Trabajo en ${profession.toLowerCase()} con atención directa, presupuesto claro y experiencia en hogares de Tepic.`,
  areas: [profession, offered[0]?.category ?? "Hogar"], plan: "free", status: "active", phone: "5213110000000",
  verifications: [{ type: "phone" }, { type: "identity" }], reviews: reviews.slice(0, 2),
  portfolio: [{ id: `${id}-w1`, title: `Trabajo de ${offered[0]?.name}`, description: "Proyecto terminado en Tepic con materiales acordados con el cliente.", image: "/images/tequit-hero.png" }],
  updatedAt: "2026-08-29T00:00:00.000Z", faqs: [],
  site: { headline: `${profession} en ${zone}`, intro: `Trabajo en ${profession.toLowerCase()} con atención directa, presupuesto claro y experiencia en hogares de Tepic.`, theme: "tequit", accentColor: "#254432", whiteLabel: false, socialLinks: {} },
  seo: { eligible: false, missing: ["Completa la presentación del sitio"], checks: { bio: false, phone: true, service: false, portfolio: true } },
});

export const providers: Provider[] = [
  { ...base("juan-perez", "Juan Pérez", "Albañil", "Tepic y Xalisco", [services.piso, services.enjarre, services.muros, services.banquetas, services.impermeabilizacion], 4.8),
    areas: ["Albañilería", "Construcción", "Pisos", "Acabados"], plan: "free", featured: true, reviews,
    bio: "Soy albañil con 14 años de experiencia. Me especializo en acabados limpios, pisos, muros y trabajos residenciales.",
    verifications: [{ type: "phone" }, { type: "identity" }, { type: "visited_by_tequit", date: "2026-08-12" }],
    businessSlug: "concretos-estampados-de-nayarit", businessName: "Concretos Estampados de Nayarit" },
  base("miguel-ibarra", "Miguel Ibarra", "Plomero", "Centro y Morelos", [services.plomeria], 4.9),
  base("sofia-ramirez", "Sofía Ramírez", "Electricista", "Tepic", [services.electricidad], 4.9),
  base("raul-castaneda", "Raúl Castañeda", "Técnico en electrodomésticos", "Tepic y Bellavista", [services.lavadoras], 4.7),
  base("gabriela-ortiz", "Gabriela Ortiz", "Pintora", "Ciudad del Valle", [services.pintura, services.impermeabilizacion], 4.8),
  base("oscar-medina", "Óscar Medina", "Técnico en climatización", "Tepic y Xalisco", [services.minisplit], 4.9),
  base("luis-aranza", "Luis Aranza", "Carpintero", "Las Aves", [services.carpinteria], 4.6),
  base("mario-galvan", "Mario Galván", "Soldador", "Ciudad Industrial", [services.soldadura], 4.7),
  base("elena-vega", "Elena Vega", "Jardinera", "Tepic", [services.jardineria], 4.9),
  base("rosa-nava", "Rosa Nava", "Especialista en limpieza", "Tepic", [services.limpieza], 4.8),
  base("hector-ruiz", "Héctor Ruiz", "Albañil", "Vistas de la Cantera", [services.albanileria, services.muros], 4.5),
  { ...base("andrea-flores", "Andrea Flores", "Decoradora", "Tepic", [services.bodas, services.eventos], 4.9), plan: "pro" },
];

const businessReviews = reviews.slice(0, 3);
export const businesses: Business[] = [
  { id: "b1", slug: "concretos-estampados-de-nayarit", name: "Concretos Estampados de Nayarit", category: "Construcción", zone: "Ciudad Industrial", address: "Zona Ciudad Industrial, Tepic (dirección demo)", rating: 4.9, reviewCount: 31, status: "active", phone: "5213110000000", featured: true,
    description: "Materiales y aplicación profesional para pisos, patios y cocheras de concreto estampado.", services: [services.concreto, service("sellado-de-concreto", "Sellado de concreto", "Construcción"), service("renovacion-de-concreto", "Renovación", "Construcción"), services.piso],
    products: ["Sellador para concreto", "Pigmento", "Endurecedor", "Moldes"].map((name, i) => ({ id: `cp${i}`, name, description: "Disponible para cotización y entrega local." })), verifications: [{ type: "phone" }, { type: "identity" }, { type: "visited_by_tequit", date: "2026-08-10" }], reviews: businessReviews, providerSlugs: ["juan-perez"] },
  { id: "b2", slug: "floreria-rosario", name: "Florería Rosario", category: "Eventos", zone: "Centro", address: "Centro de Tepic (dirección demo)", rating: 4.9, reviewCount: 42, status: "active", phone: "5213110000000", featured: true,
    description: "Flores y decoración para momentos importantes, con diseño personalizado en Tepic.", services: [services.bodas, service("decoracion-xv-anos", "Decoración de XV años", "Eventos"), services.eventos], products: ["Ramo clásico", "Ramo premium", "Caja de rosas", "Arreglo de cumpleaños"].map((name, i) => ({ id: `fp${i}`, name, description: "Diseño floral preparado por encargo." })), verifications: [{ type: "phone" }, { type: "references" }], reviews: businessReviews, providerSlugs: ["andrea-flores"] },
  { id: "b3", slug: "ferreteria-la-loma", name: "Ferretería La Loma", category: "Hogar", zone: "La Loma", address: "Zona La Loma, Tepic (dirección demo)", rating: 4.7, reviewCount: 18, status: "active", phone: "5213110000000", description: "Herramientas y materiales con orientación para reparaciones del hogar.", services: [], products: ["Herramientas", "Impermeabilizante", "Material eléctrico"].map((name, i) => ({ id: `hp${i}`, name, description: "Pregunta existencias por WhatsApp." })), verifications: [{ type: "phone" }], reviews: businessReviews, providerSlugs: [] },
  { id: "b4", slug: "climas-del-valle", name: "Climas del Valle", category: "Climatización", zone: "Ciudad del Valle", address: "Ciudad del Valle, Tepic (dirección demo)", rating: 4.8, reviewCount: 24, status: "active", phone: "5213110000000", description: "Venta, instalación y mantenimiento de aire acondicionado.", services: [services.minisplit], products: [{ id: "ac1", name: "Minisplit inverter", description: "Modelos para espacios residenciales." }], verifications: [{ type: "phone" }, { type: "identity" }], reviews: businessReviews, providerSlugs: ["oscar-medina"] },
];

export const categories = [
  { name: "Albañilería", slug: "albanileria", icon: "BrickWall" }, { name: "Plomería", slug: "plomeria", icon: "Droplets" },
  { name: "Electricidad", slug: "electricidad", icon: "Zap" }, { name: "Pisos", slug: "pegado-de-piso", icon: "Grid2X2" },
  { name: "Electrodomésticos", slug: "reparacion-de-lavadoras", icon: "WashingMachine" }, { name: "Pintura", slug: "pintura", icon: "PaintRoller" },
  { name: "Minisplits", slug: "minisplits", icon: "Snowflake" }, { name: "Limpieza", slug: "limpieza", icon: "Sparkles" },
];
