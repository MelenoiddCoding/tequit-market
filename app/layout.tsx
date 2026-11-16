import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { PublicChrome } from "@/components/navigation";
import { cookies, headers } from "next/headers";
import { LOCATION_COOKIE, marketCityForDiscovery, parseDiscoveryLocation } from "@/lib/location";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Tequit — Encuentra quién le sabe", template: "%s | Tequit" },
  description: "Encuentra personas y negocios en Tepic y Uruapan que pueden hacer el trabajo que necesitas.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: { title: "Tequit", description: "Encuentra quién le sabe en Tepic.", type: "website" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const ipCity = (await headers()).get("x-vercel-ip-city");
  const savedLocation = parseDiscoveryLocation((await cookies()).get(LOCATION_COOKIE)?.value);
  const savedCity = savedLocation ? marketCityForDiscovery(savedLocation, []) : null;
  const initialCity = savedLocation?.source === "browser" && !savedCity ? "Elegir ciudad" : savedCity === "uruapan" || /uruapan/i.test(savedLocation?.label ?? "") ? "Uruapan" : "Tepic";
  return <html lang="es-MX" data-scroll-behavior="smooth" className={`${manrope.variable} ${fraunces.variable}`}><body><PublicChrome ipCity={ipCity} initialCity={initialCity}>{children}</PublicChrome></body></html>;
}
