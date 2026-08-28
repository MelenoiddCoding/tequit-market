import Image from "next/image";
import { cn } from "@/lib/cn";

const assets = {
  horizontal: { src: "/brand/tequit-logo-horizontal.svg", width: 696, height: 193 },
  symbol: { src: "/brand/tequit-symbol.svg", width: 330, height: 470 },
  wordmark: { src: "/brand/tequit-wordmark.svg", width: 488, height: 157 },
  "app-light": { src: "/brand/tequit-app-icon-light.svg", width: 512, height: 512 },
  "app-dark": { src: "/brand/tequit-app-icon-dark.svg", width: 512, height: 512 },
} as const;

export function BrandLogo({ variant = "horizontal", className, priority = false }: {
  variant?: keyof typeof assets;
  className?: string;
  priority?: boolean;
}) {
  const asset = assets[variant];
  return <Image className={cn("brand-logo", `brand-logo-${variant}`, className)} src={asset.src} width={asset.width} height={asset.height} alt="Tequit" priority={priority} />;
}
