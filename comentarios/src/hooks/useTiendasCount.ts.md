# src/hooks/useTiendasCount.ts

<!-- 3 bloques · 12 líneas · original del commit 1310672 -->

3 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 6

> Ancla: `cantidad: number | null;`

```
/** `null` hasta que llega la respuesta (o si hubo error). */
```

## Línea 12

> Ancla: `export function useTiendasCount(): Estado {`

```
/**
 * ============================================================================
 *  Cantidad de tiendas aprobadas, para el contador de la pantalla de inicio.
 *
 *  A diferencia de los hooks del catálogo, este NO cae a datos de prueba: un
 *  número inventado en la portada sería una mentira al usuario. Mientras no
 *  haya respuesta (o si falla), `cantidad` queda en `null` y la pantalla
 *  simplemente no dibuja el contador.
 * ============================================================================
 */
```

## Línea 30

> Ancla: `if (!catalogoDisponible) return;`

```
// Sin Supabase configurado no hay nada que contar.
```
