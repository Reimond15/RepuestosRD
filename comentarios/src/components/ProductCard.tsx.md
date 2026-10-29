# src/components/ProductCard.tsx

<!-- 15 bloques · 23 líneas · original del commit 1310672 -->

15 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 13

> Ancla: `export type ProductoResumen = {`

```
/**
 * Lo mínimo que la tarjeta necesita.
 *
 * Acepta las 3 formas que devuelven las vistas, para que la misma tarjeta
 * sirva en el inicio, en la búsqueda y en el detalle:
 *   - catalogo_productos        → nombre, precio
 *   - productos_mas_vendidos   → producto, precio_actual
 *   - productos_mejor_calificados → producto, precio_actual
 */
```

## Línea 29

> Ancla: `tienda_verificada?: boolean;`

```
/** true si la tienda está verificada → muestra la insignia. */
```

## Línea 31

> Ancla: `stock?: number;`

```
/** undefined = no se sabe (vistas de ranking sin stock) → no se marca agotado */
```

## Línea 33

> Ancla: `distancia_km?: number | null;`

```
/** Distancia a la tienda, en km. Solo se muestra si la app tiene posición. */
```

## Línea 36

> Ancla: `nombre?: string;`

```
// el nombre del producto, con cualquiera de los dos alias
```

## Línea 40

> Ancla: `precio?: number | string;`

```
// el precio, con cualquiera de los dos alias
```

## Línea 47

> Ancla: `variante?: 'vertical' | 'horizontal';`

```
/** "vertical" = tarjeta grande · "horizontal" = fila compacta */
```

## Línea 49

> Ancla: `mostrarTienda?: boolean;`

```
/** Oculta el nombre de la tienda (en detalle no hace falta). */
```

## Línea 54

> Ancla: `function emojiDeCategoria(nombre: string): string {`

```
/** Emoji que representa la categoría, usado de placeholder. */
```

## Línea 69

> Ancla: `const agotado = typeof producto.stock === 'number' && producto.stock <= 0;`

```
// agotado solo cuando la vista trae stock y es 0; si es unknown no se marca
```

## Línea 72

> Ancla: `const nombre = producto.nombre ?? producto.producto ?? 'Producto';`

```
// las vistas usan `producto`/`precio_actual`; el catálogo usa `nombre`/`precio`
```

## Línea 85

> Ancla: `<View style={[styles.imagenBox, horizontal && styles.imagenBoxHorizontal]}>`

```
{/* ---------- imagen ---------- */}
```

## Línea 109

> Ancla: `<View style={styles.datos}>`

```
{/* ---------- datos ---------- */}
```

## Línea 190

> Ancla: `imagenBox: { width: '100%', height: 140, backgroundColor: colors.surfaceAlt },`

```
// ---- imagen ----
```

## Línea 215

> Ancla: `datos: { padding: 10, gap: 5, flex: 1 },`

```
// ---- datos ----
```
