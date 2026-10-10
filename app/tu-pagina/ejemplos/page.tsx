import Link from "next/link";
import { ProviderSite } from "@/components/provider-site";
import { WEBSITE_TEMPLATES, websiteTemplate } from "@/lib/website-offer";
import { websiteDemoProvider } from "@/lib/website-demo-provider";
import type { Provider } from "@/types";
import styles from "./examples.module.css";

export const metadata = { title: "Plantillas para tu oficio", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ tema?: string; contenido?: string }> }) {
  const params = await searchParams;
  const template = websiteTemplate(params.tema as Provider["site"]["templateId"]) ?? WEBSITE_TEMPLATES[0];
  const sparse = params.contenido === "breve";
  const provider = websiteDemoProvider(template.id, template.accent, sparse);

  return <main>
    <div className={styles.examples}>
      <Link href="/">← Tequit</Link>
      <h1>Una página para presentar tu trabajo.</h1>
      <p>Ejemplo con los mismos datos y fotografías de Servi-Bombas en los once diseños. Contenido ilustrativo; los contactos están desactivados.</p>
      <nav className={styles.exampleNav} aria-label="Plantillas de ejemplo">
        {WEBSITE_TEMPLATES.map(item => <Link key={item.id} href={`?tema=${item.id}${sparse ? "&contenido=breve" : ""}`} aria-current={item.id === template.id ? "page" : undefined}>{item.name}</Link>)}
      </nav>
      <Link href={`?tema=${template.id}${sparse ? "" : "&contenido=breve"}`}>{sparse ? "Ver ejemplo con fotografías" : "Ver ejemplo sin fotografías"}</Link>
    </div>
    <ProviderSite provider={provider} customBranding preview />
  </main>;
}
