import {NextResponse} from "next/server";
import {z} from "zod";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";

const schema=z.object({email:z.string().email().max(254)});
export async function POST(request:Request){const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Escribe un correo válido."},{status:400});const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Tu sesión terminó."},{status:401});const{error}=await supabase.auth.updateUser({email:parsed.data.email},{emailRedirectTo:`${process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000"}/auth/callback?next=/cuenta`});if(error)return NextResponse.json({error:"No pudimos enviar la confirmación."},{status:409});await createAdminClient()?.from("profiles").update({recovery_email:parsed.data.email,recovery_email_verified_at:null}).eq("id",user.id);return NextResponse.json({ok:true})}
