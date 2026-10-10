import { describe, it, expect } from "vitest";
import {
  advanceJourney,
  detectSource,
  facebookShareUrl,
  JOURNEY_TTL,
} from "@/lib/traffic";
const base = "https://tequit.mx";
const url = (path: string) => new URL(path, base);
describe("atribución del recorrido", () => {
  it("mantiene Facebook desde búsqueda hasta perfil, sitio y contacto", () => {
    const entry = advanceJourney(
      null,
      url("/buscar?q=plomero&utm_source=facebook"),
      "",
      100,
      () => "journey",
    );
    const profile = advanceJourney(
      entry,
      url("/u/juan"),
      base + "/buscar",
      200,
      () => "new",
    );
    const site = advanceJourney(
      profile,
      url("/p/juan"),
      base + "/u/juan",
      300,
      () => "new",
    );
    const contact = advanceJourney(site, url("/p/juan"), "", 400, () => "new");
    expect(contact).toMatchObject({
      id: "journey",
      source: "facebook",
      entrySurface: "directory",
      surface: "website",
      previousSurface: "profile",
      tagged: true,
    });
    expect(JSON.stringify(contact)).not.toContain("plomero");
  });
  it("conserva Google y no sustituye el origen por navegación interna", () => {
    const entry = advanceJourney(
      null,
      url("/u/juan"),
      "https://www.google.com.mx/search?q=plomero",
      100,
      () => "google",
    );
    expect(
      advanceJourney(entry, url("/p/juan"), base + "/u/juan", 200, () => "new")
        .source,
    ).toBe("google");
    expect(
      detectSource(url("/"), "https://google.com.evil.test"),
    ).toMatchObject({ source: "other" });
  });
  it("reinicia tras inactividad y atribuye una nueva campaña externa", () => {
    const first = advanceJourney(
      null,
      url("/u/juan?utm_source=facebook"),
      "",
      100,
      () => "one",
    );
    expect(
      advanceJourney(first, url("/u/juan"), "", 100 + JOURNEY_TTL, () => "two"),
    ).toMatchObject({ id: "two", source: "direct_unknown" });
    expect(
      advanceJourney(
        first,
        url("/p/juan?utm_source=whatsapp"),
        "",
        200,
        () => "two",
      ),
    ).toMatchObject({ id: "two", source: "whatsapp" });
    expect(
      advanceJourney(
        first,
        url("/u/juan"),
        "https://google.com",
        200,
        () => "two",
      ),
    ).toMatchObject({ id: "two", source: "google" });
  });
  it("no inventa origen cuando no hay referencia", () => {
    expect(detectSource(url("/u/juan"), "")).toMatchObject({
      source: "direct_unknown",
      tagged: false,
    });
  });
  it("comparte filtros intactos sin heredar etiquetas antiguas", () => {
    const shared = new URL(
      facebookShareUrl(
        base +
          "/buscar?q=plomero&type=provider&verified=true&ref=qr&utm_source=google",
      ),
    );
    expect(shared.searchParams.get("q")).toBe("plomero");
    expect(shared.searchParams.get("verified")).toBe("true");
    expect(shared.searchParams.get("utm_source")).toBe("facebook");
    expect(shared.searchParams.has("ref")).toBe(false);
  });
});
