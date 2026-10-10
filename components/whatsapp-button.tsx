"use client";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/traffic-client";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
export function WhatsAppButton({
  phone,
  message,
  label = "Escribir por WhatsApp",
  className = "btn btn-primary",
  targetSlug,
  targetType,
  disabled = false,
  disabledLabel,
}: {
  phone: string;
  message: string;
  label?: string;
  className?: string;
  targetSlug?: string;
  targetType?: "provider" | "business";
  disabled?: boolean;
  disabledLabel?: string;
}) {
  if (disabled)
    return (
      <button type="button" className={className} disabled>
        <WhatsAppIcon width={19} height={19} />
        {disabledLabel ?? "Contacto no disponible"}
      </button>
    );
  return (
    <a
      href={buildWhatsAppUrl(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackEvent({ type: "whatsapp_click", target: targetSlug, targetType })
      }
      className={className}
      aria-label={label}
    >
      <WhatsAppIcon width={19} height={19} />
      {label}
    </a>
  );
}
