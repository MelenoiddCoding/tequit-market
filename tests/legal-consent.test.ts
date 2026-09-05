import {describe,expect,it,vi}from "vitest";
import fs from "node:fs";
import path from "node:path";

vi.mock("server-only",()=>({}));
import {legalDocumentHash}from "@/lib/legal-consent";
import {LEGAL_VERSION,legalDocuments}from "@/lib/legal-documents";

describe("consentimiento legal",()=>{
  it("mantiene dos documentos completos en una versión compartida",()=>{expect(LEGAL_VERSION).toBe("2026-09-04");expect(legalDocuments.terms.sections.length).toBeGreaterThanOrEqual(12);expect(legalDocuments.privacy.sections.length).toBeGreaterThanOrEqual(10);expect(JSON.stringify(legalDocuments)).toContain("privacidad@tequit.mx")});
  it("coincide el contenido del repositorio con los hashes sembrados",()=>{const sql=fs.readFileSync(path.join(process.cwd(),"supabase/migrations/202609040001_legal_consent.sql"),"utf8");expect(sql).toContain(legalDocumentHash("terms"));expect(sql).toContain(legalDocumentHash("privacy"))});
  it("permite sólo lectura propia y reserva escrituras al servidor",()=>{const sql=fs.readFileSync(path.join(process.cwd(),"supabase/migrations/202609040001_legal_consent.sql"),"utf8");expect(sql).toContain("using(auth.uid()=user_id)");expect(sql).toContain("revoke all on table public.legal_acceptances from public,anon,authenticated");expect(sql).toContain("grant select on table public.legal_acceptances to authenticated")});
  it("registra consentimiento en registro y creación por reclamación",()=>{const register=fs.readFileSync(path.join(process.cwd(),"app/api/auth/register/route.ts"),"utf8");const claim=fs.readFileSync(path.join(process.cwd(),"app/api/claims/route.ts"),"utf8");expect(register).toContain("recordLegalAcceptances");expect(register).toContain('source:\"registration\"');expect(claim).toContain('value.mode===\"create\"');expect(claim).toContain('source:\"claim\"')});
});
