# src/app/(tabs)/pedidos.tsx

<!-- 12 bloques · 21 líneas · original del commit 1310672 -->

12 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 42

> Ancla: `const esTienda = usuario?.rol === 'tienda';`

```
// Si el usuario es una tienda, esta pestaña es su panel de pedidos;
  // si es comprador, es su historial de compras.
```

## Línea 62

> Ancla: `const { suscripcion } = useSuscripcion(esTienda && Boolean(tienda));`

```
// Estado de la suscripción: solo para la tienda (el RPC filtra por rol).
```

## Línea 68

> Ancla: `const [sinLeer, setSinLeer] = useState<Record<string, number>>({});`

```
// Mensajes sin leer por pedido, para el globito del botón de chat.
  // Sirve igual para el comprador y para la tienda (la RPC filtra por rol).
  // Se refresca cada vez que la pestaña vuelve al frente.
```

## Línea 87

> Ancla: `});`

```
// el globito es un extra: si falla, el chat sigue andando
```

## Línea 252

> Ancla: `function TarjetaPedidoCliente({`

```
/** Tarjeta del comprador: solo lectura, con la barra de progreso y la calificación. */
```

## Línea 264

> Ancla: `calificados: Set<string>;`

```
/** ids de producto de ESTE pedido que el cliente ya calificó */
```

## Línea 266

> Ancla: `sinLeer: number;`

```
/** mensajes del chat que el cliente todavía no leyó */
```

## Línea 268

> Ancla: `retiro: UbicacionRetiro | null;`

```
/**
   * Dirección exacta de la tienda para retirar. Viene null mientras la tienda
   * no confirme el pedido: hasta entonces solo se conoce la zona aproximada.
   */
```

## Línea 392

> Ancla: `function TarjetaPedidoTienda({`

```
/** Tarjeta de la tienda: los datos del pedido y los botones de estado. */
```

## Línea 402

> Ancla: `sinLeer: number;`

```
/** mensajes del chat que la tienda todavía no leyó */
```

## Línea 514

> Ancla: `function BotonChat({`

```
/** Botón para abrir el chat del pedido, con globito si hay mensajes sin leer. */
```

## Línea 560

> Ancla: `export function BarraProgresoPedido({ estado }: { estado: EstadoPedido }) {`

```
/**
 * Los 4 estados que ve el cliente. Nota: la base guarda `preparando` y
 * `enviado` por separado, pero el usuario ve "En camino" para los dos.
 */
```
