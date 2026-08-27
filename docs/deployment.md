# Despliegue Vercel + Supabase

1. Crear proyecto Supabase y enlazar CLI: `npx supabase link --project-ref <ref>`.
2. Aplicar schema: `npx supabase db push`.
3. Verificar buckets `avatars`, `business-media`, `provider-work` y `lead-media`.
4. Configurar en Vercel `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` y `NEXT_PUBLIC_DEMO_MODE=false`.
5. En Supabase Auth configurar Site URL y redirects `https://dominio/auth/callback`.
6. Ejecutar `npm run seed:users` sólo en staging; no conservar contraseña demo en producción.
7. Validar `npm run lint && npm run typecheck && npm test && npm run build`.
8. Desplegar en Vercel y probar requests, permisos de media y eventos con cuentas de roles distintos.

No se despliega automáticamente desde este repositorio porque no se proporcionaron credenciales. Para producción, el endpoint demo de login debe retirarse y el dashboard debe consumir la sesión Supabase SSR.
