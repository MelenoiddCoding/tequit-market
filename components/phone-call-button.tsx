"use client";
import { Phone } from "lucide-react";
export function PhoneCallButton({
  phone,
  slug,
  className,
}: {
  phone: string;
  slug: string;
  className?: string;
}) {
  function call() {
    void fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "phone_call_click",
        target: slug,
        targetType: "provider",
      }),
    });
    window.location.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
  }
  return (
    <button type="button" className={className} onClick={call}>
      <Phone size={19} aria-hidden />
      Llamar
    </button>
  );
}
