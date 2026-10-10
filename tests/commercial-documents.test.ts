import {describe,expect,it} from "vitest";import {folio,money} from "@/lib/commercial-documents";
describe("documentos comerciales",()=>{it("genera folios independientes legibles",()=>{expect(folio("quote",1)).toBe("COT-0001");expect(folio("remission",42)).toBe("REM-0042")});it("formatea importes MXN",()=>{expect(money(1234.5)).toContain("1,234.50")})});
