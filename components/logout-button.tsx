"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("No pudimos cerrar la sesión.");
      router.replace("/login");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button className={className} type="button" onClick={logout} disabled={loading}>
      <LogOut size={17} aria-hidden />
      {loading ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}
