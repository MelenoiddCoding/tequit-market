"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trafficSurface } from "@/lib/traffic";
import { trackEvent } from "@/lib/traffic-client";
export function DirectoryTracker() {
  const path = usePathname();
  useEffect(() => {
    if (trafficSurface(path) === "directory")
      trackEvent({ type: "directory_view", target: path }, true);
  }, [path]);
  return null;
}
