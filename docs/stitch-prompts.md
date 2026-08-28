# Prompts listos para Google Stitch — Tequit

Este archivo está pensado para copiar y pegar en Google Stitch. Crea **un solo proyecto** para Tequit y ejecuta los prompts en el orden indicado. No inicies un proyecto distinto para cada pantalla: la consistencia mejora cuando Stitch conserva el contexto, los componentes y los tokens.

## Cómo usar este paquete

1. Crea un proyecto nuevo en Stitch llamado **Tequit — Rediseño integral**.
2. Pega primero el **Prompt 00 — Sistema base**.
3. Genera y aprueba visualmente la fundación antes de continuar.
4. Pega los prompts 01 a 20, uno por uno, dentro del mismo proyecto.
5. Cuando un prompt pida variantes, conserva cada una como frame separado.
6. Usa estos nombres: `NN-nombre-mobile`, `NN-nombre-desktop` y `NN-nombre-estado-mobile`.
7. Si Stitch cambia el sistema visual, añade al final del prompt: “No cambies el sistema visual aprobado ni inventes nuevos tokens”.
8. Al terminar, ejecuta el **Prompt 21 — Auditoría de consistencia**.

No existe un paquete `stitch_reference/` en el repositorio. No cargues la imagen hero actual como plantilla obligatoria; solicita imágenes documentales nuevas y conserva sólo la dirección de marca descrita aquí.

Antes del Prompt 00, carga en Stitch como assets de marca los cinco SVG de `tequit-svg-pack/`:

- `tequit-logo-horizontal.svg`: logo principal para header y aplicaciones horizontales sobre fondos claros.
- `tequit-symbol.svg`: símbolo aislado para espacios compactos y elementos de marca, no como icono funcional.
- `tequit-wordmark.svg`: nombre aislado cuando el símbolo ya está presente cerca.
- `tequit-app-icon-light.svg`: icono cuadrado para fondo claro, launcher y previews claras.
- `tequit-app-icon-dark.svg`: icono cuadrado para superficies oscuras, launcher y previews oscuras.

Los SVG son la fuente de verdad. No redibujarlos, sustituirlos por texto, deformarlos, rotarlos, aplicar sombras, alterar sus paths ni cambiar sus colores. La paleta oficial del logo es verde `#254432`, barro `#C75B3A` y marfil `#FFF9F0`.

---

## Prompt 00 — Sistema base

```text
Crea el sistema de diseño y las plantillas base de Tequit, un marketplace local mobile-first de Tepic, Nayarit, cuya promesa es “Encuentra quién le sabe”. Tequit ayuda a encontrar personas prestadoras y negocios locales, evaluar señales de confianza y contactarlos directamente por WhatsApp. No hay checkout, pagos, chat interno, mapa, agenda, precios cerrados ni cuentas para usuarios exploradores. Los guardados viven únicamente en el navegador y dispositivo. Las cuentas son sólo para prestadores, dueños de negocio y administradores.

Dirección creativa: oficio humano, confianza local y precisión editorial. Debe sentirse cálido y auténtico, no folclórico ni turístico. Usa fotografía documental de personas trabajando, manos, materiales, talleres, hogares y comercios reales de Tepic. Evita estética SaaS genérica, glassmorphism, neón, gradientes tecnológicos, exceso de tarjetas y fotografías corporativas posadas.

Sistema visual:
- Fondo principal marfil de marca #FFF9F0 y secciones crema #F7F1E7.
- Texto principal #17231D, marca verde oficial #254432, verde secundario #35634A y verificaciones #2D7456.
- Acento barro oficial #C75B3A y fondo barro suave #F7DDD2.
- Bordes #DCE4DE, texto secundario #5D6A64, foco #E3A600.
- Éxito #186A3B, advertencia #8A5B00, error #A33A2B y CTA WhatsApp #08783E.
- Tipografía Fraunces 600–700 para títulos y cifras editoriales; Manrope 400–750 para cuerpo, navegación, formularios, datos y botones.
- Escala de espacios 4, 8, 12, 16, 24, 32, 48, 64 y 96 px.
- Radios: 10 px en controles, 16 px en cards compactas y 24 px en superficies editoriales. Píldora sólo en chips y estados.
- Targets mínimos 44 × 44 px, contraste WCAG 2.2 AA y foco siempre visible.
- Iconografía Lucide, trazo 1.75–2 px.
- Movimiento de 120–220 ms y alternativa prefers-reduced-motion.

Crea primero una página de foundations con paleta, tipografía, escala, radios, bordes, elevación y ejemplos accesibles. Después crea un component sheet con:
1. Header público desktop y bottom navigation mobile.
2. Footer público.
3. Sidebar desktop, header y drawer mobile para el panel.
4. Shell administrativo propio.
5. Buscador hero y buscador compacto.
6. Chips y filtros desktop/mobile.
7. Card de prestador y card de negocio como componentes visualmente distintos.
8. Rating, número de reseñas, zona, verificación, estado y badge de plan.
9. Botones WhatsApp, Primary, Secondary, Ghost y Destructive con loading, disabled, hover y focus.
10. Corazón guardar/no guardado y snackbar.
11. Inputs, textarea, select, radio cards, carga de archivo, ayuda y error inline.
12. Servicio, producto, trabajo/portafolio, reseña, afiliación y solicitud.
13. Empty state, skeleton, banner de error y confirmación de éxito.
14. Métrica, tabla responsive, selector de estado y comparación de plan.

Uso obligatorio de marca:
- Header público desktop y mobile: usa `tequit-logo-horizontal.svg` sobre el fondo marfil/claro. Conserva su proporción 696:193, sin recortar y con altura visual aproximada de 32–38 px en desktop y 28–32 px en mobile.
- Footer oscuro: usa `tequit-app-icon-dark.svg` como marca compacta y acompáñalo con el nombre accesible “Tequit” en texto blanco sólo cuando haga falta legibilidad. No uses el logo horizontal verde sobre verde.
- Panel y administración: usa `tequit-symbol.svg` o `tequit-app-icon-dark.svg` de forma compacta; el nombre del contexto (“Panel de Juan” o “Administración Tequit”) permanece como texto de interfaz separado.
- Favicon/launcher/PWA y previews cuadradas: genera ejemplos con `tequit-app-icon-light.svg` y `tequit-app-icon-dark.svg`; no vuelvas a dibujar el símbolo.
- `tequit-wordmark.svg` sólo se usa cuando el símbolo oficial ya aparece en el mismo contexto visual; no reconstruyas el wordmark con Fraunces o Manrope.
- Mantén alrededor del logo un área libre mínima equivalente a la altura del acento barro del símbolo. Nunca coloques fotografía, borde o texto dentro de esa área.
- El barro `#C75B3A` es un acento de marca. Para botones con texto pequeño usa preferentemente verde `#254432` o WhatsApp `#08783E`; no asumas que texto blanco sobre barro cumple AA sin verificar contraste.

Crea los tres shells sin mezclarlos y respeta exactamente esta arquitectura:

SHELL PÚBLICO
- Header desktop, de izquierda a derecha: marca Tequit enlazada a `/`; Buscar → `/buscar`; Negocios → `/negocios`; Publicar necesidad → `/solicitar`; Soy prestador → `/dashboard`; ubicación “Tepic, Nayarit”. El header es sticky, sobrio y no debe incluir Guardados ni login como botones adicionales.
- Header mobile: marca Tequit a la izquierda y ubicación compacta “Tepic” a la derecha. Sin menú hamburguesa; la navegación principal vive abajo.
- Bottom navigation mobile fija, exactamente cinco elementos y en este orden: Inicio con icono Home → `/`; Buscar con icono Search → `/buscar`; Negocios con icono Store → `/negocios`; Guardados con icono Heart → `/guardados`; Cuenta con icono UserRound → `/login`. Mostrar label e icono, respetar safe area y estado activo. Considerar `/servicios/**` y `/p/**` dentro de Buscar; `/n/**` dentro de Negocios; `/registro` dentro de Cuenta. En `/solicitar`, ningún tab necesita quedar activo.
- Footer en tres grupos: 1) marca Tequit y texto “Encuentra personas y negocios en Tepic que puedan hacer el trabajo que necesitas”; 2) título “Explora” con Buscar servicios → `/buscar`, Negocios locales → `/negocios` y Guardados → `/guardados`; 3) título “Para quien le sabe” con Crear perfil → `/registro`, Iniciar sesión → `/login` y Tequit Pro → `/dashboard/plan`. Cierra con la nota legal “Tequit facilita el contacto. No garantiza resultados ni participa en pagos o acuerdos.”

SHELL DEL PANEL
- Sin header, bottom navigation ni footer público.
- Desktop: sidebar persistente con identidad “Panel de Juan” y exactamente estos nueve elementos en orden: Resumen → `/dashboard`; Mi perfil → `/dashboard/perfil`; Servicios → `/dashboard/servicios`; Trabajos → `/dashboard/trabajos`; Solicitudes → `/dashboard/solicitudes`; Reseñas → `/dashboard/resenas`; Estadísticas → `/dashboard/estadisticas`; Negocios → `/dashboard/negocios`; Plan → `/dashboard/plan`. Incluye al pie “Ver perfil público” y “Cerrar sesión”.
- Mobile: header compacto con marca/contexto del panel, título de la pantalla, botón de menú y avatar. El botón abre un drawer con los mismos nueve elementos, agrupados y con estado activo; no uses una fila horizontal de nueve tabs. Incluye “Ver perfil público” y “Cerrar sesión” al final.

SHELL ADMINISTRATIVO
- Sin navegación pública ni panel de prestador.
- Desktop: sidebar o rail con identidad “Administración Tequit” y secciones ancla Resumen, Prestadores y planes, Moderación de reseñas y Taxonomía. Incluye “Ver sitio público” y “Cerrar sesión”. No inventes subrutas: actualmente todo vive en `/admin`.
- Mobile: header “Administración Tequit” y drawer con las mismas secciones ancla.

Estados de navegación:
- Todos los enlaces deben tener default, hover, focus-visible, active y disabled cuando aplique.
- El estado activo combina color, peso y una señal gráfica; nunca depende sólo del color.
- Los labels siempre permanecen visibles en la bottom navigation.
- El contenido nunca puede quedar oculto debajo de la bottom navigation fija.

Diseña componentes y shells en mobile 390 × 844 y desktop 1440 × 1024, con contenedor desktop máximo de 1200 px. No inventes funcionalidad futura. Todo el copy debe estar en español de México.
```

---

## Prompt 01 — Inicio `/`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 01 Inicio para la ruta `/` en mobile 390 × 844 y desktop 1440 × 1024.

Objetivo: que una persona en Tepic entienda la propuesta y llegue a opciones relevantes en una interacción. KPI: búsqueda o categoría → apertura de ficha.

Contenido y jerarquía:
- Header público.
- Hero editorial con fotografía documental de un oficio real, ubicación “Tepic, Nayarit”, H1 “Encuentra quién le sabe.” y texto: “Personas y negocios que pueden hacer el trabajo que necesitas. Revisa sus trabajos, reputación y verificaciones; contáctalos directamente.”
- Buscador dominante con placeholder “¿Qué necesitas resolver?” y botón “Buscar”.
- Dos señales breves: “Perfiles con señales de confianza” y “Busca como lo dirías normalmente”.
- Accesos rápidos a Albañilería, Plomería, Electricidad, Pisos, Electrodomésticos, Pintura, Minisplits y Limpieza.
- Chips de servicios populares.
- Tres prestadores verificados.
- Tres negocios locales.
- Bloque final para oferta: “Haz que te encuentren cuando alguien necesite lo que tú sabes hacer.” con CTA “Crear mi perfil”.
- Footer público y bottom navigation mobile con Inicio activo.

Evita convertir cada sección en una tarjeta. En mobile, promesa y buscador deben verse antes del primer scroll. Usa contenido realista y muestra la diferencia entre card de persona y card de negocio. Genera además un estado skeleton del contenido inferior. No agregues mapa, promociones, precios ni cuenta de explorador.
```

## Prompt 02 — Buscar `/buscar`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 02 Resultados para `/buscar?q=plomería&type=all` en mobile 390 × 844 y desktop 1440 × 1024.

Objetivo: comparar personas y negocios por coincidencia, reputación, verificaciones y zona. KPI: resultado → ficha.

Incluye:
- Shell público y título “Resultados para ‘plomería’”.
- Buscador compacto editable.
- Chips Todos, Personas, Negocios y Verificados; Todos activo.
- Desktop: panel lateral de filtros con Zona y Categoría.
- Mobile: botón “Filtros” con contador y bottom sheet accesible; no ocultes la existencia de filtros.
- Resumen “6 opciones” y explicación “Personas y negocios; compara antes de contactar.”
- Lista de resultados mixtos con cards canónicas, corazón guardar y CTA “Ver perfil” o “Ver negocio”.
- Orden visual basado en coincidencia y confianza, sin afirmar cercanía GPS.

Genera frames separados para: resultados mixtos, sólo personas, filtros activos, cero resultados, skeleton y error. El cero resultados debe decir: “No encontramos una coincidencia exacta. Cuéntanos qué necesitas y te ayudamos a encontrar opciones.” con CTA “Solicitar un trabajo personalizado”. El error debe conservar consulta/filtros y ofrecer “Reintentar”. No agregues mapa ni filtros que dependan de geolocalización.
```

## Prompt 03 — Servicio `/servicios/[slug]`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 03 Landing de servicio para `/servicios/plomeria` en mobile 390 × 844 y desktop 1440 × 1024.

Objetivo: responder una búsqueda SEO local y conducir a una ficha. Título “Plomería en Tepic”. Texto: “Compara reputación, trabajos y verificaciones antes de contactar.” Incluye buscador compacto, número de opciones y lista de prestadores/negocios relevantes con las mismas cards del buscador.

Debe sentirse como una entrada contextual al sistema de búsqueda, no como un micrositio ni una landing comercial separada. Añade breadcrumb accesible Inicio / Servicios / Plomería y enlaces hacia perfiles, negocios y una nueva búsqueda. Genera variante sin resultados válidos que conduzca a `/solicitar?service=plomería`, y variante 404 sobria con acciones “Buscar otro servicio” y “Volver al inicio”. No agregues contenido SEO repetitivo, precios, mapa ni garantías.
```

## Prompt 04 — Negocios `/negocios`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 04 Directorio de negocios para `/negocios` en mobile 390 × 844 y desktop 1440 × 1024.

Objetivo: explorar comercios que venden productos, prestan servicios o combinan ambos. Incluye shell público, encabezado “Negocios locales”, texto “Comercios que venden productos, prestan servicios o ambas cosas”, buscador compacto y grid/lista de negocios.

Cada card de negocio debe mostrar imagen o fallback, categoría, nombre, rating con número de reseñas, descripción breve, máximo tres servicios, zona, corazón y CTA “Ver negocio”. Debe ser claramente distinta de una card de prestador. Mobile usa una columna y bottom navigation con Negocios activo; desktop usa hasta tres columnas.

Genera estados con contenido, skeleton, cero negocios y error. El estado vacío debe ofrecer “Buscar servicios” y no sugerir que el directorio completo está vacío si sólo falló un filtro. No agregues ofertas, descuentos, carrito, entrega ni mapa.
```

## Prompt 05 — Solicitar trabajo `/solicitar`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 05 Solicitar trabajo para `/solicitar` en mobile 390 × 844 y desktop 1440 × 1024.

Objetivo: enviar una necesidad general o dirigida sin crear cuenta. H1 “Publica lo que necesitas”. Subtítulo: “Cuéntanos el trabajo. El equipo de Tequit podrá revisar la solicitud y ayudarte a encontrar opciones.”

Organiza el formulario en bloques claros:
1. Necesidad: servicio y descripción.
2. Ubicación y tiempo: zona y selector Lo antes posible / Esta semana / Este mes / Estoy cotizando.
3. Evidencia: hasta 4 fotos JPG, PNG o WebP, máximo 5 MB cada una.
4. Contacto: nombre, WhatsApp/teléfono y correo opcional.
5. Privacidad: “Tequit comparte estos datos sólo con el prestador indicado o los revisa para ayudarte. No se publican.”

CTA “Enviar solicitud”. En mobile una columna; evita pasos innecesarios, pero muestra progreso de bloque si usas formulario progresivo. Genera frames para solicitud general, dirigida a prestador, dirigida a negocio, validación inline conservando datos, cargando, error reintentable y éxito con título “Solicitud enviada”, folio `TQ-8K4M2` y siguiente acción “Volver a explorar”. No pidas login y no prometas una respuesta inmediata.
```

## Prompt 06 — Perfil público `/p/[providerSlug]`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 06 Perfil público para `/p/juan-perez` en mobile 390 × 844 y desktop 1440 × 1024.

Objetivo: construir confianza y provocar contacto por WhatsApp. Usa contenido: Juan Pérez, Albañil, Tepic y Xalisco, rating 4.8 con 19 reseñas, identidad confirmada, tres verificaciones y afiliación a “Concretos Estampados de Nayarit”.

Jerarquía:
- Hero con foto/avatar, profesión, nombre, zona, rating y verificaciones.
- CTA primario “Contactar por WhatsApp” y secundario “Solicitar trabajo”.
- Acción guardar con estado accesible.
- Afiliación opcional explicando que las reputaciones son independientes.
- Servicios: Pegado de piso, Enjarre, Construcción de muros, Banquetas e Impermeabilización.
- Galería “Trabajos realizados”.
- Bio y zonas/capacidades.
- Reseñas aprobadas con fecha y fuente.
- Panel “Verificaciones” que explique qué se comprobó sin sugerir garantía.
- Formulario de solicitud dirigida al final.

En mobile, resumen de confianza y CTA deben aparecer antes de la galería; considera barra CTA sticky sólo cuando no cubra navegación o contenido. Genera variantes completa, guardada, sin trabajos, sin reseñas y sin afiliación. No agregues agenda, disponibilidad inmediata, tarifa, garantía, chat ni contratación interna.
```

## Prompt 07 — Ficha de negocio `/n/[businessSlug]`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 07 Ficha de negocio para `/n/concretos-estampados-de-nayarit` en mobile 390 × 844 y desktop 1440 × 1024.

Objetivo: mostrar oferta, productos, equipo y contacto. Usa contenido: “Concretos Estampados de Nayarit”, categoría Construcción, Ciudad Industrial, rating 4.9 con 31 reseñas, tres verificaciones y dirección “Zona Ciudad Industrial, Tepic”.

Incluye hero de negocio con imagen, guardar, reputación, dirección y CTAs “Contactar por WhatsApp” y “Solicitar trabajo”. Después: descripción, servicios, productos sin precio cerrado, equipo afiliado y formulario de solicitud. Cada producto tiene CTA “Preguntar por WhatsApp”; no uses carrito ni botón comprar. El perfil de Juan Pérez debe enlazarse como integrante y aclarar que conserva reputación propia.

Genera variantes: completa, sólo productos sin servicios, sin equipo, sin reseñas y no encontrada/404. Mobile debe priorizar identidad, ubicación, confianza y contacto. No agregues checkout, entrega, mapa, horario inventado ni promociones.
```

## Prompt 08 — Guardados `/guardados`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 08 Guardados para `/guardados` en mobile 390 × 844 y desktop 1440 × 1024.

Objetivo: retomar opciones guardadas en el navegador. Título “Tus guardados” y etiqueta discreta “En este dispositivo”. Explica sin alarmar: “Se conservan en este navegador y no se sincronizan con otros dispositivos.” No pidas login.

Diseña un estado con resultados mixtos, distinguiendo secciones Personas y Negocios o usando filtros claros. Reutiliza cards canónicas y permite quitar un elemento con feedback “Quitado de guardados” y acción “Deshacer”. Mobile usa bottom navigation con Guardados activo.

Genera además estado vacío con título “Aún no guardas opciones”, texto “Usa el corazón en personas o negocios para compararlos después” y CTA “Explorar servicios”; estado después de quitar el último elemento; y estado de almacenamiento no disponible con explicación breve. No inventes sincronización, colecciones, compartir lista ni cuenta de explorador.
```

## Prompt 09 — Registro `/registro`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 09 Crear perfil para `/registro` en mobile 390 × 844 y desktop 1440 × 1024.

Objetivo: registrar oferta, no una cuenta de explorador. Título “Publica lo que sabes hacer” y texto “Crea tu perfil Free. Sin comisiones, pagos ni contratos dentro de Tequit.”

Primero muestra selector accesible “Prestador” o “Negocio”. Diseña dos variantes de formulario:
- Prestador: nombre, profesión principal, correo, WhatsApp, zona, contraseña, bio y primer servicio.
- Negocio: nombre comercial, categoría, correo, WhatsApp, zona/dirección, contraseña, descripción y primer servicio o producto.

Explica que el plan Free permite hasta cinco servicios, sin convertir el plan en el foco. Usa bloques progresivos, labels persistentes, ayuda y validación inline. CTA prestador “Crear cuenta y publicar perfil”; CTA negocio “Crear cuenta de negocio”.

Genera frames para prestador, negocio, validación, cargando, error y éxito. En éxito: “Perfil creado” y CTA “Ir a iniciar sesión”. No agregues OTP, cuenta de cliente, checkout de plan ni publicación garantizada si aún falta moderación.
```

## Prompt 10 — Login `/login`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 10 Iniciar sesión para `/login` en mobile 390 × 844 y desktop 1440 × 1024.

Objetivo: acceso de prestador, dueño de negocio o administrador. Eyebrow “Cuenta de prestador o negocio”, H1 “Bienvenido de vuelta”, campos Correo y Contraseña y CTA “Entrar a mi cuenta”. Incluye enlace “Crear perfil”. Añade una nota: “¿Buscas un servicio? No necesitas una cuenta para explorar, guardar o solicitar.” con CTA discreto “Ir a buscar”.

Genera frames inicial, cargando, credenciales incorrectas, sesión expirada y redirección por ruta protegida. Los errores deben mostrarse inline y conservar el correo. Las credenciales demo deben aparecer únicamente en una variante etiquetada `DEMO`, nunca en la propuesta de producción. Marca recuperación de contraseña como futura si se muestra. No agregues login social, OTP ni cuenta de explorador.
```

## Prompt 11 — Resumen del panel `/dashboard`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 11 Resumen del panel para `/dashboard` en mobile 390 × 844 y desktop 1440 × 1024.

Usa el shell exclusivo de prestador, sin header/footer público. Objetivo: mostrar movimiento reciente y trabajo pendiente. Saludo “Hola, Juan” y periodo “Últimos 30 días”. Incluye métricas Vistas del perfil, Contactos por WhatsApp, Solicitudes y Conversión, con contexto breve. Prioriza una sección “Por atender” con dos solicitudes: “Concreto estampado” estado Nueva y “Reparar humedad en muro” estado Vista. Añade acciones “Abrir solicitud” y “Ver todas”.

Incluye una alerta accionable de completitud si falta contenido, pero no inventes gamificación. Desktop usa sidebar; mobile usa header de panel y drawer agrupado, nunca una fila de nueve tabs. Genera estado normal, skeleton, cero actividad y error parcial de métricas. En cero actividad ofrece “Mejorar mi perfil” y “Agregar un trabajo”. Evita gráficas decorativas.
```

## Prompt 12 — Mi perfil `/dashboard/perfil`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 12 Mi perfil para `/dashboard/perfil` en mobile 390 × 844 y desktop 1440 × 1024.

Usa el shell exclusivo del panel. Objetivo: editar información pública con seguridad. Incluye título “Mi perfil”, estado de publicación, acción “Ver perfil público” y formulario agrupado en Identidad, Sobre mi trabajo, Zonas y Contacto. Campos: nombre Juan Pérez, profesión Albañil, bio, zonas Tepic y Xalisco y WhatsApp.

Desktop puede mostrar formulario y preview/resumen lateral; mobile apila contenido y mantiene Guardar cambios accesible sin tapar campos. Incluye indicador de cambios sin guardar. Genera estados sin cambios, cambios pendientes, guardando, guardado con feedback discreto y error conservando valores. Añade confirmación sólo para acciones destructivas; guardar normal no requiere modal. No inventes campos que el backend no tiene ni mezcles la edición de servicios o trabajos en esta pantalla.
```

## Prompt 13 — Servicios `/dashboard/servicios`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 13 Servicios para `/dashboard/servicios` en mobile 390 × 844 y desktop 1440 × 1024.

Usa el shell exclusivo del panel. Objetivo: administrar el catálogo público del prestador. Encabezado “Servicios”, contador visible “5 de 5 servicios usados” y explicación “Tu plan Free permite cinco servicios publicados.” Lista Pegado de piso, Enjarre, Construcción de muros, Banquetas e Impermeabilización; cada fila muestra estado Activo y acción Desactivar.

Incluye formulario “Publicar otro servicio” con nombre y CTA “Agregar servicio”. Diseña variantes: lista normal con espacio disponible, vacío con CTA, alta en progreso, servicio desactivado, error y límite Free alcanzado. En el límite muestra “Llegaste al límite de 5 servicios del plan Free” y CTA secundario “Conocer Tequit Pro”; no bloquees la administración de servicios existentes. Mobile usa filas apiladas y acciones claras. No agregues precios, paquetes ni agenda.
```

## Prompt 14 — Trabajos `/dashboard/trabajos`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 14 Trabajos para `/dashboard/trabajos` en mobile 390 × 844 y desktop 1440 × 1024.

Usa el shell exclusivo del panel. Objetivo: administrar evidencia visual del trabajo. Título “Trabajos”, galería ordenable con el ejemplo “Acabado de muro residencial” y acciones accesibles Editar, Reordenar y Eliminar. Añade formulario “Agregar trabajo” con título, descripción y carga de JPG, PNG o WebP, máximo 8 MB.

La carga debe tener drag and drop en desktop y selector claro en mobile, preview, progreso y validación. Genera estados galería, vacío, archivo seleccionado, cargando, formato inválido, archivo demasiado grande, guardado y error conservando título/descripción. El estado vacío debe explicar que las fotos ayudan a evaluar experiencia y ofrecer “Agregar mi primer trabajo”. Evita grids densos, edición fotográfica avanzada y filtros decorativos.
```

## Prompt 15 — Solicitudes `/dashboard/solicitudes`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 15 Solicitudes para `/dashboard/solicitudes` en mobile 390 × 844 y desktop 1440 × 1024.

Usa el shell exclusivo del panel. Objetivo: revisar un lead, proteger sus datos y avanzar estado. Desktop: patrón inbox con lista a la izquierda y detalle a la derecha. Mobile: lista y detalle como vistas apiladas con regreso claro.

Detalle de ejemplo: “Concreto estampado”, estado Nueva, descripción de cochera de 35 m², Ciudad del Valle, Esta semana, 3 fotos privadas, cliente Mariana López y teléfono. Muestra aviso: “Las fotos y datos del cliente sólo son visibles para ti y el equipo administrador.” CTA primario “Contactar al cliente” por WhatsApp.

Incluye transición de estados Nueva, Vista, Me interesa, No hago este trabajo, Contactado y Cerrada. No muestres todos como chips ambiguos: usa selector/timeline con consecuencias claras. Genera lista, vacío, cada estado, error al actualizar y confirmación de cierre. En vacío ofrece “Revisar mi perfil”. No agregues chat interno, pago ni cotización estructurada.
```

## Prompt 16 — Reseñas `/dashboard/resenas`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 16 Reseñas para `/dashboard/resenas` en mobile 390 × 844 y desktop 1440 × 1024.

Usa el shell exclusivo del panel. Objetivo: entender reputación y solicitar una reseña a un cliente anterior. Incluye métricas rating general 4.8, 23 reseñas y 1 enlace pendiente. Lista reseñas aprobadas con autor, calificación, comentario, fecha y fuente “Trabajo solicitado en Tequit” o “Cliente invitado”. CTA “Generar enlace para cliente anterior”.

Genera estados con reseñas, sin reseñas, enlace pendiente, enlace generado listo para copiar, error y skeleton. En vacío usa: “Tu reputación empieza con un trabajo bien contado” y CTA “Generar mi primer enlace”. Explica que sólo las reseñas aprobadas aparecen públicamente. No permitas editar comentarios ni ocultar selectivamente reseñas aprobadas.
```

## Prompt 17 — Estadísticas `/dashboard/estadisticas`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 17 Estadísticas para `/dashboard/estadisticas` en mobile 390 × 844 y desktop 1440 × 1024.

Usa el shell exclusivo del panel. Objetivo: entender visibilidad y conversión. Selector de periodo 7 días / 30 días, con 30 activo. Métricas: Vistas 284, WhatsApp 47, Solicitudes 8 y Conversión 16.5%. Añade “Búsquedas que trajeron visitas”: albañil 82, pegar piso 61 y enjarre 33.

Usa una gráfica de tendencia sólo si hace más fácil comparar días; evita donut charts decorativos. Añade definiciones accesibles de cada métrica y acciones de mejora hacia Mi perfil o Servicios. Genera estados normal, cero datos, skeleton y error parcial. El cero datos debe explicar que las métricas aparecerán después de recibir visitas y ofrecer “Ver mi perfil público”. No inventes ingresos, ranking, impresiones pagadas ni atribución avanzada.
```

## Prompt 18 — Negocios y afiliaciones `/dashboard/negocios`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 18 Negocios para `/dashboard/negocios` en mobile 390 × 844 y desktop 1440 × 1024.

Usa el shell exclusivo del panel. Objetivo: administrar relaciones opcionales con negocios y separar afiliaciones de negocios propios. Crea dos secciones: “Afiliaciones” y “Mis negocios”. Muestra afiliación activa con “Concretos Estampados de Nayarit”, explicación “Aparece en tu perfil como afiliación. Su rating no se transfiere al tuyo” y CTA “Ver negocio público”.

En “Mis negocios”, muestra estado vacío y bloque “Crear un negocio” con resumen de datos necesarios: nombre, categoría, descripción, WhatsApp, dirección, servicios y productos. Como el flujo completo aún no está implementado, etiqueta su CTA de manera honesta como “Comenzar registro” y diseña el destino como futuro, no como una pantalla funcional adicional.

Genera variantes sin afiliación, pendiente, activa, rechazada y error. Diferencia visualmente afiliación de propiedad. No mezcles reputaciones, no inventes permisos de equipo y no publiques un negocio automáticamente.
```

## Prompt 19 — Plan `/dashboard/plan`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 19 Plan para `/dashboard/plan` en mobile 390 × 844 y desktop 1440 × 1024.

Usa el shell exclusivo del panel. Objetivo: explicar el plan actual y el futuro Pro con honestidad. Título “Plan Free” y nota “No hay pagos en el MVP. Un administrador puede activar Pro durante la etapa piloto.” Compara:
- Free actual: 5 servicios, aparece en búsqueda, recibe solicitudes, reseñas y métricas básicas.
- Tequit Pro próximamente: servicios ilimitados, galería ampliada, estadísticas avanzadas, promoción y más zonas.

CTA “Solicitar Pro”, tratado como interés o solicitud, no checkout. Genera estados Free normal, límite de servicios alcanzado, solicitud Pro enviada, error y Pro activo futuro claramente etiquetado como concepto. Evita countdowns, descuento falso, precio inventado, tarjeta de pago y dark patterns.
```

## Prompt 20 — Administración `/admin`

```text
Usando exactamente el sistema Tequit aprobado, diseña la pantalla 20 Panel administrativo para `/admin` en mobile 390 × 844 y desktop 1440 × 1024.

Usa un shell administrativo exclusivo llamado “Administración Tequit”, sin navegación pública ni panel de prestador. Objetivo: supervisar operación, moderar y habilitar planes. Incluye métricas Prestadores activos, Negocios activos, Solicitudes nuevas y Reseñas pendientes.

Secciones:
- Tabla de prestadores con nombre, estado, plan y número de verificaciones; acción cambiar Free/Pro y enlace al perfil público.
- Cola de moderación con reseña pendiente, rating, comentario, contexto y acciones Aprobar/Rechazar.
- Taxonomía con categorías Construcción, Plomería, Electricidad, Electrodomésticos, Climatización, Hogar y Eventos.

Desktop puede ser denso, pero con jerarquía y acciones seguras. Mobile convierte tablas en filas/cards semánticas. Genera estados normal, tabla vacía, moderación pendiente/aprobada/rechazada, acción en progreso y error. Cambios sensibles deben tener confirmación y feedback. No inventes administración financiera, usuarios exploradores, analítica avanzada ni permisos no definidos.
```

---

## Prompt 21 — Auditoría final de consistencia

```text
Audita todas las pantallas creadas para Tequit y corrige inconsistencias sin cambiar la dirección visual aprobada.

Verifica:
1. Que existan las 20 pantallas en mobile 390 × 844 y desktop 1440 × 1024.
2. Que los tres shells estén separados: público, panel y administración.
3. Que header, bottom navigation, footer, sidebar y drawer tengan estados activos correctos.
4. Que cards de prestador y negocio sean distintas pero pertenezcan al mismo sistema.
5. Que WhatsApp sea el CTA principal sólo donde corresponde y “Solicitar trabajo” sea secundario.
6. Que no aparezcan checkout, pagos, chat interno, mapa, agenda, precio cerrado, disponibilidad inmediata, garantía ni cuenta de explorador.
7. Que Guardados diga “En este dispositivo” y nunca prometa sincronización.
8. Que toda pantalla de datos tenga skeleton, vacío y error; y todo formulario tenga validación, loading, error y éxito.
9. Que el copy esté en español de México, sin urgencia artificial ni promesas absolutas.
10. Que el contraste cumpla WCAG 2.2 AA, los targets midan al menos 44 × 44 px, el foco sea visible y los layouts funcionen con contenido largo.
11. Que se usen exclusivamente los tokens y componentes del sistema aprobado; elimina valores ad hoc y componentes duplicados.
12. Que mobile no sea una simple reducción de desktop: filtros usan bottom sheet, tablas se apilan y el panel usa drawer.

Entrega una página final “Handoff index” con miniatura, ID, nombre, ruta, tamaño, estados incluidos y componentes usados por cada pantalla. Señala explícitamente cualquier decisión de producto no resuelta como FUTURE y no la mezcles con MVP.
```

## Checklist antes de entregar al agente frontend

- [ ] Foundations y component sheet aprobados.
- [ ] 20 pantallas mobile.
- [ ] 20 pantallas desktop.
- [ ] Variantes vacías, loading, error y éxito.
- [ ] Navegación y destinos anotados.
- [ ] Assets exportables sin texto incrustado.
- [ ] Tokens y componentes nombrados consistentemente.
- [ ] Contenido de ejemplo editable.
- [ ] Funciones futuras marcadas como `FUTURE`.
- [ ] Handoff index generado.

La especificación funcional y de diseño ampliada vive en `docs/redesign-stitch-handoff.md`.
