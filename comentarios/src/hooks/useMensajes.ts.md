# src/hooks/useMensajes.ts

<!-- 6 bloques · 17 líneas · original del commit 1310672 -->

6 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 8

> Ancla: `type Hilo = {`

```
/** El hilo cargado, atado al pedido al que pertenece. */
```

## Línea 10

> Ancla: `pedidoId: string | null;`

```
/** pedidoId de los mensajes cargados (null = todavía no se cargó nada). */
```

## Línea 16

> Ancla: `export function useMensajes(pedidoId: string | null, autorId: string | null) {`

```
/**
 * ============================================================================
 *  Chat de un pedido.
 *
 *  Carga el hilo, se suscribe a Realtime para ver los mensajes nuevos al
 *  instante y marca como leídos los de la contraparte al abrirlo.
 *
 *  Si Realtime no está disponible (o la base no lo tiene activado), el chat
 *  sigue funcionando con lo que se carga al abrir la pantalla.
 * ============================================================================
 */
```

## Línea 31

> Ancla: `const idsVistos = useRef<Set<string>>(new Set());`

```
// Un mensaje propio llega DOS veces: por el insert y por Realtime.
  // Con este set nos aseguramos de mostrarlo una sola vez.
```

## Línea 72

> Ancla: `if (autorId && nuevo.autor_id !== autorId) {`

```
// si lo escribió la contraparte y estoy mirando, ya queda leído
```

## Línea 109

> Ancla: `const cargando = pedidoId !== null && hilo.pedidoId !== pedidoId;`

```
// Mientras el hilo cargado no sea el del pedido pedido, seguimos cargando.
```
