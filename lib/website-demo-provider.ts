import type { Provider } from "@/types";

const cover = "/images/demo/servibombas/cover.webp";
const avatar = "/images/demo/servibombas/avatar.jpg";
const photos = [
  "/images/demo/servibombas/work-maintenance.webp",
  "/images/demo/servibombas/work-installation.webp",
  "/images/demo/servibombas/work-motor.webp",
  "/images/demo/servibombas/work-parts.webp",
];

export function websiteDemoProvider(templateId: Provider["site"]["templateId"], accentColor: string, sparse: boolean): Provider {
  const intro = "Servicio especializado en mantenimiento, instalación y reparación de bombas de agua y motores. Atención preventiva y correctiva para mantener tus equipos funcionando y evitar contratiempos.";
  return {
    id: "demostracion", slug: "demostracion", name: "Servi-Bombas Tepic", profession: "Mantenimiento de Bombas Eléctricas", bio: intro,
    zone: "", areas: [], rating: 0, reviewCount: 0, plan: "free", status: "active", phone: "3113928492",
    showPhoneCall: true, isDemo: true, canContact: false, avatarImage: sparse ? undefined : avatar, updatedAt: "2026-09-28",
    services: [
      { id: "mantenimiento", slug: "mantenimiento", name: "Mantenimiento de bombas y motores", category: "Servicio técnico", description: "Mantenimiento preventivo para conservar bombas y motores en buenas condiciones, prevenir fallas y prolongar su vida útil." },
      { id: "instalacion", slug: "instalacion", name: "Instalación de bombas", category: "Servicio técnico", description: "Instalación de bombas de agua de acuerdo con las necesidades del equipo y el lugar donde será utilizado." },
      { id: "reparacion", slug: "reparacion", name: "Reparación de bombas y motores", category: "Servicio técnico", description: "Diagnóstico y reparación de fallas en bombas de agua y motores para recuperar su correcto funcionamiento." },
      { id: "refacciones", slug: "refacciones", name: "Refacciones para bombas", category: "Servicio técnico", description: "Suministro de refacciones para mantenimiento y reparación de bombas de agua." },
      { id: "venta", slug: "venta", name: "Venta de bombas", category: "Servicio técnico", description: "Venta de bombas de agua para distintas necesidades y aplicaciones residenciales, comerciales e industriales." },
    ],
    portfolio: sparse ? [] : [
      { id: "trabajo-1", title: "Mantenimiento preventivo y diagnóstico", description: "Mantenimiento preventivo y diagnóstico técnico de bomba centrífuga.", image: photos[0] },
      { id: "trabajo-2", title: "Instalación de sistema hidroneumático", description: "Instalación residencial con tubería y tanque presurizador.", image: photos[1] },
      { id: "trabajo-3", title: "Reparación y embobinado de motor", description: "Reparación de motor eléctrico y embobinado de cobre.", image: photos[2] },
      { id: "trabajo-4", title: "Refacciones originales y sellos", description: "Refacciones y componentes para bombas.", image: photos[3] },
    ],
    verifications: [{ type: "phone" }], reviews: [], faqs: [],
    site: {
      templateId, headline: "Mantenimiento de Bombas Eléctricas", intro, coverImage: sparse ? undefined : cover,
      theme: "tequit", accentColor, whiteLabel: false,
      socialLinks: {
        facebook: "https://facebook.com/ejemplo-servibombas",
        tiktok: "https://tiktok.com/@ejemplo-servibombas",
        instagram: "https://instagram.com/ejemplo-servibombas",
        website: "https://example.com/servibombas",
      },
      details: {
        contactName: "Daniel Santana", contactRole: "Técnico Especialista",
        notice: "No esperes a que tu bomba falle. Evita contratiempos y programa con anticipación el mantenimiento de tu bomba o motor.",
        servicesIntro: "Soluciones precisas de electro-mecánica hidráulica para hogar, comercio y agroindustria.",
        workIntro: "Imágenes ilustrativas de cómo pueden mostrarse los trabajos del prestador.",
        contactTitle: "¿Necesitas mantenimiento, reparación o instalación de bombas?",
        contactIntro: "Atención técnica inmediata en Tepic y alrededores. Atendemos reportes de emergencia y programaciones preventivas.",
        address: "Amalfi #249, Tepic, Nayarit", hours: "Lunes a Sábado · 8:00 AM - 7:00 PM",
      },
    },
    seo: { eligible: false, checks: { bio: true, phone: true, service: true, portfolio: !sparse }, missing: [] },
  };
}
