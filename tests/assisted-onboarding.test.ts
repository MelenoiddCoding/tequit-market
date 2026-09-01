import fs from "node:fs";
import path from "node:path";
import {describe,expect,it} from "vitest";

const sql=fs.readFileSync(path.join(process.cwd(),"supabase/migrations/202608310001_assisted_onboarding.sql"),"utf8");
const api=fs.readFileSync(path.join(process.cwd(),"app/api/admin/onboardings/route.ts"),"utf8");

describe("alta asistida",()=>{
  it("mantiene los borradores y tokens bajo control administrativo",()=>{expect(sql).toContain("alter table public.assisted_onboardings enable row level security");expect(sql).toContain('create policy "admin manages assisted onboardings"');expect(sql).toContain("token_hash text not null unique")});
  it("reclama de forma atómica y sólo con sesión",()=>{expect(sql).toContain("for update");expect(sql).toContain("if auth.uid() is null");expect(sql).toContain("phone mismatch");expect(sql).toContain("set owner_profile_id=auth.uid()")});
  it("nunca conserva el token de reclamo en texto plano",()=>{expect(api).toContain('createHash("sha256")');expect(api).not.toContain("token_plain")});
  it("exige consentimiento antes de publicar",()=>{expect(api).toContain("consent_confirmed");expect(api).toContain("Completa autorización, contacto, descripción y al menos un servicio.")});
});
