/* eslint-disable @next/next/no-img-element -- ImageResponse renders optimized data URLs, not browser DOM images. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { APP_URL } from "@/lib/provider-site";

export const socialImageSize = { width: 1200, height: 630 } as const;
export type SocialImageKind = "site" | "profile" | "business" | "demo" | "proposal";

export function socialImageVersion(...parts: Array<string | undefined>) {
  return createHash("sha256").update(parts.map((part) => part ?? "").join("\u0000")).digest("hex").slice(0, 12);
}

export function socialImageUrl(kind: SocialImageKind, slug: string, version: string, sparse = false) {
  const url = new URL(`/api/share-image/${kind}/${encodeURIComponent(slug)}`, APP_URL);
  url.searchParams.set("v", version);
  if (sparse) url.searchParams.set("contenido", "breve");
  return url.toString();
}

export function socialImageMetadata(url: string, alt: string) {
  return { url, width: socialImageSize.width, height: socialImageSize.height, alt };
}

export function socialPreviewAlt(name: string, category: string) {
  return `${name} · ${category}`;
}

function linesForName(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.length - 1;
    if (last >= 0 && `${lines[last]} ${word}`.length <= 25) lines[last] += ` ${word}`;
    else lines.push(word.length > 25 ? `${word.slice(0, 24)}…` : word);
  }
  if (lines.length > 3) return [...lines.slice(0, 2), `${lines.slice(2).join(" ").slice(0, 24)}…`];
  return lines.length ? lines : ["Profesional local"];
}

async function imageData(source: string | undefined, width: number, height: number, fit: "cover" | "contain") {
  if (!source) return undefined;
  try {
    let input: Buffer;
    if (source.startsWith("/")) {
      if (!/^\/(images\/demo\/servibombas|providers\/soluciones-haro|brand)\/[\w./-]+$/.test(source) || source.includes("..")) return undefined;
      input = await readFile(path.join(process.cwd(), "public", source.slice(1)));
    } else {
      const url = new URL(source);
      const storageOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL && new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
      if (url.origin !== storageOrigin || !url.pathname.startsWith("/storage/v1/object/public/")) return undefined;
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!response.ok || Number(response.headers.get("content-length") ?? 0) > 8_000_000) return undefined;
      input = Buffer.from(await response.arrayBuffer());
      if (input.length > 8_000_000) return undefined;
    }
    const output = await sharp(input).rotate().resize(width, height, { fit, background: "#ffffff", withoutEnlargement: false }).png({ compressionLevel: 8 }).toBuffer();
    return `data:image/png;base64,${output.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function renderSocialPreview({ name, category, zone, cover, logo, kind, accent = "#254432", label }: {
  name: string; category: string; zone?: string; cover?: string; logo?: string;
  kind: SocialImageKind; accent?: string; label?: string;
}) {
  const [coverData, logoData, tequitData] = await Promise.all([
    imageData(cover, 1200, 630, "cover"),
    imageData(logo, 144, 144, "contain"),
    kind === "profile" || kind === "business" ? imageData("/brand/tequit-app-icon-dark.svg", 64, 64, "contain") : Promise.resolve(undefined),
  ]);
  const nameLines = linesForName(name);
  const fontSize = nameLines.length === 1 ? 78 : nameLines.length === 2 ? 70 : 58;
  const safeAccent = /^#[\da-fA-F]{6}$/.test(accent) ? accent : "#254432";

  return new ImageResponse(
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: coverData ? "#17231d" : safeAccent, color: "#fff", fontFamily: "sans-serif", overflow: "hidden" }}>
      {coverData ? <img src={coverData} alt="" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      <div style={{ position: "absolute", width: "100%", height: "100%", background: coverData ? "linear-gradient(90deg,rgba(9,20,15,.88),rgba(9,20,15,.49) 58%,rgba(9,20,15,.25))" : "linear-gradient(135deg,rgba(0,0,0,.12),rgba(0,0,0,.44))" }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 10, background: safeAccent }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "58px 76px 60px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
          {logoData ? <div style={{ display: "flex", width: 140, height: 140, background: "#fff", borderRadius: 22, padding: 6, alignItems: "center", justifyContent: "center" }}><img src={logoData} alt="" style={{ width: 128, height: 128, objectFit: "contain" }} /></div> : <div style={{ display: "flex", width: 94, height: 8, marginTop: 12, borderRadius: 4, background: "#fff" }} />}
          {tequitData ? <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 23, fontWeight: 700 }}><img src={tequitData} alt="" style={{ width: 58, height: 58 }} /><span>Tequit</span></div> : label ? <span style={{ display: "flex", fontSize: 22, fontWeight: 700, background: "rgba(0,0,0,.56)", padding: "10px 18px", borderRadius: 8 }}>{label}</span> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1010 }}>
          <div style={{ display: "flex", flexDirection: "column", fontWeight: 800, fontSize, lineHeight: 1.03, letterSpacing: -2, textShadow: "0 2px 14px rgba(0,0,0,.35)" }}>
            {nameLines.map((line, index) => <span key={index}>{line}</span>)}
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 29, fontWeight: 600, lineHeight: 1.2, color: "#f3f5f2" }}>
            {category.length > 64 ? `${category.slice(0, 63)}…` : category}{zone ? ` · ${zone}` : ""}
          </div>
        </div>
      </div>
    </div>,
    { ...socialImageSize, headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
