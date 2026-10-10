"use client";
import { trackEvent } from "@/lib/traffic-client";
import { Phone } from "lucide-react";
export function PhoneCallButton({
  phone,
  slug,
  className,
  label = "Llamar",
  materialIcon = false,
}: {
  phone: string;
  slug: string;
  className?: string;
  label?: string;
  materialIcon?: boolean;
}) {
  function call() {
    trackEvent({ type: "phone_call_click", target: slug, targetType: "provider" });
    window.location.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
  }
  return (
    <button type="button" className={className} onClick={call}>
      {materialIcon ? <span className="material-symbols-outlined" aria-hidden>call</span> : <Phone size={19} aria-hidden />}
      {label}
    </button>
  );
}
