import {describe,it,expect} from "vitest";
import {oneRelation} from "@/lib/relation";
describe("nombres de altas asistidas",()=>{
 it("conserva nombre y slug cuando Supabase devuelve una relación a uno",()=>{
  const row={name:"Servicio Técnico en Aires Acondicionados Loera's",slug:"loera"};
  expect(oneRelation(row)).toEqual(row);
  expect(oneRelation([row])).toEqual(row);
 });
 it("tolera relaciones ausentes sin inventar un perfil",()=>{
  expect(oneRelation(null)).toBeUndefined();
  expect(oneRelation([])).toBeUndefined();
 });
});
