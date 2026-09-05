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
9. `PublicFooter` desktop y `PublicBottomNav` mobile; no se apilan ambos en celular.

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

### 06. Sitio público de prestador — `/p/[providerSlug]` — PROVIDER SITE

Usa `ProviderSiteShell`, sin header, footer ni bottom nav del marketplace.

El shell incluye un header profesional sticky: identidad del prestador, anclas internas desktop y `Explorar Tequit`. En mobile, el control abre un drawer derecho hacia Inicio, Buscar, Negocios, Publicar necesidad, Favoritos y Cuenta; no sustituye el dock de WhatsApp. El footer co-marcado ofrece continuidad hacia Buscar, Negocios y Publicar necesidad.

1. Portada, identidad, profesión, zona y WhatsApp.
2. Rating, reseñas, verificaciones y experiencia.
3. Servicios con descripción individual.
4. Trabajos realizados.
5. Presentación y zonas.
6. Reseñas aprobadas.
7. Preguntas frecuentes.
8. Solicitud dirigida.
9. Cierre con WhatsApp, compartir y dock móvil.

Free conserva co-marca Tequit; Pro puede usar identidad propia con sello discreto. Los perfiles incompletos funcionan con `noindex`; demo no permite contacto y suspendido responde 404.

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

1. Cuenta Usuario seleccionada por defecto.
2. Opción secundaria “Quiero promocionarme” para elegir Prestador/Negocio.
3. Formulario específico del tipo; celular privado y contraseña son la identidad de acceso.
4. Correo de recuperación opcional con confirmación independiente.
5. Dos aceptaciones independientes y obligatorias para Términos y Privacidad; cada enlace abre un modal sin perder el formulario y conserva acceso a la página canónica.
6. Verificación por WhatsApp con OTP de seis dígitos, vigencia de cinco minutos, reenvío y corrección de número.
7. Éxito sólo después de comprobar el celular.

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
3. `LoginForm` con celular y contraseña; correo sólo para migración de cuentas anteriores.
4. Error/loading/session expired.
5. CTA a Registro.
6. Nota y CTA para explorar sin cuenta.
7. Footer/bottom nav; Cuenta activo.

Credenciales demo sólo en modo demo.

### Activar celular — `/cuenta/activar-celular` — PUBLIC AUTENTICADO

1. Explicación breve de la migración obligatoria.
2. Celular privado y contraseña actual.
3. Aclaración de que no cambia el WhatsApp público y sigue pendiente de OTP.
4. Error de duplicado con salida a soporte.
5. Continuación al destino original.

### Recuperar acceso — `/recuperar`, `/restablecer` — PUBLIC

1. Solicitud con correo de recuperación confirmado.
2. Respuesta neutra que no revela si existe la cuenta.
3. Callback seguro y definición de contraseña nueva.
4. Error de enlace inválido o expirado.
5. La entrega a usuarios externos requiere configurar SMTP propio en Supabase; sin SMTP no se ofrece esta recuperación aunque el acceso por celular siga operativo.

## Panel de prestador

Todas las rutas siguientes usan el mismo `DashboardShell` del modo Prestador. En mobile usan avatar + drawer izquierdo para el mapa completo y bottom nav con Dashboard, Servicios, Solicitudes, Herramientas y Cuenta. El modo Usuario conserva Inicio, Buscar, Negocios, Favoritos y Cuenta.

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

### Mi sitio — `/dashboard/sitio` — DASHBOARD

1. Estado y checklist exacto de indexación.
2. URL pública, compartir y QR PNG/SVG.
3. Identidad: frase, portada, avatar, presentación y experiencia.
4. Descripción pública por servicio.
5. Hasta seis preguntas frecuentes y enlaces sociales.
6. Personalización visual disponible sólo en Pro.
7. Vista previa y guardado con estados reales.

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

No crear `/mensajes`; la bottom nav de Prestador prioriza las cinco tareas definidas y el drawer conserva el mapa completo.

### Herramientas — `/dashboard/herramientas` — DASHBOARD

1. Header funcional.
2. Utilidades previstas: cotizaciones, órdenes de trabajo y calculadoras.
3. Estado “Próximamente” mientras no exista backend; ninguna acción simula funcionamiento.

### Cuenta de prestador — `/dashboard/cuenta` — DASHBOARD

1. Datos de la cuenta.
2. Edición del perfil público.
3. Seguridad.
4. Cambio explícito a modo Usuario.

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

El directorio de Prestadores y planes se pagina en servidor y permite buscar por nombre, teléfono o correo administrativo. El filtro y la página viven en la URL; cambiar o limpiar la búsqueda vuelve a la primera página.

No reutilizar `DashboardShell`; usar `AdminShell`. En mobile, la tabla se transforma en filas semánticas.

### 21. Altas asistidas — `/admin/altas` — ADMIN

1. Header y CTA separados para prestador y negocio.
2. Cola ordenada por última actualización.
3. Estado, origen y tipo de cada alta.
4. Continuar borrador, abrir publicación y administrar enlace de reclamo.
5. Empty/error/loading.

En mobile, Admin conserva acceso persistente mediante bottom nav y drawer desde el avatar. En el detalle de un alta publicada se puede generar un enlace de reclamo nuevo, visualizarlo, copiarlo, compartirlo o revocarlo; regenerar invalida el anterior.

### 22. Nueva alta — `/admin/prestadores/nuevo`, `/admin/negocios/nuevo` — ADMIN

1. Datos básicos y detección de duplicados.
2. Servicios canónicos con descripción pública.
3. Avatar/logo, portada y trabajos.
4. Presentación y zonas.
5. Verificaciones con evidencia breve.
6. Consentimiento explícito, revisión y publicación.
7. Resultado con URL pública y enlace privado de reclamo.

Los seis pasos funcionan como navegación directa: el administrador puede inspeccionar o editar cualquier sección sin avanzar secuencialmente. Guardar persiste el formulario completo; publicar conserva las validaciones obligatorias.

Fotos separa Cámara y Galería. Antes de subir muestra previews removibles; avatar/logo y portada incluyen ajuste de zoom y posición con salida 1:1 y 16:9, mientras los trabajos conservan el encuadre original. Al retomar un alta se muestran las imágenes ya guardadas.

### 23. Reclamar perfil — `/reclamar/[token]` — PUBLIC

1. Estado del enlace sin revelar datos privados.
2. Crear cuenta o iniciar sesión mediante celular y contraseña. Crear cuenta exige aceptar Términos y Privacidad; iniciar con una cuenta existente no exige reaceptación en esta entrega.
3. Exigir coincidencia completa con el WhatsApp registrado en la ficha.
4. Transferencia atómica y acceso al dashboard.
5. Estados inválido, expirado, revocado, usado y error.

## Documentos legales

### Términos — `/terminos` — PUBLIC

1. Título, versión y fecha de vigencia.
2. Texto completo proveniente de la misma fuente versionada usada por el modal de consentimiento.
3. Footer y bottom nav públicos.

### Privacidad — `/privacidad` — PUBLIC

1. Título, versión y fecha de vigencia.
2. Texto completo proveniente de la misma fuente versionada usada por el modal de consentimiento.
3. Footer y bottom nav públicos.

## Regla final de consistencia

Una pantalla puede variar en layout entre mobile y desktop, pero siempre debe conservar:

- el mismo shell y mapa de navegación;
- el mismo nombre de producto, idioma y entidad;
- las mismas secciones y acciones esenciales;
- las mismas reglas de cuenta, guardados, contacto y privacidad;
- los componentes y tokens de `components.md`.

Si una captura de Stitch contradice esta matriz, se adapta la captura; no se adapta el producto a la inconsistencia.
