import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { WebsiteProfileForm } from "@/components/website-profile-form";
import { requireRole } from "@/lib/auth";
import { getProviderTaxonomy } from "@/lib/taxonomy";
import {getDiscoveryAreas} from "@/lib/location-server";
import styles from "@/components/website-workspace.module.css";
export default async function Page(){
  await requireRole(["admin"]);
  const [categories,areas]=await Promise.all([getProviderTaxonomy(),getDiscoveryAreas()]);
  return <AdminShell><div className={styles.workspace}><header className={styles.header}><div><Link href="/admin/sitios">← Páginas</Link><h1>Nueva página</h1></div></header><div className={styles.body}><WebsiteProfileForm categories={categories} discoveryAreas={areas}/></div></div></AdminShell>;
}
