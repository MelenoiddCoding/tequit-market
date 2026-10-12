import { expect, it } from "vitest";
import { allowedDuringPasswordChange } from "@/lib/supabase/proxy";

it("permite cambiar la contraseña temporal y cerrar sesión sin abrir el resto de la API", () => {
  expect(allowedDuringPasswordChange("/cuenta")).toBe(true);
  expect(allowedDuringPasswordChange("/api/auth/change-password")).toBe(true);
  expect(allowedDuringPasswordChange("/api/auth/logout")).toBe(true);
  expect(allowedDuringPasswordChange("/admin")).toBe(false);
  expect(allowedDuringPasswordChange("/api/admin/actions")).toBe(false);
  expect(allowedDuringPasswordChange("/api/auth/login")).toBe(false);
});
