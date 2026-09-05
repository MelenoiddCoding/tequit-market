"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Loader2, MessageCircle, RefreshCw, Search, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/identity-redesign.module.css";
import { LegalConsentFields } from "@/components/legal-consent-fields";

type AccountType = "customer" | "provider" | "business";
const pendingRegistrationKey="tequit.pending-registration";

export function RegisterForm() {
  const router=useRouter();
  const [accountType, setAccountType] = useState<AccountType | null>("customer");
  const [phase,setPhase]=useState<"form"|"otp"|"done">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error,setError]=useState("");
  const [legalError,setLegalError]=useState("");
  const [registrationId,setRegistrationId]=useState("");
  const [pendingPhone,setPendingPhone]=useState("");
  const [destination,setDestination]=useState("/cuenta");
  const [registrationPassword,setRegistrationPassword]=useState("");
  const [resendIn,setResendIn]=useState(0);
  const activeStep = phase==="done" ? 4 : phase==="otp" ? 3 : accountType ? 2 : 1;

  useEffect(()=>{
    const saved=window.sessionStorage.getItem(pendingRegistrationKey);
    if(!saved)return;
    try{
      const value=JSON.parse(saved) as {registrationId?:string;phone?:string;destination?:string;accountType?:AccountType};
      if(value.registrationId&&value.phone&&value.accountType){
        const timer=window.setTimeout(()=>{setRegistrationId(value.registrationId!);setPendingPhone(value.phone!);setDestination(value.destination??"/cuenta");setAccountType(value.accountType!);setPhase("otp")},0);
        return()=>window.clearTimeout(timer);
      }
    }catch{window.sessionStorage.removeItem(pendingRegistrationKey)}
  },[]);
  useEffect(()=>{if(resendIn<=0)return;const timer=window.setInterval(()=>setResendIn(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer)},[resendIn]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body=Object.fromEntries(new FormData(event.currentTarget));
    const acceptTerms=body.acceptTerms==="true",acceptPrivacy=body.acceptPrivacy==="true";
    if(!acceptTerms||!acceptPrivacy){setLegalError("Debes aceptar ambos documentos para crear tu cuenta.");return}
    setLegalError("");setSubmitting(true);setError("");
    setRegistrationPassword(String(body.password??""));
    const response=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,acceptTerms,acceptPrivacy,accountType})});
    const result=await response.json();setSubmitting(false);if(!response.ok){setError(result.error??"No pudimos iniciar el registro.");return}
    setRegistrationId(result.registrationId);setPendingPhone(result.phone);setDestination(result.destination);setResendIn(60);setPhase("otp");
    window.sessionStorage.setItem(pendingRegistrationKey,JSON.stringify({registrationId:result.registrationId,phone:result.phone,destination:result.destination,accountType}));
  }

  async function verify(event:FormEvent<HTMLFormElement>){event.preventDefault();setSubmitting(true);setError("");const values=Object.fromEntries(new FormData(event.currentTarget));const response=await fetch("/api/auth/register/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({registrationId,code:values.code,password:registrationPassword||undefined})});const result=await response.json();setSubmitting(false);if(!response.ok){setError(result.error??"No pudimos comprobar el código.");return}window.sessionStorage.removeItem(pendingRegistrationKey);setDestination(result.destination??destination);setPhase("done");window.setTimeout(()=>router.push(result.destination??destination),900)}

  async function resend(){setSubmitting(true);setError("");const response=await fetch("/api/auth/register/resend",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({registrationId})});const result=await response.json();setSubmitting(false);if(!response.ok){setError(result.error??"No pudimos reenviar el código.");return}setResendIn(60)}

  async function restart(){setSubmitting(true);setError("");const response=await fetch("/api/auth/register",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({registrationId})});setSubmitting(false);if(!response.ok){setError("No pudimos reiniciar el registro.");return}window.sessionStorage.removeItem(pendingRegistrationKey);setRegistrationId("");setPendingPhone("");setPhase("form")}

  return <>
    <div className={styles.progress} aria-label={`Paso ${activeStep} de 4`}>
      {["Tipo de cuenta", "Información", "Verificación", "Listo"].map((label, index) => <span key={label} className={`${styles.progressStep} ${index < activeStep ? styles.progressStepActive : ""}`}>{label}</span>)}
    </div>

    <div className={styles.formSurface}>
      {!accountType && phase==="form" && <div className={styles.accountOptions}>
        <button className={styles.accountOption} type="button" aria-label="Crear cuenta para buscar y guardar" onClick={() => setAccountType("customer")}>
          <span className={styles.accountIcon}><Search size={30} aria-hidden /></span><h2>Busco un servicio</h2><p>Guarda opciones y consulta tus solicitudes desde cualquier dispositivo.</p><span className={styles.accountLink}>Crear cuenta personal <ArrowRight size={18} aria-hidden /></span>
        </button>
        <button className={styles.accountOption} type="button" aria-label="Registrarme como prestador independiente" onClick={() => setAccountType("provider")}>
          <span className={styles.accountIcon}><UserRound size={30} aria-hidden /></span>
          <h2>Prestador independiente</h2>
          <p>Para quien ofrece un oficio o servicio con atención directa.</p>
          <span className={styles.accountLink}>Crear perfil personal <ArrowRight size={18} aria-hidden /></span>
        </button>
        <button className={styles.accountOption} type="button" aria-label="Registrar un negocio local" onClick={() => setAccountType("business")}>
          <span className={styles.accountIcon}><Building2 size={30} aria-hidden /></span>
          <h2>Negocio local</h2>
          <p>Para talleres, comercios o equipos que ofrecen productos y servicios.</p>
          <span className={styles.accountLink}>Registrar negocio <ArrowRight size={18} aria-hidden /></span>
        </button>
      </div>}

      {accountType && phase==="form" && <form className={styles.formGrid} onSubmit={submit}>
        <div className={styles.fieldGroupFull}>
          <p className="eyebrow">{accountType === "customer" ? "Cuenta personal" : accountType === "provider" ? "Perfil de prestador" : "Ficha de negocio"}</p>
          <h2>{accountType === "customer" ? "Guarda y consulta tus solicitudes" : accountType === "provider" ? "Cuéntanos sobre tu trabajo" : "Cuéntanos sobre tu negocio"}</h2>
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-name">{accountType === "business" ? "Nombre del negocio" : "Nombre completo"}</label>
          <input className={styles.field} id="register-name" name="name" autoComplete="name" required />
        </div>
        {accountType !== "customer" && <div className={styles.fieldGroup}>
          <label htmlFor="register-profession">{accountType === "provider" ? "Profesión principal" : "Categoría principal"}</label>
          <input className={styles.field} id="register-profession" name="profession" placeholder={accountType === "provider" ? "Ej. Plomería" : "Ej. Ferretería"} required />
        </div>}
        <div className={styles.fieldGroup}>
          <label htmlFor="register-phone">Número de celular</label>
          <input className={styles.field} id="register-phone" name="phone" inputMode="tel" autoComplete="tel" placeholder="311 000 0000" required />
          <p className={styles.fieldHelp}>Será privado. Te enviaremos un código por WhatsApp para comprobarlo.</p>
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-email">Correo de recuperación <span aria-hidden>(opcional)</span></label>
          <input className={styles.field} id="register-email" name="recoveryEmail" type="email" autoComplete="email" />
          <p className={styles.fieldHelp}>Te enviaremos un enlace para confirmarlo. No será tu identidad principal.</p>
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-zone">{accountType==="customer"?"Tu zona":"Zona de atención"}</label>
          <input className={styles.field} id="register-zone" name="zone" placeholder="Ej. Tepic y Xalisco" required />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-password">Contraseña</label>
          <input className={styles.field} id="register-password" name="password" type="password" minLength={8} autoComplete="new-password" required />
          <p className={styles.fieldHelp}>Mínimo 8 caracteres.</p>
        </div>
        {accountType !== "customer" && <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
          <label htmlFor="register-bio">{accountType === "provider" ? "Sobre tu trabajo" : "Sobre el negocio"}</label>
          <textarea className={styles.textarea} id="register-bio" name="bio" minLength={20} required />
        </div>}
        {accountType !== "customer" && <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
          <label htmlFor="register-service">Primer servicio</label>
          <input className={styles.field} id="register-service" name="firstService" placeholder="Ej. Reparación de fugas" required />
          <p className={styles.fieldHelp}>El plan Free permite publicar hasta 5 servicios. Podrás completar fotos y verificaciones después.</p>
        </div>}
        <LegalConsentFields error={legalError}/>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden hidden />
        {error&&<p className={styles.formError} role="alert">{error}</p>}
        <div className={styles.formActions}>
          <button className="btn btn-ghost" type="button" onClick={() => setAccountType(null)}><ArrowLeft size={18} aria-hidden /> Quiero promocionarme</button>
          <button className="btn btn-primary" disabled={submitting} type="submit">{submitting ? <Loader2 className="animate-spin" aria-hidden /> : <ArrowRight size={18} aria-hidden />} {submitting ? "Creando cuenta…" : accountType==="customer"?"Crear cuenta":"Crear cuenta y perfil"}</button>
        </div>
      </form>}

      {phase==="otp"&&<form className={styles.otpState} onSubmit={verify}>
        <span className={styles.otpIcon}><MessageCircle size={30} aria-hidden/></span>
        <p className="eyebrow">Revisa tu WhatsApp</p>
        <h2>Escribe tu código</h2>
        <p>Enviamos un código de seis dígitos a <strong>{pendingPhone}</strong> mediante nuestro proveedor de verificación.</p>
        <div className={styles.otpField}>
          <label htmlFor="register-otp">Código de verificación</label>
          <input className={styles.field} id="register-otp" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" autoFocus required/>
          <p className={styles.fieldHelp}>El código vence en cinco minutos. No lo compartas con nadie.</p>
        </div>
        {!registrationPassword&&<div className={styles.otpField}><label htmlFor="register-confirm-password">Tu contraseña</label><input className={styles.field} id="register-confirm-password" name="password" type="password" minLength={8} autoComplete="current-password" onChange={event=>setRegistrationPassword(event.target.value)} required/><p className={styles.fieldHelp}>La necesitamos de nuevo porque recargaste la página.</p></div>}
        {error&&<p className={styles.formError} role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={submitting} type="submit">{submitting?<Loader2 className="animate-spin" aria-hidden/>:<CheckCircle2 size={18} aria-hidden/>}{submitting?"Comprobando…":"Verificar y crear cuenta"}</button>
        <button className="btn btn-ghost" disabled={submitting||resendIn>0} type="button" onClick={resend}><RefreshCw size={17} aria-hidden/>{resendIn>0?`Reenviar en ${resendIn} s`:"Reenviar código"}</button>
        <button className="btn btn-ghost" disabled={submitting} type="button" onClick={restart}><ArrowLeft size={17} aria-hidden/>Corregir número</button>
      </form>}

      {phase==="done" && <div className={styles.successState} role="status">
        <span className={styles.successIcon}><CheckCircle2 size={38} aria-hidden /></span>
        <p className="eyebrow">Registro completo</p>
        <h2>{accountType==="customer"?"Tu cuenta está lista":"Tu perfil ya está publicado"}</h2>
        <p>{accountType==="customer"?"Tu celular quedó verificado. Ya puedes sincronizar guardados y consultar tus solicitudes.":"Tu celular quedó verificado y tu cuenta inicia en el plan Free."}</p>
        <Link className="btn btn-primary" href={accountType==="customer"?"/cuenta":"/dashboard"}>Continuar</Link>
      </div>}
    </div>
  </>;
}
