# src/types/database.ts

<!-- 50 bloques · 99 líneas · original del commit 1310672 -->

50 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 8

> Ancla: `export type UUID = string;`

```
// ============================================================================
//  Tipos que reflejan 1:1 el SQL de la base de datos.
//  En la Etapa 2 se reemplazan por los generados con:
//    npx supabase gen types typescript --project-id <TU_ID>
// ============================================================================
```

## Línea 37

> Ancla: `verificada: boolean;`

```
/** true si el admin verificó la tienda con fotos. Da la insignia en el catálogo. */
```

## Línea 42

> Ancla: `export interface VerificacionTienda {`

```
/**
 * Estado de verificación de una tienda (RPC `mi_verificacion_tienda`).
 * Las fotos viven en el bucket PRIVADO `verificacion`; acá se guarda la RUTA,
 * no una URL pública. Se ven por URL firmada temporal (dueño + admin).
 */
```

## Línea 56

> Ancla: `export interface VerificacionAdmin extends VerificacionTienda {`

```
/** Una verificación de tienda para el panel de administración. */
```

## Línea 75

> Ancla: `export interface TipoConCategoria extends TipoRepuesto {`

```
/** Un tipo de repuesto con el nombre de su categoría (pantalla de administración). */
```

## Línea 103

> Ancla: `export interface ProductoMasVendido {`

```
// ============================================================================
//  VISTAS
// ============================================================================
```

## Línea 107

> Ancla: `export interface ProductoMasVendido {`

```
/** products_mas_vendidos */
```

## Línea 113

> Ancla: `tienda_verificada?: boolean;`

```
/** true si la tienda está verificada (insignia). */
```

## Línea 115

> Ancla: `tienda_lat?: number | null;`

```
/** Null en la base; opcionales en TS para que los mocks no tengan que repetirlos. */
```

## Línea 129

> Ancla: `export interface ProductoMejorCalificado {`

```
/** productos_mejor_calificados */
```

## Línea 135

> Ancla: `tienda_verificada?: boolean;`

```
/** true si la tienda está verificada (insignia). */
```

## Línea 137

> Ancla: `tienda_lat?: number | null;`

```
/** Null en la base; opcionales en TS para que los mocks no tengan que repetirlos. */
```

## Línea 149

> Ancla: `export interface ProductoCatalogo {`

```
/** catalogo_productos */
```

## Línea 164

> Ancla: `tienda_verificada?: boolean;`

```
/** true si la tienda está verificada (insignia en la ficha). */
```

## Línea 166

> Ancla: `tienda_lat?: number | null;`

```
/** Null en la base; opcionales en TS para que los mocks no tengan que repetirlos. */
```

## Línea 176

> Ancla: `distancia_km?: number | null;`

```
/** Calculado en el cliente (no viene de la vista): distancia a la tienda. */
```

## Línea 207

> Ancla: `export interface LineaPedidoConNombre extends DetallePedido {`

```
/** Línea de un pedido ya traída con el nombre e imagen del producto. */
```

## Línea 213

> Ancla: `export interface PedidoConDetalle extends Pedido {`

```
/** Un pedido con sus líneas, listo para mostrar (lista de "Mis pedidos"). */
```

## Línea 218

> Ancla: `export interface UbicacionRetiro {`

```
/**
 * Ubicación exacta de la tienda para un pedido de retiro ya confirmado.
 * La base solo la devuelve al comprador del pedido y cuando la tienda ya lo
 * confirmó (RPC `ubicaciones_de_mis_pedidos`): antes de eso, el comprador ve
 * únicamente la zona aproximada (anti-elusión).
 */
```

## Línea 232

> Ancla: `export interface PedidoTienda extends Pedido {`

```
/** Un pedido de la tienda (RPC `pedidos_de_mi_tienda`). */
```

## Línea 235

> Ancla: `sin_leer: number;`

```
/** Mensajes del chat que la tienda todavía no leyó. */
```

## Línea 239

> Ancla: `export interface PedidoTiendaConDetalle extends PedidoTienda {`

```
/** Pedido de la tienda con sus líneas, para el panel de colaboradores. */
```

## Línea 254

> Ancla: `export interface Mensaje {`

```
/**
 * Un mensaje del chat interno de un pedido.
 *
 * Existe para que comprador y tienda se comuniquen SIN intercambiar teléfono
 * ni correo (anti-elusión). Solo lo ven los dos participantes del pedido.
 */
```

## Línea 265

> Ancla: `leido: boolean;`

```
/** true cuando la contraparte ya lo leyó. */
```

## Línea 270

> Ancla: `export interface SinLeerPedido {`

```
/** Cuántos mensajes sin leer tiene un pedido (RPC `mensajes_sin_leer`). */
```

## Línea 276

> Ancla: `export type MotivoReporte =`

```
/** Motivos de un reporte. Deben coincidir con el `check` de `reportes.motivo`. */
```

## Línea 285

> Ancla: `export type TipoReporte = 'producto' | 'tienda' | 'usuario' | 'mensaje';`

```
/** Qué se está reportando. Debe coincidir con el `check` de `reportes.tipo`. */
```

## Línea 288

> Ancla: `export interface Reporte {`

```
/**
 * Un reporte de contenido o de usuario (Google Play, política UGC).
 * Lo crea cualquier usuario autenticado; lo resuelve el admin.
 */
```

## Línea 308

> Ancla: `export interface Bloqueo {`

```
/**
 * Un bloqueo entre usuarios (Google Play, política UGC para interacción 1:1).
 * Mientras exista, ninguno de los dos ve los mensajes del otro en el chat.
 */
```

## Línea 318

> Ancla: `export interface MiSuscripcion {`

```
/**
 * Estado de la suscripción de la tienda (RPC `mi_suscripcion`).
 * RD$100/mes (precio de fundador) o RD$500/mes · 30 días de prueba · 5 días de gracia (ver SUSCRIPCION).
 */
```

## Línea 323

> Ancla: `estado: 'prueba' | 'activa' | 'gracia' | 'vencida';`

```
/** `prueba` | `activa` | `gracia` | `vencida` */
```

## Línea 325

> Ancla: `dias_restantes: number;`

```
/** Días hasta que vence la prueba o el pago (0 si ya venció). */
```

## Línea 327

> Ancla: `dias_gracia: number;`

```
/** Días que quedan antes de salir del catálogo (incluye la gracia). */
```

## Línea 329

> Ancla: `vence_en: string;`

```
/** Fin de la prueba o del pago. */
```

## Línea 331

> Ancla: `disponible_hasta: string;`

```
/** Fin de la gracia: después de esto la tienda sale del catálogo. */
```

## Línea 335

> Ancla: `es_fundador: boolean | null;`

```
/** true si la tienda fue marcada como fundadora. */
```

## Línea 337

> Ancla: `fundador_hasta: string | null;`

```
/** fecha hasta la cual aplica el precio de fundador. */
```

## Línea 339

> Ancla: `precio_fundador_vigente: boolean | null;`

```
/** true si el precio de fundador está vigente hoy. */
```

## Línea 343

> Ancla: `export interface SolicitudEliminacion {`

```
/**
 * Pedido de eliminación de cuenta (`solicitudes_eliminacion`).
 * Requisito de Google Play: la vía vive en la app y en `/legal/eliminar-cuenta`.
 */
```

## Línea 357

> Ancla: `export interface EliminacionAdmin {`

```
/**
 * Una solicitud de eliminación de cuenta vista por el admin
 * (RPC `admin_listar_eliminaciones`). Trae el contexto necesario para decidir
 * antes de borrar: si es dueño de una tienda, su nombre y cuántos pedidos hay.
 */
```

## Línea 370

> Ancla: `es_tienda: boolean;`

```
/** true si el usuario es dueño de una tienda. */
```

## Línea 372

> Ancla: `tienda: string | null;`

```
/** Nombre de la tienda del usuario, si tiene una. */
```

## Línea 374

> Ancla: `pedidos: number;`

```
/** Cuántos pedidos hizo como comprador (se reasignan a la cuenta fantasma). */
```

## Línea 376

> Ancla: `tiene_backup: boolean;`

```
/** true si la cuenta todavía existe en `auth.users` (hay algo que borrar). */
```

## Línea 380

> Ancla: `export interface ResultadoPrepararEliminacion {`

```
/**
 * Resultado de preparar una eliminación (RPC `admin_preparar_eliminacion`).
 * Cuenta qué se anonimizó/borró/reasignó antes del borrado definitivo.
 */
```

## Línea 390

> Ancla: `export interface ResenaProducto {`

```
/**
 * Reseña pública de un producto (vista `resenas_producto`).
 * A propósito NO trae `cliente_id`: la reseña se muestra en el detalle del
 * producto a cualquiera, sin exponer quién la escribió.
 */
```

## Línea 402

> Ancla: `export interface TiendaAdmin {`

```
/**
 * Una tienda del panel de administración (RPC `admin_listar_tiendas`).
 * Trae los datos de la tienda + el nombre/correo del dueño + el estado de la
 * suscripción, todo en una sola fila para la pantalla del admin.
 */
```

## Línea 423

> Ancla: `verificada: boolean;`

```
/** true si el admin ya verificó la tienda con fotos. */
```

## Línea 425

> Ancla: `estado_verificacion: string;`

```
/** Estado de la verificación con fotos: sin_enviar | enviada | verificada | rechazada. */
```

## Línea 430

> Ancla: `export interface Sesion {`

```
// ============================================================================
//  Sesión
// ============================================================================
```
