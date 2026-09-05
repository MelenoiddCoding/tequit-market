"use client";
import Link from "next/link";
import {useEffect,useRef,useState}from "react";
import {ExternalLink,X}from "lucide-react";
import {LegalDocumentContent}from "@/components/legal-document-content";
import {legalDocuments,LEGAL_VERSION,type LegalDocumentType}from "@/lib/legal-documents";
import styles from "@/components/legal.module.css";

export function LegalConsentFields({error}:{error?:string}){const[open,setOpen]=useState<LegalDocumentType|null>(null);const[validationError,setValidationError]=useState("");const dialogRef=useRef<HTMLDialogElement>(null);const triggerRef=useRef<HTMLElement|null>(null);const activeDocument=open?legalDocuments[open]:null;const visibleError=error||validationError;
  useEffect(()=>{const dialog=dialogRef.current;if(open&&dialog&&!dialog.open){dialog.showModal();window.document.body.style.overflow="hidden";}return()=>{window.document.body.style.overflow=""}},[open]);
  function show(type:LegalDocumentType,event:React.MouseEvent<HTMLElement>){event.preventDefault();triggerRef.current=event.currentTarget;setOpen(type)}
  function close(){const dialog=dialogRef.current;if(dialog?.open)dialog.close();window.document.body.style.overflow="";setOpen(null);window.setTimeout(()=>triggerRef.current?.focus(),0)}
  return <fieldset className={styles.consent} aria-describedby={visibleError?"legal-consent-error":undefined}>
    <legend>Acuerdos legales</legend>
    <input type="hidden" name="termsVersion" value={LEGAL_VERSION}/><input type="hidden" name="privacyVersion" value={LEGAL_VERSION}/>
    <label><input type="checkbox" name="acceptTerms" value="true" required onChange={()=>setValidationError("")} onInvalid={()=>setValidationError("Debes aceptar ambos documentos para crear tu cuenta.")}/><span>He leído y acepto los <Link href="/terminos" onClick={event=>show("terms",event)}>Términos y Condiciones</Link>.</span></label>
    <label><input type="checkbox" name="acceptPrivacy" value="true" required onChange={()=>setValidationError("")} onInvalid={()=>setValidationError("Debes aceptar ambos documentos para crear tu cuenta.")}/><span>He leído y acepto el <Link href="/privacidad" onClick={event=>show("privacy",event)}>Aviso y Política de Privacidad</Link>.</span></label>
    <p className={styles.consentHelp}>Ambas aceptaciones son necesarias para crear tu cuenta. Consultar un documento no marca su casilla.</p>
    {visibleError&&<p id="legal-consent-error" className={styles.consentError} role="alert">{visibleError}</p>}
    <dialog ref={dialogRef} className={styles.modal} aria-labelledby="legal-modal-title" onCancel={event=>{event.preventDefault();close()}} onClick={event=>{if(event.target===event.currentTarget)close()}}>
      {activeDocument&&<div className={styles.modalPanel}><header className={styles.modalHeader}><div><p className="eyebrow">Versión {activeDocument.version}</p><h2 id="legal-modal-title">{activeDocument.title}</h2><p>Vigente desde {activeDocument.effectiveDate}</p></div><button type="button" onClick={close} aria-label="Cerrar documento" autoFocus><X aria-hidden/></button></header><div className={styles.modalScroll}><LegalDocumentContent document={activeDocument} compact/></div><footer className={styles.modalFooter}><Link href={open==="terms"?"/terminos":"/privacidad"} target="_blank">Abrir documento completo <ExternalLink size={16} aria-hidden/></Link><button className="btn btn-primary" type="button" onClick={close}>Cerrar</button></footer></div>}
    </dialog>
  </fieldset>}
