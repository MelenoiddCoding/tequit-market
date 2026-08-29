import { MonitorSmartphone } from "lucide-react";
import { SiteContainer } from "@/components/layout-primitives";
import { SavedList } from "@/components/saved-list";
import { getMarketplace } from "@/lib/marketplace";
export const dynamic="force-dynamic";
import styles from "@/components/identity-redesign.module.css";

export const metadata = {
  title: "Guardados",
  description: "Personas y negocios guardados en este dispositivo.",
};

export default async function SavedPage() {
  const {providers,businesses}=await getMarketplace();
  return <main className={styles.savedPage}>
    <SiteContainer>
      <header className={styles.savedHeader}>
        <p className="eyebrow">Tu selección local</p>
        <div className={styles.savedTitleRow}>
          <h1>Tus guardados</h1>
          <span className={styles.deviceBadge}><MonitorSmartphone size={16} aria-hidden /> En este dispositivo</span>
        </div>
        <p>Sin cuenta se conservan en este navegador. Al iniciar sesión se sincronizan entre tus dispositivos.</p>
      </header>
      <SavedList providers={providers} businesses={businesses} />
    </SiteContainer>
  </main>;
}
