import { createHash } from "node:crypto";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review-form";
import { SiteContainer } from "@/components/layout-primitives";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function ReviewPage({params}:{params:Promise<{token:string}>}){const{token}=await params;const admin=createAdminClient();const hash=createHash("sha256").update(token).digest("hex");const{data}=await admin!.from("review_requests").select("expires_at,used_at,provider_profiles(name),businesses(name)").eq("token_hash",hash).maybeSingle();if(!data||data.used_at||new Date(data.expires_at)<new Date())notFound();const provider=data.provider_profiles as unknown as {name:string}|null;const business=data.businesses as unknown as {name:string}|null;return <main><SiteContainer size="reading"><p className="eyebrow">Experiencia verificada</p><h1>Reseña para {provider?.name??business?.name}</h1><p>Comparte una opinión honesta. Tequit la revisará antes de publicarla.</p><ReviewForm token={token}/></SiteContainer></main>}
