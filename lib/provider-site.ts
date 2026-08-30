import type {Provider,ProviderSeoEligibility} from "@/types";

export const APP_URL=(process.env.NEXT_PUBLIC_APP_URL??"https://tequit-market.vercel.app").replace(/\/$/,"");
export function providerUrl(slug:string){return `${APP_URL}/p/${slug}`}
export function providerSeoEligibility(provider:Pick<Provider,"bio"|"phone"|"services"|"portfolio"|"isDemo"|"status">):ProviderSeoEligibility{
  const checks={
    bio:provider.bio.trim().length>=120,
    phone:provider.phone.replace(/\D/g,"").length>=10,
    service:provider.services.some((service)=>service.name.trim().length>=3&&(service.description?.trim().length??0)>=40),
    portfolio:provider.portfolio.some((work)=>Boolean(work.image)&&work.title.trim().length>=3&&work.description.trim().length>=40),
  };
  const labels={bio:"Escribe una presentación de al menos 120 caracteres.",phone:"Agrega un WhatsApp válido.",service:"Publica un servicio con una descripción de al menos 40 caracteres.",portfolio:"Publica un trabajo con foto y descripción de al menos 40 caracteres."};
  const missing=(Object.keys(checks) as Array<keyof typeof checks>).filter((key)=>!checks[key]).map((key)=>labels[key]);
  return{eligible:provider.status==="active"&&!provider.isDemo&&missing.length===0,checks,missing};
}
