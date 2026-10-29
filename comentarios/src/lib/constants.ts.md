# src/lib/constants.ts

<!-- 21 bloques · 50 líneas · original del commit 1310672 -->

21 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `export const CATEGORIAS = [`

```
/**
 * Constantes del dominio. Acá viven las categorías, los estados del pedido
 * y la traducción entre lo que guarda la base y lo que ve el usuario.
 */
```

## Línea 6

> Ancla: `export const CATEGORIAS = [`

```
// ============================================================================
//  CATEGORÍAS — coinciden con la tabla `categorias` de la base
// ============================================================================
```

## Línea 18

> Ancla: `export const CATEGORIA_TODOS = 'todos';`

```
/** "Todos" es la opción por defecto de los filtros. */
```

## Línea 25

> Ancla: `export const nombresFiltro = (seleccion: CategoriaSlug[]): string[] | null => {`

```
/**
 * Convierte la selección múltiple del checklist en los nombres que
 * esperan las vistas SQL (`.in('categoria_nombre', ...)`).
 * `[]` = sin filtro (null) = ver todo.
 */
```

## Línea 37

> Ancla: `export type EstadoPedido =`

```
// ============================================================================
//  ESTADOS DEL PEDIDO
//  La base guarda: pendiente | confirmado | preparando | enviado | entregado | cancelado
//  El usuario ve:   Recibido | Confirmado | En camino  | Entregado   | Cancelado
// ============================================================================
```

## Línea 87

> Ancla: `export const PROGRESO_PEDIDO: { clave: EstadoPedido; etiqueta: string }[] = [`

```
/** Para la barra de progreso: los 4 estados que ve el cliente. */
```

## Línea 95

> Ancla: `export const SIGUIENTE_ESTADO: Partial<`

```
// ============================================================================
//  FLUJO DE LA TIENDA (colaboradores)
//  La tienda avanza el pedido: Recibido → Confirmado → En camino → Entregado.
//  La base guarda `preparando` y `enviado` por separado; acá se usa
//  `preparando` para "En camino" y se acepta `enviado` por si viene de antes.
// ============================================================================
```

## Línea 102

> Ancla: `export const SIGUIENTE_ESTADO: Partial<`

```
/** Siguiente paso del pedido, con el texto del botón que ve la tienda. */
```

## Línea 128

> Ancla: `export const ESTADOS_CANCELABLES: EstadoPedido[] = [`

```
/** Estados en los que la tienda todavía puede cancelar el pedido. */
```

## Línea 136

> Ancla: `export const FORMAS_ENTREGA = [`

```
// ============================================================================
//  ENTREGA Y PAGO
// ============================================================================
```

## Línea 145

> Ancla: `export const FORMAS_PAGO = [`

```
/** Solo efectivo y transferencia, como se pidió. La tabla acepta también `tarjeta`. */
```

## Línea 151

> Ancla: `export const CONDICIONES = [`

```
// ============================================================================
//  PRODUCTO
// ============================================================================
```

## Línea 167

> Ancla: `export type Rol = 'cliente' | 'tienda' | 'admin';`

```
// ============================================================================
//  ROLES
// ============================================================================
```

## Línea 179

> Ancla: `export const SUSCRIPCION = {`

```
// ============================================================================
//  SUSCRIPCIÓN DE LA TIENDA
//  Debe coincidir con el SQL (19_catalogo_y_suscripcion.sql):
//    prueba default   = now() + 30 días
//    gracia           = 5 días después de vencer
// ============================================================================
```

## Línea 187

> Ancla: `precioNormal: 500,`

```
/** Precio normal tras finalizar el precio de fundador o si no aplica. */
```

## Línea 189

> Ancla: `precioFundador: 100,`

```
/** Precio de fundador (primeras 25 tiendas, 12 meses). */
```

## Línea 191

> Ancla: `precioNormalTexto: 'RD$500/mes',`

```
/** Etiquetas listas para mostrar. */
```

## Línea 194

> Ancla: `limiteFundadores: 25,`

```
/** Límite de tiendas fundadoras. */
```

## Línea 196

> Ancla: `mesesFundador: 12,`

```
/** Meses a precio de fundador. */
```

## Línea 198

> Ancla: `diasPrueba: 30,`

```
/** Días gratis al aprobar la tienda. */
```

## Línea 200

> Ancla: `diasGracia: 5,`

```
/** Días de gracia antes de salir del catálogo (coincide con el SQL). */
```
