"use client";
import { useState } from "react";
import { facebookShareUrl } from "@/lib/traffic";
export function FacebookShare({ path }: { path?: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    const link = facebookShareUrl(
      path ? new URL(path, window.location.origin).href : window.location.href,
    );
    try {
      await navigator.clipboard.writeText(link);
      setMessage("Enlace copiado. Pégalo en Facebook.");
    } catch {
      setMessage(link);
    }
  }
  return (
    <div>
      <button type="button" className="btn btn-secondary" onClick={copy}>
        Copiar enlace para Facebook
      </button>
      <p role="status" style={{ overflowWrap: "anywhere" }}>
        {message}
      </p>
    </div>
  );
}
