# src/hooks/useTiendasAdmin.ts

<!-- 3 bloques · 10 líneas · original del commit 1310672 -->

3 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 13

> Ancla: `export function useTiendasAdmin() {`

```
/**
 * Todas las tiendas para el panel de administración (RPC `admin_listar_tiendas`).
 *
 * Solo dispara la consulta si el usuario es admin: un usuario normal nunca la
 * pide, y la base igual la rechazaría. Mismo patrón que el resto de hooks
 * (setState solo dentro de la promesa, nunca sincrónico dentro del efecto).
 */
```

## Línea 34

> Ancla: `if (cargandoSesion || !esAdmin) return;`

```
// Esperamos a que la sesión termine de cargar antes de decidir.
    // Si no es admin, no disparamos nada: el estado queda vacío y sin cargar.
```

## Línea 55

> Ancla: `if (!esAdmin) {`

```
// Un no-admin nunca ve datos ni errores del panel, y no se queda "cargando".
```
