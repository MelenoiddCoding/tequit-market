# Tequit — secciones canónicas por pantalla

Este documento define qué contiene cada ruta y en qué orden. `components.md` define cómo se construye cada pieza. Mobile y desktop comparten información y acciones; cambia la composición, no la funcionalidad.

## Convenciones

- `PUBLIC`: `PublicShell`.
- `DASHBOARD`: `DashboardShell`.
- `ADMIN`: `AdminShell`.
- Un nombre entre backticks se refiere a un componente definido en `components.md`.
- Stitch es referencia visual. Esta matriz decide secciones, navegación y límites funcionales.

## Mapa de normalización del export Stitch

| Export Stitch | Destino canónico | Decisión |
| --- | --- | --- |
| 01–08 | Rutas públicas equivalentes | Conservar composición útil; reemplazar shells/copy/componentes inconsistentes |
| 09 selección + 09 formulario + 10 confirmación | `/registro` | Tres estados/pasos del mismo flujo, no tres rutas |
| Login | `/login` | Falta en export; construir con sistema canónico |
| 11 resumen | `/dashboard` | Adoptar composición, quitar “Administrador” |
| 12 servicios + portfolio | `/dashboard/servicios` y `/dashboard/trabajos` | Separar en dos pantallas |
| 13 solicitudes + 15 solicitudes | `/dashboard/solicitudes` | 13 aporta lista; 15 aporta detalle; un solo módulo/shell |
| 14 estadísticas | `/dashboard/estadisticas` | Conservar composición de métricas; eliminar ingresos, finanzas, respuesta y opiniones inventadas |
| 16 configuración | `/dashboard/perfil` parcialmente | Usar patrón de formulario; notificaciones/seguridad/soporte son FUTURE |
| 17 reseñas | `/dashboard/resenas` | Conservar lista/resumen; reemplazar navegación/marca |
| 18 negocios | `/dashboard/negocios` | Adaptar a afiliaciones y negocios, no gestión comercial inventada |
| 19 plan | `/dashboard/plan` | Base canónica |
| 20 facturación | Sin ruta actual | Rechazar billing/pago; sólo puede inspirar composición de plan |
| Administración | `/admin` | Falta en export; construir con sistema canónico |

## Sitio público

### 01. Inicio — `/` — PUBLIC

Orden:

1. `PublicHeader`.
2. Hero full-bleed editorial: ubicación, promesa, copy y `MarketplaceSearch hero`.
3. Prueba breve de confianza.
4. Accesos rápidos a categorías.
5. Servicios populares.
6. Prestadores verificados con `ProviderCard`.
7. Negocios locales con `BusinessCard`.
8. CTA para crear perfil.
9. `PublicFooter` y `PublicBottomNav` mobile.

Desktop puede superponer texto/búsqueda sobre una imagen con zona tonal estable. Mobile apila imagen, promesa, buscador y señales; no elimina negocios ni footer del flujo completo.

### 02. Buscar — `/buscar` — PUBLIC

1. Header + `DashboardPageHeader` adaptado a público con consulta.
2. `MarketplaceSearch compact`.
3. `FilterBar`.
4. Desktop: `SplitLayout filters` con `FilterSidebar` + resultados.
5. Mobile: botón y `FilterSheet` + resultados.
6. Resumen de cantidad/orden.
7. Lista mixta `ProviderCard list` / `BusinessCard list`.
8. Empty/error/skeleton.
9. Footer/bottom nav.

No usar nav en inglés ni afirmar geolocalización. Zona/categoría sólo se habilitan cuando filtran realmente.

### 03. Servicio — `/servicios/[slug]` — PUBLIC

1. Header.
2. `Breadcrumbs`.
3. Encabezado “{Servicio} en Tepic”, descripción y búsqueda.
4. Resumen de opciones.
5. Resultados reutilizando cards de búsqueda.
6. Empty o 404 con acciones.
7. Footer/bottom nav; Buscar activo.

### 04. Negocios — `/negocios` — PUBLIC

1. Header.
2. Encabezado “Negocios locales”.
3. Search compacta.
4. Filtros si son funcionales.
5. `AutoGrid` de `BusinessCard`.
6. Empty/error/skeleton.
7. Footer/bottom nav; Negocios activo.

No usar información no disponible como abierto/cerrado u horarios inventados.

### 05. Solicitar — `/solicitar` — PUBLIC

1. Header compacto.
2. Encabezado “Publica lo que necesitas”.
3. Contexto dirigido opcional: prestador/negocio/servicio.
4. `RequestForm`: Necesidad → Ubicación/tiempo → Evidencia → Contacto → Privacidad.
5. Estados validation/submitting/error/success con folio.
6. Footer. En mobile puede haber `MobileActionDock`; ningún tab activo.

No usar “Mis pedidos”, citas ni seguimiento con cuenta.

### 06. Perfil de prestador — `/p/[providerSlug]` — PUBLIC

1. Header.
2. `EntityHero provider` con guardar, confianza y CTAs.
3. `AffiliationNotice` opcional.
4. Servicios.
5. Portafolio.
6. Sobre mí y zonas/capacidades.
7. Reseñas aprobadas.
8. Verificaciones explicadas en aside desktop/sección mobile.
9. Solicitud dirigida.
10. Footer/bottom nav; Buscar activo.

Mobile conserva bio, reseñas y formulario aunque la captura de Stitch los omita. No usar nav con “Mis pedidos”.

### 07. Ficha de negocio — `/n/[businessSlug]` — PUBLIC

1. Header.
2. `EntityHero business`.
3. Sobre el negocio.
4. Servicios.
5. Productos con “Preguntar por WhatsApp”, sin carrito.
6. Portafolio si existe.
7. Equipo afiliado con `ProviderCard`.
8. Reseñas aprobadas.
9. Verificaciones.
10. Solicitud dirigida.
11. Footer/bottom nav; Negocios activo.

No inventar licencia profesional, domicilio confirmado, horario o garantía.

### 08. Guardados — `/guardados` — PUBLIC

1. Header.
2. Título + “En este dispositivo”.
3. Explicación breve de persistencia local.
4. Sección Personas.
5. Sección Negocios.
6. Empty/error de almacenamiento/snackbar deshacer.
7. Footer/bottom nav; Guardados activo.

### 09. Registro — `/registro` — PUBLIC

Estados internos, mismo URL:

1. Selección Prestador/Negocio.
2. Formulario específico del tipo.
3. Éxito de registro.

Shell y orden:

1. Header compacto/logo.
2. Progreso del flujo.
3. `RegistrationFlow` en `FormContainer`.
4. Beneficios breves sólo desktop si hay espacio; no prometer clientes verificados.
5. Enlace a Login.
6. Footer/bottom nav; Cuenta activo.

### 10. Login — `/login` — PUBLIC

1. Header compacto/logo.
2. Encabezado de cuenta de prestador/negocio.
3. `LoginForm`.
4. Error/loading/session expired.
5. CTA a Registro.
6. Nota y CTA para explorar sin cuenta.
7. Footer/bottom nav; Cuenta activo.

Credenciales demo sólo en modo demo.

## Panel de prestador

Todas las rutas siguientes usan el mismo `DashboardShell` con nueve items completos. En mobile mantienen el chrome público y Cuenta activa; el cambio entre áreas ocurre mediante un selector compacto dentro del panel.

### 11. Resumen — `/dashboard` — DASHBOARD

1. Saludo + periodo.
2. `CompletionAlert` opcional.
3. Métricas: Vistas, WhatsApp, Solicitudes, Conversión.
4. “Por atender” con últimas solicitudes.
5. Empty/skeleton/error parcial.

### 12. Mi perfil — `/dashboard/perfil` — DASHBOARD

1. `DashboardPageHeader` + Ver perfil público.
2. Estado de publicación/cambios.
3. Formulario: identidad, bio, zonas, WhatsApp.
4. Preview/resumen lateral desktop opcional.
5. Guardando/guardado/error.

El patrón visual puede venir de Configuración de Stitch, pero no existen tabs de notificaciones, seguridad o soporte.

### 13. Servicios — `/dashboard/servicios` — DASHBOARD

1. Header.
2. Contador `n de 5` y contexto Free.
3. Lista de servicios y activar/desactivar.
4. Alta de servicio.
5. Empty/error/límite Free.

No contiene galería ni precios/rangos inventados.

### 14. Trabajos — `/dashboard/trabajos` — DASHBOARD

1. Header.
2. Galería gestionable.
3. Añadir trabajo: título, descripción y foto.
4. Preview/progreso/validación.
5. Empty/error/success.

### 15. Solicitudes — `/dashboard/solicitudes` — DASHBOARD

Desktop:

1. Header + privacidad.
2. `LeadInbox`: lista izquierda y detalle derecha.
3. Datos, fotos privadas, estado y WhatsApp.

Mobile:

1. Lista como vista inicial.
2. Detalle como estado interno con “Volver a Solicitudes”.
3. `MobileActionDock` para contacto/estado.

No crear `/mensajes`; la barra inferior es la navegación pública y Cuenta representa el dashboard.

### 16. Reseñas — `/dashboard/resenas` — DASHBOARD

1. Header.
2. Resumen de rating/reseñas/enlaces pendientes.
3. Lista aprobada.
4. Generar enlace para cliente anterior.
5. Empty/link-created/error/skeleton.

### 17. Estadísticas — `/dashboard/estadisticas` — DASHBOARD

1. Header + selector 7/30 días.
2. Métricas Vistas, WhatsApp, Solicitudes, Conversión.
3. Tendencia sólo con datos reales.
4. Búsquedas que trajeron visitas.
5. Zero-data/skeleton/error.

Eliminar ingresos, finanzas, tasa de respuesta, sentimientos y opiniones duplicadas del export Stitch.

### 18. Negocios — `/dashboard/negocios` — DASHBOARD

1. Header.
2. Sección Afiliaciones: pendiente/activa/rechazada/vacía.
3. Aclaración de reputaciones independientes.
4. Sección Mis negocios.
5. CTA futuro “Comenzar registro” claramente honesto.

No asumir catálogo, ventas, mensajes o múltiples negocios administrables sin backend.

### 19. Plan — `/dashboard/plan` — DASHBOARD

1. Header y plan actual.
2. Comparación Free vs Pro futuro.
3. Límites/beneficios verificables.
4. CTA no transaccional “Solicitar Pro”.
5. Estados enviado/error/Pro conceptual.

No facturación, método de pago, recibos ni checkout.

## Administración

### 20. Administración — `/admin` — ADMIN

1. Header “Panel administrativo”.
2. Métricas operativas.
3. Prestadores y planes en `ResponsiveDataTable`.
4. Moderación de reseñas.
5. Taxonomía.
6. Empty/loading/error/confirmaciones de acción.

No reutilizar `DashboardShell`; usar `AdminShell`. En mobile, la tabla se transforma en filas semánticas.

## Regla final de consistencia

Una pantalla puede variar en layout entre mobile y desktop, pero siempre debe conservar:

- el mismo shell y mapa de navegación;
- el mismo nombre de producto, idioma y entidad;
- las mismas secciones y acciones esenciales;
- las mismas reglas de cuenta, guardados, contacto y privacidad;
- los componentes y tokens de `components.md`.

Si una captura de Stitch contradice esta matriz, se adapta la captura; no se adapta el producto a la inconsistencia.
