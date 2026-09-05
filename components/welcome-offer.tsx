"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Check, Sparkles } from "lucide-react";
import styles from "@/components/welcome-offer.module.css";
export function WelcomeOffer({
  assignmentId,
  endsAt,
  months,
  value,
}: {
  assignmentId: string;
  endsAt: string;
  months: number;
  value: number;
}) {
  useEffect(() => {
    void fetch("/api/dashboard/welcome", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assignmentId }),
    });
  }, [assignmentId]);
  const date = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeZone: "America/Mexico_City",
  }).format(new Date(endsAt));
  return (
    <main className={styles.page}>
      <section className={styles.poster}>
        <div className={styles.mark}>
          <Sparkles aria-hidden />
        </div>
        <p className={styles.eyebrow}>Bienvenido a Tequit</p>
        <h1>
          Te regalamos
          <br />
          {months} {months === 1 ? "mes" : "meses"} Pro
        </h1>
        <p className={styles.value}>
          Valor de referencia:{" "}
          <strong>${value.toLocaleString("es-MX")} MXN</strong>
        </p>
        <div className={styles.details}>
          <span>
            <Check />
            15 servicios publicados
          </span>
          <span>
            <Check />
            10 trabajos en tu galería
          </span>
          <span>
            <Check />
            Solicitudes y analítica avanzada
          </span>
        </div>
        <p className={styles.expiry}>
          Tu regalo termina el {date}. Después pasarás a Free automáticamente.
        </p>
        <p className={styles.noCard}>Sin tarjeta · Sin renovación automática</p>
        <Link className="btn btn-primary" href="/dashboard">
          Conocer mi panel
        </Link>
      </section>
    </main>
  );
}
