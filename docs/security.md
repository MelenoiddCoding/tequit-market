# Seguridad

- RLS está activa en entidades privadas y operativas.
- Público sólo lee perfiles/negocios activos, servicios/productos activos, verificaciones y reviews aprobadas.
- Un owner sólo modifica su `provider_profile`; un member sólo sus negocios; admin usa rol relacional.
- El límite Free vive en trigger `provider_free_limit` además del endpoint/UI.
- Los leads públicos entran por route handler validado con Zod; no existe policy pública de insert directo.
- `SUPABASE_SERVICE_ROLE_KEY` es server-only.
- `lead-media` es bucket privado y la policy de lectura sigue el target del lead.
- Los teléfonos demo no pertenecen a terceros y WhatsApp no guarda conversaciones.

Antes de producción: sustituir login demo por Auth SSR, añadir rate limiting/CAPTCHA al endpoint de leads, escaneo de archivos, logs de moderación y pruebas RLS contra Supabase local con dos JWT reales.
