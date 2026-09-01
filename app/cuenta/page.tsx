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

export default async function AccountPage(){
  const session=await requireSession();
  const supabase=await createClient();
  const{data:leads}=await supabase.from("leads").select("id,requested_service_text,status,created_at").eq("customer_profile_id",session.user.id).order("created_at",{ascending:false}).limit(20);
  const isProvider=session.roles.includes("provider")||session.roles.includes("business_owner");
  return <main className={styles.accountPage}><SiteContainer size="reading" className={styles.accountShell}>
    <header className={styles.accountHeader}><span className={styles.accountAvatar} aria-hidden><UserRound/></span><div><p className="eyebrow">Modo Usuario</p><h1>{session.profile?.display_name??"Mi cuenta"}</h1><p>Tu información y actividad en Tequit.</p></div></header>
    <section className={styles.accountSection}><div className={styles.accountSectionHead}><UserRound aria-hidden/><h2>Datos de la cuenta</h2></div><dl className={styles.accountData}><div><dt>Celular de acceso</dt><dd>{displayMexicanPhone(session.profile?.phone_e164)} · {session.profile?.phone_verified_at?"Verificado":"Pendiente de OTP"}</dd></div><div><dt>Correo de recuperación</dt><dd>{session.profile?.recovery_email??"No agregado"} · {session.profile?.recovery_email_verified_at?"Confirmado":"Pendiente"}</dd></div></dl><RecoveryEmailForm current={session.profile?.recovery_email}/><p className={styles.fieldHelp}>Este celular es privado. El WhatsApp de tu perfil profesional se administra por separado.</p></section>
    <section className={styles.accountSection}><div className={styles.accountSectionHead}><ShieldCheck aria-hidden/><h2>Cambiar modo</h2></div>{isProvider?<><p>Administra tus servicios, solicitudes y estadísticas.</p><Link className="btn btn-primary" href="/dashboard">Cambiar a modo Prestador</Link></>:<><p>Crea un perfil profesional dentro de esta misma cuenta.</p><details className={styles.providerDetails}><summary className="btn btn-secondary">Quiero promocionarme</summary><ProviderOnboardingForm name={session.profile?.display_name??""} phone={session.profile?.phone??""}/></details></>}</section>
    <section className={styles.accountSection}><div className={styles.accountSectionHead}><Heart aria-hidden/><h2>Favoritos y solicitudes</h2></div><div className={styles.accountQuickActions}><Link href="/guardados"><strong>Favoritos</strong><span>Ver lo que guardaste</span></Link><Link href="/solicitar"><strong>Nueva solicitud</strong><span>Publicar una necesidad</span></Link></div>{leads?.length?<div className={styles.accountLeads}><h3>Solicitudes recientes</h3>{leads.map((lead)=><article key={lead.id}><strong>{lead.requested_service_text}</strong><span>{lead.status} · {new Intl.DateTimeFormat("es-MX").format(new Date(lead.created_at))}</span></article>)}</div>:<p className={styles.accountEmpty}>Aún no has enviado solicitudes con esta cuenta.</p>}</section>
    <section className={styles.accountSection}><div className={styles.accountSectionHead}><ShieldCheck aria-hidden/><h2>Acceso y seguridad</h2></div>{session.profile?.must_change_password&&<p role="alert"><strong>Cambio obligatorio:</strong> define una contraseña nueva.</p>}<AccountManager/></section>
  </SiteContainer></main>;
}
