import type{Metadata}from "next";
import {LegalDocumentContent}from "@/components/legal-document-content";
import {privacyDocument}from "@/lib/legal-documents";
export const metadata:Metadata={title:"Aviso y Política de Privacidad",description:privacyDocument.summary,alternates:{canonical:"/privacidad"}};
export default function PrivacyPage(){return <main><LegalDocumentContent document={privacyDocument}/></main>}
