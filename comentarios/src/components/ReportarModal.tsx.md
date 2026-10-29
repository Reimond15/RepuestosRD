# src/components/ReportarModal.tsx

<!-- 3 bloques · 11 líneas · original del commit 1310672 -->

3 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 9

> Ancla: `export const MOTIVOS_REPORTE: { valor: MotivoReporte; etiqueta: string }[] = [`

```
/** Motivos de reporte, en el orden en que se muestran. */
```

## Línea 22

> Ancla: `onEnviar: (motivo: MotivoReporte, detalle: string) => Promise<void>;`

```
/** Envía el reporte. La pantalla lo arma con el contexto (producto, pedido…). */
```

## Línea 28

> Ancla: `export function ReportarModal({`

```
/**
 * ============================================================================
 *  Reportar contenido o usuario.
 *
 *  Google Play (política de contenido de usuarios) exige que la app tenga un
 *  sistema DENTRO de la app para reportar. Este es el formulario compartido:
 *  lo usa el detalle de un producto y el chat del pedido.
 * ============================================================================
 */
```
