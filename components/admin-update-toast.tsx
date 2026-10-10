"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AlertCircle, AlertTriangle, Check, Info, X } from "lucide-react";
import styles from "@/components/admin-update-toast.module.css";

export type AdminUpdateMode = "success" | "error" | "warning" | "info";
export type AdminUpdate = {
  mode: AdminUpdateMode;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
};

const icons = { success: Check, error: AlertCircle, warning: AlertTriangle, info: Info };
const durations: Record<AdminUpdateMode, number> = { success: 5000, error: 9000, warning: 8000, info: 6000 };
const AdminUpdateContext = createContext<((update: AdminUpdate) => void) | null>(null);
const noop = () => {};

export function useAdminUpdate() {
  const show = useContext(AdminUpdateContext);
  if (!show) throw new Error("useAdminUpdate debe usarse dentro de AdminUpdateProvider.");
  return show;
}

export function useOptionalAdminUpdate() {
  return useContext(AdminUpdateContext) ?? noop;
}

export function AdminUpdateProvider({ children }: { children: ReactNode }) {
  const [update, setUpdate] = useState<AdminUpdate | null>(null);
  const [paused, setPaused] = useState(false);
  const show = useCallback((next: AdminUpdate) => { setPaused(false); setUpdate(next); }, []);
  const close = useCallback(() => { setUpdate(null); setPaused(false); }, []);

  useEffect(() => {
    if (!update || paused) return;
    const timeout = window.setTimeout(close, update.action ? 10000 : durations[update.mode]);
    return () => window.clearTimeout(timeout);
  }, [update, paused, close]);

  const Icon = update ? icons[update.mode] : Info;
  return <AdminUpdateContext.Provider value={show}>
    {children}
    {update && <div
      className={styles.toast}
      data-mode={update.mode}
      role={update.mode === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    >
      <span className={styles.symbol}><Icon size={18} strokeWidth={2.2} aria-hidden /></span>
      <div className={styles.copy}>
        <strong>{update.title}</strong>
        {update.message && <p>{update.message}</p>}
        {update.action && <button className={styles.action} type="button" onClick={() => { close(); update.action?.onClick(); }}>{update.action.label}</button>}
      </div>
      <button type="button" className={styles.close} aria-label="Cerrar aviso" onClick={close}><X size={18} aria-hidden /></button>
    </div>}
  </AdminUpdateContext.Provider>;
}
