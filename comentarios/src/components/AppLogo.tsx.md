# src/components/AppLogo.tsx

<!-- 3 bloques · 11 líneas · original del commit 1310672 -->

3 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 8

> Ancla: `tamano?: number;`

```
/** Tamaño del ícono (el círculo con el carrito). */
```

## Línea 10

> Ancla: `conNombre?: boolean;`

```
/** Muestra el nombre al lado. */
```

## Línea 14

> Ancla: `export function AppLogo({ tamano = 34, conNombre = true }: Props) {`

```
/**
 * Logo de la app: el carrito de compras con herramientas, dentro de un
 * círculo blanco, más el nombre.
 *
 * El carrito es azul oscuro sobre transparente (`logo-app.png`), así que no
 * se vería sobre el fondo negro de la app. Por eso va montado sobre un
 * círculo blanco, igual que el ícono de Android: se ve nítido en cualquier
 * fondo y mantiene una sola identidad visual.
 */
```
