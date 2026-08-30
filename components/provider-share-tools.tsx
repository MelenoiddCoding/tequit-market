"use client";

import Image from "next/image";
import {useEffect,useState} from "react";
import {Check,Copy,Download,QrCode,Share2} from "lucide-react";
import QRCode from "qrcode";

export function ProviderShareTools({slug,name,compact=false}:{slug:string;name:string;compact?:boolean}){
  const url=`${process.env.NEXT_PUBLIC_APP_URL??"https://tequit-market.vercel.app"}/p/${slug}`;const[qr,setQr]=useState("");const[copied,setCopied]=useState(false);
  useEffect(()=>{QRCode.toDataURL(`${url}?ref=qr`,{width:420,margin:2,color:{dark:"#183225",light:"#fff9f0"}}).then(setQr)},[url]);
  async function track(){await fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"share_action",target:slug,targetType:"provider"})})}
  async function copy(){await navigator.clipboard.writeText(`${url}?ref=share`);await track();setCopied(true);window.setTimeout(()=>setCopied(false),1800)}
  async function share(){if(navigator.share){await navigator.share({title:`${name} en Tequit`,text:`Conoce los servicios de ${name}`,url:`${url}?ref=share`});await track()}else await copy()}
  async function download(format:"png"|"svg"){const qrUrl=`${url}?ref=qr`;const content=format==="png"?await QRCode.toDataURL(qrUrl,{width:1200,margin:3}):await QRCode.toString(qrUrl,{type:"svg",margin:3});const anchor=document.createElement("a");anchor.download=`qr-${slug}.${format}`;anchor.href=format==="png"?content:URL.createObjectURL(new Blob([content],{type:"image/svg+xml"}));anchor.click();if(format==="svg")URL.revokeObjectURL(anchor.href);await track()}
  return <div className={compact?"provider-share provider-share-compact":"provider-share"}>{!compact&&qr&&<Image src={qr} alt={`Código QR del sitio de ${name}`} width={190} height={190}/>}<div className="provider-share-actions"><button className="btn btn-secondary" type="button" onClick={share}><Share2 size={17}/><span>Compartir</span></button><button className="btn btn-secondary" type="button" onClick={copy}>{copied?<Check size={17}/>:<Copy size={17}/>}<span>{copied?"Copiado":"Copiar enlace"}</span></button>{!compact&&<><button className="btn btn-secondary" type="button" onClick={()=>download("png")}><Download size={17}/>QR PNG</button><button className="btn btn-secondary" type="button" onClick={()=>download("svg")}><QrCode size={17}/>QR SVG</button></>}</div></div>
}
