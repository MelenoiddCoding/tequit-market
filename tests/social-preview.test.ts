import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/marketplace", () => ({ getProviderBySlug: vi.fn(), getBusinessBySlug: vi.fn() }));
import { renderSocialPreview, socialImageUrl, socialImageVersion, socialPreviewAlt } from "@/lib/social-preview";
import { GET } from "@/app/api/share-image/[kind]/[slug]/route";

describe("miniaturas sociales", () => {
  it("versiona la imagen cuando cambia la identidad o la fotografía", () => {
    const first = socialImageVersion("Ana", "Electricista", "cover-1.webp");
    const second = socialImageVersion("Ana", "Electricista", "cover-2.webp");
    expect(first).not.toBe(second);
    expect(socialImageUrl("site", "ana", first)).toContain(`/api/share-image/site/ana?v=${first}`);
    expect(socialPreviewAlt("Ana", "Electricista")).toBe("Ana · Electricista");
  });

  it("genera imágenes diferentes para dos temas de Servi-Bombas", async () => {
    const base = await GET(new Request("https://tequit.mx/api/share-image/demo/base"), { params: Promise.resolve({ kind: "demo", slug: "base" }) });
    const industrial = await GET(new Request("https://tequit.mx/api/share-image/demo/industrial"), { params: Promise.resolve({ kind: "demo", slug: "industrial" }) });
    expect(base.status).toBe(200);
    expect(base.headers.get("content-type")).toContain("image/png");
    expect(Buffer.compare(Buffer.from(await base.arrayBuffer()), Buffer.from(await industrial.arrayBuffer()))).not.toBe(0);
  });

  it("rechaza temas desconocidos", async () => {
    const response = await GET(new Request("https://tequit.mx/api/share-image/demo/desconocido"), { params: Promise.resolve({ kind: "demo", slug: "desconocido" }) });
    expect(response.status).toBe(404);
  });

  it("genera una tarjeta limpia para nombres largos sin fotografías", async () => {
    const response = await renderSocialPreview({ kind: "site", name: "Servicios Profesionales de Mantenimiento y Reparación de Equipos de Bombeo", category: "Mantenimiento de bombas eléctricas" });
    expect(response.status).toBe(200);
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(1_000);
  });
});
