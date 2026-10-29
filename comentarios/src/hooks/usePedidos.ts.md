# src/hooks/usePedidos.ts

<!-- 2 bloques · 9 líneas · original del commit 1310672 -->

2 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 16

> Ancla: `ubicaciones: UbicacionRetiro[];`

```
/** Ubicación exacta de la tienda en los pedidos de retiro ya confirmados. */
```

## Línea 22

> Ancla: `export function usePedidos(usuarioId: string | null) {`

```
/**
 * Pedidos del cliente con sus líneas, el nombre de cada tienda y las
 * calificaciones que ya dejó (para marcar los pedidos calificados).
 *
 * Mismo patrón que useCatalogo: sin usuario no consulta nada (y queda
 * `cargando` en true, pero la pantalla decide qué mostrar según la sesión);
 * el reintento re-dispara el efecto con un contador.
 */
```
