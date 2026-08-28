import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { PublicChrome } from "@/components/navigation";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Tequit — Encuentra quién le sabe", template: "%s | Tequit" },
  description: "Encuentra personas y negocios en Tepic que pueden hacer el trabajo que necesitas.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: { title: "Tequit", description: "Encuentra quién le sabe en Tepic.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX" data-scroll-behavior="smooth" className={`${manrope.variable} ${fraunces.variable}`}><body><PublicChrome>{children}</PublicChrome></body></html>;
}
