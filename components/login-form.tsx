"use client";

import { FormEvent, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "@/components/identity-redesign.module.css";

export function LoginForm({ next = "/dashboard", demo = false, sessionExpired = false }: { next?: string; demo?: boolean; sessionExpired?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState(sessionExpired ? "Tu sesión terminó. Inicia sesión de nuevo para continuar." : "");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No pudimos iniciar sesión.");
      router.push(body.mustChangePassword ? "/cuenta?password=required" : body.role === "admin" ? "/admin" : next==="/admin"?"/cuenta":next==="/dashboard"?"/cuenta":next);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pudimos iniciar sesión. Revisa tu conexión e inténtalo otra vez.");
      setLoading(false);
    }
  }

  return <form className={styles.formGrid} onSubmit={submit} aria-busy={loading}>
    <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
      <label htmlFor="login-email">Correo</label>
      <input className={styles.field} id="login-email" name="email" type="email" defaultValue={demo ? "provider@tequit.local" : ""} autoComplete="email" required />
    </div>
    <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
      <label htmlFor="login-password">Contraseña</label>
      <input className={styles.field} id="login-password" name="password" type="password" defaultValue={demo ? "Tequit123!" : ""} autoComplete="current-password" required />
    </div>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <button className={`btn btn-primary ${styles.fieldGroupFull}`} disabled={loading} type="submit">
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : <LogIn size={18} aria-hidden />}
      {loading ? "Iniciando sesión…" : "Entrar a mi cuenta"}
    </button>
  </form>;
}
