"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import styles from "@/components/provider-site-proposal.module.css";

export function ProposalShareAction({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    const data = {
      title: "Soluciones Caro · Propuesta de sitio",
      text: "Conoce esta propuesta de sitio profesional creada con Tequit.",
      url,
    };

    if (navigator.share) {
      await navigator.share(data).catch(() => undefined);
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      className={compact ? styles.shareCompact : styles.shareButton}
      onClick={share}
    >
      {copied ? <Check aria-hidden /> : compact ? <Share2 aria-hidden /> : <Copy aria-hidden />}
      <span>{copied ? "Enlace copiado" : compact ? "Compartir" : "Compartir propuesta"}</span>
    </button>
  );
}
