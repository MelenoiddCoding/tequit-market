"use client";
import { useState } from "react";
export function ContactPreferences({
  providerId,
  initial,
}: {
  providerId: string;
  initial: boolean;
}) {
  const [enabled, setEnabled] = useState(initial),
    [message, setMessage] = useState("");
  async function change() {
    const next = !enabled;
    setMessage("Guardando…");
    const response = await fetch("/api/dashboard/contact-preferences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ providerId, showPhoneCall: next }),
    });
    if (response.ok) {
      setEnabled(next);
      setMessage("Preferencia guardada.");
    } else setMessage("No pudimos guardar el cambio.");
  }
  return (
    <div>
      <label>
        <input type="checkbox" checked={enabled} onChange={change} /> Mostrar
        también el botón “Llamar” en mi sitio
      </label>
      <p className="help" role="status">
        {message || "WhatsApp permanece disponible. La llamada es opcional."}
      </p>
    </div>
  );
}
