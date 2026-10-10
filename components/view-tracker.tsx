"use client";
import { useEffect } from "react";
import { trackEvent } from "@/lib/traffic-client";
export function ViewTracker({
  type,
  target,
  referrer,
  disabled = false,
}: {
  type:
    | "profile_view"
    | "website_view"
    | "directory_view"
    | "business_view"
    | "service_view";
  target: string;
  referrer?: string;
  disabled?: boolean;
}) {
  useEffect(() => {
    if (disabled) return;
    trackEvent({ type, target }, true);
    if (referrer === "qr" || referrer === "share")
      trackEvent(
        {
          type: referrer === "qr" ? "qr_visit" : "shared_link_visit",
          target,
          targetType: "provider",
        },
        true,
      );
  }, [type, target, referrer, disabled]);
  return null;
}
