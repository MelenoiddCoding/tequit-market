"use client";

/* eslint-disable @next/next/no-img-element -- The lightbox must display the uploaded original without a crop. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Provider } from "@/types";
import styles from "./work-gallery.module.css";

type Work = Provider["portfolio"][number];

export function WorkGallery({ works, className, children }: {
  works: Work[];
  className: string;
  children: ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const isOpen = activeIndex !== null;

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [isOpen]);

  function move(direction: number) {
    setActiveIndex(index => index === null ? null : (index + direction + works.length) % works.length);
  }

  function openFromClick(event: React.MouseEvent<HTMLDivElement>) {
    const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-work-index]");
    if (!trigger || !event.currentTarget.contains(trigger)) return;
    const index = Number(trigger.dataset.workIndex);
    if (!Number.isInteger(index) || index < 0 || index >= works.length) return;
    openerRef.current = trigger;
    setActiveIndex(index);
  }

  const work = activeIndex === null ? null : works[activeIndex];

  return <>
    <div className={className} onClick={openFromClick}>{children}</div>
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Galería de trabajos realizados"
      onCancel={event => { event.preventDefault(); setActiveIndex(null); }}
      onClick={event => { if (event.target === event.currentTarget) setActiveIndex(null); }}
      onKeyDown={event => {
        if (event.key === "ArrowLeft" && works.length > 1) { event.preventDefault(); move(-1); }
        if (event.key === "ArrowRight" && works.length > 1) { event.preventDefault(); move(1); }
      }}
      onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
      onTouchEnd={event => {
        if (!touchStart.current || works.length < 2) return;
        const dx = event.changedTouches[0].clientX - touchStart.current.x;
        const dy = event.changedTouches[0].clientY - touchStart.current.y;
        touchStart.current = null;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) move(dx < 0 ? 1 : -1);
      }}
    >
      {work && <div className={styles.layout}>
        <div className={styles.toolbar}>
          <span className={styles.counter}>{activeIndex! + 1} / {works.length}</span>
          <button ref={closeRef} type="button" className={styles.close} aria-label="Cerrar galería" onClick={() => setActiveIndex(null)}><X size={24} aria-hidden /></button>
        </div>
        <div className={styles.stage}>
          {works.length > 1 && <button type="button" className={styles.previous} aria-label="Foto anterior" onClick={() => move(-1)}><ChevronLeft size={28} aria-hidden /></button>}
          <img className={styles.image} src={work.image} alt={work.title} referrerPolicy="no-referrer" />
          {works.length > 1 && <button type="button" className={styles.next} aria-label="Foto siguiente" onClick={() => move(1)}><ChevronRight size={28} aria-hidden /></button>}
        </div>
        <div className={styles.caption}><strong>{work.title}</strong>{work.description && <p>{work.description}</p>}</div>
      </div>}
    </dialog>
  </>;
}
