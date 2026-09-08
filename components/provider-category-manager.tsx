"use client";

import { useState } from "react";
import { ProviderCategorySelector } from "@/components/provider-category-selector";
import { DashboardSection, dashboardStyles as styles } from "@/components/dashboard-components";
import type { MarketplaceCategory } from "@/types";

export function ProviderCategoryManager({ providerId, categories, initialPrimaryId, initialSecondaryIds }: { providerId: string; categories: MarketplaceCategory[]; initialPrimaryId: string; initialSecondaryIds: string[] }) {
  const [primaryId, setPrimaryId] = useState(initialPrimaryId);
  const [secondaryIds, setSecondaryIds] = useState(initialSecondaryIds);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  function change(primary: string, secondary: string[]) { setPrimaryId(primary); setSecondaryIds(secondary); setMessage(""); }
  async function save() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/provider/categories", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ providerId, primaryId, secondaryIds }) });
    const body = await response.json(); setBusy(false);
    setMessage(response.ok ? "Categorías guardadas." : body.error ?? "No pudimos guardar tus categorías.");
  }
  return <DashboardSection title="Cómo se clasifica tu perfil" description="Elige una actividad principal y hasta dos complementarias. Tus servicios siguen siendo libres.">
    <div className={`${styles.surface} ${styles.form}`}>
      <ProviderCategorySelector categories={categories} primaryId={primaryId} secondaryIds={secondaryIds} onChange={change} disabled={busy} idPrefix="dashboard-category"/>
      <footer className={styles.formFooter}><span className={styles.savedNote} role="status">{message}</span><button className={styles.primary} type="button" onClick={save} disabled={busy || !primaryId}>{busy ? "Guardando…" : "Guardar categorías"}</button></footer>
    </div>
  </DashboardSection>;
}
