import { beforeEach, afterEach, expect, it, vi } from "vitest";
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
  vi.stubGlobal("window", {
    location: {
      href: "https://tequit.mx/buscar?q=plomero&utm_source=facebook",
    },
  });
  vi.stubGlobal("document", { referrer: "" });
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => {} });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("deduplica renders y atribuye el clic sin esperar la red", async () => {
  const { trackEvent } = await import("@/lib/traffic-client");
  trackEvent({ type: "directory_view", target: "/buscar" }, true);
  trackEvent({ type: "directory_view", target: "/buscar" }, true);
  window.location.href = "https://tequit.mx/u/juan";
  trackEvent({ type: "profile_view", target: "juan" }, true);
  window.location.href = "https://tequit.mx/p/juan";
  trackEvent({ type: "website_view", target: "juan" }, true);
  trackEvent({
    type: "whatsapp_click",
    target: "juan",
    targetType: "provider",
  });
  trackEvent({
    type: "whatsapp_click",
    target: "juan",
    targetType: "provider",
  });
  expect(fetch).toHaveBeenCalledTimes(4);
  const calls = vi.mocked(fetch).mock.calls;
  const payload = JSON.parse(calls.at(-1)![1]!.body as string);
  expect(payload.attribution).toMatchObject({
    source: "facebook",
    surface: "website",
    entrySurface: "directory",
    previousSurface: "profile",
  });
  expect(payload.eventId).toBeTruthy();
});
it("funciona con almacenamiento bloqueado y fallo de red", async () => {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  });
  vi.mocked(fetch).mockRejectedValue(new Error("offline"));
  const { trackEvent } = await import("@/lib/traffic-client");
  expect(() =>
    trackEvent({
      type: "whatsapp_click",
      target: "juan",
      targetType: "provider",
    }),
  ).not.toThrow();
  await Promise.resolve();
  await Promise.resolve();
});
it("excluye las vistas previas administrativas", async () => {
  window.location.href = "https://tequit.mx/admin/sitios/123";
  const { trackEvent } = await import("@/lib/traffic-client");
  trackEvent({ type: "website_view", target: "juan" }, true);
  expect(fetch).not.toHaveBeenCalled();
});
