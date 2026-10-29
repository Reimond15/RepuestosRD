# src/components/ErrorBoundary.tsx

<!-- 2 bloques · 15 líneas · original del commit 1310672 -->

2 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 8

> Ancla: `type Props = {`

```
/**
 * ============================================================================
 *  Barrera de errores.
 *
 *  ¿Por qué existe? Porque un error de render sin capturar CIERRA la app
 *  entera (Android vuelve al inicio del teléfono). Con esta barrera, si una
 *  pantalla falla, la app sigue viva y el usuario ve un mensaje con opción de
 *  reintentar en vez de un cierre inesperado.
 *
 *  Nota: las barreras de error solo atrapan errores de RENDER (no errores
 *  nativos ni de eventos asíncronos). Para esos se usa el try/catch del store
 *  de ubicación y las guardas defensivas de cada pantalla.
 * ============================================================================
 */
```

## Línea 39

> Ancla: `console.error('ErrorBoundary atrapó un error:', error, info?.componentStack);`

```
// Deja rastro en la consola para poder diagnosticar en un build de prueba.
```
