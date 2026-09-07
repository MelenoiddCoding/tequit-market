"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import styles from "@/components/identity-redesign.module.css";
import { LegalConsentFields } from "@/components/legal-consent-fields";

export type AccountType = "customer" | "provider" | "business";
type Props = { initialAccountType?: AccountType };
type Details = { firstName: string; lastName: string; recoveryEmail: string; password: string; confirmPassword: string };
const pendingKey = "tequit.pending-registration";
const blankDetails: Details = { firstName: "", lastName: "", recoveryEmail: "", password: "", confirmPassword: "" };

function phoneIssue(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^52(?=\d{10}$)/, "").replace(/^521(?=\d{10}$)/, "");
  if (!digits) return "";
  return digits.length < 10 ? "Número incompleto" : digits.length > 10 ? "Número no válido" : "";
}

export function RegisterForm({ initialAccountType = "customer" }: Props) {
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
  const [showTypes, setShowTypes] = useState(false);
  const [phase, setPhase] = useState<"phone" | "otp" | "details">("phone");
  const [phone, setPhone] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [details, setDetails] = useState<Details>(blankDetails);
  const [mobileStep, setMobileStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [legalError, setLegalError] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const detailsFormRef = useRef<HTMLFormElement>(null);
  const issue = phoneIssue(phone);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(pendingKey);
    if (!saved) return;
    try {
      const pending = JSON.parse(saved) as { registrationId?: string; phone?: string; accountType?: AccountType; phase?: "otp" | "details" };
      if (pending.registrationId && pending.phone && pending.accountType && pending.phase) {
        const timer = window.setTimeout(() => { setRegistrationId(pending.registrationId!); setPhone(pending.phone!); setAccountType(pending.accountType!); setPhase(pending.phase!); }, 0);
        return () => window.clearTimeout(timer);
      }
    } catch { window.sessionStorage.removeItem(pendingKey); }
  }, []);
  useEffect(() => { if (!resendIn) return; const id = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(id); }, [resendIn]);

  function savePending(nextPhase: "otp" | "details", id = registrationId, number = phone) {
    window.sessionStorage.setItem(pendingKey, JSON.stringify({ registrationId: id, phone: number, accountType, phase: nextPhase }));
  }
  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (issue || !phone.replace(/\D/g, "")) { setError(issue || "Número incompleto"); return; }
    setBusy(true);
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, accountType }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setError(result.error ?? "No pudimos enviar el código."); return; }
    setRegistrationId(result.registrationId); setPhone(result.phone); setResendIn(60); setPhase("otp"); savePending("otp", result.registrationId, result.phone);
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const value = code.join("");
    if (value.length !== 6) { setError("Escribe el código de seis dígitos."); return; }
    setBusy(true);
    const response = await fetch("/api/auth/register/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationId, code: value }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setError(result.error ?? "No pudimos comprobar el código."); return; }
    setPhase("details"); setMobileStep(0); savePending("details");
  }
  async function resend() {
    setBusy(true); setError("");
    const response = await fetch("/api/auth/register/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationId }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setError(result.error ?? "No pudimos reenviar el código."); return; }
    setResendIn(60);
  }
  async function changeNumber() {
    await fetch("/api/auth/register", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationId }) });
    window.sessionStorage.removeItem(pendingKey); setRegistrationId(""); setCode(["", "", "", "", "", ""]); setPhase("phone"); setError("");
  }
  function updateDetail(field: keyof Details, value: string) { setDetails((current) => ({ ...current, [field]: value })); }
  function goNext() {
    if (mobileStep === 0 && details.firstName.trim().length < 2) { setError("Escribe tu nombre."); return; }
    if (mobileStep === 1 && details.lastName.trim().length < 2) { setError("Escribe tu apellido."); return; }
    if (mobileStep === 2 && details.recoveryEmail && !/^\S+@\S+\.\S+$/.test(details.recoveryEmail)) { setError("Escribe un correo válido."); return; }
    if (mobileStep === 3 && details.password.length < 8) { setError("Tu contraseña debe tener al menos 8 caracteres."); return; }
    if (mobileStep === 3 && details.password !== details.confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    setError(""); setMobileStep((step) => Math.min(4, step + 1));
  }
  async function complete() {
    setError("");
    if (!detailsFormRef.current) return;
    const form = new FormData(detailsFormRef.current);
    const acceptTerms = form.get("acceptTerms") === "true", acceptPrivacy = form.get("acceptPrivacy") === "true";
    if (!acceptTerms || !acceptPrivacy) { setLegalError("Debes aceptar ambos documentos para crear tu cuenta."); return; }
    if (details.password.length < 8 || details.password !== details.confirmPassword) { setError(details.password !== details.confirmPassword ? "Las contraseñas no coinciden." : "Tu contraseña debe tener al menos 8 caracteres."); return; }
    setLegalError(""); setBusy(true);
    const response = await fetch("/api/auth/register/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationId, ...details, acceptTerms, acceptPrivacy, termsVersion: form.get("termsVersion"), privacyVersion: form.get("privacyVersion") }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setError(result.error ?? "No pudimos crear tu cuenta."); return; }
    window.sessionStorage.removeItem(pendingKey); window.location.assign(result.destination);
  }
  function updateCode(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1); const next = [...code]; next[index] = digit; setCode(next); if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }
  const accountLabel = accountType === "provider" ? "cuenta de prestador" : accountType === "business" ? "cuenta de negocio" : "cuenta de usuario";

  if (phase === "phone") return <form className={styles.registrationSimple} onSubmit={start} noValidate>
    <div className={styles.registrationCopy}><h1>Ingresa tu número de celular</h1><p>Te enviaremos un código de confirmación.</p></div>
    <label className={styles.registrationField} htmlFor="register-phone">Número de celular<input id="register-phone" className={styles.field} value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="311 000 0000" autoFocus aria-invalid={Boolean(issue || error)} /></label>
    {(issue || error) && <p className={styles.formError} role="alert">{issue || error}</p>}
    <button className="btn btn-whatsapp" type="submit" disabled={busy || Boolean(issue)}>{busy ? <Loader2 className="animate-spin" aria-hidden /> : <MessageCircle aria-hidden />} {busy ? "Enviando…" : "Recibir código por WhatsApp"}</button>
    {initialAccountType === "customer" ? <div className={styles.registrationType}><button type="button" className="text-link" onClick={() => setShowTypes((visible) => !visible)}>Quiero promocionarme</button>{showTypes && <div><button type="button" onClick={() => setAccountType("provider")} aria-pressed={accountType === "provider"}>Quiero ser prestador</button><button type="button" onClick={() => setAccountType("business")} aria-pressed={accountType === "business"}>Soy un negocio</button></div>}<p>Crearás una {accountLabel}.</p></div> : <p className={styles.registrationIntent}>Crearás una {accountLabel}. Completarás tu perfil después.</p>}
  </form>;

  if (phase === "otp") return <form className={styles.registrationSimple} onSubmit={verify}>
    <div className={styles.registrationCopy}><h1>Ingresa el código que te enviamos por WhatsApp</h1><p>A tu número {phone}. <button type="button" className="text-link" onClick={changeNumber}>No es tu número, cambiar</button></p></div>
    <div className={styles.otpBoxes} aria-label="Código de seis dígitos">{code.map((digit, index) => <input key={index} ref={(element) => { otpRefs.current[index] = element; }} value={digit} onChange={(event) => updateCode(index, event.target.value)} onKeyDown={(event) => { if (event.key === "Backspace" && !code[index] && index) otpRefs.current[index - 1]?.focus(); }} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} aria-label={`Dígito ${index + 1}`} autoFocus={index === 0} />)}</div>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" aria-hidden /> : null} Verificar código</button>
    <p className={styles.resendCopy}>¿No recibiste el código?</p><button className="text-link" type="button" disabled={busy || resendIn > 0} onClick={resend}><RefreshCw size={16} aria-hidden /> {resendIn ? `Reenviar en ${resendIn} s` : "Reenviar código"}</button>
  </form>;

  return <form ref={detailsFormRef} className={styles.registrationDetails} data-mobile-step={mobileStep} onSubmit={event=>event.preventDefault()} noValidate>
    <div className={styles.registrationCopy}><p className={styles.mobileOnly}>Paso {mobileStep + 1} de 5</p><h1 className={styles.detailTitle}>{mobileStep === 0 ? "¡Bienvenido a Tequit!" : mobileStep === 1 ? "¿Cuál es tu apellido?" : mobileStep === 2 ? "Agrega un correo de recuperación" : mobileStep === 3 ? "Crea una contraseña" : "Acepta los acuerdos"}</h1>{mobileStep === 0 && <p>¿Cuál es tu nombre?</p>}{mobileStep === 2 && <p>Es opcional, pero te ayudará a recuperar tu acceso.</p>}</div>
    <div className={`${styles.detailsGrid} ${styles.detailsFieldName}`}><label htmlFor="register-first-name">Nombre<input className={styles.field} id="register-first-name" value={details.firstName} onChange={(event) => updateDetail("firstName", event.target.value)} autoComplete="given-name" /></label></div>
    <div className={`${styles.detailsGrid} ${styles.detailsFieldLast}`}><label htmlFor="register-last-name">Apellido<input className={styles.field} id="register-last-name" value={details.lastName} onChange={(event) => updateDetail("lastName", event.target.value)} autoComplete="family-name" /></label></div>
    <div className={`${styles.detailsGrid} ${styles.detailsFieldEmail}`}><label htmlFor="register-email">Correo de recuperación <span>(opcional)</span><input className={styles.field} id="register-email" type="email" value={details.recoveryEmail} onChange={(event) => updateDetail("recoveryEmail", event.target.value)} autoComplete="email" /></label></div>
    <div className={`${styles.detailsGrid} ${styles.detailsFieldPassword}`}><label htmlFor="register-password">Contraseña<div className={styles.passwordControl}><input className={styles.field} id="register-password" type={showPassword ? "text" : "password"} value={details.password} onChange={(event) => updateDetail("password", event.target.value)} autoComplete="new-password" /><button type="button" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}</button></div></label><label htmlFor="register-password-confirm">Repite tu contraseña<div className={styles.passwordControl}><input className={styles.field} id="register-password-confirm" type={showConfirmation ? "text" : "password"} value={details.confirmPassword} onChange={(event) => updateDetail("confirmPassword", event.target.value)} autoComplete="new-password" aria-invalid={Boolean(details.confirmPassword && details.password !== details.confirmPassword)} /><button type="button" aria-label={showConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowConfirmation((visible) => !visible)}>{showConfirmation ? <EyeOff aria-hidden /> : <Eye aria-hidden />}</button></div>{details.confirmPassword && details.password !== details.confirmPassword && <p className={styles.formError}>Las contraseñas no coinciden.</p>}</label></div>
    <div className={styles.detailsFieldLegal}><LegalConsentFields error={legalError} /></div>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <div className={styles.detailsActions}><button type="button" className={`btn btn-ghost ${styles.mobileOnly}`} onClick={() => setMobileStep((step) => Math.max(0, step - 1))} disabled={mobileStep === 0}><ArrowLeft aria-hidden /> Atrás</button>{mobileStep < 4 ? <button type="button" className={`btn btn-primary ${styles.mobileOnly}`} onClick={goNext}>Siguiente <ArrowRight aria-hidden /></button> : null}<button className={`btn btn-primary ${mobileStep === 4 ? "" : styles.desktopOnly}`} type="button" onClick={complete} disabled={busy}>{busy ? <Loader2 className="animate-spin" aria-hidden /> : null}{busy ? "Registrando…" : "Registrarse"}</button></div>
  </form>;
}
