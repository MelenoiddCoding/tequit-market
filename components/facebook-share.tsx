"use client";
import { useState } from "react";
import { Share2 } from "lucide-react";
import { facebookShareUrl } from "@/lib/traffic";
import styles from "@/components/provider-share-tools.module.css";

export function FacebookShare({ path, appearance = "default" }: { path?: string; appearance?: "default" | "profile" }) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  async function copy() {
    const link = facebookShareUrl(
      path ? new URL(path, window.location.origin).href : window.location.href,
    );
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setMessage(appearance === "profile" ? "" : "Enlace copiado. Pégalo en Facebook.");
    } catch {
      setCopied(false);
      setMessage(link);
    }
  }
  return (
    <div className={appearance === "profile" ? styles.facebookAction : undefined}>
      <button type="button" className={`btn btn-secondary${appearance === "profile" ? ` ${styles.profileButton}` : ""}`} onClick={copy}>
        {appearance === "profile" && <Share2 size={19} aria-hidden />}
        <span>{appearance === "profile" && copied ? "Enlace para Facebook copiado" : "Copiar enlace para Facebook"}</span>
      </button>
      {message && <p role="status" className={appearance === "profile" ? styles.facebookStatus : undefined} style={appearance === "profile" ? undefined : { overflowWrap: "anywhere" }}>{message}</p>}
    </div>
  );
}
