import { ImageResponse } from "next/og";
import { getProviderBySlug } from "@/lib/marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image({
  params,
}: {
  params: Promise<{ providerSlug: string }>;
}) {
  const { providerSlug } = await params;
  const provider = await getProviderBySlug(providerSlug);
  const name = provider?.name ?? "Tequit";
  const profession = provider?.profession ?? "Servicios locales";
  const zone = provider?.zone ?? "Tepic";
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 70,
        background: "linear-gradient(135deg,#10271b,#315d43)",
        color: "#fff",
        fontFamily: "sans-serif",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          fontWeight: 800,
          color: "#efb79f",
        }}
      >
        TEQUIT · PROFESIONALES LOCALES
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1,
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 34,
            color: "#dce9df",
          }}
        >
          {profession} · {zone}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 24 }}>
        tequit.mx
      </div>
    </div>,
    size,
  );
}
