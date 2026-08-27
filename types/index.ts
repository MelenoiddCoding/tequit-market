export type Plan = "free" | "pro";
export type PublicationStatus = "draft" | "active" | "suspended";
export type LeadStatus = "nueva" | "vista" | "interesado" | "no_me_interesa" | "contactado" | "cerrada";
export type VerificationType = "phone" | "identity" | "references" | "visited_by_tequit";

export interface Service { id: string; slug: string; name: string; category: string; aliases?: string[] }
export interface Review { id: string; author: string; rating: number; comment: string; date: string; status: "pending" | "approved" | "rejected"; source: "tequit_lead" | "invited_customer" }
export interface Verification { type: VerificationType; date?: string }
export interface Provider {
  id: string; slug: string; name: string; profession: string; bio: string; zone: string; areas: string[];
  rating: number; reviewCount: number; plan: Plan; status: PublicationStatus; services: Service[];
  verifications: Verification[]; reviews: Review[]; businessSlug?: string; businessName?: string; phone: string;
  featured?: boolean; portfolio: { id: string; title: string; description: string; image: string }[];
}
export interface Product { id: string; name: string; description: string }
export interface Business {
  id: string; slug: string; name: string; category: string; description: string; zone: string; address: string;
  rating: number; reviewCount: number; status: PublicationStatus; phone: string; services: Service[]; products: Product[];
  verifications: Verification[]; reviews: Review[]; providerSlugs: string[]; featured?: boolean;
}
export interface Lead {
  id: string; targetProviderSlug?: string; targetBusinessSlug?: string; requestedService: string; description: string;
  customerName: string; customerPhone: string; customerEmail?: string; zone: string; timing?: string; status: LeadStatus; createdAt: string;
}
export interface SearchResult { type: "provider" | "business"; score: number; provider?: Provider; business?: Business }
