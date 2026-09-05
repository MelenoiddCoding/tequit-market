# Despliegue Vercel + Supabase

Entorno público actual: [https://tequit.mx](https://tequit.mx). La beta usa Supabase alojado y `NEXT_PUBLIC_DEMO_MODE=false`.

Proyecto activo de beta: `vgszdeymfipvuiziklpq` (`tequit-market-beta`). El proyecto anterior `cfbaxrtexvdfcxffwvla` permanece pausado y no se usa.

1. Crear proyecto Supabase y enlazar CLI: `npx supabase link --project-ref <ref>`.
2. Aplicar schema: `npx supabase db push`.
3. Verificar buckets `avatars`, `business-media`, `provider-work` y `lead-media`.
4. Configurar en Vercel `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` y `NEXT_PUBLIC_DEMO_MODE=false`.
5. En Supabase Auth configurar Site URL; la beta usa correo/contraseña sin confirmación y sin recuperación automática.
6. Ejecutar `npm run seed:users` para cargar fichas marcadas como muestra y crear el administrador con contraseña temporal.
7. Validar `npm run lint && npm run typecheck && npm test && npm run build`.
8. Desplegar en Vercel y probar requests, permisos de media y eventos con cuentas de roles distintos.

## OTP por WhatsApp con Bird

Tequit genera el OTP con entropía criptográfica y lo envía directamente a la plantilla administrada `bird_otp`. En la base sólo persiste su HMAC-SHA256, nunca el código legible; vence en cinco minutos y queda limitado a diez intentos.

1. En Vercel definir `BIRD_WHATSAPP_API_KEY`, `BIRD_API_BASE_URL=https://us1.platform.bird.com`, `BIRD_WHATSAPP_TEMPLATE=bird_otp`, `BIRD_WHATSAPP_LANGUAGE=es` y `REGISTRATION_OTP_SECRET`.
2. Aplicar `202609030001_whatsapp_otp_registration.sql` y `202609030002_direct_bird_registration_otp.sql` con `npx supabase db push`.
3. En Supabase, habilitar Phone Auth y exigir confirmación telefónica. No se necesita proveedor SMS ni Send SMS Hook para este flujo.
4. En `Authentication > Hooks`, activar **Send SMS Hook** como HTTP y usar `https://tequit.mx/api/auth/hooks/send-sms`.
5. Copiar el secreto generado por Supabase a `SUPABASE_SEND_SMS_HOOK_SECRET` en Vercel. Debe conservar el formato `v1,whsec_...`.
6. Desplegar antes de activar el hook y probar un registro nuevo. El remitente visible será Bird Verify y no el número propio de Tequit.

La key general de Bird no se usa. La credencial debe estar limitada a envío de WhatsApp y nunca llevar prefijo `NEXT_PUBLIC_`.

El despliegue usa Vercel CLI. Las claves privadas sólo viven en variables Secret de Vercel; nunca se versionan.
