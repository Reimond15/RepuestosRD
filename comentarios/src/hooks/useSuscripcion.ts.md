# src/hooks/useSuscripcion.ts

<!-- 1 bloques · 7 líneas · original del commit 1310672 -->

1 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 6

> Ancla: `export function useSuscripcion(activo: boolean) {`

```
/**
 * Estado de la suscripción de la tienda del usuario.
 *
 * Solo se consulta cuando `activo` es true (es decir, cuando la sesión es de
 * tienda y ya se cargó su ficha). Mismo patrón que usePedidos: reintento por
 * contador y sin setState después de desmontar.
 */
```
