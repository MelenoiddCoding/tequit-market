export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function providerMessage(name: string, service?: string) {
  return `Hola ${name}, te encontré en Tequit. Quiero preguntarte por ${service ? `un trabajo de ${service}` : "un trabajo"}.`;
}
