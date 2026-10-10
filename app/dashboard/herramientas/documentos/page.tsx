import {DashboardContent} from "@/components/dashboard-shell";
import {CommercialDocumentsManager} from "@/components/commercial-documents-manager";
import {getDashboardContext} from "@/lib/dashboard";
import {createAdminClient} from "@/lib/supabase/admin";
import type {CommercialDocument} from "@/lib/commercial-documents";
export default async function DocumentsPage(){const context=await getDashboardContext();if(context.kind!=="provider")return null;const{data}=await createAdminClient()!.from("commercial_documents").select("*,commercial_document_items(*)").eq("provider_id",context.entity.id).order("created_at",{ascending:false});return <DashboardContent><CommercialDocumentsManager initialDocuments={(data??[]) as CommercialDocument[]} initialCanEdit={context.planDetails.entitlements.quotes&&context.planDetails.entitlements.workOrdersPdf}/></DashboardContent>}
