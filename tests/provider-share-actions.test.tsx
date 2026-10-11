import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ProviderShareTools } from "@/components/provider-share-tools";

it("ordena las cuatro acciones del perfil con iconos y un enlace real al sitio", () => {
  const html = renderToStaticMarkup(<ProviderShareTools
    slug="soluciones-haro"
    name="Soluciones Haro"
    surface="profile"
    compact
    siteHref="/p/soluciones-haro"
  />);
  const labels = ["Compartir imagen", "Copiar enlace", "Copiar enlace para Facebook", "Visitar sitio web"];
  const positions = labels.map((label) => html.indexOf(label));
  expect(positions.every((position) => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(html.match(/<svg /g)).toHaveLength(4);
  expect(html).toContain('href="/p/soluciones-haro"');
});

it("no ofrece visitar un sitio que no está publicado", () => {
  const html = renderToStaticMarkup(<ProviderShareTools
    slug="sin-sitio"
    name="Prestador"
    surface="profile"
    compact
  />);
  expect(html).not.toContain("Visitar sitio web");
});
