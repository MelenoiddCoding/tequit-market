import { NextResponse } from "next/server";
import { z } from "zod";
const statuses=["nueva","vista","interesado","no_me_interesa","contactado","cerrada"] as const;
const schema=z.object({from:z.enum(statuses),to:z.enum(statuses)});
export async function PATCH(request:Request){const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Estado inválido"},{status:400});if(parsed.data.from==="cerrada")return NextResponse.json({error:"Una solicitud cerrada no puede reabrirse"},{status:409});return NextResponse.json({status:parsed.data.to})}
