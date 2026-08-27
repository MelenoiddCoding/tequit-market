import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
const sql=fs.readFileSync(path.join(process.cwd(),"supabase/migrations/202608260001_initial_schema.sql"),"utf8");
describe("RLS",()=>{it("activa RLS y acota cambios al dueño",()=>{expect(sql).toContain("alter table public.provider_profiles enable row level security");expect(sql).toContain("owner_profile_id=auth.uid()");expect(sql).toContain("public.owns_provider(provider_id)")});it("protege fotos de leads de lectura pública",()=>{expect(sql).toContain("owners read lead media");expect(sql).not.toContain("lead-media',true")})});
