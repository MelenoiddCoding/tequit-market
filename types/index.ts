export type Plan = "free" | "basic" | "pro" | "premium";
export type PublicationStatus = "draft" | "active" | "suspended";
export type LeadStatus = "nueva" | "vista" | "interesado" | "no_me_interesa" | "contactado" | "cerrada";
export type VerificationType = "phone" | "identity" | "references" | "visited_by_tequit";

export interface Service { id: string; slug: string; name: string; category: string; description?: string; aliases?: string[] }
export interface ProviderFaq { id:string;question:string;answer:string;sortOrder:number;active:boolean }
export interface ProviderSiteSettings { headline:string;intro:string;yearsExperience?:number;coverImage?:string;coverPath?:string;theme:"tequit"|"claro"|"oscuro"|"tierra";accentColor:string;whiteLabel:boolean;socialLinks:{facebook?:string;instagram?:string;tiktok?:string;website?:string} }
export interface ProviderSeoEligibility { eligible:boolean;checks:{bio:boolean;phone:boolean;service:boolean;portfolio:boolean};missing:string[] }
export interface Review { id: string; author: string; rating: number; comment: string; date: string; status: "pending" | "approved" | "rejected"; source: "tequit_lead" | "invited_customer" }
export interface Verification { type: VerificationType; date?: string }
export interface Provider {
  id: string; slug: string; name: string; profession: string; bio: string; zone: string; areas: string[];
  rating: number; reviewCount: number; plan: Plan; status: PublicationStatus; services: Service[];
  verifications: Verification[]; reviews: Review[]; businessSlug?: string; businessName?: string; phone: string; showPhoneCall?:boolean;
  featured?: boolean; portfolio: { id: string; title: string; description: string; image: string; path?: string }[];
  isDemo?: boolean; canContact?: boolean;avatarImage?:string;avatarPath?:string;updatedAt:string;site:ProviderSiteSettings;faqs:ProviderFaq[];seo:ProviderSeoEligibility;
}
export interface Product { id: string; name: string; description: string }
export interface Business {
  id: string; slug: string; name: string; category: string; description: string; zone: string; address: string;
  rating: number; reviewCount: number; status: PublicationStatus; phone: string; services: Service[]; products: Product[];
  verifications: Verification[]; reviews: Review[]; providerSlugs: string[]; featured?: boolean;
  isDemo?: boolean; canContact?: boolean;
  portfolio?: { id: string; title: string; description: string; image: string; path?: string }[];
}
export interface Lead {
  id: string; targetProviderSlug?: string; targetBusinessSlug?: string; requestedService: string; description: string;
  customerName: string; customerPhone: string; customerEmail?: string; zone: string; timing?: string; status: LeadStatus; createdAt: string;
}
export interface SearchResult { type: "provider" | "business"; score: number; provider?: Provider; business?: Business }
