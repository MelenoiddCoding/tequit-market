import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const schema=z.object({password:z.string().min(8).max(128)});
export async function POST(request:Request){const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Usa una contraseña de al menos 8 caracteres."},{status:400});const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Tu sesión terminó."},{status:401});const{error}=await supabase.auth.updateUser({password:parsed.data.password});if(error)return NextResponse.json({error:"No pudimos cambiar la contraseña."},{status:500});await supabase.from("profiles").update({must_change_password:false}).eq("id",user.id);return NextResponse.json({ok:true})}
