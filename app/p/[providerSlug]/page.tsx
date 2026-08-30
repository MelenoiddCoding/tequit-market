import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ProviderSite} from "@/components/provider-site";
import {getProviderBySlug} from "@/lib/marketplace";
import {providerUrl} from "@/lib/provider-site";

type PageProps={params:Promise<{providerSlug:string}>;searchParams:Promise<{ref?:string}>};
const clip=(value:string,length=158)=>value.length>length?`${value.slice(0,length-1).trim()}…`:value;

export async function generateMetadata({params}:PageProps):Promise<Metadata>{
  const{providerSlug}=await params;const provider=await getProviderBySlug(providerSlug);
  if(!provider)return{title:"Perfil no encontrado",robots:{index:false,follow:false}};
  const canonical=providerUrl(provider.slug);const description=clip(provider.site.intro||provider.bio);const title=`${provider.name} · ${provider.profession} en ${provider.zone}`;const image=`${canonical}/opengraph-image`;
  return{title,description,alternates:{canonical},robots:{index:provider.seo.eligible,follow:provider.seo.eligible},openGraph:{title,description,url:canonical,siteName:"Tequit",locale:"es_MX",type:"website",images:[{url:image,width:1200,height:630,alt:`${provider.name}, ${provider.profession}`}]},twitter:{card:"summary_large_image",title,description,images:[image]}};
}

export default async function ProviderPage({params,searchParams}:PageProps){
  const[{providerSlug},query]=await Promise.all([params,searchParams]);const provider=await getProviderBySlug(providerSlug);if(!provider)notFound();
  const canonical=providerUrl(provider.slug);const images=[provider.site.coverImage,provider.avatarImage,...provider.portfolio.map((item)=>item.image)].filter(Boolean) as string[];const sameAs=Object.values(provider.site.socialLinks).filter(Boolean);
  const jsonLd={"@context":"https://schema.org","@type":"ProfessionalService",name:provider.name,description:provider.site.intro||provider.bio,url:canonical,areaServed:[provider.zone,...provider.areas],serviceType:provider.services.map((service)=>service.name),...(provider.canContact?{telephone:provider.phone}:{}),...(images.length?{image:images}:{}),...(sameAs.length?{sameAs}:{}),...(provider.reviewCount?{aggregateRating:{"@type":"AggregateRating",ratingValue:provider.rating,reviewCount:provider.reviewCount}}:{})};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,"\\u003c")}}/><ProviderSite provider={provider} referrer={query.ref}/></>;
}
