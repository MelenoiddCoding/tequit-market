"use client";

import { Heart } from "lucide-react";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "tequit-saved";
const SAVED_EVENT = "tequit-saved";

function isSavedKey(value: unknown): value is string {
  return typeof value === "string" && /^(provider|business):[^:]+$/.test(value);
}

export function readSaved(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter(isSavedKey) : [];
  } catch {
    return [];
  }
}

function subscribe(callback: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) callback();
  }

  window.addEventListener(SAVED_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SAVED_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function SaveButton({ slug, type }: { slug: string; type: "provider" | "business" }) {
  const key = `${type}:${slug}`;
  const saved = useSyncExternalStore(
    subscribe,
    () => readSaved().includes(key),
    () => false,
  );

  function toggle() {
    const values = readSaved();
    const next = values.includes(key) ? values.filter((value) => value !== key) : [...values, key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SAVED_EVENT));
  }

  return (
    <button
      type="button"
      className={`save-btn ${saved ? "saved" : ""}`}
      onClick={toggle}
      aria-label={saved ? "Quitar de guardados" : "Guardar en este dispositivo"}
      aria-pressed={saved}
    >
      <Heart size={19} fill={saved ? "currentColor" : "none"} aria-hidden />
    </button>
  );
}
