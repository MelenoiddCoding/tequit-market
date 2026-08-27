"use client";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
export function WhatsAppButton({phone,message,label="Contactar por WhatsApp",className="btn btn-primary"}:{phone:string;message:string;label?:string;className?:string}){async function click(){try{await fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"whatsapp_click",target:phone})})}finally{window.open(buildWhatsAppUrl(phone,message),"_blank","noopener,noreferrer")}}return <button type="button" onClick={click} className={className} aria-label={label}><MessageCircle size={19}/>{label}</button>}
