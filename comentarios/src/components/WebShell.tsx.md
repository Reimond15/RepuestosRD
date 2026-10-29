# src/components/WebShell.tsx

<!-- 3 bloques · 17 líneas · original del commit 1310672 -->

3 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 14

> Ancla: `conHeader?: boolean;`

```
/**
   * Muestra la barra de arriba con logo, buscar y carrito.
   * Por defecto sale sola en tablet/escritorio, que es donde aporta.
   */
```

## Línea 21

> Ancla: `export function WebShell({ children, conHeader }: Props) {`

```
/**
 * ============================================================================
 *  Contenedor adaptable.
 *
 *  En teléfono: nada, el contenido usa el ancho completo.
 *  En escritorio: el contenido se limita a ~1400px y se centra, para que
 *  no quede una línea de 3000px de ancho que nadie puede leer.
 *
 *  La barra de arriba no se dibuja en el teléfono: ahí la navegación ya
 *  está abajo y hacer las dos sería tirar espacio.
 * ============================================================================
 */
```

## Línea 47

> Ancla: `export function HeaderEscritorio() {`

```
/** Barra de arriba: logo, acceso rápido a buscar y botón del carrito. */
```
