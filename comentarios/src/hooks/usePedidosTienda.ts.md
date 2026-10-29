# src/hooks/usePedidosTienda.ts

<!-- 1 bloques · 8 líneas · original del commit 1310672 -->

1 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 12

> Ancla: `export function usePedidosTienda(tiendaId: string | null) {`

```
/**
 * Pedidos que le llegaron a la tienda del usuario (panel de colaboradores).
 *
 * Mismo patrón que usePedidos: sin `tiendaId` no consulta (y queda
 * `cargando` en true, que la pantalla resuelve según la sesión); el
 * reintento re-dispara el efecto con un contador (se usa después de
 * cambiar un estado, para refrescar la lista).
 */
```
