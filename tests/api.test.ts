import { describe, expect, it } from "vitest";
import { POST as createLead } from "@/app/api/leads/route";
import { POST as createEvent } from "@/app/api/events/route";
describe("endpoints públicos controlados",()=>{
  it("crea solicitud dirigida a Juan",async()=>{const response=await createLead(new Request("http://local/api/leads",{method:"POST",body:JSON.stringify({targetProvider:"juan-perez",requestedService:"Concreto estampado",description:"Cochera de aproximadamente treinta y cinco metros cuadrados",zone:"Ciudad del Valle",timing:"Esta semana",customerName:"Mariana López",customerPhone:"311 000 0000",customerEmail:""})}));expect(response.status).toBe(201);expect((await response.json()).status).toBe("nueva")});
  it("registra un click de WhatsApp",async()=>{const response=await createEvent(new Request("http://local/api/events",{method:"POST",body:JSON.stringify({type:"whatsapp_click",target:"juan-perez"})}));expect(response.status).toBe(201);expect((await response.json()).recorded).toBe(true)});
});
