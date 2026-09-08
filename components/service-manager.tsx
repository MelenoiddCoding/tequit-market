"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Service } from "@/types";
import {
  dashboardStyles as styles,
  DashboardSection,
} from "@/components/dashboard-components";

type ManagedService = Service & { active?: boolean };

export function ServiceManager({
  initialServices,
  entityId,
  kind,
  planName,
  maxServices,
}: {
  initialServices: Service[];
  entityId: string;
  kind: "provider" | "business";
  planName: string;
  maxServices: number | null;
}) {
  const [items, setItems] = useState<ManagedService[]>(
    initialServices.map((service) => ({ ...service, active: true })),
  );
  const [error, setError] = useState("");
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (
      maxServices !== null &&
      items.filter((item) => item.active).length >= maxServices
    ) {
      setError(
        `Llegaste al límite de ${maxServices} servicios del plan ${planName}.`,
      );
      return;
    }
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const brands = String(formData.get("brands") ?? "").split(",").map((brand) => brand.trim()).filter(Boolean).slice(0, 10);
    const quoteOnly = formData.get("quoteOnly") === "on";
    const rawPrice = String(formData.get("priceFrom") ?? "").trim();
    const priceFrom = rawPrice ? Number(rawPrice) : null;
    const response = await fetch("/api/provider/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", name, description, brands, priceFrom, quoteOnly, kind, entityId }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error);
      return;
    }
    setItems([
      ...items,
      { id: body.id, slug: body.id, name, description, category: kind === "provider" ? "Servicio libre" : "Otro", brands, priceFrom: priceFrom ?? undefined, quoteOnly, active: true },
    ]);
    form.reset();
  }
  async function toggle(id: string) {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    const active = !current.active;
    const response = await fetch("/api/provider/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", id, active, kind, entityId }),
    });
    if (response.ok)
      setItems((values) =>
        values.map((item) => (item.id === id ? { ...item, active } : item)),
      );
    else
      setError(
        (await response.json()).error ?? "No pudimos actualizar el servicio.",
      );
  }
  return (
    <>
      {maxServices !== null && (
        <div className={styles.counter}>
          <div>
            <strong>
              {items.filter((item) => item.active).length} de {maxServices}{" "}
              servicios usados
            </strong>
            <p>
              Tu plan {planName} permite publicar hasta {maxServices} servicios.
            </p>
          </div>
          <div
            className={styles.progress}
            aria-label={`${items.filter((item) => item.active).length} de ${maxServices} servicios usados`}
          >
            <span
              style={{
                width: `${Math.min((items.filter((item) => item.active).length / maxServices) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
      <DashboardSection
        title="Servicios publicados"
        description="Desactiva temporalmente un servicio sin eliminarlo."
      >
        <div>
          {items.map((service) => (
            <article className={styles.serviceRow} key={service.id}>
              <div>
                <h3>{service.name}</h3>
                {service.description && <p>{service.description}</p>}
                <div className={styles.meta}>
                  <span>{service.category}</span>
                  {service.brands?.length ? <span>Marcas: {service.brands.join(", ")}</span> : null}
                  <span>{service.quoteOnly || service.priceFrom == null ? "Solicitar cotización" : `Desde $${service.priceFrom.toLocaleString("es-MX")} MXN`}</span>
                  <span>
                    {service.active
                      ? "Visible en búsqueda"
                      : "Oculto del perfil"}
                  </span>
                </div>
              </div>
              <div className={styles.serviceActions}>
                <span className={styles.help}>
                  {service.active ? "Activo" : "Inactivo"}
                </span>
                <button
                  className={`${styles.toggle} ${service.active ? "" : styles.toggleOff}`}
                  type="button"
                  onClick={() => toggle(service.id)}
                  aria-label={`${service.active ? "Desactivar" : "Activar"} ${service.name}`}
                  aria-pressed={service.active}
                />
              </div>
            </article>
          ))}
        </div>
      </DashboardSection>
      <DashboardSection
        title="Agregar servicio"
        description="Escríbelo como quieres promocionarlo. El título, la descripción y las marcas también ayudan a encontrarte."
      >
        <form className={`${styles.surface} ${styles.form}`} onSubmit={add}>
          <div className={styles.fieldGroup}>
            <label htmlFor="service-name">Nombre del servicio</label>
            <input
              className={styles.field}
              id="service-name"
              name="name"
              placeholder="Ej. Concreto estampado"
              minLength={3}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="service-description">Descripción</label>
            <textarea className={styles.textarea} id="service-description" name="description" placeholder="Qué incluye, qué problemas resuelves y cómo trabajas." minLength={10} maxLength={500} required/>
          </div>
          {kind === "provider" && <>
            <div className={styles.fieldGroup}><label htmlFor="service-brands">Marcas o equipos (opcional)</label><input className={styles.field} id="service-brands" name="brands" placeholder="Ej. Mabe, Whirlpool, Evans"/><span className={styles.help}>Separa cada marca con una coma.</span></div>
            <div className={styles.formGrid}><div className={styles.fieldGroup}><label htmlFor="service-price">Precio desde (opcional)</label><input className={styles.field} id="service-price" name="priceFrom" type="number" min="0" step="1" placeholder="0"/></div><label className={styles.fieldGroup} htmlFor="service-quote"><span>Forma de cotizar</span><span><input id="service-quote" name="quoteOnly" type="checkbox" defaultChecked/> Solicitar cotización</span></label></div>
          </>}
          <footer className={styles.formFooter}>
            <button className={styles.primary} type="submit">
              <Plus size={18} />
              Agregar servicio
            </button>
          </footer>
          {error && (
            <aside className={styles.alert} role="alert">
              <div className={styles.alertCopy}>
                <strong>{error}</strong>
                <p>Tu profesión y capacidades continúan visibles.</p>
              </div>
              <Link className={styles.secondary} href="/dashboard/plan">
                Conocer el plan
              </Link>
            </aside>
          )}
        </form>
      </DashboardSection>
    </>
  );
}
