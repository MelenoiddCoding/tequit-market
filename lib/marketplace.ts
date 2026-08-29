import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Business, Provider, Review, Service, Verification } from "@/types";

type CategoryRow = { name: string } | null;
type CanonicalRow = { id: string; slug: string; name: string; service_categories: CategoryRow; service_aliases?: Array<{alias:string}> } | null;
type ServiceRow = { id: string; title: string; active: boolean; canonical_services: CanonicalRow };
type MediaRow = { id: string; title: string | null; description?: string | null; storage_path: string };
type VerificationRow = { type: Verification["type"]; verified_at: string };
type ReviewRow = { id: string; customer_name: string; rating: number; comment: string; created_at: string; status: Review["status"]; review_requests: { source: Review["source"] } | null };
type AreaRow = { service_areas: { name: string } | null };
type ProviderAffiliationRow = { status: string; businesses: { slug: string; name: string } | null };
type ProviderRow = {
  id:string;slug:string;name:string;profession:string;bio:string;phone:string;zone:string;plan:Provider["plan"];status:Provider["status"];
  rating:number|string;review_count:number;avatar_path:string|null;is_demo:boolean;provider_services:ServiceRow[];provider_media:MediaRow[];
  provider_verifications:VerificationRow[];reviews:ReviewRow[];provider_service_areas:AreaRow[];provider_business_affiliations:ProviderAffiliationRow[];
};
type ProductRow = { id:string;name:string;description:string;image_path:string|null;active:boolean };
type BusinessAffiliationRow = { status:string;provider_profiles:{slug:string}|null };
type BusinessRow = {
  id:string;slug:string;name:string;description:string;phone:string;zone:string;address:string|null;status:Business["status"];
  rating:number|string;review_count:number;logo_path:string|null;cover_path:string|null;is_demo:boolean;service_categories:CategoryRow;
  business_services:ServiceRow[];business_products:ProductRow[];business_media:MediaRow[];business_verifications:VerificationRow[];
  reviews:ReviewRow[];provider_business_affiliations:BusinessAffiliationRow[];
};

function storageUrl(bucket:string,path:string|null|undefined){const base=process.env.NEXT_PUBLIC_SUPABASE_URL;return base&&path?`${base}/storage/v1/object/public/${bucket}/${path}`:"/images/tequit-hero.png"}
function mapService(row:ServiceRow):Service{const canonical=row.canonical_services;return{id:row.id,slug:canonical?.slug??row.id,name:row.title,category:canonical?.service_categories?.name??"Otro",aliases:canonical?.service_aliases?.map((item)=>item.alias)??[]}}
function mapReview(row:ReviewRow):Review{return{id:row.id,author:row.customer_name,rating:row.rating,comment:row.comment,date:row.created_at.slice(0,10),status:row.status,source:row.review_requests?.source??"invited_customer"}}
function mapProvider(row:ProviderRow):Provider{const affiliation=row.provider_business_affiliations.find((item)=>item.status==="active")?.businesses;return{
  id:row.id,slug:row.slug,name:row.name,profession:row.profession,bio:row.bio,zone:row.zone,areas:row.provider_service_areas.flatMap((item)=>item.service_areas?.name?[item.service_areas.name]:[]),
  rating:Number(row.rating),reviewCount:row.review_count,plan:row.plan,status:row.status,phone:row.phone,services:row.provider_services.filter((item)=>item.active).map(mapService),
  verifications:row.provider_verifications.map((item)=>({type:item.type,date:item.verified_at.slice(0,10)})),reviews:row.reviews.filter((item)=>item.status==="approved").map(mapReview),
  portfolio:row.provider_media.map((item)=>({id:item.id,title:item.title??"Trabajo realizado",description:item.description??"",image:storageUrl("provider-work",item.storage_path),path:item.storage_path})),
  businessSlug:affiliation?.slug,businessName:affiliation?.name,isDemo:row.is_demo,canContact:!row.is_demo,
}}
function mapBusiness(row:BusinessRow):Business{return{
  id:row.id,slug:row.slug,name:row.name,description:row.description,phone:row.phone,zone:row.zone,address:row.address??row.zone,category:row.service_categories?.name??"Negocio local",
  rating:Number(row.rating),reviewCount:row.review_count,status:row.status,services:row.business_services.filter((item)=>item.active).map(mapService),
  products:row.business_products.filter((item)=>item.active).map((item)=>({id:item.id,name:item.name,description:item.description})),
  verifications:row.business_verifications.map((item)=>({type:item.type,date:item.verified_at.slice(0,10)})),reviews:row.reviews.filter((item)=>item.status==="approved").map(mapReview),
  providerSlugs:row.provider_business_affiliations.flatMap((item)=>item.status==="active"&&item.provider_profiles?.slug?[item.provider_profiles.slug]:[]),isDemo:row.is_demo,canContact:!row.is_demo,portfolio:row.business_media.map((item)=>({id:item.id,title:item.title??"Trabajo publicado",description:"",image:storageUrl("business-media",item.storage_path),path:item.storage_path})),
}}

const providerSelect=`id,slug,name,profession,bio,phone,zone,plan,status,rating,review_count,avatar_path,is_demo,provider_services(id,title,active,canonical_services(id,slug,name,service_categories(name),service_aliases(alias))),provider_media(id,title,description,storage_path),provider_verifications(type,verified_at),reviews(id,customer_name,rating,comment,created_at,status,review_requests(source)),provider_service_areas(service_areas(name)),provider_business_affiliations(status,businesses(slug,name))`;
const businessSelect=`id,slug,name,description,phone,zone,address,status,rating,review_count,logo_path,cover_path,is_demo,service_categories(name),business_services(id,title,active,canonical_services(id,slug,name,service_categories(name),service_aliases(alias))),business_products(id,name,description,image_path,active),business_media(id,title,storage_path),business_verifications(type,verified_at),reviews(id,customer_name,rating,comment,created_at,status,review_requests(source)),provider_business_affiliations(status,provider_profiles(slug))`;

export async function getProviders(options:{includeInactive?:boolean}={}):Promise<Provider[]>{const client=createAdminClient();if(!client)return[];let query=client.from("provider_profiles").select(providerSelect).order("rating",{ascending:false});if(!options.includeInactive)query=query.eq("status","active");const{data,error}=await query;if(error){console.error("provider query",error.message);return[]}return(data as unknown as ProviderRow[]).map(mapProvider)}
export async function getBusinesses(options:{includeInactive?:boolean}={}):Promise<Business[]>{const client=createAdminClient();if(!client)return[];let query=client.from("businesses").select(businessSelect).order("rating",{ascending:false});if(!options.includeInactive)query=query.eq("status","active");const{data,error}=await query;if(error){console.error("business query",error.message);return[]}return(data as unknown as BusinessRow[]).map(mapBusiness)}
export async function getProviderBySlug(slug:string){return(await getProviders()).find((item)=>item.slug===slug)}
export async function getBusinessBySlug(slug:string){return(await getBusinesses()).find((item)=>item.slug===slug)}
export async function getServices():Promise<Service[]>{const client=createAdminClient();if(!client)return[];const{data,error}=await client.from("canonical_services").select("id,slug,name,service_categories(name),service_aliases(alias)").eq("active",true).order("name");if(error){console.error("services query",error.message);return[]}return(data as unknown as Array<{id:string;slug:string;name:string;service_categories:CategoryRow;service_aliases:Array<{alias:string}>}>).map((row)=>({id:row.id,slug:row.slug,name:row.name,category:row.service_categories?.name??"Otro",aliases:row.service_aliases.map((item)=>item.alias)}))}
export async function getMarketplace(){const[providers,businesses,services]=await Promise.all([getProviders(),getBusinesses(),getServices()]);return{providers,businesses,services}}
