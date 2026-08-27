import { NextResponse } from "next/server";
import { z } from "zod";
import { assertCanPublishService } from "@/lib/plan";
const schema=z.object({name:z.string().min(3).max(100),plan:z.enum(["free","pro"]),activeCount:z.number().int().nonnegative()});
export async function POST(request:Request){const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Datos inválidos"},{status:400});try{assertCanPublishService(parsed.data.plan,parsed.data.activeCount)}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Límite alcanzado"},{status:409})}return NextResponse.json({id:parsed.data.name.toLowerCase().replace(/\s+/g,"-"),active:true},{status:201})}
