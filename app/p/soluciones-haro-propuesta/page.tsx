import type { Metadata } from "next";
import { ProviderSiteProposal } from "@/components/provider-site-proposal";
import type { Provider } from "@/types";

const title = "Soluciones Haro · Propuesta de sitio profesional";
const description = "Propuesta de experiencia móvil para un sitio de paneles solares, calentadores solares y soluciones eléctricas en Tepic.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  alternates: { canonical: "https://tequit.mx/p/soluciones-haro-propuesta" },
  openGraph: {
    title,
    description,
    url: "https://tequit.mx/p/soluciones-haro-propuesta",
    siteName: "Tequit",
    locale: "es_MX",
    type: "website",
  },
};

const mediaBase = "https://vgszdeymfipvuiziklpq.supabase.co/storage/v1/object/public";

const proposal: Provider = {
  id: "soluciones-haro-proposal",
  slug: "soluciones-haro-propuesta",
  name: "Soluciones Haro",
  profession: "Instalador de energía solar",
  bio: "Paneles solares, aire acondicionado, calentadores solares, domótica y soluciones eléctricas para hogar y negocio. Cada proyecto se dimensiona de acuerdo con el consumo, el espacio y las necesidades del cliente.",
  zone: "Tepic, Nayarit",
  areas: [],
  rating: 0,
  reviewCount: 0,
  plan: "pro",
  status: "active",
  phone: "",
  showPhoneCall: false,
  isDemo: true,
  canContact: false,
  updatedAt: "2026-10-10T00:00:00.000Z",
  avatarImage: `${mediaBase}/avatars/786718a1-a89e-45d0-aa73-bc306736a511/0a830c57-47ec-46a2-92a6-2ac47a03b076.webp`,
  services: [
    ["electricidad", "Servicios eléctricos en general", "Trabajos de instalación, adecuación, reparación y mantenimiento de sistemas eléctricos para diferentes necesidades."],
    ["paneles-solares", "Suministro e instalación de paneles solares", "Diseño, suministro e instalación de sistemas de paneles solares de acuerdo con el consumo y las necesidades de cada cliente."],
    ["calentadores-solares", "Venta e instalación de calentadores solares", "Suministro e instalación de calentadores solares para aprovechar la energía solar y contar con agua caliente en el hogar o negocio."],
    ["aires-acondicionados", "Venta e instalación de aires acondicionados", "Venta e instalación de equipos de aire acondicionado para hogares, oficinas y negocios, considerando las necesidades del espacio."],
    ["domotica", "Servicios integrales de domótica", "Instalación e integración de soluciones de automatización para controlar y modernizar diferentes sistemas del hogar o negocio."],
  ].map(([id, name, serviceDescription]) => ({ id, slug: id, name, description: serviceDescription, category: "Energía y electricidad" })),
  portfolio: [
    ["residencial", "Instalación residencial de paneles solares", "Sistema fotovoltaico instalado en vivienda para aprovechar la energía solar y reducir el consumo de la red eléctrica.", "e79716fd-e246-4ea2-a6db-0d98f6b2e34a.webp"],
    ["habitacional", "Sistema solar en conjunto habitacional", "Instalación de paneles solares en vivienda dentro de zona residencial, adaptada al espacio disponible en azotea.", "84b08357-2d58-42f1-98bf-5dcca98c69bf.webp"],
    ["capacidad", "Proyecto solar de gran capacidad", "Instalación de múltiples paneles solares en un inmueble de mayor tamaño para cubrir una demanda energética más alta.", "9eb90d88-abff-4a18-9001-c0bf6dec98d9.webp"],
    ["estructura", "Montaje y adecuación de estructura", "Trabajo documentado durante la preparación de una instalación de energía solar.", "683afb49-44f0-452f-9096-869a8b106f51.webp"],
    ["compacto", "Sistema solar residencial compacto", "Instalación de paneles solares para vivienda con un sistema dimensionado para necesidades de consumo doméstico.", "02097457-c79d-4dcf-8e7f-49bc46abc1a8.webp"],
  ].map(([id, workTitle, workDescription, file]) => ({ id, title: workTitle, description: workDescription, image: `${mediaBase}/provider-work/786718a1-a89e-45d0-aa73-bc306736a511/${file}` })),
  verifications: [],
  reviews: [],
  faqs: [],
  site: {
    headline: "Paneles y calentadores solares en Tepic",
    intro: "Paneles solares, aire acondicionado, calentadores solares, domótica y soluciones eléctricas para hogar y negocio.",
    coverImage: `${mediaBase}/provider-work/786718a1-a89e-45d0-aa73-bc306736a511/81304ab1-4993-49a4-afda-cbf27d0038ca.webp`,
    theme: "oscuro",
    accentColor: "#b22a2b",
    whiteLabel: true,
    socialLinks: {},
  },
  seo: { eligible: false, checks: { bio: true, phone: false, service: true, portfolio: true }, missing: ["Propuesta no indexable."] },
};

export default function SolucionesCaroProposalPage() {
  return <ProviderSiteProposal provider={proposal} />;
}
