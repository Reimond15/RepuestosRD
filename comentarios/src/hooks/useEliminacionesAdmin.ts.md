# src/hooks/useEliminacionesAdmin.ts

<!-- 1 bloques · 8 líneas · original del commit 1310672 -->

1 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 13

> Ancla: `export function useEliminacionesAdmin() {`

```
/**
 * Solicitudes de eliminación de cuenta para el panel de administración
 * (RPC `admin_listar_eliminaciones`).
 *
 * Solo dispara la consulta si el usuario es admin: un usuario normal nunca la
 * pide, y la base igual la rechazaría. Mismo patrón que `useTiendasAdmin`
 * (setState solo dentro de la promesa, nunca sincrónico dentro del efecto).
 */
```
