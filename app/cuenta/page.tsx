import Link from "next/link";
import { Heart,ShieldCheck,UserRound } from "lucide-react";
import { AccountManager } from "@/components/account-manager";
import {RecoveryEmailForm} from "@/components/recovery-forms";
import { ProviderOnboardingForm } from "@/components/provider-onboarding-form";
import { SiteContainer } from "@/components/layout-primitives";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import styles from "@/components/identity-redesign.module.css";
import {displayMexicanPhone} from "@/lib/phone";

export const metadata={title:"Mi cuenta"};

export default async function AccountPage({searchParams}:PageProps<"/cuenta">){
  const params=await searchParams;
  const session=await requireSession();
  const supabase=await createClient();
  const{data:leads}=await supabase.from("leads").select("id,requested_service_text,status,created_at").eq("customer_profile_id",session.user.id).order("created_at",{ascending:false}).limit(20);
  const onboardingKind=params.onboarding==="business"?"business":params.onboarding==="provider"?"provider":null;
  const{data:provider}=await supabase.from("provider_profiles").select("id,status,name,profession,phone,zone,bio,avatar_path,onboarding_step,provider_site_settings(cover_path),provider_services(title,description)").eq("owner_profile_id",session.user.id).maybeSingle();
  const isProvider=provider?.status==="active"||session.roles.includes("business_owner");
  const storage=(bucket:string,path:string|null|undefined)=>path&&process.env.NEXT_PUBLIC_SUPABASE_URL?`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`:undefined;
  const relation=provider?.provider_site_settings as unknown as {cover_path:string|null}|null;const service=(provider?.provider_services as unknown as {title:string;description:string|null}[]|null)?.[0];
  const providerInitial=provider?{name:provider.name,profession:provider.profession,phone:provider.phone,zone:provider.zone,bio:provider.bio,service:service?.title??"",serviceDescription:service?.description??"",avatarPath:provider.avatar_path,avatarUrl:storage("avatars",provider.avatar_path),coverPath:relation?.cover_path??null,coverUrl:storage("provider-work",relation?.cover_path),step:provider.onboarding_step??1}:undefined;
  return <main className={styles.accountPage}><SiteContainer size="reading" className={styles.accountShell}>
    <header className={styles.accountHeader}><span className={styles.accountAvatar} aria-hidden><UserRound/></span><div><p className="eyebrow">Modo Usuario</p><h1>{session.profile?.display_name??"Mi cuenta"}</h1><p>Tu información y actividad en Tequit.</p></div></header>
    <section className={styles.accountSection}><div className={styles.accountSectionHead}><UserRound aria-hidden/><h2>Datos de la cuenta</h2></div><dl className={styles.accountData}><div><dt>Celular de acceso</dt><dd>{displayMexicanPhone(session.profile?.phone_e164)} · {session.profile?.phone_verified_at?"Verificado":"Pendiente de OTP"}</dd></div><div><dt>Correo de recuperación</dt><dd>{session.profile?.recovery_email??"No agregado"} · {session.profile?.recovery_email_verified_at?"Confirmado":"Pendiente"}</dd></div></dl><RecoveryEmailForm current={session.profile?.recovery_email}/><p className={styles.fieldHelp}>Este celular es privado. El WhatsApp de tu perfil profesional se administra por separado.</p></section>
    <section className={styles.accountSection}><div className={styles.accountSectionHead}><ShieldCheck aria-hidden/><h2>{onboardingKind||provider?.status==="draft"?"Completa tu perfil":"Cambiar modo"}</h2></div>{isProvider?<><p>Administra tus servicios, solicitudes y estadísticas.</p><Link className="btn btn-primary" href="/dashboard">Cambiar a modo Prestador</Link></>:onboardingKind||provider?.status==="draft"?<><p>Guardaremos tu avance. Tu perfil se publicará sólo cuando termines.</p><ProviderOnboardingForm name={session.profile?.display_name??""} phone={session.profile?.phone??""} kind={onboardingKind==="business"?"business":"provider"} initial={onboardingKind==="business"?undefined:providerInitial}/></>:<><p>Crea un perfil profesional dentro de esta misma cuenta.</p><div className={styles.accountQuickActions}><Link href="/cuenta?onboarding=provider"><strong>Quiero ser prestador</strong><span>Publica tus servicios y trabajos.</span></Link><Link href="/cuenta?onboarding=business"><strong>Soy un negocio</strong><span>Registra tu negocio local.</span></Link></div></>}</section>
    <section className={styles.accountSection}><div className={styles.accountSectionHead}><Heart aria-hidden/><h2>Favoritos y solicitudes</h2></div><div className={styles.accountQuickActions}><Link href="/guardados"><strong>Favoritos</strong><span>Ver lo que guardaste</span></Link><Link href="/solicitar"><strong>Nueva solicitud</strong><span>Publicar una necesidad</span></Link></div>{leads?.length?<div className={styles.accountLeads}><h3>Solicitudes recientes</h3>{leads.map((lead)=><article key={lead.id}><strong>{lead.requested_service_text}</strong><span>{lead.status} · {new Intl.DateTimeFormat("es-MX").format(new Date(lead.created_at))}</span></article>)}</div>:<p className={styles.accountEmpty}>Aún no has enviado solicitudes con esta cuenta.</p>}</section>
    <section className={styles.accountSection}><div className={styles.accountSectionHead}><ShieldCheck aria-hidden/><h2>Acceso y seguridad</h2></div>{session.profile?.must_change_password&&<p role="alert"><strong>Cambio obligatorio:</strong> define una contraseña nueva.</p>}<AccountManager/></section>
  </SiteContainer></main>;
}
