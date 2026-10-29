# src/hooks/useResponsive.ts

<!-- 10 bloques · 16 líneas · original del commit 1310672 -->

10 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 3

> Ancla: `export const BREAKPOINTS = {`

```
/**
 * ============================================================================
 *  Breakpoints
 *  La app se ve como teléfono, tablet o escritorio según el ancho.
 *  Mismo código en las tres: no hay dos versiones que mantener.
 * ============================================================================
 */
```

## Línea 12

> Ancla: `movil: 768,`

```
// hasta acá, barra inferior + carruseles
```

## Línea 13

> Ancla: `escritorio: 1200,`

```
// desde acá, contenido más ancho
```

## Línea 19

> Ancla: `esMovil: boolean;`

```
/** < 768px — barra inferior, carruseles, 2 columnas */
```

## Línea 21

> Ancla: `esTablet: boolean;`

```
/** 768 – 1199px */
```

## Línea 23

> Ancla: `esEscritorio: boolean;`

```
/** >= 1200px */
```

## Línea 25

> Ancla: `columnas: number;`

```
/** Cantidad de columnas para las rejillas de productos */
```

## Línea 27

> Ancla: `anchoContenido: number;`

```
/** Ancho máximo del contenido, para que no se estire en pantallas grandes */
```

## Línea 29

> Ancla: `navLateral: boolean;`

```
/** true si hay espacio para poner la navegación a la izquierda */
```

## Línea 53

> Ancla: `export function anchoCelda(anchoContenido: number, columnas: number, gap = 16): number {`

```
/** Ancho de cada celda de la rejilla, ya con el gap restado. */
```
