import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(path.join(process.cwd(), "supabase/migrations/202609070001_controlled_provider_taxonomy.sql"), "utf8");

describe("taxonomía controlada de prestadores", () => {
  it("exige una sola categoría principal y limita las secundarias", () => {
    expect(migration).toContain("provider_one_primary_category_idx");
    expect(migration).toContain("PROVIDER_SECONDARY_CATEGORY_LIMIT");
    expect(migration).toContain("cardinality(coalesce(p_secondary,'{}'))>2");
  });
  it("mantiene servicios libres e indexa marcas y descripciones", () => {
    expect(migration).toContain("add column brands text[]");
    expect(migration).toContain("string_agg(concat_ws(' ',title,description,array_to_string(brands,' '))");
    expect(migration).toContain("provider_search_document_idx");
  });
  it("migra la cuenta de validación como Electricista sin cambiar su publicación", () => {
    expect(migration).toContain("5649531923");
    expect(migration).toContain("canonical.slug='electricista'");
    expect(migration).not.toContain("status='draft' where right(regexp_replace(phone");
  });
});
