import { MonitorSmartphone } from "lucide-react";
import { SiteContainer } from "@/components/layout-primitives";
import { SavedList } from "@/components/saved-list";
import styles from "@/components/identity-redesign.module.css";

export const metadata = {
  title: "Guardados",
  description: "Personas y negocios guardados en este dispositivo.",
};

export default function SavedPage() {
  return <main className={styles.savedPage}>
    <SiteContainer>
      <header className={styles.savedHeader}>
        <p className="eyebrow">Tu selección local</p>
        <div className={styles.savedTitleRow}>
          <h1>Tus guardados</h1>
          <span className={styles.deviceBadge}><MonitorSmartphone size={16} aria-hidden /> En este dispositivo</span>
        </div>
        <p>Se conservan en este navegador y no se sincronizan con otros dispositivos. No necesitas crear una cuenta para guardar.</p>
      </header>
      <SavedList />
    </SiteContainer>
  </main>;
}
