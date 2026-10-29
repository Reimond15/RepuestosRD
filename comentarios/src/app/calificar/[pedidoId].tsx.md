# src/app/calificar/[pedidoId].tsx

<!-- 2 bloques · 9 líneas · original del commit 1310672 -->

2 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 26

> Ancla: `export default function PantallaCalificar() {`

```
/**
 * Deja la reseña de un pedido entregado: una calificación (estrellas +
 * comentario) por cada repuesto del pedido.
 *
 * La base valida todo (pedido "entregado", del propio cliente, producto del
 * pedido) en el trigger `validar_calificacion`; acá solo se arma la pantalla
 * y se muestra el error tal cual si algo falla.
 */
```

## Línea 115

> Ancla: `const calificaciones = await buscarCalificacionesDePedido(pedido.id);`

```
// Recarga lo calificado para reflejar las reseñas recién guardadas.
```
