import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/202609050001_provider_plans.sql",
  ),
  "utf8",
);
const operations = fs.readFileSync(
  path.join(process.cwd(), "supabase/migrations/202609050002_provider_plan_operations.sql"),
  "utf8",
);
const restoration = fs.readFileSync(
  path.join(process.cwd(), "supabase/migrations/202609050003_restore_plan_archives.sql"),
  "utf8",
);
describe("arquitectura de planes", () => {
  it("define catálogo, capacidades, asignaciones y bienvenida", () => {
    for (const table of [
      "plan_catalog",
      "plan_entitlements",
      "provider_plan_assignments",
      "welcome_offer_settings",
    ])
      expect(migration).toContain(`create table public.${table}`);
    expect(migration).toContain("'pro',3");
  });
  it("resuelve vigencia y archiva excedentes", () => {
    expect(migration).toContain("current_provider_plan");
    expect(migration).toContain("ends_at>p_at");
    expect(migration).toContain("set active=false");
    expect(migration).toContain("set archived_at=now()");
  });
  it("mantiene las funciones WIP apagadas", () => {
    expect(migration).toContain(
      "'lead_marketplace_access','false','coming_soon'",
    );
    expect(migration).toContain("'sponsored_search','false','coming_soon'");
  });
  it("administra planes y solicitudes en operaciones atómicas", () => {
    expect(operations).toContain("admin_assign_provider_plan");
    expect(operations).toContain("admin_decide_plan_request");
    expect(operations).toContain("requested_plan");
  });
  it("restaura trabajos archivados si vuelve a existir capacidad", () => {
    expect(restoration).toContain("restore_slots");
    expect(restoration).toContain("set archived_at=null");
  });
});
