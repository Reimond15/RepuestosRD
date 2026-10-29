# src/components/AvisoDatos.tsx

<!-- 3 bloques · 10 líneas · original del commit 1310672 -->

3 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 11

> Ancla: `error?: string | null;`

```
/** Mensaje del error, cuando modo es "error". */
```

## Línea 15

> Ancla: `vacio?: string;`

```
/** Texto cuando no hay nada que mostrar. */
```

## Línea 19

> Ancla: `export function AvisoDatos({ modo, error, cargando, onReintentar, vacio }: Props) {`

```
/**
 * ============================================================================
 *  Aviso pequeño de estado: carga, error o "estás viendo datos de prueba".
 *
 *  Vive en la parte de arriba de las pantallas. Es deliberadamente
 *  discreto: si la app funciona, no tiene que ocupar espacio.
 * ============================================================================
 */
```
