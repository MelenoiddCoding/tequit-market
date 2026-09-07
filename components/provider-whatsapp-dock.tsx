"use client";

import { useEffect, useState } from "react";
import { WhatsAppButton } from "@/components/whatsapp-button";
import styles from "@/components/provider-site.module.css";

export function ProviderWhatsAppDock({heroId,phone,message,slug}:{heroId:string;phone:string;message:string;slug:string}) {
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const target=document.getElementById(heroId);
    if(!target)return;
    const observer=new IntersectionObserver(([entry])=>setVisible(!entry.isIntersecting),{threshold:.01});
    observer.observe(target);
    return()=>observer.disconnect();
  },[heroId]);
  return <div className={`${styles.mobileDock} ${visible?styles.mobileDockVisible:""}`} aria-hidden={!visible} inert={!visible}>
    <WhatsAppButton phone={phone} message={message} label="WhatsApp" className={styles.whatsapp} targetSlug={slug} targetType="provider"/>
  </div>;
}
