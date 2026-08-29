import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const sql=readFileSync("supabase/migrations/202608290001_account_modes.sql","utf8");

describe("modos de cuenta",()=>{
  it("mantiene Usuario para todas las cuentas",()=>{expect(sql).toContain("select id,'customer'::public.app_role from public.profiles");expect(sql).toContain("values(new.id,'customer')")});
  it("agrega Prestador sin reemplazar la cuenta",()=>{expect(sql).toContain("values(auth.uid(),'provider')");expect(sql).toContain("on conflict do nothing")});
  it("protege el onboarding con sesión",()=>{expect(sql).toContain("if auth.uid() is null then raise exception 'authentication required'")});
});
