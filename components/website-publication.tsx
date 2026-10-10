"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {websiteProfileRequest} from "@/components/website-profile-form";
import {useAdminUpdate} from "@/components/admin-update-toast";
import {dashboardStyles as styles} from "@/components/dashboard-components";
export function WebsiteProfilePublication({id}:{id:string}){
 const router=useRouter();const showUpdate=useAdminUpdate();const[busy,setBusy]=useState(false);
 async function publish(){setBusy(true);try{await websiteProfileRequest({action:"publish",id});showUpdate({mode:"success",title:"Ficha publicada en Tequit",message:"Puedes continuar con el pago y la publicación de la página."});router.refresh();}catch(error){showUpdate({mode:"error",title:"No se publicó la ficha",message:error instanceof Error?error.message:"Inténtalo de nuevo."});}finally{setBusy(false);}}
 return <div><p>Publica primero la ficha del directorio. Requiere autorización, contacto, presentación y al menos un servicio guardados.</p><button className={styles.secondary} disabled={busy||!id} onClick={publish}>{busy?"Publicando…":"Publicar ficha en Tequit"}</button></div>;
}
