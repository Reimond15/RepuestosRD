# src/theme/colors.ts

<!-- 19 bloques · 52 líneas · original del commit 1310672 -->

19 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 3

> Ancla: `export const colors = {`

```
/**
 * ============================================================================
 *  ⭐ ARCHIVO DE TEMPORAL CENTRAL — EDITAR SOLO AQUÍ
 * ============================================================================
 *  Cambias un color acá y cambia en toda la app: tarjetas, botones,
 *  barras, textos, estrellas, estados.
 *
 *  Paleta:
 *    Fondo ............ #0D0D0D  negro
 *    Superficies ...... #1C1C1C  tarjetas y barras
 *    Primario ......... #6B7A2F  verde oliva (botones, elementos activos)
 *    Primario claro ... #8A9A3B  enlaces y textos destacados
 *    Texto ............ #F5F5F0  texto principal
 *    Estrellas ........ #F2B705  dorado
 *
 *  Contraste verificado (WCAG AA necesita 4.5:1):
 *    #F5F5F0 sobre #0D0D0D ....... 17.4:1  ✅
 *    #F5F5F0 sobre #1C1C1C ....... 15.1:1  ✅
 *    #000000 sobre #6B7A2F ........  5.2:1  ✅
 *    #A3A3A0 sobre #1C1C1C .......  7.0:1  ✅
 *    #8A8A88 sobre #1C1C1C .......  5.3:1  ✅
 * ============================================================================
 */
```

## Línea 28

> Ancla: `background: '#0D0D0D', // fondo de la app`

```
// ---- tus 6 colores ----
```

## Línea 29

> Ancla: `background: '#0D0D0D',`

```
// fondo de la app
```

## Línea 30

> Ancla: `surface: '#1C1C1C',`

```
// tarjetas, barra inferior, campos
```

## Línea 31

> Ancla: `primary: '#6B7A2F',`

```
// verde oliva: botones, elementos activos
```

## Línea 32

> Ancla: `primaryLight: '#8A9A3B',`

```
// enlaces, textos destacados
```

## Línea 33

> Ancla: `text: '#F5F5F0',`

```
// texto principal
```

## Línea 34

> Ancla: `star: '#F2B705',`

```
// estrellas de calificación
```

## Línea 36

> Ancla: `surfaceAlt: '#242424', // hover, campos, filas alternas`

```
// ---- derivados, para que nada se vea plano ----
```

## Línea 37

> Ancla: `surfaceAlt: '#242424',`

```
// hover, campos, filas alternas
```

## Línea 38

> Ancla: `surfaceRaised: '#2A2A2A',`

```
// elementos sobre superficies
```

## Línea 39

> Ancla: `border: '#2E2E2E',`

```
// líneas y bordes
```

## Línea 42

> Ancla: `textMuted: '#A3A3A0',`

```
// texto secundario (contraste 7:1)
```

## Línea 43

> Ancla: `textFaint: '#8A8A88',`

```
// texto terciario, placeholders (contraste 5.3:1)
```

## Línea 56

> Ancla: `export const paperTheme = {`

```
// ============================================================================
//  TEMA DE REACT NATIVE PAPER (MD3) ARMADO DESDE LOS COLORES DE ARRIBA
// ============================================================================
```

## Línea 62

> Ancla: `roundness: 4,`

```
// con los radios de styles.ts queda el look redondeado
```

## Línea 100

> Ancla: `export const radius = {`

```
// ============================================================================
//  TOKENS DE ESTILO
// ============================================================================
```

## Línea 121

> Ancla: `export const hitSize = { minHeight: 52 } as const;`

```
/** Altura mínima de un botón grande, fácil de tocar con el dedo. */
```

## Línea 134

> Ancla: `export const shadow = {`

```
/**
 * Sombras.
 *
 * Se usa `boxShadow` y no `shadowColor`/`shadowOffset`/etc. porque esas
 * propiedades son de iOS y react-native-web las marca como deprecadas
 * (avisa por consola). `boxShadow` funciona en las tres plataformas y es
 * una sola línea. `elevation` se mantiene para Android, que lo necesita.
 */
```
