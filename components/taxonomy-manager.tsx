"use client";

import { FormEvent, useState } from "react";
import { Edit3, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CanonicalProviderCategory, MarketplaceCategory } from "@/types";
import { dashboardStyles } from "@/components/dashboard-components";
import styles from "@/components/taxonomy-manager.module.css";

type ParentDraft = { id: string | null; name: string; description: string; active: boolean };
type CanonicalDraft = ParentDraft & { parentId: string; aliases: string; requiresReview: boolean };
const emptyParent: ParentDraft = { id: null, name: "", description: "", active: true };

export function TaxonomyManager({ categories, searchInsights = [] }: { categories: MarketplaceCategory[]; searchInsights?: Array<{ query: string; count: number; zeroCount: number }> }) {
  const router = useRouter();
  const [parent, setParent] = useState<ParentDraft>(emptyParent);
  const [canonical, setCanonical] = useState<CanonicalDraft>({ ...emptyParent, parentId: categories[0]?.id ?? "", aliases: "", requiresReview: false });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>, value: Record<string, unknown>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const response = await fetch("/api/admin/taxonomy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(value) });
    const body = await response.json(); setBusy(false);
    if (!response.ok) return setMessage(body.error ?? "No pudimos guardar.");
    setMessage("Taxonomía guardada."); setParent(emptyParent); setCanonical({ ...emptyParent, parentId: categories[0]?.id ?? "", aliases: "", requiresReview: false }); router.refresh();
  }
  function editParent(category: MarketplaceCategory) { setParent({ id: category.id, name: category.name, description: category.description, active: category.active }); }
  function editCanonical(category: MarketplaceCategory, item: CanonicalProviderCategory) { setCanonical({ id: item.id, parentId: category.id, name: item.name, description: item.description, active: item.active, aliases: (item.aliases ?? []).join(", "), requiresReview: item.requiresReview }); }
  return <div className={styles.manager}>
    <div className={styles.catalog}>{categories.map((category) => <section key={category.id}><header><div><strong>{category.name}</strong><span>{category.canonicalCategories.length} categorías canónicas · {category.active ? "Activa" : "Inactiva"}</span></div><button type="button" onClick={() => editParent(category)} aria-label={`Editar ${category.name}`}><Edit3 size={16}/></button></header><div>{category.canonicalCategories.map((item) => <button type="button" className={item.active ? styles.canonical : styles.inactive} onClick={() => editCanonical(category, item)} key={item.id}><span>{item.name}</span>{item.requiresReview && <small>Revisión profesional</small>}</button>)}</div></section>)}</div>
    <div className={styles.editors}>
      <form className={dashboardStyles.form} onSubmit={(event) => submit(event, { kind: "parent", ...parent })}><h3>{parent.id ? "Editar categoría principal" : "Nueva categoría principal"}</h3><label><span>Nombre</span><input className={dashboardStyles.field} value={parent.name} onChange={(event) => setParent({ ...parent, name: event.target.value })} required/></label><label><span>Descripción</span><textarea className={dashboardStyles.textarea} value={parent.description} onChange={(event) => setParent({ ...parent, description: event.target.value })}/></label><label className={styles.check}><input type="checkbox" checked={parent.active} onChange={(event) => setParent({ ...parent, active: event.target.checked })}/> Disponible</label><button className={dashboardStyles.primary} disabled={busy}><Plus size={17}/>{parent.id ? "Guardar categoría" : "Crear categoría"}</button></form>
      <form className={dashboardStyles.form} onSubmit={(event) => submit(event, { kind: "canonical", id: canonical.id, name: canonical.name, description: canonical.description, active: canonical.active, parentId: canonical.parentId, aliases: canonical.aliases.split(",").map((alias) => alias.trim()).filter(Boolean), requiresReview: canonical.requiresReview })}><h3>{canonical.id ? "Editar categoría canónica" : "Nueva categoría canónica"}</h3><label><span>Categoría principal</span><select className={dashboardStyles.select} value={canonical.parentId} onChange={(event) => setCanonical({ ...canonical, parentId: event.target.value })} required>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label><span>Nombre</span><input className={dashboardStyles.field} value={canonical.name} onChange={(event) => setCanonical({ ...canonical, name: event.target.value })} required/></label><label><span>Descripción</span><textarea className={dashboardStyles.textarea} value={canonical.description} onChange={(event) => setCanonical({ ...canonical, description: event.target.value })}/></label><label><span>Alias separados por coma</span><input className={dashboardStyles.field} value={canonical.aliases} onChange={(event) => setCanonical({ ...canonical, aliases: event.target.value })} placeholder="eléctrico, instalaciones eléctricas"/></label><div className={styles.checks}><label className={styles.check}><input type="checkbox" checked={canonical.active} onChange={(event) => setCanonical({ ...canonical, active: event.target.checked })}/> Disponible</label><label className={styles.check}><input type="checkbox" checked={canonical.requiresReview} onChange={(event) => setCanonical({ ...canonical, requiresReview: event.target.checked })}/> Actividad regulada</label></div><button className={dashboardStyles.primary} disabled={busy}><Plus size={17}/>{canonical.id ? "Guardar categoría canónica" : "Crear categoría canónica"}</button></form>
    </div>
    <section className={styles.insights}><h3>Oportunidades de búsqueda</h3><p>Términos recientes que pueden necesitar un alias o una categoría nueva.</p>{searchInsights.length ? <div>{searchInsights.map((item) => <span key={item.query}><strong>{item.query}</strong><small>{item.count} búsquedas · {item.zeroCount} sin resultados</small></span>)}</div> : <p>Aún no hay búsquedas registradas.</p>}</section>
    {message && <p role="status" className={styles.message}>{message}</p>}
  </div>;
}
