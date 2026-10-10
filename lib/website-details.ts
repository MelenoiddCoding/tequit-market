import { WEBSITE_SERVICE_ICON_IDS, type WebsiteServiceIcon } from "@/lib/website-service-icons";

export const WEBSITE_DETAIL_FIELDS = [
  {key:"contactName",label:"Nombre de contacto",max:120,ideal:"hasta 32 caracteres"},
  {key:"contactRole",label:"Cargo o especialidad del contacto",max:120,ideal:"hasta 40 caracteres"},
  {key:"notice",label:"Aviso destacado",max:350,ideal:"una frase de hasta 130 caracteres"},
  {key:"servicesIntro",label:"Descripción breve de servicios",max:240,ideal:"una frase de hasta 110 caracteres"},
  {key:"workIntro",label:"Descripción breve de trabajos",max:240,ideal:"una frase de hasta 110 caracteres"},
  {key:"contactTitle",label:"Título del cierre de contacto",max:160,ideal:"hasta 70 caracteres"},
  {key:"contactIntro",label:"Texto del cierre de contacto",max:350,ideal:"hasta 140 caracteres"},
  {key:"address",label:"Dirección pública",max:240,ideal:"una línea breve"},
  {key:"hours",label:"Horario de atención",max:240,ideal:"una línea breve"},
] as const;
export type WebsiteDetails = Partial<Record<typeof WEBSITE_DETAIL_FIELDS[number]["key"],string>> & {
  serviceIcons?: Record<string, WebsiteServiceIcon>;
};
export function normalizeWebsiteDetails(value: unknown): WebsiteDetails {
  if (!value || typeof value!=="object" || Array.isArray(value)) return {};
  const row=value as Record<string,unknown>;
  const details: WebsiteDetails = Object.fromEntries(WEBSITE_DETAIL_FIELDS.flatMap(field=>typeof row[field.key]==="string" ? [[field.key,(row[field.key] as string).trim().slice(0,field.max)]] : []));
  if (row.serviceIcons && typeof row.serviceIcons === "object" && !Array.isArray(row.serviceIcons)) {
    const icons = Object.entries(row.serviceIcons).filter(([id, icon]) =>
      /^[0-9a-f-]{36}$/i.test(id) && WEBSITE_SERVICE_ICON_IDS.includes(icon as WebsiteServiceIcon),
    );
    if (icons.length) details.serviceIcons = Object.fromEntries(icons.slice(0, 30)) as Record<string, WebsiteServiceIcon>;
  }
  return details;
}
