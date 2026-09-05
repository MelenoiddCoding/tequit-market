import "server-only";
import {createHash} from "node:crypto";
import type {SupabaseClient} from "@supabase/supabase-js";
import {legalDocuments,type LegalDocumentType} from "@/lib/legal-documents";

export type LegalConsentInput={acceptTerms:boolean;acceptPrivacy:boolean;termsVersion:string;privacyVersion:string};
export type LegalConsentResult={ok:true}|{ok:false;status:409|500;error:string};

function canonicalContent(type:LegalDocumentType){return JSON.stringify(legalDocuments[type]);}
export function legalDocumentHash(type:LegalDocumentType){return createHash("sha256").update(canonicalContent(type)).digest("hex");}
function requestIp(request:Request){return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||request.headers.get("x-real-ip")||"unknown";}

export async function recordLegalAcceptances(args:{admin:SupabaseClient;userId:string;source:"registration"|"claim";request:Request;input:LegalConsentInput}):Promise<LegalConsentResult>{
  const{admin,userId,source,request,input}=args;
  if(!input.acceptTerms||!input.acceptPrivacy)return{ok:false,status:409,error:"Debes aceptar los Términos y la Política de Privacidad."};
  const expected={terms:legalDocuments.terms.version,privacy:legalDocuments.privacy.version};
  if(input.termsVersion!==expected.terms||input.privacyVersion!==expected.privacy)return{ok:false,status:409,error:"Los documentos legales cambiaron. Recarga la página para revisar la versión vigente."};
  const{data,error}=await admin.from("legal_documents").select("id,document_type,version,content_sha256").eq("active",true).in("document_type",["terms","privacy"]);
  if(error||!data||data.length!==2)return{ok:false,status:500,error:"No pudimos comprobar los documentos legales. Intenta nuevamente."};
  const rows=[];
  for(const type of ["terms","privacy"] as const){const document=data.find(item=>item.document_type===type);if(!document||document.version!==expected[type]||document.content_sha256!==legalDocumentHash(type))return{ok:false,status:409,error:"Los documentos legales cambiaron. Recarga la página para revisar la versión vigente."};rows.push({user_id:userId,document_id:document.id,source,ip_hash:createHash("sha256").update(`${process.env.RATE_LIMIT_SALT||process.env.SUPABASE_SERVICE_ROLE_KEY||"tequit-beta"}:legal:${requestIp(request)}`).digest("hex"),user_agent:(request.headers.get("user-agent")||"").slice(0,500)});}
  const{error:insertError}=await admin.from("legal_acceptances").insert(rows);
  return insertError?{ok:false,status:500,error:"No pudimos guardar tu aceptación legal. No se creó la cuenta."}:{ok:true};
}
