import {NextResponse} from "next/server";
import {z} from "zod";
import {allowRequest} from "@/lib/rate-limit";
import {createClient} from "@/lib/supabase/server";

const schema=z.object({email:z.string().email().max(254)});
export async function POST(request:Request){if(!await allowRequest(request,"password_recovery",5,3600))return NextResponse.json({error:"Espera antes de solicitar otro enlace."},{status:429});const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Escribe un correo válido."},{status:400});const supabase=await createClient();await supabase.auth.resetPasswordForEmail(parsed.data.email,{redirectTo:`${process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000"}/auth/callback?next=/restablecer`});return NextResponse.json({ok:true})}
