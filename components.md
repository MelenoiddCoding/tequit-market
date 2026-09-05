# Tequit — contrato de componentes

Documento autoritativo para cualquier agente que diseñe, implemente o revise interfaz en Tequit.

## 1. Regla de autoridad

Antes de modificar una pantalla, leer en este orden:

1. `AGENTS.md` y la documentación local de Next.js aplicable.
2. Este `components.md` para componentes, containers, tokens y shells.
3. `docs/sections.md` para la composición y el orden de secciones de cada ruta.
4. El comportamiento existente en `app/`, `components/`, APIs y modelo de datos.
5. Las imágenes de Stitch como referencia de composición visual.
6. Los HTML de Stitch sólo como referencia de medidas y estilo; nunca como arquitectura o lógica para copiar literalmente.

Si dos pantallas de Stitch se contradicen, prevalecen este documento y `docs/sections.md`. No crear una segunda variante de navegación, card o container para igualar una captura aislada.

## 2. Tesis

### Tesis visual

Oficio humano de Tepic tratado con calidez documental y precisión editorial: fotografía realista, papel cálido, verde de confianza, barro como acento y una interfaz sobria que deja respirar el contenido.

### Tesis de contenido

- Sitio público: descubrir → comparar → confiar → contactar/guardar.
- Panel: estado → acción pendiente → administración → mejora.
- Administración: supervisar → revisar → decidir.

### Tesis de interacción

1. El header público pasa de transparente/ligero a papel sólido al desplazarse.
2. Guardar, abrir drawers y cambiar filtros usan transiciones de 120–220 ms con feedback inmediato.
3. El hero puede entrar con una secuencia breve de imagen, título y buscador; los paneles operativos no usan animación editorial.

Todas las animaciones se desactivan con `prefers-reduced-motion`.

## 3. Marca y assets

Los archivos de `tequit-svg-pack/` son la única fuente de verdad de la marca. No recrear el logo con texto, no cambiar paths, proporciones o colores y no aplicar sombras.

| Asset | Uso canónico |
| --- | --- |
| `tequit-logo-horizontal.svg` | Header público y aplicaciones horizontales sobre fondos claros |
| `tequit-symbol.svg` | Espacios compactos; marca, nunca icono funcional |
| `tequit-wordmark.svg` | Sólo cuando el símbolo ya está presente en el contexto |
| `tequit-app-icon-light.svg` | Launcher, favicon grande y previews sobre fondo claro |
| `tequit-app-icon-dark.svg` | Launcher, footer y previews sobre superficies oscuras |

Reglas:

- Logo horizontal: proporción `696:193`; altura aproximada 32–38 px desktop y 28–32 px mobile.
- Nunca usar el logo horizontal verde sobre fondo verde.
- En footer oscuro usar `tequit-app-icon-dark.svg` y, si hace falta, el nombre accesible en texto blanco separado.
- Mantener área libre mínima equivalente a la altura del acento barro del símbolo.
- Todo `<Image>` decorativo usa `alt=""`; todo logo enlazado usa nombre accesible “Tequit — Inicio”.

## 4. Tokens canónicos

No tomar los tokens Material generados en cada HTML de Stitch: cambian entre archivos. Implementar una sola capa semántica.

### Color

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-canvas` | `#FFF9F0` | Fondo general, marfil oficial |
| `--color-surface` | `#FFFFFF` | Campos y superficies elevadas |
| `--color-surface-muted` | `#F7F1E7` | Secciones y cards cálidas |
| `--color-brand` | `#254432` | Verde oficial; navegación y primary |
| `--color-brand-strong` | `#183225` | Hover/pressed sobre brand |
| `--color-brand-soft` | `#E4F1E9` | Estado activo y fondos de confianza |
| `--color-accent` | `#C75B3A` | Barro oficial; acento, no texto normal pequeño |
| `--color-accent-soft` | `#F7DDD2` | Guardado y acento suave |
| `--color-text` | `#17231D` | Texto principal |
| `--color-text-muted` | `#5D6A64` | Texto secundario |
| `--color-border` | `#DCE4DE` | Bordes/divisores |
| `--color-whatsapp` | `#08783E` | Contacto WhatsApp exclusivamente |
| `--color-verified` | `#2D7456` | Verificación y confianza |
| `--color-success` | `#186A3B` | Confirmaciones |
| `--color-warning` | `#8A5B00` | Pendiente/advertencia |
| `--color-error` | `#A33A2B` | Error/destructivo |
| `--color-star` | `#E3A600` | Rating y foco visible |

El barro no es el botón primario por defecto. Usar `brand` para acciones normales y `whatsapp` únicamente para contacto. Verificar contraste AA en toda combinación.

### Tipografía

- Display: **Fraunces**, pesos 600–700.
- UI/cuerpo: **Manrope**, pesos 400–750.
- Máximo dos familias.
- Escala: 12, 14, 16, 18, 22, 28, 36, 48 y 64 px.
- Body base 16 px, line-height 1.5–1.65.
- Paneles usan copy funcional; no hero de marketing.

### Espacio, radio y elevación

- Espaciado: 4, 8, 12, 16, 24, 32, 48, 64 y 96 px.
- Radio control: 10 px.
- Radio card: 16 px.
- Radio editorial: 24 px.
- Píldora: únicamente chips y estados.
- Sombra flotante: `0 4px 12px rgba(23,35,29,.05)`.
- La separación se consigue primero con espacio, fondo y divisores; no con cards anidadas.

### Breakpoints

| Nombre | Desde | Conducta |
| --- | ---: | --- |
| `mobile` | 0 | Una columna; bottom nav pública; drawers/sheets |
| `sm` | 640 px | Grids de dos si el contenido lo permite |
| `md` | 768 px | Transición tablet; formularios de hasta dos columnas |
| `lg` | 1024 px | Header desktop, sidebar del panel, filtros laterales |
| `xl` | 1280 px | Contenedor completo y grids de tres |

Validar 320, 390, 768, 1024 y 1440 px y zoom del navegador al 200%.

## 5. Containers reutilizables

Los containers controlan geometría; no incluyen copy ni lógica de negocio.

### `SiteContainer`

Contenedor horizontal general.

```ts
type SiteContainerProps = {
  as?: "div" | "section" | "main";
  size?: "reading" | "content" | "wide";
  bleedMobile?: boolean;
  className?: string;
  children: React.ReactNode;
};
```

- `reading`: máximo 760 px.
- `content`: máximo 1200 px; default.
- `wide`: máximo 1360 px para workspace/tablas.
- Gutter 16 px mobile, 24 px tablet, 32 px desktop.

### `PageStack`

Flujo vertical de una pantalla. Variantes `compact`, `default`, `editorial`; define únicamente separación vertical. No dibuja card.

### `Section`

Sección semántica con `tone="canvas|muted|brand"`, spacing vertical y `aria-labelledby`. Puede ser full-bleed y contener un `SiteContainer` interno.

### `SectionHeader`

Eyebrow opcional, título, descripción breve y una acción. En mobile la acción baja debajo del título; nunca desaparece sólo por falta de espacio.

### `Cluster`

Fila flexible para chips, metadata y acciones. Soporta wrap y alineación; sustituye grupos con estilos ad hoc.

### `AutoGrid`

Grid fluido de cards con `minItemWidth`. Variantes canónicas:

- Provider/business desktop: mínimo 320 px, máximo tres columnas.
- Métricas: mínimo 180 px, máximo cuatro.
- Servicios: mínimo 260 px, máximo dos.

### `SplitLayout`

Contenido principal + aside. Variantes `filters` (240–280 px) y `detail` (320–360 px). El aside puede ser sticky sólo en desktop.

### `DashboardFrame`

Shell del modo Prestador. Desktop usa sidebar completo. Mobile usa avatar en la esquina superior izquierda para abrir el drawer desde ese mismo lado y una bottom nav operativa de cinco destinos: Dashboard, Servicios, Solicitudes, Herramientas y Cuenta. Comparte tokens, tipografía y componentes con el modo Usuario; no muestra el footer público.

### `DashboardContent`

Máximo 1280 px, padding 16 mobile / 32 desktop, `PageStack` interno. Todas las pantallas del dashboard lo usan.

### `FormContainer`

Máximo 760 px. Puede usar superficie/borde sólo cuando el formulario necesita delimitarse. `FormGrid` cambia de una a dos columnas en `md`.

### `MobileActionDock`

Acciones críticas sticky/fixed en mobile. Debe respetar safe area, no coexistir encima de la bottom nav sin sumar ambas alturas y dejar padding final equivalente.

## 6. Shells y navegación

### `PublicShell`

Compuesto por `PublicHeader`, contenido, `PublicFooter` desktop y `PublicBottomNav` mobile. En anchos mobile el footer se oculta porque la bottom nav es el cierre persistente de la app.

#### `PublicHeader`

- Logo horizontal → `/`.
- Desktop, en orden: Buscar → `/buscar`; Negocios → `/negocios`; Publicar necesidad → `/solicitar`; Soy prestador → `/dashboard`; ubicación “Tepic, Nayarit”.
- Mobile: logo y ubicación compacta; sin hamburger.
- No alternar entre “Tequit”, “Tequit Marketplace”, “Oficio Humano” o nombres similares.

#### `PublicBottomNav`

Exactamente cinco items:

| Label | Icono Lucide | Ruta | Activo también en |
| --- | --- | --- | --- |
| Inicio | `Home` | `/` | sólo `/` |
| Buscar | `Search` | `/buscar` | `/servicios/**`, `/p/**` |
| Negocios | `Store` | `/negocios` | `/n/**` |
| Guardados | `Heart` | `/guardados` | sólo `/guardados` |
| Cuenta | `UserRound` | `/login` | `/registro` |

En `/solicitar` ningún item queda activo. Altura visual 64–72 px más safe area. Label siempre visible.

#### `PublicFooter`

- Marca y texto: “Encuentra personas y negocios en Tepic que puedan hacer el trabajo que necesitas.”
- Explora: Buscar servicios, Negocios locales, Guardados.
- Para quien le sabe: Crear perfil, Iniciar sesión, Tequit Pro.
- Nota legal: “Tequit facilita el contacto. No garantiza resultados ni participa en pagos o acuerdos.”

### `DashboardShell`

El drawer conserva el mapa completo del panel e incluye “Mi sitio” inmediatamente después de “Mi perfil”:

1. Resumen — `/dashboard`
2. Mi perfil — `/dashboard/perfil`
3. Mi sitio — `/dashboard/sitio`
4. Servicios — `/dashboard/servicios`
5. Trabajos — `/dashboard/trabajos`
6. Solicitudes — `/dashboard/solicitudes`
7. Reseñas — `/dashboard/resenas`
8. Estadísticas — `/dashboard/estadisticas`
9. Negocios — `/dashboard/negocios`
10. Plan — `/dashboard/plan`
11. Herramientas — `/dashboard/herramientas`

Desktop usa `DashboardSidebar`. Mobile usa `ProviderMobileHeader`, `ProviderDrawer` y `ProviderBottomNav`. El avatar abre el drawer desde la izquierda con las rutas completas. La bottom nav contiene sólo Dashboard, Servicios, Solicitudes, Herramientas y Cuenta. “Cambiar a modo Usuario” aparece en header/drawer y no cierra sesión.

Usar marca Tequit. “Panel de Juan” es contexto, no otra marca. No usar “Oficio Humano”, “Taller de Oficios”, “Professional Trades” ni “Local Expert”. No llamar “Administrador” al prestador.

### `AdminShell`

Marca/contexto “Administración Tequit”. Desktop conserva navegación horizontal. Mobile usa avatar administrativo arriba a la izquierda, drawer completo desde ese lado y bottom nav con Resumen, Altas, Prestador y Negocio. El drawer incluye Ver sitio público y Cerrar sesión. Las altas publicadas permiten regenerar, copiar, compartir y revocar su enlace privado de reclamo; nunca se conserva el token original en texto plano.

### `ProviderSiteShell`

`/p/**` permanece fuera de `PublicChrome`, pero usa navegación híbrida propia. El header sticky mantiene primero la identidad del prestador, ofrece anclas de sección en desktop y un control explícito `Explorar Tequit`. Este abre un drawer derecho con Inicio, Buscar, Negocios, Publicar necesidad, Favoritos y Cuenta. En mobile el único dock inferior sigue siendo WhatsApp. El footer cierra con co-marca y tres salidas controladas hacia Tequit.

## 7. Primitives

### `Button`

Variantes: `primary`, `secondary`, `ghost`, `whatsapp`, `danger`. Tamaños `sm`, `md` (48 px) y `lg` (52–56 px). Estados default, hover, active, focus-visible, disabled y loading.

Un botón ejecuta una acción; un enlace navega. `ButtonLink` conserva semántica de enlace.

### `IconButton`

Target mínimo 44 × 44 px. Siempre `aria-label` y tooltip desktop cuando el icono no tiene label visible.

### Navegación textual y utilidades

- `TextLink`: variantes `default`, `muted` y `danger`; siempre conserva semántica de enlace.
- `Divider`: horizontal/vertical, sólo cuando el espacio o cambio tonal no bastan.
- `Spinner`: indicador para acciones breves; pantallas y bloques usan `Skeleton`.
- `Tooltip`: apoyo para iconos desktop; nunca contiene información esencial inaccesible en mobile.

### Campos

`TextField`, `TextAreaField`, `SelectField`, `RadioCardGroup`, `CheckboxField`, `FileDropzone` comparten `FieldShell`: label persistente, help, required/optional, error asociado y contador cuando aplica.

### `Chip`

Variantes `filter`, `tag`, `status`. Un chip filtro es interactivo; un tag no lo es. No usar pills como botones primarios.

### `Badge`

Variantes `verified`, `status`, `plan`, `count`. Siempre texto + color; no comunicar estado sólo con icono.

### `Avatar`

Variantes `provider`, `business`, `user`; fallback de iniciales. No usar fotografías distintas de la misma persona entre pantallas.

### `BrandLogo`

Props `variant="horizontal|symbol|wordmark|app-light|app-dark"` y tamaños definidos; resuelve siempre a un SVG del pack oficial.

## 8. Componentes de navegación y feedback

- `PublicHeader`
- `PublicBottomNav`
- `PublicFooter`
- `DashboardSidebar`
- `ProviderMobileHeader`
- `ProviderDrawer`
- `ProviderBottomNav`
- `AdminSidebar`
- `Breadcrumbs`
- `Tabs` sólo para subcontextos reales, no para sustituir navegación global.
- `Drawer` y `BottomSheet` comparten overlay, focus trap, Escape y restauración de foco.
- `Dialog` comparte overlay/focus trap y se reserva para confirmaciones o decisiones bloqueantes.
- `DropdownMenu` agrupa acciones secundarias; no oculta el CTA principal.
- `Snackbar` para guardado/copiado; incluye Deshacer cuando la acción es reversible.
- `InlineAlert` para mensajes persistentes.
- `EmptyState`, `ErrorState`, `Skeleton` y `SuccessState` son componentes compartidos, no bloques distintos por pantalla.

## 9. Componentes de marketplace

### `MarketplaceSearch`

Variantes `hero` y `compact`. Props mínimas: valor, placeholder, submit, loading y label accesible. La misma búsqueda se usa en Inicio, Buscar, Negocios y Servicio.

### `FilterBar`

Chips Todos/Personas/Negocios/Verificados. Desktop se complementa con `FilterSidebar`; mobile con `FilterSheet`. Los filtros que aún no funcionen no deben presentarse como activos en producción.

### `ProviderCard`

Contenido canónico: avatar/foto, profesión, nombre, rating + número de reseñas, máximo tres servicios, verificaciones, zona, guardar y enlace “Ver perfil”. Variantes `grid` y `list`; mismo componente y datos.

### `BusinessCard`

Contenido canónico: imagen/fallback, “Negocio local”, categoría, nombre, rating + reseñas, descripción breve, máximo tres servicios, zona, guardar y “Ver negocio”. No reutilizar `ProviderCard` cambiando sólo el label.

### `SaveButton`

Estados saved/unsaved, `aria-label` dinámico y snackbar. Persistencia actual en dispositivo; ningún componente sugiere cuenta o sincronización.

### Confianza

- `Rating`: valor, número de reseñas y estado sin reseñas.
- `VerificationSummary`: número/resumen compacto.
- `VerificationList`: tipo, explicación y fecha opcional; nunca “garantizado”.
- `AffiliationNotice`: prestador ↔ negocio y aclaración de reputaciones independientes.

### Detalle público

- `EntityHero`: variante provider/business; identidad, zona, confianza, guardar y acciones.
- `ServiceList`
- `PortfolioGallery`
- `ProductList`
- `ReviewList`
- `WhatsAppButton`
- `RequestForm`

`WhatsAppButton` usa `--color-whatsapp`, nombre accesible de la entidad y registra evento antes de abrir el enlace externo.

## 10. Componentes de formularios

### `RequestForm`

Secciones fijas: Necesidad, Ubicación y tiempo, Evidencia, Contacto, Privacidad. Variantes general/provider/business sin duplicar markup. Estados editing, submitting, field-error, server-error y success con folio.

### `RegistrationFlow`

Un solo flujo `/registro` con pasos internos:

1. `AccountTypeSelector`: Usuario/Prestador/Negocio.
2. Formulario específico del tipo de cuenta.
3. `WhatsAppOtpVerification`: código de seis dígitos, vigencia de cinco minutos, reenvío limitado y opción para corregir el número.
4. `RegistrationSuccess`, únicamente después de verificar el celular.

La identidad principal es el celular mexicano normalizado a E.164 más contraseña. El correo es opcional, se confirma y se usa sólo para recuperación. El celular privado de la cuenta nunca se toma automáticamente del WhatsApp público.

La verificación conserva el contexto en la pestaña para sobrevivir una recarga y no es una ruta independiente. Login permanece `/login`.

### `LoginForm`

Celular, contraseña, error inline, loading y destino `next`. Acepta correo únicamente para migrar cuentas anteriores; después de asociar el celular ya no permite acceso público por correo. Administración usa su variante explícita por correo. Copy aclara que explorar no requiere cuenta.

### Identidad telefónica

- `phone_login_enabled_at` significa que el celular puede usarse para entrar; no significa que su propiedad fue verificada.
- Sólo `phone_verified_at` después de OTP habilita el estado “Celular verificado”.
- `profiles.phone_e164` es privado; `provider_profiles.phone` y `businesses.phone` son contactos públicos independientes.
- Las cuentas anteriores usan una pantalla bloqueante, sobria y de una sola acción para activar celular.

## 11. Componentes del panel

- `DashboardPageHeader`: título, descripción funcional y acción opcional.
- `MetricGrid` + `MetricItem`: datos reales, no mosaico ornamental.
- `CompletionAlert`: acción concreta para completar perfil/portafolio.
- `ServiceManager`: contador Free, lista, activar/desactivar y alta.
- `PortfolioManager`: galería, carga, preview, progreso y errores.
- `AssistedMediaEditor`: en altas administrativas separa Cámara y Galería, muestra selección y contenido guardado, permite quitar antes de subir y recorta avatar/logo en 1:1 y portada en 16:9. Los trabajos preservan su encuadre.
- `LeadInbox`: lista + detalle desktop; navegación lista/detalle mobile.
- `LeadListItem`
- `LeadDetail`
- `LeadStatusControl`: Nueva, Vista, Me interesa, No hago este trabajo, Contactado, Cerrada.
- `ReviewSummary`, `ReviewItem`, `ReviewInviteAction`.
- `StatsPeriodSelector`, `MetricTrend`, `SearchTermsList`.
- `AffiliationCard`, `BusinessOwnershipCard`.
- `PlanComparison`, `PlanStatus`.
- `ResponsiveDataTable` para administración; en mobile cambia a filas semánticas, no scroll ilegible.
- `Pagination` sólo cuando el backend pagina; no simular paginación sobre arrays locales.

Servicios y Trabajos son rutas/componentes separados. Solicitudes lista y detalle son estados del mismo módulo. Reseñas no se mezcla dentro de Estadísticas.

## 12. Estados obligatorios

Todo componente de datos contempla:

- loading/skeleton;
- contenido;
- vacío con acción;
- error con reintento;
- contenido largo y datos parciales.

Todo formulario contempla:

- inicial;
- validación inline sin perder datos;
- submitting;
- error de servidor/red;
- éxito.

Estados destructivos requieren confirmación; guardar cambios normales no.

## 13. Convenciones de implementación

Estructura objetivo sugerida:

```text
components/
  ui/             # Button, fields, badge, chip, feedback
  layout/         # containers, sections, shells
  navigation/     # header, bottom nav, sidebars, drawers
  marketplace/    # cards, search, filters, trust
  profile/        # entity hero, services, portfolio, reviews
  forms/          # request, registration, login
  dashboard/      # metrics, leads, managers, plan
```

- Componentes de servidor por defecto; `"use client"` sólo para interacción/estado.
- Props tipadas con datos del dominio; no leer demo-data dentro de componentes puramente visuales.
- `className` es escape controlado, no API principal de variantes.
- Variantes con nombres semánticos, no `green`, `rounded-big` o `screen-06`.
- Lucide es el único set de iconos. No copiar Material Symbols de Stitch.
- No copiar Tailwind CDN, scripts inline, dark mode generado ni URLs remotas de los HTML de Stitch.
- No crear componentes por pantalla (`HomeProviderCard`, `SavedProviderCard`) si una variante resuelve la diferencia.

## 14. QA para agentes

Antes de declarar terminada una pantalla:

- Usa el shell correcto y su navegación completa.
- Coincide con la receta de `docs/sections.md`.
- Usa logos del SVG pack.
- Reutiliza containers y componentes existentes.
- No introduce funciones futuras ni datos inventados.
- Funciona en 390 y 1440 px, además de los breakpoints intermedios.
- Mantiene labels, foco, teclado, contraste AA y target mínimo 44 px.
- No oculta contenido detrás de nav/docks.
- Incluye estados loading, vacío, error y éxito cuando corresponda.
- Pasa lint, typecheck, tests y build aplicables.

## 15. Hallazgos de Stitch que este contrato corrige

- Navegaciones públicas en español e inglés y con contenidos distintos.
- Bottom nav de 4 o 5 items, a veces con “Mis pedidos”, “Mensajes” o “Money”.
- Marca alterna “Oficio Humano”, “Taller de Oficios” o “Tequit Marketplace”.
- Prestador etiquetado como “Administrador”.
- Servicios y Portafolio fusionados, aunque son rutas separadas.
- Dos diseños de Solicitudes con shells diferentes.
- Estadísticas con ingresos, finanzas y tasa de respuesta no existentes.
- Configuración, notificaciones, seguridad, mensajes y facturación sin rutas/soporte actual.
- Íconos Material mezclados con Lucide.
- Tokens y colores Material diferentes entre HTML y `DESIGN.md`.
- 42 HTML exportados contienen 41 configuraciones Tailwind distintas; ninguna configuración individual es canónica.

La composición visual de Stitch se conserva donde aporta valor; estas inconsistencias no se trasladan al producto.

## 16. Alta asistida administrativa

- `AdminShell` es obligatorio en `/admin`, `/admin/altas` y `/admin/**/nuevo`.
- `AssistedOnboardingWizard` usa una secuencia lineal de seis pasos: datos, servicios, fotos, perfil, verificación y confirmación.
- En móvil conserva todas las acciones y utiliza una barra inferior de avance; el contexto lateral pasa arriba sin duplicar navegación.
- Las fotos se capturan o eligen con el control nativo, se procesan antes de publicarse y nunca se muestran desde cuarentena.
- El resultado de publicación separa el enlace público del enlace privado y de un solo uso para reclamar.

## 17. Consentimiento y documentos legales

- `LegalConsentFields` es un único bloque reutilizable en cualquier alta pública de cuenta. Contiene dos casillas independientes, desmarcadas y obligatorias, además de las versiones enviadas al servidor.
- Los enlaces legales abren un `dialog` accesible sobre el formulario: conserva datos escritos, bloquea scroll de fondo, admite Escape y overlay, y devuelve el foco al disparador. Leer nunca acepta automáticamente.
- `LegalDocumentContent` representa la fuente estructurada y versionada compartida por modal, `/terminos` y `/privacidad`; no se duplican textos en componentes.
- En móvil el diálogo ocupa casi todo el viewport con controles fuera del área desplazable. En desktop permanece centrado y acotado.
- Un error de consentimiento se muestra dentro del bloque legal antes de iniciar OTP o crear una cuenta de reclamación.
