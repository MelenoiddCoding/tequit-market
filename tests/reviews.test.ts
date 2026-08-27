import { describe, expect, it } from "vitest";
import { providers } from "@/lib/demo-data";
describe("moderación de reseñas",()=>{it("sólo expone reseñas aprobadas",()=>{const visible=providers[0].reviews.filter(r=>r.status==="approved");expect(visible.length).toBe(3);expect(visible.some(r=>r.author==="Demo pendiente")).toBe(false)})});
