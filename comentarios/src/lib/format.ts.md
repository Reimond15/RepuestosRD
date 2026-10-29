# src/lib/format.ts

<!-- 12 bloques · 20 líneas · original del commit 1310672 -->

12 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `const formattersRD = new Map<string, Intl.NumberFormat>();`

```
/** Formateadores para República Dominicana. */
```

## Línea 3

> Ancla: `const formattersRD = new Map<string, Intl.NumberFormat>();`

```
// ============================================================================
//  DINERO
// ============================================================================
```

## Línea 22

> Ancla: `export function money(monto: number | string | null | undefined): string {`

```
/** 1500 → "RD$1,500.00" */
```

## Línea 29

> Ancla: `export function numero(valor: number | string | null | undefined, decimales = 0): string {`

```
/** 1500 → "1,500" (sin RD$, para cuando el símbolo ya está a la vista) */
```

## Línea 36

> Ancla: `export function recortar(texto: string, largo: number): string {`

```
// ============================================================================
//  TEXTO
// ============================================================================
```

## Línea 40

> Ancla: `export function recortar(texto: string, largo: number): string {`

```
/** "Pastilla de freno Deluxe" → "Pastilla de brake..." con la largo que le pidas */
```

## Línea 46

> Ancla: `export function iniciales(nombre: string): string {`

```
/** iniciales para el avatar: "Repuestos El Che" → "RC" */
```

## Línea 54

> Ancla: `export function tiempoRelativo(fecha: string | Date): string {`

```
// ============================================================================
//  FECHA
// ============================================================================
```

## Línea 58

> Ancla: `export function tiempoRelativo(fecha: string | Date): string {`

```
/** "hace 3 días", "hace 2 meses" */
```

## Línea 80

> Ancla: `export function fechaCorta(fecha: string | Date): string {`

```
/** "12 oct 2026" */
```

## Línea 90

> Ancla: `export function telefono(valor: string | null | undefined): string {`

```
// ============================================================================
//  TELÉFONO
// ============================================================================
```

## Línea 94

> Ancla: `export function telefono(valor: string | null | undefined): string {`

```
/** "8091234567" → "(809) 123-4567" */
```
