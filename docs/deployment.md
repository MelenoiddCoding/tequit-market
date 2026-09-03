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

El despliegue usa Vercel CLI. Las claves privadas sólo viven en variables Secret de Vercel; nunca se versionan.
