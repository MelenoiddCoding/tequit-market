"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Provider } from "@/types";
import {useAdminUpdate} from "@/components/admin-update-toast";
import { dashboardStyles as styles } from "@/components/dashboard-components";
export function WebsitePortfolioMaintenance({provider}:{provider:Provider}) {
  const router=useRouter();
  const showUpdate=useAdminUpdate();
  const [busy,setBusy]=useState(false);
  async function save(event:React.FormEvent<HTMLFormElement>,id:string) {
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const action=(event.nativeEvent as SubmitEvent).submitter?.getAttribute("value")==="delete"?"delete":"update";
    if(action==="delete"&&!window.confirm("¿Quitar este trabajo del perfil y del sitio?"))return;
    setBusy(true);
    try {
      const response=await fetch("/api/admin/portfolio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,providerId:provider.id,id,...(action==="update"?{title:form.get("title"),description:form.get("description")}: {})})});
      const result=await response.json();if(!response.ok)throw new Error(result.error);
      showUpdate({mode:"success",title:action==="delete"?"Trabajo retirado":"Trabajo actualizado",message:action==="delete"?"La fotografía ya no aparece en el sitio ni en el perfil.":"Los cambios de esta fotografía ya están guardados."});router.refresh();
    }catch(error){showUpdate({mode:"error",title:"No se guardó el trabajo",message:error instanceof Error?error.message:"Inténtalo de nuevo."});}finally{setBusy(false);}
  }
  return <section className={styles.stack}><h2>Fotografías y descripciones</h2><p>Estos trabajos aparecen también en el perfil gratuito. Agrega nuevas fotografías en la sección superior.</p>{provider.portfolio.map(work=><form key={work.id} className={styles.form} onSubmit={event=>save(event,work.id)}><Image src={work.image} alt={work.title} width={180} height={120} style={{objectFit:"cover",width:180,height:120}}/><label className={styles.fieldGroup}>Título<input name="title" className={styles.field} defaultValue={work.title} minLength={3} maxLength={120} required/></label><label className={styles.fieldGroup}>Descripción<textarea name="description" className={styles.textarea} defaultValue={work.description} maxLength={500}/></label><div className={styles.formFooter}><button className={styles.secondary} value="update" disabled={busy}>Guardar trabajo</button><button className={styles.danger} value="delete" formNoValidate disabled={busy}>Quitar trabajo</button></div></form>)}{!provider.portfolio.length&&<p>No hay trabajos publicados todavía.</p>}</section>;
}
