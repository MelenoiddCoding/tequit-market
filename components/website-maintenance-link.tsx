"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardStyles as styles } from "@/components/dashboard-components";

export function WebsiteMaintenanceLink({ providerId }: { providerId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function open() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/onboardings", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({action: "manage", providerId}) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push(`/admin/altas/${result.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo abrir el perfil.");
      setBusy(false);
    }
  }
  return <div><button type="button" className={styles.secondary} onClick={open} disabled={busy}>{busy ? "Abriendo…" : "Administrar contacto, servicios y fotografías"}</button>{error && <p role="alert">{error}</p>}</div>;
}
