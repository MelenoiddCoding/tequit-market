import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import type { Provider } from "@/types";

vi.mock("@/components/view-tracker", () => ({ ViewTracker: () => null }));
vi.mock("@/components/provider-share-tools", () => ({ ProviderShareTools: ({ siteHref }: { siteHref?: string }) => <div><button>Compartir</button>{siteHref && <a href={siteHref}>Visitar su sitio web</a>}</div> }));
vi.mock("@/components/save-button", () => ({ SaveButton: () => <button>Guardar</button> }));
vi.mock("@/components/whatsapp-button", () => ({ WhatsAppButton: () => <button>WhatsApp</button> }));

import { ProviderProfile } from "@/components/profile-details";

const provider = {
  id: "haro",
  slug: "soluciones-haro",
  name: "Soluciones Haro",
  profession: "Energía solar",
  bio: "Instalación de paneles y calentadores solares.",
  zone: "Tepic, Nayarit",
  areas: ["Tepic", "Tepic, Nayarit"],
  rating: 0,
  reviewCount: 0,
  plan: "free",
  status: "active",
  services: [{ id: "solar", slug: "solar", name: "Instalación de paneles solares", category: "Energía", description: "Diseño e instalación para viviendas." }],
  verifications: [],
  reviews: [],
  phone: "3111234567",
  portfolio: [],
  avatarImage: "https://example.com/logo-haro.png",
  updatedAt: "2026-10-11",
  site: { headline: "", intro: "", theme: "tequit", accentColor: "#254432", whiteLabel: false, socialLinks: {} },
  faqs: [],
  seo: { eligible: false, checks: { bio: false, phone: true, service: true, portfolio: false }, missing: [] },
} as Provider;

it("muestra la identidad real sin secciones ni métricas vacías", () => {
  const html = renderToStaticMarkup(<ProviderProfile provider={provider} />);
  expect(html).toContain("logo-haro.png");
  expect(html).toContain("Energía solar en Tepic");
  expect(html).toContain("Diseño e instalación para viviendas.");
  expect(html).not.toContain("0 verificaciones");
  expect(html).not.toContain("0.0");
  expect(html).not.toContain("Trabajos realizados");
  expect(html).not.toContain("Experiencias aprobadas");
  expect(html.match(/Tepic, Nayarit/g)).toHaveLength(2);
  expect(html).not.toContain("Visitar su sitio web");
});

it("conserva confianza y trabajos cuando existen", () => {
  const complete = {
    ...provider,
    rating: 5,
    reviewCount: 1,
    verifications: [{ type: "phone" as const }],
    reviews: [{ id: "r1", author: "Ana", rating: 5, comment: "Buen trabajo", date: "2026-10-01", status: "approved" as const, source: "invited_customer" as const }],
    portfolio: [{ id: "w1", title: "Instalación solar", description: "Casa en Tepic", image: "https://example.com/trabajo.png" }],
  };
  const html = renderToStaticMarkup(<ProviderProfile provider={complete} siteActive />);
  expect(html).toContain("Trabajos realizados");
  expect(html).toContain("Verificaciones");
  expect(html).toContain("Buen trabajo");
  expect(html).toContain("Visitar su sitio web");
});

it("contextualiza la solicitud dirigida al servicio y ciudad del prestador", () => {
  const html = renderToStaticMarkup(<ProviderProfile provider={provider} directedRequests />);
  expect(html).toContain("Ej. Instalación de paneles solares");
  expect(html).toContain("Zona en Tepic");
  expect(html).not.toContain("Plomero para una tubería rota");
});
