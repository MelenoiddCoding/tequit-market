"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {AssistedMediaEditor, type MediaRole} from "@/components/assisted-media-editor";
import {useAdminUpdate} from "@/components/admin-update-toast";
import {WebsitePortfolioMaintenance} from "@/components/website-portfolio-maintenance";
import {websiteProfileRequest} from "@/components/website-profile-form";
import {createClient} from "@/lib/supabase/client";
import type {Provider} from "@/types";
import styles from "@/components/website-workspace.module.css";

export function WebsiteMedia({provider,onboardingId,limit}:{provider:Provider;onboardingId:string;limit:number}){
  const router=useRouter();const showUpdate=useAdminUpdate();const[busy,setBusy]=useState(false);
  async function upload(files:File[],role:MediaRole):Promise<string[]>{
    setBusy(true);
    try{
      const id=onboardingId||(await websiteProfileRequest({action:"manage",providerId:provider.id})).id;
      const request=async(body:unknown)=>{const response=await fetch("/api/admin/onboardings/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw new Error(result.error);return result;};
      const prepared=await request({action:"prepare",onboardingId:id,files:files.map(file=>({type:file.type,size:file.size}))});
      const client=createClient();const paths:string[]=[];
      for(let i=0;i<prepared.uploads.length;i++){const target=prepared.uploads[i];const{error}=await client.storage.from("upload-quarantine").uploadToSignedUrl(target.path,target.token,files[i],{contentType:files[i].type});if(error)throw new Error("No se pudo subir la imagen.");paths.push(target.path);}
      const result=await request({action:"confirm",onboardingId:id,role,title:"Trabajo realizado",description:"",paths});
      showUpdate(result.failed?{mode:"warning",title:"Algunas imágenes no se guardaron",message:`${result.saved.length} guardadas; ${result.failed} no se pudieron procesar. Vuelve a seleccionar las faltantes.`}:{mode:"success",title:"Imágenes guardadas",message:"Las fotografías ya aparecen en la página y en el perfil."});router.refresh();
      return (result.saved as {path:string}[]).map(item=>`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${role==="avatar"?"avatars":"provider-work"}/${item.path}`);
    }catch(error){showUpdate({mode:"error",title:"No se guardaron las imágenes",message:error instanceof Error?error.message:"Inténtalo de nuevo."});return [];}finally{setBusy(false);}
  }
  return <div className={styles.workspace}><div><h2>Fotografías</h2><p className={styles.note}>Estas son las imágenes ya guardadas. Cambia únicamente las que necesites reemplazar.</p></div>
    <AssistedMediaEditor key={[provider.avatarPath,provider.site.coverPath,provider.portfolio.map(p=>p.id).join()].join("|")} kind="provider" initial={{avatar:provider.avatarImage,cover:provider.site.coverImage,portfolio:provider.portfolio.map(p=>p.image)}} maxPortfolioItems={limit} onUpload={upload} busy={busy}/>
    <WebsitePortfolioMaintenance provider={provider}/></div>;
}
