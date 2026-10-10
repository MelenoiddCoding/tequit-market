# Entrega: sitios independientes y atribución

## Alcance

- Perfil gratuito: /u/[slug]. El directorio y los enlaces del panel llevan aquí.
- Sitio promocional: /p/[slug], con identidad, servicios, trabajos, reseñas, FAQ y contacto. Reutiliza datos y editor. Personalización independiente de Pro.
- Administración: /admin/sitios permite buscar prestador, preparar contenido, crear pedido, confirmar pago recibido y publicar o renovar.
- Propietario: /dashboard/sitio muestra vigencia, editor y enlaces; /dashboard/estadisticas ofrece 7/30 días.
- Pro conserva su sistema de planes. La bienvenida futura comienza una sola vez al publicar el perfil, incluso sin propietario. Reclamar/republicar no reinicia el regalo.
- /tu-pagina redirige a los ejemplos; la preparación y publicación se operan en /admin/sitios, sin página comercial pública. Defaults iniciales: $699 MXN y 12 meses; ambos editables al registrar cada pedido. Renovación beta: $499 MXN por 12 meses, siempre manual. Ver `docs/website-beta.md` para límites y operación actual.

## Antes de desplegar

1. Revisar cambios locales; no se hizo push ni despliegue.
2. Aplicar en orden 202609090001_websites_and_attribution.sql, 202609090002_atomic_site_content.sql y 202609090003_traffic_summary.sql, 202609170001_assisted_website_beta.sql y 202609170002_assisted_maintenance.sql. Después desplegar código. El código requiere estas tablas y funciones.
3. Configurar TEQUIT_SALES_WHATSAPP con el número comercial real (formato internacional, por ejemplo prefijo 52). No se configura ni publica un número inventado. Sin variable, el CTA de contratación por WhatsApp se oculta.
4. Mantener NEXT_PUBLIC_DEMO_MODE desactivado en producción. Las pruebas usan datos efímeros.
5. Confirmar NEXT_PUBLIC_APP_URL=https://tequit.mx y el cron de vencimiento de planes ya existente. El sitio verifica su propia fecha en cada consulta; su vencimiento no depende de un cron.
6. Verificar permisos con una cuenta administradora, una propietaria y una ajena. No aplicar migraciones contra un proyecto Supabase antiguo.
7. Confirmar oferta de bienvenida y condiciones comerciales antes de salir a vender. El texto inicial de 12 meses es una configuración de arranque, no una política universal.

## Operación

1. Crear perfil mediante registro o alta asistida con consentimiento. La cuenta es opcional en la alta asistida.
2. En Sitios y pagos seleccionar prestador y crear pedido con importe y meses acordados.
3. Preparar el contenido. La vista previa administrativa no genera tráfico ni abre contactos. Cambiar contenido de un sitio ya publicado sí cambia su contenido público: coordinar la corrección con el prestador.
4. Confirmar el ingreso real del pago y anotar referencia. Esto no mueve dinero ni genera factura.
5. Publicar sitio después de revisar contenido y de publicar el perfil con consentimiento. Ahí inicia la vigencia; repetir la acción no la extiende.
6. Una renovación crea un pedido nuevo. Si el sitio sigue vigente suma meses al vencimiento; si venció, parte de la fecha actual.
7. El administrador puede seguir editando texto, descripciones, FAQ, portada y avatar aun después de reclamarse la cuenta. Contacto, servicios y nuevas fotos se administran con el acceso de mantenimiento del sitio; funciona con perfiles reclamados. Los títulos/descripciones y retiro de trabajos se gestionan en la misma pantalla del sitio. Se respetan los límites efectivos del plan y la plantilla beta muestra los primeros cinco servicios y trabajos.
8. Sólo se cancelan pedidos pendientes sin pago. Reembolsos y cancelaciones de pedidos ya pagados se resuelven operativamente, conservando historial; no se simulan desde esta pantalla.
9. Pro se asigna por separado desde la administración de planes, con la duración acordada. El pedido de sitio no cobra ni renueva Pro.

## Compatibilidad

Los perfiles activos anteriores a la migración obtienen acceso legacy sin vencimiento: se conservan las URL existentes sin inventar ventas. No se crea ese acceso para altas nuevas ni demos. Un sitio nuevo vencido redirige temporalmente a /u/[slug], conserva etiquetas de atribución y mantiene contenido. No hay borrado ni cobro automático. Sitios suspendidos siguen fuera de publicación. Un acceso anterior sin vencimiento no se acorta al registrar un pedido posterior.

## Atribución

- Origen externo: Facebook, Google, Instagram, WhatsApp, otro, directo/desconocido.
- Superficie: directorio, perfil, sitio, negocio, servicio.
- Entrada: primera superficie visitada en el recorrido.
- Ejemplo: enlace Facebook a /buscar?q=plomero → perfil → sitio → WhatsApp conserva source=facebook, entrySurface=directory y surface=website.
- El botón Copiar enlace para Facebook conserva filtros y añade utm_source=facebook y utm_medium=organic_social.
- Google se reconoce sólo si llega referrer. Sin Search Console, GA ni acceso a palabras buscadas en Google.
- Recorrido anónimo de 30 minutos de inactividad; localStorage con respaldo en memoria si está bloqueado. Una campaña externa nueva reinicia atribución. Sin almacenamiento, una recarga completa puede perder el origen.
- Sin huellas digitales, teléfonos, búsquedas libres ni URL de referencia completas en la atribución. El servidor conserva categorías, ID aleatorio y objetivos validados.
- Visitas deduplicadas por recorrido, evento y destino; clics rápidos repetidos se filtran 1.5 s. Un clic es un intento: no confirma conversación, contratación o ingresos.
- Los eventos antiguos aparecen como sin atribución. No se fabrican fuentes para el histórico.
- Origen, lugar de interacción y entrada son distintas agrupaciones de la misma actividad. No sumar sus totales.
- Demos, previews administrativas y tráfico identificable del propio prestador se excluyen. Usuarios no identificados que sean propietarios no pueden distinguirse de visitantes normales.
- Un enlace etiquetado y reenviado conserva su etiqueta. La atribución es orientativa y los clientes pueden bloquear el registro.
- Si falla /api/events, WhatsApp y llamadas siguen abriendo mediante navegación normal.

## Validación

npm run lint
npm run typecheck
npm test
npm run build

La suite website-database usa PostgreSQL embebido (PGlite) y ejecuta las migraciones de sitios y beta asistida sobre una base mínima que representa sus dependencias anteriores. Valida SQL real, estados, idempotencia, renovación, permisos, bienvenida y atomicidad. No sustituye aplicar todo el historial de Supabase en staging antes de producción.
