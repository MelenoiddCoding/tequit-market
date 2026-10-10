"use client";
import { useEffect, useRef } from "react";

export function useUnsavedForm() {
  const dirty=useRef(false);
  useEffect(()=>{
    const unload=(event:BeforeUnloadEvent)=>{if(dirty.current){event.preventDefault();event.returnValue="";}};
    const navigate=(event:MouseEvent)=>{
      const link=(event.target as Element)?.closest?.("a");
      if(!dirty.current||!link||link.target==="_blank"||link.getAttribute("href")?.startsWith("#"))return;
      if(!window.confirm("Tienes cambios sin guardar. ¿Salir de esta sección?")){event.preventDefault();event.stopPropagation();}
    };
    window.addEventListener("beforeunload",unload);
    document.addEventListener("click",navigate,true);
    return ()=>{window.removeEventListener("beforeunload",unload);document.removeEventListener("click",navigate,true);};
  },[]);
  return {markChanged:()=>{dirty.current=true;},markSaved:()=>{dirty.current=false;}};
}
