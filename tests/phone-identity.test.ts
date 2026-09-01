import fs from "node:fs";
import path from "node:path";
import {describe,expect,it} from "vitest";
import {displayMexicanPhone,normalizeMexicanPhone} from "@/lib/phone";

const sql=fs.readFileSync(path.join(process.cwd(),"supabase/migrations/202609010001_phone_identity.sql"),"utf8");
describe("identidad telefónica",()=>{
  it("normaliza formatos mexicanos sin conservar el prefijo 521 antiguo",()=>{expect(normalizeMexicanPhone("311 123 4567")).toBe("+523111234567");expect(normalizeMexicanPhone("+52 311 123 4567")).toBe("+523111234567");expect(normalizeMexicanPhone("+5213111234567")).toBe("+523111234567");expect(normalizeMexicanPhone("123")).toBeNull()});
  it("presenta el número sin exponer formatos internos",()=>expect(displayMexicanPhone("+523111234567")).toBe("311 123 4567"));
  it("separa acceso habilitado de teléfono verificado",()=>{expect(sql).toContain("phone_login_enabled_at");expect(sql).toContain("phone_verified_at");expect(sql).toContain("phone_verification_method");expect(sql).toContain("Password-only beta signup does not verify ownership")});
  it("impide que el cliente se autoasigne una verificación",()=>{expect(sql).toContain("revoke update on table public.profiles from authenticated");expect(sql).toContain("revoke all on function public.mark_phone_otp_verified")});
  it("exige coincidencia completa al reclamar un perfil",()=>expect(sql).toContain("public.normalize_mexican_phone(entity_phone)<>account_phone"));
});
