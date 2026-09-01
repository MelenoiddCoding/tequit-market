import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole="customer"|"provider"|"business_owner"|"admin";
export async function getSessionProfile(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return null;const[{data:profile},{data:roles}]=await Promise.all([supabase.from("profiles").select("id,display_name,phone,phone_e164,phone_login_enabled_at,phone_verified_at,recovery_email,recovery_email_verified_at,must_change_password").eq("id",user.id).maybeSingle(),supabase.from("profile_roles").select("role").eq("profile_id",user.id)]);return{user,profile,roles:(roles??[]).map((item)=>item.role as AppRole)}}
export async function requireSession(){const session=await getSessionProfile();if(!session)redirect("/login?reason=expired");return session}
export async function requireRole(allowed:AppRole[]){const session=await requireSession();if(!session.roles.some((role)=>allowed.includes(role)))redirect(session.roles.includes("customer")?"/cuenta":"/login");return session}
