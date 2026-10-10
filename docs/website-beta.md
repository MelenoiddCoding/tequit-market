# Beta de sitios asistidos — septiembre de 2026

## Oferta que se entrega

$699 MXN por preparación y 12 meses en `tequit.mx/p/nombre`. Renovación manual: $499 por otros 12 meses. Las tres plantillas cuestan lo mismo. No hay cargos automáticos ni dominio propio incluido.

Incluye cinco servicios, cinco trabajos con foto (avatar y portada aparte), presentación, zonas, redes, contacto, tres FAQ y una ronda consolidada de correcciones. El propietario mantiene datos y contenido. Tequit administra el diseño y publicación. No incluye fotografía, identidad de marca, campañas, tienda, agenda, cotizaciones o remisiones PDF.

Tres meses Pro para futuras altas desde la primera publicación del perfil. Reclamar, republicar o comprar el sitio no reinicia la bienvenida. Los sitios y Pro vencen por separado. La migración beta fija esa oferta para altas futuras; conserva asignaciones anteriores.

## Operación administrativa

1. Recibir por WhatsApp o en persona nombre, actividad, zona, número público, servicios, fotografías y autorización. Ofrecer también el perfil gratuito sin condicionar la inscripción a una compra.
2. Crear/publicar el perfil en Altas asistidas; la persona no necesita crear su cuenta primero. Abrir Sitios y pagos y seleccionar al prestador.
3. Preparar el sitio: completar campos y elegir Servicio técnico, Taller y oficio o Casa y mantenimiento. Guardar actualiza la vista previa y, si ya existe, el contenido publicado. No hay borrador editorial separado.
4. Desde “Administrar contacto, servicios y fotografías” abrir el formulario asistido del prestador, incluso si ya reclamó la cuenta o llegó por registro autónomo. Los cambios se guardan juntos; los servicios conservan sus IDs y los retirados se desactivan. El mantenimiento no cambia propietario ni vuelve a emitir un reclamo.
5. Revisar fotos y descripciones en la pantalla de preparación. Quitar un trabajo exige confirmación. Se retira el registro, conservando el objeto de almacenamiento para evitar eliminar una imagen reutilizada como portada; la limpieza de archivos huérfanos no es parte de esta entrega.
6. Mostrar la revisión al cliente y reunir una ronda de correcciones. No compartir la URL administrativa como una vista previa pública; revisar en persona o enviar capturas por el canal acordado.
7. Crear pedido por $699 y 12 meses. Confirmar únicamente un pago efectivamente recibido, anotando referencia. Publicar por separado: ahí comienza la vigencia. El panel no transfiere dinero ni factura.
8. Entregar enlace público, QR y enlace privado de reclamo. Para cuentas existentes, usar su acceso habitual. Nunca entregar el enlace privado a terceros.
9. Renovar con pedido nuevo por $499. Si sigue vigente, el plazo se suma al vencimiento; si venció, comienza al activar. No acortar accesos anteriores sin vencimiento.

## Plantillas y contenido

- `legacy`: conserva la presentación anterior; sólo el administrador puede cambiarla explícitamente.
- `tecnico`: títulos sans, azul oscuro y servicios en filas; pensado para consulta rápida de servicios y cobertura.
- `oficio`: Fraunces, tonos de papel y barro oscuro, galería con fotografías verticales y composición escalonada en escritorio.
- `hogar`: presentación sobre fondo verde claro, fotografía horizontal debajo y servicios en dos columnas en escritorio.
- Todas conservan identidad, servicios, trabajos, presentación, cobertura, reseñas, FAQ y contacto. Sin fotos el hero se compacta; no se sustituyen por trabajos inventados.
- Las plantillas beta muestran cinco servicios activos y cinco trabajos no archivados, ordenados por `created_at,id`. Coincide con los cinco que conserva el descenso a Free. La prueba SQL verifica los IDs antes y después del vencimiento. El contenido adicional de Pro se gestiona en el perfil y queda sujeto a ese plan.
- Preguntas beta: tres; sitios anteriores: seis. Cambiar a una plantilla beta exige retirar las preguntas adicionales antes de guardar.
- Las reseñas son reales y moderadas. Sin verificaciones no se muestra una cifra de verificación como prueba de confianza.
- Las redes externas se muestran sólo con URL HTTP(S). La presentación editada desde Mi perfil actualiza también el sitio.

Ejemplos: `/tu-pagina/ejemplos?tema=tecnico`, `?tema=oficio`, `?tema=hogar`. Agregar `&contenido=breve` muestra la composición sin fotos. Comparten contenido ilustrativo, no generan tráfico de prestadores y no permiten contacto. No aparecen en el sitemap y llevan `noindex`.

Direcciones reservadas para una segunda etapa: Profesional independiente (retrato y credenciales), Estudio personal (belleza y servicios personales) y Portafolio visual (fotografía, decoración y eventos). No se ofrecen como plantillas disponibles en la beta.

## Interfaces y permisos

- `ProviderSiteSettings.templateId`: `legacy | tecnico | oficio | hogar`.
- `/api/dashboard/site`: sólo contenido; rechaza campos de diseño. `/api/admin/website-content`: también plantilla, tema y marca. Ambos usan un guardado transaccional.
- Trigger de diseño: impide que un propietario cambie plantilla, colores o marca mediante escrituras directas, inserciones o borrado/recreación. Conserva el alta autónoma con valores predeterminados.
- `/api/admin/onboardings`: acción `manage` abre/crea mantenimiento sin duplicar el prestador; `save` guarda el formulario de manera atómica sin perder `claimed` o `published`.
- `/api/admin/portfolio`: actualizar descripción o retirar un trabajo. Comprueba rol administrativo y pertenencia al prestador; conserva auditoría.
- Los RPC administrativos están disponibles sólo al servidor y vuelven a comprobar el rol del actor. No se concede publicación al propietario ni a Pro.

## Migración y salida

Aplicar en staging el historial previo y después, en orden:

1. `202609090001_websites_and_attribution.sql`
2. `202609090002_atomic_site_content.sql`
3. `202609090003_traffic_summary.sql`
4. `202609170001_assisted_website_beta.sql`
5. `202609170002_assisted_maintenance.sql`

Las dos últimas agregan plantillas/permisos y mantenimiento. No migran automáticamente la apariencia de sitios existentes. Desplegar el código después del SQL: la consulta del catálogo requiere `template_id`.

Configurar `NEXT_PUBLIC_APP_URL=https://tequit.mx` y mantener demo desactivado. La venta es asistida desde `/admin/sitios`; no existe página comercial ni botones de contratación pública. `/tu-pagina` redirige a los ejemplos. Confirmar cron de planes y transporte OTP existentes.

Validaciones automatizadas: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Las pruebas PostgreSQL usan PGlite con esquema representativo, las migraciones nuevas y la función real de reconciliación; no sustituyen ejecutar todo el historial en Supabase.

Antes de vender, completar una entrega con tres cuentas de staging: administrador, titular y ajena. Comprobar subida de fotos, publicación, reclamo, edición posterior, enlaces de WhatsApp/QR, vencimiento de Pro y renovación. No usar pagos ni reseñas inventados en producción.

## Piloto comercial manual

Meta inicial: diez sitios pagados y treinta perfiles completos en cinco categorías: plomería, electricidad, refrigeración, pintura y limpieza. No crear registros ficticios para alcanzar la meta.

Por cada conversación, registrar en una bitácora privada:

| Dato | Qué anotar |
| --- | --- |
| Prestador / categoría | ID o enlace administrativo; evitar duplicados |
| Resultado | Perfil gratuito, interesado, pendiente de materiales o sitio comprado |
| Tiempo real | Minutos de visita/traslado, preparación, correcciones y soporte por separado |
| Entrega | Fecha de publicación, plantilla, pago y vencimiento |
| Uso | Visitas y clics del informe; consultas recibidas sólo cuando el prestador las confirme |
| Seguimiento | Dificultad para editar, materiales faltantes y próxima acción acordada |

Revisar a los treinta días: perfiles completos por categoría, ventas, tiempo mediano de preparación, tiempo total por sitio, correcciones y consultas confirmadas. Los clics no prueban contratación. Comparar ingreso de $699 con costos reales antes de ampliar a seis plantillas; cualquier cambio de precio aplica a nuevas propuestas, respetando condiciones ya acordadas.

La captación, las visitas y el seguimiento con personas reales son operación posterior; este código no contacta prospectos ni programa mensajes.


## Evidencia local de esta entrega

- 78 pruebas en 17 archivos: incluyen permisos API, escrituras directas autenticadas, guardado atómico, servicios ajenos, mantenimiento tras reclamo, cinco entradas conservadas al vencer Pro, pedidos y renovación idempotentes.
- Tipos, lint y compilación completados. La compilación reportó `fetch failed` en consultas a Supabase: no se considera validado el entorno conectado ni su catálogo real.
- Las tres plantillas se revisaron a 320, 390, 768, 1024 y 1440 px sin desbordamiento horizontal; demostraciones sin contactos activos y un solo main. También se revisaron variantes sin fotos, navegación inicial por teclado, movimiento reducido y zoom CSS al 200%.
- Capturas en `output/playwright/beta-*.png`. Los ejemplos públicos permiten inspeccionar las tres opciones con los mismos datos.
- Desplegado en producción el 17 de septiembre de 2026: Vercel `dpl_EitiGDW9FeWbLBXSefYx4eKDq6Sk`, alias `https://tequit.mx`. Se aplicaron `202609170001` y `202609170002` al proyecto Supabase enlazado `vgszdeymfipvuiziklpq`.
- Las 22 configuraciones existentes conservaron `legacy`. Se verificaron el trigger de diseño, Pro de bienvenida de tres meses y permisos de ejecución exclusivos del servidor para las funciones administrativas.
- Producción: `/tu-pagina` responde 308 hacia los ejemplos; los tres temas responden 200 con noindex; portada y sitemap ya no incluyen la ruta comercial. `/admin/sitios` exige acceso administrativo y las tres APIs de sitios/portafolio rechazan peticiones anónimas con 403.
- Playwright en producción: tres temas a 390 y 1440 px sin desbordamiento, un solo main y contactos deshabilitados. Captura `output/playwright/production-temas-1440.png`.
- Lint, typecheck, 78 pruebas y compilación local aprobados. La compilación remota de Vercel terminó sin los errores de conexión observados localmente.
- No se simuló un cobro ni se publicó una ficha real para probar. La comprobación de producción no sustituye el recorrido completo autenticado de entrega, reclamo y almacenamiento con cuentas de prueba.


## Revisión operativa — 18 de septiembre de 2026

- Ruta de entrada: `/admin/sitios` → Nueva página → espacio propio. La ficha del directorio se crea como parte del flujo, sin navegar por Altas. Se reutilizan datos y permisos existentes.
- Lista de prestadores con filtro de muestras antes de paginar, búsqueda por nombre y orden de actualización. Loera aparece sin necesitar búsqueda.
- Secciones del espacio: Datos y servicios, Contenido y tema, Fotografías, Vista previa, Publicación y entrega. Fotografías muestra las imágenes guardadas y conserva avatar/portada al guardar contenido.
- Corrección de nombres en Altas para relaciones PostgREST con forma de objeto o arreglo. CTA de WhatsApp fijo; separación de 20 px en el título de cobertura.
- Un borrador de un titular existente puede publicarse con autorización desde este espacio sin transferir su cuenta ni emitir un nuevo reclamo. Una ficha reclamada activa no se republica.
- QA autenticado de lectura con la ficha de Loera: cinco secciones a 320, 390, 768, 1024 y 1440 px sin desbordamiento. La creación y el guardado de contenido se comprobaron con respuestas interceptadas para no crear perfiles ni escribir cambios en clientes reales.
- 84 pruebas automatizadas: incluye la relación de nombres y la publicación de borradores con propietario, autorización y protección de reclamos.
- Esta revisión no requiere migraciones nuevas. No altera el tema elegido, los datos ni la vigencia de Loera.

Despliegue de esta revisión: `dpl_amHt1PCho4YtkPfHngEDzCp4G1qR`, listo en `https://tequit.mx`. Comprobación autenticada en producción: lista, creación y fotografías de Loera responden 200; avatar existente presente.
