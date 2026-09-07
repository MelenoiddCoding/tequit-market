"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/components/identity-redesign.module.css";

export function LoginForm({ next = "/dashboard", demo = false, sessionExpired = false, admin = false }: { next?: string; demo?: boolean; sessionExpired?: boolean;admin?:boolean }) {
  const router = useRouter();
  const [error, setError] = useState(sessionExpired ? "Tu sesión terminó. Inicia sesión de nuevo para continuar." : "");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No pudimos iniciar sesión.");
      router.push(body.mustChangePassword ? "/cuenta?password=required" : body.requiresPhoneMigration?`/cuenta/activar-celular?next=${encodeURIComponent(next)}`:body.role === "admin" ? "/admin" : next==="/admin"?"/cuenta":next==="/dashboard"?"/cuenta":next);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pudimos iniciar sesión. Revisa tu conexión e inténtalo otra vez.");
      setLoading(false);
    }
  }

  return <form className={styles.loginForm} onSubmit={submit} aria-busy={loading}>
    <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
      <label htmlFor="login-identifier">{admin?"Correo administrativo":"Número de celular"}</label>
      <input className={styles.field} id="login-identifier" name="identifier" inputMode={admin?"email":"tel"} type={admin?"email":"text"} defaultValue={demo ? admin?"admin@tequit.local":"provider@tequit.local" : ""} autoComplete="username" placeholder={admin?"admin@tequit.mx":"311 000 0000"} required />
    </div>
    <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
      <label htmlFor="login-password">Contraseña</label>
      <div className={styles.passwordControl}>
        <input className={styles.field} id="login-password" name="password" type={showPassword?"text":"password"} defaultValue={demo ? "Tequit123!" : ""} autoComplete="current-password" required />
        <button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?"Ocultar contraseña":"Mostrar contraseña"} aria-pressed={showPassword}>
          {showPassword
            ? <EyeOff size={20}/>
            : <Eye size={20}/>
          }
        </button>
      </div>
    </div>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <button className={`btn btn-primary ${styles.loginSubmit}`} disabled={loading} type="submit">
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : <LogIn size={18} aria-hidden />}
      {loading ? "Iniciando sesión…" : "Entrar a mi cuenta"}
    </button>
    <Link className={styles.forgotLink} href="/recuperar">Olvidé mi contraseña</Link>
    {!admin&&<p className={styles.loginMigration}>Si tu cuenta todavía usaba correo, escríbelo en el campo de celular.</p>}
  </form>;
}
