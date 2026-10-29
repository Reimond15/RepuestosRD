# src/hooks/useVerificacionTienda.ts

<!-- 4 bloques · 11 líneas · original del commit 1310672 -->

4 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 9

> Ancla: `urlFachada: string | null;`

```
/** URL firmada de la fachada (bucket privado). */
```

## Línea 11

> Ancla: `urlInterior: string | null;`

```
/** URL firmada del interior (bucket privado). */
```

## Línea 17

> Ancla: `export function useVerificacionTienda() {`

```
/**
 * El estado de verificación de la tienda del usuario actual.
 *
 * Solo dispara si el usuario es `tienda`: un comprador nunca la pide, y la
 * base igual la rechazaría. Las fotos viven en un bucket privado, así que
 * además de la RPC se piden URLs firmadas temporales para poder mostrarlas.
 */
```

## Línea 46

> Ancla: `const [urlFachada, urlInterior] = await Promise.all([`

```
// Las URLs firmadas se piden en paralelo; si fallan, se muestran nulls
        // (la pantalla igual muestra el estado, solo sin la miniatura).
```
