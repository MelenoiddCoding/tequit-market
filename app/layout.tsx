import type { Metadata } from "next";
import "./globals.css";
import { Header, BottomNavigation, Footer } from "@/components/navigation";

export const metadata: Metadata = {
  title: { default: "Tequit — Encuentra quién le sabe", template: "%s | Tequit" },
  description: "Encuentra personas y negocios en Tepic que pueden hacer el trabajo que necesitas.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: { title: "Tequit", description: "Encuentra quién le sabe en Tepic.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX" data-scroll-behavior="smooth"><body><Header />{children}<Footer /><BottomNavigation /></body></html>;
}
