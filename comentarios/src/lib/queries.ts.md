# src/lib/queries.ts

<!-- 68 bloques · 226 líneas · original del commit 1310672 -->

68 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 37

> Ancla: `const db: SupabaseClient | null = supabase;`

```
/**
 * ============================================================================
 *  Consultas del catálogo público
 *
 *  El catálogo se puede ver SIN sesión, así que estas consultas usan el
 *  mismo cliente que el resto de la app. Si el proyecto no está
 *  configurado, cada función devuelve una lista vacía y los hooks caen
 *  a los datos de prueba — la pantalla nunca se ve rota.
 * ============================================================================
 */
```

## Línea 48

> Ancla: `const db: SupabaseClient | null = supabase;`

```
/** Cliente o null, para no repetir el chequeo en cada función. */
```

## Línea 53

> Ancla: `export function leerError(error: unknown): string {`

```
/** Convierte el error de Postgres en algo que se pueda mostrar al usuario. */
```

## Línea 61

> Ancla: `export async function buscarMasVendidos(`

```
// ============================================================================
//  productos_mas_vendidos
// ============================================================================
```

## Línea 73

> Ancla: `if (nombres && nombres.length > 0) consulta = consulta.in('categoria_nombre', nombres);`

```
// la vista ya viene ordenada de mayor a menor
```

## Línea 82

> Ancla: `export async function buscarMejorCalificados(`

```
// ============================================================================
//  productos_mejor_calificados
//  La vista ya exige mínimo 3 calificaciones, no hace falta filtrar acá.
// ============================================================================
```

## Línea 103

> Ancla: `export async function buscarCategorias(): Promise<Categoria[]> {`

```
// ============================================================================
//  categorias
// ============================================================================
```

## Línea 116

> Ancla: `export async function contarTiendas(): Promise<number> {`

```
// ============================================================================
//  tiendas
//
//  OJO: la tabla `tiendas` NO se puede consultar directo desde la app. Está
//  cerrada para `anon` (sin GRANT SELECT, a propósito) y una consulta devuelve
//  "permission denied for table tiendas". Lo público se lee por vistas y
//  funciones, igual que `catalogo_productos`.
//
//  Por eso el conteo va por la RPC `contar_tiendas_publicas()` (SQL 31), que
//  devuelve solo un número: no expone ningún dato de las tiendas.
// ============================================================================
```

## Línea 128

> Ancla: `export async function contarTiendas(): Promise<number> {`

```
/** Cantidad de tiendas aprobadas (las que se ven en el catálogo). */
```

## Línea 138

> Ancla: `export async function buscarProductos(limite = 60): Promise<ProductoCatalogo[]> {`

```
// ============================================================================
//  catalogo_productos  (búsqueda)
//
//  No filtra por texto: eso lo hace Postgres con el índice trigram de
//  `nombre`. Buscando el nombre del producto el plan es mejor y el
//  resultado trae también las marcas y modelos compatibles, que es lo
//  que hace útil este buscador para repuestos.
// ============================================================================
```

## Línea 157

> Ancla: `export async function buscarProductoPorId(id: string): Promise<ProductoCatalogo | null> {`

```
/** Un producto del catálogo por id, para la pantalla de detalle. */
```

## Línea 171

> Ancla: `export async function buscarTiendasPorIds(ids: string[]): Promise<Tienda[]> {`

```
/** Las tiendas de un carrito, para saber quién ofrece delivery y a qué costo. */
```

## Línea 181

> Ancla: `export async function buscarUbicacionesRetiro(): Promise<UbicacionRetiro[]> {`

```
/**
 * Ubicación exacta de la tienda para los pedidos de RETIRO del comprador ya
 * confirmados. La RPC `ubicaciones_de_mis_pedidos` filtra por `auth.uid()` y
 * por estado, así que antes de confirmar no devuelve nada (anti-elusión).
 */
```

## Línea 195

> Ancla: `export async function preciosYStock(`

```
/**
 * Precio y stock ACTUALES de los productos del carrito.
 * Se usa en el checkout: un precio puede haber cambiado después de
 * agregar al carrito, y el stock puede haber bajado.
 */
```

## Línea 215

> Ancla: `export async function crearPedidoYLineas(entrada: {`

```
// ============================================================================
//  Pedidos (cliente)
//
//  Un pedido es de UNA sola tienda; el carrito se parte en uno por tienda.
//  Los triggers se encargan del total, del precio y del stock: acá solo se
//  crea el pedido y sus líneas.
// ============================================================================
```

## Línea 264

> Ancla: `async function conLineas<T extends Pedido>(`

```
/**
 * Completa una lista de pedidos con sus líneas (con nombre e imagen del
 * producto). Genérico para reusarlo tanto con los pedidos del cliente como
 * con los de la tienda (que además traen el contacto del cliente).
 */
```

## Línea 312

> Ancla: `export async function buscarPedidosCliente(clienteId: string): Promise<PedidoConDetalle[]> {`

```
/** Los pedidos del cliente con sus líneas (con nombre e imagen del producto). */
```

## Línea 326

> Ancla: `export async function buscarPedidoPorId(pedidoId: string): Promise<PedidoConDetalle | null> {`

```
/** Un pedido del cliente por id, con sus líneas (para la pantalla de calificar). */
```

## Línea 343

> Ancla: `export async function buscarPedidosTienda(): Promise<PedidoTiendaConDetalle[]> {`

```
// ============================================================================
//  Pedidos (tienda / colaboradores)
//
//  El panel de la tienda usa el RPC `pedidos_de_mi_tienda()` (11_panel_tienda.sql)
//  porque la RLS de `usuarios` no deja leer el perfil del comprador con un
//  select normal. Las líneas sí se leen con RLS (detalle_select_involved).
// ============================================================================
```

## Línea 351

> Ancla: `export async function buscarPedidosTienda(): Promise<PedidoTiendaConDetalle[]> {`

```
/**
 * Los pedidos de la tienda del usuario.
 *
 * A propósito NO trae el contacto del cliente (la charla va por el chat) y la
 * dirección llega null hasta que el pedido se confirma (17_mensajes.sql).
 */
```

## Línea 366

> Ancla: `export async function actualizarEstadoPedido(`

```
/** Cambia el estado de un pedido. La RLS solo deja hacerlo a su dueño. */
```

## Línea 377

> Ancla: `export function compatibilidadATexto(compatibilidad: ProductoCatalogo['compatibilidad']): string[] {`

```
/**
 * Aplana la compatibilidad (que viene como jsonb agregado) a una lista de
 * texto: "Honda XR150 2015-2023". Es lo que se muestra en la tarjeta.
 */
```

## Línea 398

> Ancla: `export async function buscarTipos(): Promise<TipoConCategoria[]> {`

```
// ============================================================================
//  Tipos de repuesto (pantalla de administración)
//
//  Lectura pública (`tipos_select_public`); escritura solo admin
//  (`tipos_write_admin`). Si no sos admin, la base rechaza el insert/update/
//  delete y el error se muestra tal cual.
// ============================================================================
```

## Línea 463

> Ancla: `export async function listarTiendasAdmin(): Promise<TiendaAdmin[]> {`

```
// ============================================================================
//  Tiendas (panel de administración)
//
//  Solo el admin puede leer y escribir: la RLS y las RPC `security definer`
//  (`admin_*`) validan `es_admin()`. Si un no-admin llama, la base rechaza.
// ============================================================================
```

## Línea 470

> Ancla: `export async function listarTiendasAdmin(): Promise<TiendaAdmin[]> {`

```
/** Todas las tiendas con su dueño y el estado de la suscripción. Solo admin. */
```

## Línea 480

> Ancla: `export async function aprobarTienda(tiendaId: string, aprobar: boolean): Promise<void> {`

```
/** Aprueba (true) o rechaza (false) una tienda. Solo admin. */
```

## Línea 492

> Ancla: `export async function marcarFundadora(tiendaId: string, marcar: boolean): Promise<void> {`

```
/** Marca/desmarca una tienda como fundadora (RD$100/mes, tope 25). Solo admin. */
```

## Línea 504

> Ancla: `export async function subirFotoVerificacion(`

```
// ============================================================================
//  Verificación de tiendas (fotos de fachada + interior)
//
//  Las fotos viven en el bucket PRIVADO `verificacion`. Acá se sube el archivo,
//  se devuelve la RUTA (no una URL pública) y se ve por URL firmada temporal.
//  La insignia pública (`tiendas.verificada`) la sincroniza un trigger en la base.
// ============================================================================
```

## Línea 512

> Ancla: `export async function subirFotoVerificacion(`

```
/**
 * Sube una foto de verificación al bucket privado, dentro de la carpeta del
 * dueño: `verificacion/<dueno_id>/<archivo>`. Esa es la ruta que exige la
 * política de Storage. Devuelve la RUTA guardada (para firmarla después).
 */
```

## Línea 540

> Ancla: `export async function urlFotoVerificacion(`

```
/**
 * URL firmada temporal de una foto privada de verificación.
 * Devuelve null si la ruta viene vacía. Sirve para el dueño y para el admin.
 */
```

## Línea 558

> Ancla: `export async function enviarVerificacion(`

```
/** La tienda manda sus 2 fotos (fachada + interior) a revisión. */
```

## Línea 573

> Ancla: `export async function miVerificacion(): Promise<VerificacionTienda | null> {`

```
/** Estado y fotos de la verificación de la tienda del usuario actual. */
```

## Línea 584

> Ancla: `export async function listarVerificaciones(): Promise<VerificacionAdmin[]> {`

```
/** Verificaciones de todas las tiendas (con las rutas de las fotos). Solo admin. */
```

## Línea 594

> Ancla: `export async function verificarTienda(`

```
/** Aprueba (true) o rechaza (false) la verificación de una tienda. Solo admin. */
```

## Línea 611

> Ancla: `export async function buscarResenasProducto(productoId: string): Promise<ResenaProducto[]> {`

```
// ============================================================================
//  Calificaciones / reseñas
//
//  Lectura pública (`resenas_producto`, sin datos del cliente).
//  Escritura solo del propio comprador y solo sobre un pedido "entregado":
//  lo valida el trigger `validar_calificacion`, acá solo se inserta.
// ============================================================================
```

## Línea 619

> Ancla: `export async function buscarResenasProducto(productoId: string): Promise<ResenaProducto[]> {`

```
/** Las reseñas de un producto, de la más nueva a la más vieja. */
```

## Línea 633

> Ancla: `export async function buscarCalificacionesDePedido(pedidoId: string): Promise<Calificacion[]> {`

```
/** Las calificaciones que un pedido ya tiene (para no calificar dos veces). */
```

## Línea 646

> Ancla: `export async function buscarCalificacionesCliente(clienteId: string): Promise<Calificacion[]> {`

```
/**
 * Todas las calificaciones de un cliente. Se usa en "Mis pedidos" para saber
 * qué pedidos ya están calificados sin una consulta por cada tarjeta.
 */
```

## Línea 662

> Ancla: `export async function crearCalificacion(entrada: {`

```
/** Deja una reseña (1 a 5 estrellas) de un producto de un pedido entregado. */
```

## Línea 683

> Ancla: `export async function buscarProductosDeTienda(tiendaId: string): Promise<Producto[]> {`

```
// ============================================================================
//  Panel de la tienda — productos
//
//  La RLS deja a la tienda crear/editar/borrar los productos de SU tienda
//  (y solo si la tienda está aprobada — lo valida el trigger
//  `validar_producto_tienda`). Acá solo se arman las consultas.
// ============================================================================
```

## Línea 691

> Ancla: `export async function buscarProductosDeTienda(tiendaId: string): Promise<Producto[]> {`

```
/** Todos los repuestos de una tienda, activos e inactivos (panel de la tienda). */
```

## Línea 705

> Ancla: `export async function buscarProductoBase(id: string): Promise<Producto | null> {`

```
/** Un producto por id, sin pasar por el catálogo (incluye los inactivos). */
```

## Línea 715

> Ancla: `export type ProductoEntrada = {`

```
/** Lo que la tienda puede mandar al crear/editar un repuesto. */
```

## Línea 761

> Ancla: `export async function subirImagenProducto(`

```
/**
 * Sube una foto del teléfono al bucket `productos`, dentro de la carpeta del
 * producto: `productos/<producto_id>/<archivo>`. Esa es la ruta que exige la
 * política de Storage (`06_storage.sql`): solo el dueño de la tienda del
 * producto puede escribir ahí.
 *
 * Lee el archivo local con `fetch` (funciona con las URIs `file://` / `content://`
 * que devuelve expo-image-picker) y lo manda como bytes. Devuelve la URL pública
 * para guardarla en `productos.imagenes`.
 */
```

## Línea 795

> Ancla: `export type CompatibilidadEntrada = {`

```
// ============================================================================
//  Panel de la tienda — compatibilidad
// ============================================================================
```

## Línea 806

> Ancla: `export async function buscarCompatibilidadDeProducto(`

```
/** La compatibilidad cargada de un producto. */
```

## Línea 822

> Ancla: `export async function reemplazarCompatibilidad(`

```
/**
 * Reemplaza toda la compatibilidad de un producto (borra y vuelve a insertar).
 * Es lo más simple para un formulario: el usuario ve y edita la lista completa.
 */
```

## Línea 847

> Ancla: `export async function buscarMensajes(pedidoId: string): Promise<Mensaje[]> {`

```
// ============================================================================
//  Chat interno del pedido (anti-elusión)
//
//  Comprador y tienda se escriben acá adentro, sin intercambiar teléfono ni
//  correo. La RLS (17_mensajes.sql) deja ver y escribir solo a los dos
//  participantes del pedido; `leido` se marca con una RPC porque no hay
//  policy de update.
// ============================================================================
```

## Línea 856

> Ancla: `export async function buscarMensajes(pedidoId: string): Promise<Mensaje[]> {`

```
/** Los mensajes de un pedido, del más viejo al más nuevo. */
```

## Línea 870

> Ancla: `export async function enviarMensaje(entrada: {`

```
/** Manda un mensaje al chat de un pedido. Devuelve la fila guardada. */
```

## Línea 892

> Ancla: `export async function marcarMensajesLeidos(pedidoId: string): Promise<void> {`

```
/** Marca como leídos los mensajes que mandó la contraparte en un pedido. */
```

## Línea 900

> Ancla: `export async function buscarMensajesSinLeer(): Promise<SinLeerPedido[]> {`

```
/** Cuántos mensajes sin leer tiene cada pedido (para el globito del panel). */
```

## Línea 910

> Ancla: `export async function buscarMiSuscripcion(): Promise<MiSuscripcion | null> {`

```
// ============================================================================
//  Suscripción de la tienda
//  RD$100/mes precio de fundador (primeras 25 tiendas, 12 meses desde la marca)
//  o RD$500/mes. 30 días gratis · 5 días de gracia (19_catalogo_y_suscripcion.sql, 22_precio_fundador.sql)
// ============================================================================
```

## Línea 916

> Ancla: `export async function buscarMiSuscripcion(): Promise<MiSuscripcion | null> {`

```
/**
 * Estado de la suscripción de la tienda del usuario (o de cualquier tienda si
 * el usuario es admin). Devuelve null si el usuario no tiene tienda.
 */
```

## Línea 930

> Ancla: `export async function buscarMiSolicitudEliminacion(): Promise<SolicitudEliminacion | null> {`

```
// ============================================================================
//  Eliminación de cuenta
//  Requisito de Google Play (20_eliminar_cuenta.sql).
//  La app registra la solicitud; el admin cierra el borrado definitivo.
// ============================================================================
```

## Línea 936

> Ancla: `export async function buscarMiSolicitudEliminacion(): Promise<SolicitudEliminacion | null> {`

```
/** Última solicitud de eliminación del usuario que todavía no se completó. */
```

## Línea 952

> Ancla: `export async function solicitarEliminacionCuenta(motivo: string | null): Promise<string> {`

```
/**
 * Registra el pedido de eliminación de la cuenta del usuario actual.
 * Devuelve el id de la solicitud. La RPC también borra de inmediato los datos
 * personales que no rompen nada (mensajes, calificaciones, teléfono).
 */
```

## Línea 968

> Ancla: `export async function listarEliminaciones(): Promise<EliminacionAdmin[]> {`

```
// ============================================================================
//  Eliminación de cuenta (panel de administración)
//
//  Requisito de Google Play: la eliminación debe funcionar de verdad. El borrado
//  de `auth.users` vive en la Edge Function `eliminar-cuenta` (necesita la clave
//  `service_role`, que nunca viaja al cliente). Acá se listan las solicitudes y
//  se llama a la función. Las RPC validan `es_admin()` en la base.
// ============================================================================
```

## Línea 977

> Ancla: `export async function listarEliminaciones(): Promise<EliminacionAdmin[]> {`

```
/** Solicitudes de eliminación con su contexto. Solo admin. */
```

## Línea 987

> Ancla: `export async function eliminarCuentaAdmin(entrada: {`

```
/**
 * Cierra una solicitud de eliminación: prepara los datos, borra la cuenta de
 * `auth.users` y marca la solicitud como completada.
 *
 * Llama a la Edge Function `eliminar-cuenta`, que corre en el servidor de
 * Supabase (ahí vive la `service_role`). La función valida que quien llama sea
 * admin antes de hacer nada.
 */
```

## Línea 1009

> Ancla: `let detalle = error.message;`

```
// `FunctionsHttpError` trae el mensaje real del servidor en el cuerpo.
```

## Línea 1015

> Ancla: `}`

```
// sin cuerpo legible: nos quedamos con el mensaje genérico
```

## Línea 1033

> Ancla: `export async function buscarContraparteDelPedido(pedidoId: string): Promise<string | null> {`

```
// ============================================================================
//  Reportes y bloqueos
//  Requisito de Google Play (política de contenido de usuarios).
//  Ver 21_reportes_y_bloqueos.sql.
// ============================================================================
```

## Línea 1039

> Ancla: `export async function buscarContraparteDelPedido(pedidoId: string): Promise<string | null> {`

```
/** La contraparte del pedido (el otro participante) para quien llama. */
```

## Línea 1051

> Ancla: `export async function crearReporte(entrada: {`

```
/** Crea un reporte de contenido o de usuario. Lo resuelve el admin. */
```

## Línea 1082

> Ancla: `export async function bloquearUsuario(bloqueadorId: string, bloqueadoId: string): Promise<void> {`

```
/** Bloquea a otro usuario: deja de ver sus mensajes en el chat. */
```

## Línea 1093

> Ancla: `export async function desbloquearUsuario(bloqueadorId: string, bloqueadoId: string): Promise<void> {`

```
/** Quita el bloqueo que el usuario le puso a otro. */
```

## Línea 1106

> Ancla: `export async function buscarMisBloqueos(bloqueadorId: string): Promise<Bloqueo[]> {`

```
/** Los usuarios que el usuario actual tiene bloqueados. */
```
