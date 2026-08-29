import { describe, expect, it } from "vitest";
import { normalizeSearch, searchMarketplaceData } from "@/lib/search";
import { businesses,providers } from "@/lib/demo-data";
describe("búsqueda cotidiana",()=>{
  it("normaliza acentos y puntuación",()=>expect(normalizeSearch("¡Plomería en Tepic!")).toBe("plomeria en tepic"));
  it("fontanero encuentra plomería",()=>{const results=searchMarketplaceData(providers,businesses,"fontanero");expect(results.some(r=>r.provider?.slug==="miguel-ibarra")).toBe(true)});
  it("concreto estampado encuentra el negocio y no lo publica Juan",()=>{const results=searchMarketplaceData(providers,businesses,"concreto estampado");expect(results.some(r=>r.business?.slug==="concretos-estampados-de-nayarit")).toBe(true);expect(results.some(r=>r.provider?.slug==="juan-perez")).toBe(false)});
});
