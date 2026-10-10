import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { dashboardStyles as ui } from "@/components/dashboard-components";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "@/components/website-workspace.module.css";

export default async function Page({searchParams}:{searchParams:Promise<{q?:string;page?:string;provider?:string}>}) {
  await requireRole(["admin"]);
  const params=await searchParams;
  if(params.provider && /^[0-9a-f-]{36}$/i.test(params.provider)) redirect(`/admin/sitios/${params.provider}?seccion=publicacion`);
  const q=(params.q??"").trim().slice(0,100);
  const page=Math.max(1,Math.min(10000,Number.parseInt(params.page??"1",10)||1));
  const size=20;
  let query=createAdminClient()!.from("provider_profiles").select("id,name,profession,status,slug",{count:"exact"}).eq("is_demo",false).order("updated_at",{ascending:false}).order("id");
  if(q) query=query.ilike("name",`%${q.replace(/[%_]/g,"")}%`);
  const {data:providers,count,error}=await query.range((page-1)*size,page*size-1);
  const pageUrl=(p:number)=>`/admin/sitios?q=${encodeURIComponent(q)}&page=${p}`;
  return <AdminShell><div className={styles.workspace}>
    <header className={styles.header}><div><h1>Páginas</h1><p>Crea, prepara y publica desde un solo lugar.</p></div><div className={styles.actions}><Link className={ui.secondary} href="/tu-pagina/ejemplos" target="_blank">Ver temas</Link><Link className={ui.primary} href="/admin/sitios/nuevo">Nueva página</Link></div></header>
    <form className={styles.search}><label className={ui.fieldGroup}>Buscar por nombre<input className={ui.field} name="q" defaultValue={q} maxLength={100} placeholder="Nombre del prestador o de su servicio"/></label><button className={ui.secondary}>Buscar</button>{q&&<Link className={ui.ghost} href="/admin/sitios">Limpiar</Link>}</form>
    {error?<p role="alert">No se pudieron cargar las páginas. Vuelve a intentarlo.</p>:<><p className={styles.note}>{count??0} prestadores. Abre uno para preparar su página o crea una nueva.</p><ul className={styles.list}>{providers?.map(p=><li key={p.id}><div><strong>{p.name}</strong><small>{p.profession} · Ficha {p.status==="active"?"publicada":p.status==="draft"?"en borrador":"suspendida"}</small></div><Link className={ui.secondary} href={`/admin/sitios/${p.id}`}>Abrir página</Link></li>)}</ul>{!providers?.length&&<p>No hay resultados. Puedes cambiar la búsqueda o crear una página.</p>}<nav className={styles.actions} aria-label="Páginas de resultados">{page>1&&<Link className={ui.secondary} href={pageUrl(page-1)}>Anterior</Link>}<span>Página {page} de {Math.max(1,Math.ceil((count??0)/size))}</span>{page*size<(count??0)&&<Link className={ui.secondary} href={pageUrl(page+1)}>Siguiente</Link>}</nav></>}
  </div></AdminShell>;
}
