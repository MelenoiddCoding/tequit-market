import type{Metadata}from "next";
import {LegalDocumentContent}from "@/components/legal-document-content";
import {termsDocument}from "@/lib/legal-documents";
export const metadata:Metadata={title:"Términos y Condiciones",description:termsDocument.summary,alternates:{canonical:"/terminos"}};
export default function TermsPage(){return <main><LegalDocumentContent document={termsDocument}/></main>}
