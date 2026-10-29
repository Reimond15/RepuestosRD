# src/store/carrito.ts

<!-- 6 bloques · 10 líneas · original del commit 1310672 -->

6 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 16

> Ancla: `export type PrecioStockActual = {`

```
/** Precio y stock actualizados desde la base, para revalidar en el checkout. */
```

## Línea 26

> Ancla: `agregar: (p: Omit<LineaCarrito, 'cantidad'>, cantidad?: number) => string | null;`

```
/**
   * Agrega (o suma) una línea. Devuelve `null` si salió bien, o un mensaje
   * para mostrar si no (agotado). Con `stock = 0` NO agrega nada.
   */
```

## Línea 34

> Ancla: `vaciarTienda: (tiendaId: string) => void;`

```
/** Limpia solo las líneas de una tienda (después de crear su pedido). */
```

## Línea 36

> Ancla: `revalidar: (actuales: PrecioStockActual[]) => void;`

```
/** Revalida el carrito contra la base (precios/stock que pueden haber cambiado). */
```

## Línea 42

> Ancla: `tiendasDistintas: () => string[];`

```
/** Un pedido es de UNA sola tienda: el carrito se agrupa por tienda. */
```

## Línea 114

> Ancla: `.filter((l) => porId.has(l.producto_id) && l.stock > 0),`

```
// se saca lo que ya no existe (desactivado, tienda sin aprobar)
              // o lo que quedó sin stock
```
