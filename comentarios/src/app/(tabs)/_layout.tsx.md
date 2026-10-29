# src/app/(tabs)/_layout.tsx

<!-- 8 bloques · 25 líneas · original del commit 1310672 -->

8 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 11

> Ancla: `type Props = {`

```
/**
 * `color` lo da React Navigation como ColorValue, que puede ser un
 * OpaqueColorValue (no un string). Por eso el tipo es el del ícono.
 */
```

## Línea 21

> Ancla: `export default function LayoutTabs() {`

```
/**
 * ============================================================================
 *  Navegación adaptable
 *
 *    teléfono   → barra abajo (lo de siempre)
 *    tablet/desktop → barra lateral con ícono + etiqueta al lado
 *
 *  Es el mismo `Tabs` de siempre: React Navigation ya resuelve el layout
 *  en fila cuando `tabBarPosition` es "left", así que no hay dos
 *  navegadores que mantener.
 * ============================================================================
 */
```

## Línea 51

> Ancla: `...Platform.select({ web: { width: 210 }, default: {} }),`

```
// en web las barras laterales no necesitan altura fija
```

## Línea 58

> Ancla: `...Platform.select({ android: { elevation: 0 } }),`

```
// en Android el color del borde de la barra inferior viene de otro lado
```

## Línea 62

> Ancla: `tabBarLabelPosition: navLateral ? 'beside-icon' : 'below-icon',`

```
// con la barra lateral, la etiqueta va AL LADO del ícono
```

## Línea 81

> Ancla: `tabBarActiveBackgroundColor: navLateral ? colors.surfaceAlt : undefined,`

```
// el activo se destaca con un fondo, no solo con el color del ícono
```

## Línea 84

> Ancla: `tabBarBackground: () => null,`

```
// quitar la "pill" de fondo que mete React Navigation por defecto
```

## Línea 141

> Ancla: `function TabIcon({ name, color, size }: Props) {`

```
/**
 * El ícono de la pestaña sigue el color activo/inactivo que da React Navigation,
 * para que no haya que duplicar la lógica de estado en cada pestaña.
 */
```
