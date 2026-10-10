"use client";
import { WEBSITE_TEMPLATES, websiteTemplate, type WebsiteTemplateId } from "@/lib/website-offer";
import { dashboardStyles as styles } from "@/components/dashboard-components";

export function WebsiteTemplatePicker({value,onChange}:{value:WebsiteTemplateId;onChange:(value:WebsiteTemplateId)=>void}) {
  const selected=WEBSITE_TEMPLATES.find(t=>t.id===value);
  return <div className={styles.fieldGroup}>
    <label htmlFor="website-template">Diseño de la página</label>
    <select id="website-template" className={styles.select} value={value} onChange={e=>onChange(e.target.value as WebsiteTemplateId)}>
      {!selected && <option value={value}>{websiteTemplate(value)?.name??"Diseño anterior"} (actual)</option>}
      {WEBSITE_TEMPLATES.map((t,i)=><option key={t.id} value={t.id}>{String(i+1).padStart(2,"0")} · {t.name}</option>)}
    </select>
    <p className={styles.help}>{selected?.description??"El sitio conserva su diseño anterior hasta que elijas otro."}</p>
    <div>{selected && <a className={styles.secondary} href={`/demos/${selected.demo}.html`} target="_blank" rel="noopener noreferrer">Ver ejemplo de {selected.name}</a>} <a className={styles.ghost} href="/demos/index.html" target="_blank" rel="noopener noreferrer">Comparar los 11 diseños</a></div>
  </div>;
}
