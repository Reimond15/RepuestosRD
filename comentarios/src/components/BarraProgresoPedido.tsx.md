# src/components/BarraProgresoPedido.tsx

<!-- 2 bloques · 8 líneas · original del commit 1310672 -->

2 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 9

> Ancla: `estadoActual: number;`

```
/** Índice (0-3) del estado actual dentro de PROGRESO_PEDIDO. */
```

## Línea 13

> Ancla: `export function BarraProgresoPedido({ estadoActual }: Props) {`

```
/**
 * Los 4 estados que ve el cliente: Recibido → Confirmado → En camino → Entregado.
 *
 * La base guarda 6 estados (incluye preparando, enviado y cancelado).
 * El usuario solo ve estos 4: "En camino" corresponde a preparando y enviado.
 * Ver ETAPAS_PEDIDO en src/lib/constants.ts
 */
```
