"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, Copy, Download, QrCode, Share2 } from "lucide-react";
import QRCode from "qrcode";

const SIZE = 1200;
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  start: number,
  min: number,
) {
  let size = start;
  while (size > min) {
    context.font = `800 ${size}px sans-serif`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}
async function createShareCard(url: string, name: string, subtitle: string) {
  const qr = await QRCode.toDataURL(url, {
    width: 820,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#183225", light: "#ffffff" },
  });
  const [qrImage, logo] = await Promise.all([
    loadImage(qr),
    loadImage("/brand/tequit-symbol.svg"),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo crear la imagen.");
  context.fillStyle = "#fff9f0";
  context.fillRect(0, 0, SIZE, SIZE);
  context.fillStyle = "#254432";
  context.font = "900 30px sans-serif";
  context.textAlign = "center";
  context.fillText("TEQUIT · PROFESIONALES LOCALES", SIZE / 2, 54);
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.roundRect(146, 76, 908, 908, 38);
  context.fill();
  context.drawImage(qrImage, 190, 120, 820, 820);
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.roundRect(522, 466, 156, 156, 32);
  context.fill();
  context.drawImage(logo, 570, 493, 60, 86);
  context.fillStyle = "#17231d";
  context.font = `800 ${fitText(context, name, 1040, 66, 38)}px sans-serif`;
  context.fillText(name, SIZE / 2, 1062);
  context.fillStyle = "#5d6a64";
  context.font = `700 ${fitText(context, subtitle, 1000, 34, 24)}px sans-serif`;
  context.fillText(subtitle, SIZE / 2, 1116);
  context.fillStyle = "#c75b3a";
  context.font = "800 23px sans-serif";
  context.fillText(
    "Escanea para ver trabajos, reseñas y contactar",
    SIZE / 2,
    1163,
  );
  return canvas;
}
function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("No se pudo preparar la imagen.")),
      "image/png",
      0.94,
    ),
  );
}

export function ProviderShareTools({
  slug,
  name,
  subtitle = "Servicios profesionales",
  compact = false,
}: {
  slug: string;
  name: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://tequit.mx"}/p/${slug}`;
  const qrUrl = `${url}?ref=qr`;
  const shareUrl = `${url}?ref=share`;
  const [card, setCard] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    createShareCard(qrUrl, name, subtitle).then((canvas) => {
      if (active) setCard(canvas.toDataURL("image/png", 0.9));
    });
    return () => {
      active = false;
    };
  }, [qrUrl, name, subtitle]);
  async function track() {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "share_action",
        target: slug,
        targetType: "provider",
      }),
    });
  }
  async function copy() {
    await navigator.clipboard.writeText(shareUrl);
    await track();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  async function getFile() {
    const canvas = await createShareCard(qrUrl, name, subtitle);
    return new File([await canvasBlob(canvas)], `tequit-${slug}.png`, {
      type: "image/png",
    });
  }
  async function share() {
    if (!navigator.share) {
      await copy();
      return;
    }
    const file = await getFile();
    const data = {
      title: `${name} en Tequit`,
      text: `Conoce los servicios de ${name}: ${shareUrl}`,
      files: [file],
    };
    if (navigator.canShare?.({ files: [file] })) await navigator.share(data);
    else
      await navigator.share({
        title: data.title,
        text: data.text,
        url: shareUrl,
      });
    await track();
  }
  async function download(format: "png" | "svg") {
    let href: string;
    if (format === "png") {
      const canvas = await createShareCard(qrUrl, name, subtitle);
      href = canvas.toDataURL("image/png", 0.94);
    } else {
      const content = await QRCode.toString(qrUrl, {
        type: "svg",
        margin: 3,
        errorCorrectionLevel: "H",
      });
      href = URL.createObjectURL(
        new Blob([content], { type: "image/svg+xml" }),
      );
    }
    const anchor = document.createElement("a");
    anchor.download = `tequit-${slug}.${format}`;
    anchor.href = href;
    anchor.click();
    if (format === "svg") URL.revokeObjectURL(href);
    await track();
  }
  return (
    <div
      className={
        compact ? "provider-share provider-share-compact" : "provider-share"
      }
    >
      {!compact && card && (
        <Image
          src={card}
          alt={`Tarjeta QR del sitio de ${name}`}
          width={360}
          height={360}
        />
      )}
      <div className="provider-share-actions">
        <button className="btn btn-secondary" type="button" onClick={share}>
          <Share2 size={17} />
          <span>Compartir imagen</span>
        </button>
        <button className="btn btn-secondary" type="button" onClick={copy}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          <span>{copied ? "Copiado" : "Copiar enlace"}</span>
        </button>
        {!compact && (
          <>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => download("png")}
            >
              <Download size={17} />
              Imagen PNG
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => download("svg")}
            >
              <QrCode size={17} />
              QR SVG
            </button>
          </>
        )}
      </div>
    </div>
  );
}
