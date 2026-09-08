"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketplaceCategory } from "@/types";
import styles from "@/components/provider-category-selector.module.css";

export function ProviderCategorySelector({
  categories,
  primaryId,
  secondaryIds,
  onChange,
  disabled = false,
  idPrefix = "provider-category",
}: {
  categories: MarketplaceCategory[];
  primaryId: string;
  secondaryIds: string[];
  onChange: (primaryId: string, secondaryIds: string[]) => void;
  disabled?: boolean;
  idPrefix?: string;
}) {
  const inferredParent = categories.find((category) => category.canonicalCategories.some((canonical) => canonical.id === primaryId))?.id ?? categories[0]?.id ?? "";
  const [parentId, setParentId] = useState(inferredParent);
  const parent = categories.find((category) => category.id === parentId);
  const allCanonical = useMemo(() => categories.flatMap((category) => category.canonicalCategories.map((canonical) => ({ ...canonical, parentName: category.name }))), [categories]);

  useEffect(() => {
    if (!primaryId && parent?.canonicalCategories[0]) onChange(parent.canonicalCategories[0].id, secondaryIds);
  }, [onChange, parent, primaryId, secondaryIds]);

  function changeParent(value: string) {
    setParentId(value);
    const first = categories.find((category) => category.id === value)?.canonicalCategories[0];
    onChange(first?.id ?? "", secondaryIds.filter((id) => id !== first?.id));
  }
  function changeSecondary(index: number, value: string) {
    const next = [...secondaryIds];
    if (value) next[index] = value;
    else next.splice(index, 1);
    onChange(primaryId, [...new Set(next.filter((id) => id && id !== primaryId))].slice(0, 2));
  }
  const primary = allCanonical.find((category) => category.id === primaryId);
  return <div className={styles.selector}>
    <label><span>Categoría principal</span><select id={`${idPrefix}-parent`} value={parentId} onChange={(event) => changeParent(event.target.value)} disabled={disabled}>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select><small>Organiza tu perfil dentro del mercado.</small></label>
    <label><span>Lo que haces principalmente</span><select id={`${idPrefix}-primary`} value={primaryId} onChange={(event) => onChange(event.target.value, secondaryIds.filter((id) => id !== event.target.value))} disabled={disabled} required>{parent?.canonicalCategories.map((canonical) => <option value={canonical.id} key={canonical.id}>{canonical.name}</option>)}</select>{primary?.requiresReview && <small className={styles.review}>Esta actividad requiere revisión antes de mostrar una verificación profesional.</small>}</label>
    <div className={styles.secondary}>
      <div><strong>Otras actividades</strong><small>Opcional · puedes agregar hasta dos.</small></div>
      {[0, 1].map((index) => <label key={index}><span className="sr-only">Actividad secundaria {index + 1}</span><select value={secondaryIds[index] ?? ""} onChange={(event) => changeSecondary(index, event.target.value)} disabled={disabled}><option value="">{index === 0 ? "Agregar actividad secundaria" : "Agregar otra actividad"}</option>{categories.map((category) => <optgroup label={category.name} key={category.id}>{category.canonicalCategories.filter((canonical) => canonical.id !== primaryId && !secondaryIds.some((id, selectedIndex) => selectedIndex !== index && id === canonical.id)).map((canonical) => <option value={canonical.id} key={canonical.id}>{canonical.name}</option>)}</optgroup>)}</select></label>)}
    </div>
  </div>;
}
