# Tequit Market

Tequit es un marketplace/directorio local de servicios para Tepic, Nayarit. Ayuda a una persona a buscar una necesidad en lenguaje cotidiano, comparar reputación y evidencia, y contactar directamente por WhatsApp. Tequit genera el lead; no procesa pagos ni promete disponibilidad inmediata.

## Entorno público de pruebas

La versión desplegada está disponible en [https://tequit-market.vercel.app](https://tequit-market.vercel.app). Actualmente opera con `NEXT_PUBLIC_DEMO_MODE=true`: permite recorrer el producto completo sin depender de infraestructura externa y devuelve solicitudes demo no persistentes.

## Estado del MVP

La aplicación incluye frontend público mobile-first, búsqueda, perfiles de prestadores, negocios con productos y servicios, guardados en el navegador, solicitudes sin cuenta, eventos de contacto, login demo, dashboard, límite Free/Pro, moderación administrativa, migraciones PostgreSQL, RLS, Storage y seed reproducible.

En `NEXT_PUBLIC_DEMO_MODE=true` usa el catálogo incluido y permite recorrer todos los flujos sin Docker. Con Supabase configurado y Demo Mode desactivado, los endpoints de solicitudes y eventos escriben en PostgreSQL. La arquitectura de lectura está separada en `lib/` para migrarla por completo al repositorio Supabase cuando se publique el piloto.

## Stack

- Next.js 16, React 19 y TypeScript estricto
- Tailwind CSS 4 + CSS de producto propio
- Supabase Auth, PostgreSQL, Storage y RLS
- Zod para validación en servidor
- React Hook Form disponible para formularios extensibles
- Lucide React
- Vitest

## Arquitectura

```text
app/                    App Router, páginas y API routes
components/             UI pública, formularios y paneles interactivos
lib/demo-data.ts        Adaptador de catálogo demo local
lib/search.ts           Normalización, aliases y ranking reemplazable
lib/supabase/           Clientes browser/server/admin
lib/plan.ts             Regla central Free/Pro
lib/whatsapp.ts         Construcción central de URLs de WhatsApp
supabase/migrations/    Schema, índices, triggers, RLS y buckets
supabase/seed.sql       Taxonomía, aliases y zonas
scripts/seed-users.ts   Auth y entidades demo reproducibles
tests/                  Reglas y flujos críticos
docs/                   Producto, datos, búsqueda, seguridad y deploy
```

## Arranque inmediato (modo demo)

Requisitos: Node.js 20+ y npm 10+.

```bash
npm install
copy .env.example .env.local
npm run dev
```

En macOS/Linux cambia `copy` por `cp`. La URL esperada es [http://localhost:3000](http://localhost:3000).

## Supabase local completo

Requisitos adicionales: Docker Desktop y Supabase CLI.

```bash
npx supabase start
npx supabase db reset
npx supabase status
```

Copia la URL, anon key y service role key locales a `.env.local`; cambia `NEXT_PUBLIC_DEMO_MODE=false` y crea los usuarios/entidades:

```bash
npm run seed:users
npm run dev
```

`supabase db reset` aplica `202608260001_initial_schema.sql` y `seed.sql`. `seed:users` crea 12 prestadores, 4 negocios y membresías mediante Admin API. La service role nunca debe llevar prefijo `NEXT_PUBLIC_`.

## Usuarios demo

Sólo para desarrollo local:

| Rol | Correo | Contraseña |
|---|---|---|
| Prestador / Juan | `provider@tequit.local` | `Tequit123!` |
| Dueño de negocio | `business@tequit.local` | `Tequit123!` |
| Administrador | `admin@tequit.local` | `Tequit123!` |

El login navegable usa una cookie demo `httpOnly`. En el entorno Supabase, los mismos usuarios se crean en Auth; antes de producción debe sustituirse el endpoint demo por la sesión SSR de Supabase.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run seed:users
```

## Flujos demostrables

1. `/` → buscar “albañil” o “fontanero” → resultados → Juan Pérez.
2. `/p/juan-perez` → rating, verificaciones, trabajos y reseñas aprobadas → WhatsApp.
3. Juan publica exactamente cinco servicios y no publica concreto estampado → “Solicitar otro trabajo” → lead directo.
4. Login con Juan → `/dashboard/solicitudes` → marcar interesado → contactar cliente.
5. `/dashboard/servicios` → intento de sexto servicio → rechazo 409 y upsell Pro.
6. Buscar “concreto estampado” → Concretos Estampados de Nayarit → productos, servicios y equipo.
7. Buscar “decoración de bodas” → Florería Rosario.
8. Admin → moderar reseña y cambiar plan visualmente.
9. Guardados sobreviven refresh en `localStorage`.

## Modelo de datos

El modelo separa identidad, prestador, negocio, membresías, afiliaciones, capacidades/categorías, servicios publicados, productos, media, verificaciones, leads, review requests, reseñas y eventos. Ratings de negocio y prestador son independientes. El trigger `provider_free_limit` impide en PostgreSQL más de cinco servicios activos para Free.

## Decisiones importantes

- Servicios son el producto principal; negocios quedan como vertical complementario.
- Visitantes exploran y solicitan sin cuenta.
- WhatsApp es el canal, Tequit no almacena conversaciones.
- Solicitudes generales se guardan sin target y las revisa admin; una solicitud dirigida admite sólo un target.
- Media pública y fotos privadas de leads viven en buckets distintos.
- El modo demo permite enseñar el producto sin infraestructura, pero no finge persistencia: la respuesta del API marca `demo: true`.

## No incluido

Pagos, comisiones, chat interno, tracking, asignación automática, disponibilidad en tiempo real, calendario complejo, facturación y app nativa. El cambio de plan es administrativo; no hay checkout Pro.

## Deploy futuro

Consulta [docs/deployment.md](docs/deployment.md). En resumen: crear proyecto Supabase, aplicar migraciones, crear buckets/policies, configurar variables en Vercel, agregar callbacks de Auth y ejecutar `npm run build` antes del despliegue.

## Asset visual generado

`public/images/tequit-hero.png` se generó con la herramienta integrada de ImageGen, con el prompt: fotografía editorial natural de un oficio local terminando un muro terracota en un patio de Tepic, sujeto a la derecha y espacio negativo a la izquierda, luz cálida, sin logos, texto ni personas identificables.
