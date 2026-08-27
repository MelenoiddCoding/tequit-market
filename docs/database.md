# Base de datos

La migración inicial crea tipos, 24 tablas, índices de búsqueda/analytics, helpers de autorización, trigger Free y políticas RLS.

Relaciones clave:

```text
auth.users → profiles → profile_roles
profiles → provider_profiles → provider_services / provider_media
profiles → business_members → businesses → business_services / business_products
provider_profiles ↔ provider_business_affiliations ↔ businesses
lead → review_request(token hash) → review
provider/business/service → contact_events
```

Un lead puede ser general (sin target) o dirigido a exactamente una persona o negocio. `lead-media` es privado. Reviews públicas requieren `approved`. El rating agregado se mantiene en la entidad correspondiente y nunca cruza una afiliación.

Migración: `supabase/migrations/202608260001_initial_schema.sql`. Seed de taxonomía: `supabase/seed.sql`. Seed de Auth y marketplace: `npm run seed:users`.
