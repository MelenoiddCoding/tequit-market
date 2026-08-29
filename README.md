# Tequit Market

Tequit es un marketplace/directorio local de servicios para Tepic, Nayarit. Ayuda a una persona a buscar una necesidad en lenguaje cotidiano, comparar reputación y evidencia, y contactar directamente por WhatsApp. Tequit genera el lead; no procesa pagos ni promete disponibilidad inmediata.

## Entorno público de pruebas

La beta persistente está disponible en [https://tequit-market.vercel.app](https://tequit-market.vercel.app). Opera con Supabase Auth, PostgreSQL y Storage reales; `NEXT_PUBLIC_DEMO_MODE=false` en Preview y Production.

## Estado del MVP

La aplicación incluye frontend público mobile-first, búsqueda, perfiles de prestadores y negocios, favoritos sincronizados, solicitudes anónimas o con cuenta, fotos privadas, eventos, sesiones SSR, dashboard, límites Free/Pro, reseñas moderadas, panel administrativo, RLS, Storage y seed reproducible. El catálogo inicial se conserva en Supabase como contenido de muestra claramente etiquetado y sin contacto.

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
lib/marketplace.ts      Consultas tipadas y mapeo del catálogo Supabase
lib/search.ts           Normalización, aliases y ranking de búsqueda
lib/supabase/           Clientes browser/server/admin
lib/plan.ts             Regla central Free/Pro
lib/whatsapp.ts         Construcción central de URLs de WhatsApp
supabase/migrations/    Schema, índices, triggers, RLS y buckets
supabase/seed.sql       Taxonomía, aliases y zonas
scripts/seed-users.ts   Auth y entidades demo reproducibles
tests/                  Reglas y flujos críticos
docs/                   Producto, datos, búsqueda, seguridad y deploy
```

## Arranque local

Requisitos: Node.js 20+ y npm 10+.

```bash
npm install
copy .env.example .env.local
npm run dev
```

En macOS/Linux cambia `copy` por `cp`. Completa las variables Supabase antes de iniciar. La URL esperada es [http://localhost:3000](http://localhost:3000).

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

`supabase db reset` aplica las migraciones y `seed.sql`. `seed:users` crea el administrador y migra 12 prestadores y 4 negocios de muestra mediante Admin API. La service role nunca debe llevar prefijo `NEXT_PUBLIC_` ni guardarse en Git.

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
8. Admin → moderar reseña, suspender publicación y cambiar plan persistentemente.
9. Guardados se sincronizan en Supabase para clientes con cuenta.

## Modelo de datos

El modelo separa identidad, prestador, negocio, membresías, afiliaciones, capacidades/categorías, servicios publicados, productos, media, verificaciones, leads, review requests, reseñas y eventos. Ratings de negocio y prestador son independientes. El trigger `provider_free_limit` impide en PostgreSQL más de cinco servicios activos para Free.

## Decisiones importantes

- Servicios son el producto principal; negocios quedan como vertical complementario.
- Visitantes exploran y solicitan sin cuenta.
- WhatsApp es el canal, Tequit no almacena conversaciones.
- Solicitudes generales se guardan sin target y las revisa admin; una solicitud dirigida admite sólo un target.
- Media pública y fotos privadas de leads viven en buckets distintos.
- Los perfiles sembrados son muestras, se etiquetan y no permiten contacto ni solicitudes dirigidas.

## No incluido

Pagos, comisiones, chat interno, tracking, asignación automática, disponibilidad en tiempo real, calendario complejo, facturación y app nativa. El cambio de plan es administrativo; no hay checkout Pro.

## Despliegue

Consulta [docs/deployment.md](docs/deployment.md) para infraestructura y [docs/beta-testing.md](docs/beta-testing.md) para el recorrido de aceptación.

## Asset visual generado

`public/images/tequit-hero.png` se generó con la herramienta integrada de ImageGen, con el prompt: fotografía editorial natural de un oficio local terminando un muro terracota en un patio de Tepic, sujeto a la derecha y espacio negativo a la izquierda, luz cálida, sin logos, texto ni personas identificables.
