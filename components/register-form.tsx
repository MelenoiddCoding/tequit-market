"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Loader2, Search, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/identity-redesign.module.css";

type AccountType = "customer" | "provider" | "business";

export function RegisterForm() {
  const router=useRouter();
  const [accountType, setAccountType] = useState<AccountType | null>("customer");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error,setError]=useState("");
  const activeStep = done ? 3 : accountType ? 2 : 1;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);setError("");
    const body=Object.fromEntries(new FormData(event.currentTarget));
    const response=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,accountType})});
    const result=await response.json();setSubmitting(false);if(!response.ok){setError(result.error??"No pudimos crear la cuenta.");return}setDone(true);window.setTimeout(()=>router.push(result.destination),700);
  }

  return <>
    <div className={styles.progress} aria-label={`Paso ${activeStep} de 3`}>
      {["Tipo de cuenta", "Información", "Listo"].map((label, index) => <span key={label} className={`${styles.progressStep} ${index < activeStep ? styles.progressStepActive : ""}`}>{label}</span>)}
    </div>

    <div className={styles.formSurface}>
      {!accountType && !done && <div className={styles.accountOptions}>
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

      {accountType && !done && <form className={styles.formGrid} onSubmit={submit}>
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
          <p className={styles.fieldHelp}>Será tu número privado para iniciar sesión. Aún no se considerará verificado.</p>
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
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden hidden />
        {error&&<p className={styles.formError} role="alert">{error}</p>}
        <div className={styles.formActions}>
          <button className="btn btn-ghost" type="button" onClick={() => setAccountType(null)}><ArrowLeft size={18} aria-hidden /> Quiero promocionarme</button>
          <button className="btn btn-primary" disabled={submitting} type="submit">{submitting ? <Loader2 className="animate-spin" aria-hidden /> : <ArrowRight size={18} aria-hidden />} {submitting ? "Creando cuenta…" : accountType==="customer"?"Crear cuenta":"Crear cuenta y perfil"}</button>
        </div>
      </form>}

      {done && <div className={styles.successState} role="status">
        <span className={styles.successIcon}><CheckCircle2 size={38} aria-hidden /></span>
        <p className="eyebrow">Registro completo</p>
        <h2>{accountType==="customer"?"Tu cuenta está lista":"Tu perfil ya está publicado"}</h2>
        <p>{accountType==="customer"?"Ya puedes sincronizar guardados y consultar tus solicitudes. Tu celular quedará pendiente de OTP durante la beta.":"Tu cuenta inicia en el plan Free. Tu celular permite entrar, pero quedará pendiente de OTP durante la beta."}</p>
        <Link className="btn btn-primary" href={accountType==="customer"?"/cuenta":"/dashboard"}>Continuar</Link>
      </div>}
    </div>
  </>;
}
