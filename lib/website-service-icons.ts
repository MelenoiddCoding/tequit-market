export const WEBSITE_SERVICE_ICONS = [
  { id: "build", label: "Herramientas" },
  { id: "ac_unit", label: "Climatización" },
  { id: "water_drop", label: "Agua y bombas" },
  { id: "plumbing", label: "Plomería" },
  { id: "electrical_services", label: "Electricidad" },
  { id: "construction", label: "Construcción" },
  { id: "carpenter", label: "Carpintería" },
  { id: "cleaning_services", label: "Limpieza" },
  { id: "pool", label: "Albercas" },
  { id: "computer", label: "Tecnología" },
  { id: "school", label: "Educación" },
  { id: "format_paint", label: "Pintura" },
  { id: "grass", label: "Jardinería" },
  { id: "pest_control", label: "Control de plagas" },
  { id: "solar_power", label: "Energía solar" },
  { id: "local_shipping", label: "Mudanzas" },
  { id: "security", label: "Seguridad" },
  { id: "roofing", label: "Techos" },
  { id: "kitchen", label: "Cocinas" },
  { id: "handyman", label: "Reparaciones" },
] as const;

export type WebsiteServiceIcon = (typeof WEBSITE_SERVICE_ICONS)[number]["id"];
export const WEBSITE_SERVICE_ICON_IDS = WEBSITE_SERVICE_ICONS.map(icon => icon.id) as [WebsiteServiceIcon, ...WebsiteServiceIcon[]];

export function suggestedWebsiteServiceIcon(name: string): WebsiteServiceIcon {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const rules: [RegExp, WebsiteServiceIcon][] = [
    [/aire|clima|refrigera|ventila|minisplit|calefac/, "ac_unit"],
    [/bomba|agua|cisterna|tinaco|hidroneum/, "water_drop"],
    [/plom|tuber|drenaje|fuga|sanitario/, "plumbing"],
    [/electri|cable|ilumina|voltaje/, "electrical_services"],
    [/alberca|piscina/, "pool"],
    [/limpieza|lavado|desinfe|aseo/, "cleaning_services"],
    [/carpint|mueble|madera/, "carpenter"],
    [/albanil|constru|remodel|obra|concreto/, "construction"],
    [/comput|software|internet|redes|tecnolog|celular/, "computer"],
    [/clase|curso|tutor|escuela|educa/, "school"],
    [/pintura|pintar|impermeabil/, "format_paint"],
    [/jardin|poda|cesped|pasto/, "grass"],
    [/plaga|fumiga/, "pest_control"],
    [/solar|fotovolta/, "solar_power"],
    [/mudanza|flete|transporte/, "local_shipping"],
    [/seguridad|alarma|camara/, "security"],
    [/techo|techumbre/, "roofing"],
    [/cocina|estufa/, "kitchen"],
    [/repara|mantenim|instala/, "handyman"],
  ];
  return rules.find(([pattern]) => pattern.test(normalized))?.[1] ?? "build";
}
