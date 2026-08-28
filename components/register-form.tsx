"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Loader2, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import styles from "@/components/identity-redesign.module.css";

type AccountType = "provider" | "business";

export function RegisterForm() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const activeStep = done ? 3 : accountType ? 2 : 1;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setSubmitting(false);
    setDone(true);
  }

  return <>
    <div className={styles.progress} aria-label={`Paso ${activeStep} de 3`}>
      {["Tipo de cuenta", "Información", "Listo"].map((label, index) => <span key={label} className={`${styles.progressStep} ${index < activeStep ? styles.progressStepActive : ""}`}>{label}</span>)}
    </div>

    <div className={styles.formSurface}>
      {!accountType && !done && <div className={styles.accountOptions}>
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
          <p className="eyebrow">{accountType === "provider" ? "Perfil de prestador" : "Ficha de negocio"}</p>
          <h2>{accountType === "provider" ? "Cuéntanos sobre tu trabajo" : "Cuéntanos sobre tu negocio"}</h2>
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-name">{accountType === "provider" ? "Nombre completo" : "Nombre del negocio"}</label>
          <input className={styles.field} id="register-name" name="name" autoComplete="name" required />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-profession">{accountType === "provider" ? "Profesión principal" : "Categoría principal"}</label>
          <input className={styles.field} id="register-profession" name="profession" placeholder={accountType === "provider" ? "Ej. Plomería" : "Ej. Ferretería"} required />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-email">Correo</label>
          <input className={styles.field} id="register-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-phone">WhatsApp</label>
          <input className={styles.field} id="register-phone" name="phone" inputMode="tel" autoComplete="tel" placeholder="311 000 0000" required />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-zone">Zona de atención</label>
          <input className={styles.field} id="register-zone" name="zone" placeholder="Ej. Tepic y Xalisco" required />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-password">Contraseña</label>
          <input className={styles.field} id="register-password" name="password" type="password" minLength={8} autoComplete="new-password" required />
          <p className={styles.fieldHelp}>Mínimo 8 caracteres.</p>
        </div>
        <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
          <label htmlFor="register-bio">{accountType === "provider" ? "Sobre tu trabajo" : "Sobre el negocio"}</label>
          <textarea className={styles.textarea} id="register-bio" name="bio" minLength={20} required />
        </div>
        <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
          <label htmlFor="register-service">Primer servicio</label>
          <input className={styles.field} id="register-service" name="firstService" placeholder="Ej. Reparación de fugas" required />
          <p className={styles.fieldHelp}>El plan Free permite publicar hasta 5 servicios. Podrás completar fotos y verificaciones después.</p>
        </div>
        <div className={styles.formActions}>
          <button className="btn btn-ghost" type="button" onClick={() => setAccountType(null)}><ArrowLeft size={18} aria-hidden /> Cambiar tipo</button>
          <button className="btn btn-primary" disabled={submitting} type="submit">{submitting ? <Loader2 className="animate-spin" aria-hidden /> : <ArrowRight size={18} aria-hidden />} {submitting ? "Creando perfil…" : "Crear cuenta y perfil"}</button>
        </div>
      </form>}

      {done && <div className={styles.successState} role="status">
        <span className={styles.successIcon}><CheckCircle2 size={38} aria-hidden /></span>
        <p className="eyebrow">Registro completo</p>
        <h2>Tu perfil está listo para completar</h2>
        <p>Tu cuenta inicia en el plan Free. En el panel podrás revisar la información, agregar trabajos y continuar con las verificaciones disponibles.</p>
        <Link className="btn btn-primary" href="/login">Ir a iniciar sesión</Link>
      </div>}
    </div>
  </>;
}
