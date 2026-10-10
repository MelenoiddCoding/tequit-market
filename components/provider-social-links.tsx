import { Globe2 } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok } from "react-icons/si";
import type { Provider } from "@/types";

const socialNetworks = [
  { key: "facebook", label: "Facebook", Icon: SiFacebook },
  { key: "tiktok", label: "TikTok", Icon: SiTiktok },
  { key: "instagram", label: "Instagram", Icon: SiInstagram },
  { key: "website", label: "sitio web", Icon: Globe2 },
] as const;

export function ProviderSocialLinks({ provider, preview = false }: { provider: Provider; preview?: boolean }) {
  const links = socialNetworks.flatMap(({ key, label, Icon }) => {
    const url = provider.site.socialLinks[key];
    return url && /^https?:\/\//i.test(url) ? [{ key, label, Icon, url }] : [];
  });
  if (!links.length) return null;

  return <nav className="sheet-social" aria-label="Redes y sitio web del prestador">
    {links.map(({ key, label, Icon, url }) => preview
      ? <span className="sheet-social-icon" role="img" aria-label={label} title={label} key={key}><Icon aria-hidden size={20} /></span>
      : <a className="sheet-social-icon" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${label} de ${provider.name}`} title={label} key={key}><Icon aria-hidden size={20} /></a>)}
  </nav>;
}
