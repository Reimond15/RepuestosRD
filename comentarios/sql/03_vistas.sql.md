# sql/03_vistas.sql

<!-- 8 bloques · 43 líneas · original del commit 1310672 -->

8 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `drop view if exists public.vista_calificaciones_producto cascade;`

```
-- ============================================================
-- 03 · VISTAS
-- Todas con security_invoker = true: respetan las politicas RLS
-- de las tablas base (el catalogo es publico, asi que anon
-- tambien puede leerlas). Una vista nunca es una via para
-- saltarse RLS.
--
-- NOTA: cada agregado se calcula en su propio CTE para evitar
-- el "fan-out" de joins que duplica las sumas y los promedios.
-- ============================================================
```

## Línea 12

> Ancla: `drop view if exists public.vista_calificaciones_producto cascade;`

```
-- ------------------------------------------------------------
-- 3.1 · Promedio de estrellas por producto
--      Filtro: where producto_id = <uuid>
-- ------------------------------------------------------------
```

## Línea 36

> Ancla: `drop view if exists public.vista_calificaciones_tienda cascade;`

```
-- ------------------------------------------------------------
-- 3.2 · Promedio de estrellas por tienda
--      Filtro: where tienda_id = <uuid>
--      Promedio ponderado: cada calificacion pesa igual.
-- ------------------------------------------------------------
```

## Línea 72

> Ancla: `drop view if exists public.productos_mas_vendidos cascade;`

```
-- ------------------------------------------------------------
-- CTE compartida para las dos vistas de ranking
-- ------------------------------------------------------------
```

## Línea 76

> Ancla: `drop view if exists public.productos_mas_vendidos cascade;`

```
-- ------------------------------------------------------------
-- 3.3 · productos_mas_vendidos
--      Unidades vendidas, contando solo pedidos "entregado".
--      Solo tiendas aprobadas.
--      Filtro: where categoria_nombre = 'Motocicletas'
-- ------------------------------------------------------------
```

## Línea 132

> Ancla: `drop view if exists public.productos_mejor_calificados cascade;`

```
-- ------------------------------------------------------------
-- 3.4 · productos_mejor_calificados
--      Solo productos con al menos 3 calificaciones.
--      Filtro: where categoria_nombre = 'Carros'
-- ------------------------------------------------------------
```

## Línea 179

> Ancla: `drop view if exists public.catalogo_productos cascade;`

```
-- ------------------------------------------------------------
-- 3.5 · Catalogo publico (lo que ve el anon)
--      Solo tiendas aprobadas + productos activos.
-- ------------------------------------------------------------
```

## Línea 233

> Ancla: `drop view if exists public.resenas_producto cascade;`

```
-- ------------------------------------------------------------
-- 3.7 · resenas_producto  (Etapa 6)
--      Reseñas de un producto, sin datos del cliente: es lo que se
--      muestra en el detalle. security_invoker: respeta RLS.
--      Filtro: where producto_id = <uuid>
-- ------------------------------------------------------------
```
