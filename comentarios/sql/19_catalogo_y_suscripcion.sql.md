# sql/19_catalogo_y_suscripcion.sql

<!-- 14 bloques · 64 líneas · original del commit 1310672 -->

14 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create or replace function public.ventas_por_producto()`

```
-- ============================================================================
--  19 · CATÁLOGO (ranking de ventas) + SUSCRIPCIÓN DE TIENDAS
-- ============================================================================
--
--  PARTE A · ARREGLO DEL RANKING DE VENTAS
--  `productos_mas_vendidos` y `productos_mejor_calificados` son vistas
--  `security_invoker = true`, así que leen `detalle_pedido`/`pedidos` con los
--  privilegios y las políticas RLS del usuario que consulta:
--     · sin sesión (anon) las ventas daban SIEMPRE 0, y
--     · con sesión, solo contaban los pedidos propios.
--  Resultado: el "más vendido" no mostraba ventas reales.
--  ARREGLO: el agregado de ventas se calcula en una función
--  `security definer` (`ventas_por_producto()`) que devuelve SOLO números por
--  producto. El resto de la vista sigue con `security_invoker = true`: los
--  productos y las tiendas siguen pasando por RLS.
--
--  PARTE B · SUSCRIPCIÓN  (RD$500/mes · 30 días gratis · 5 días de gracia)
--  Se agrega a `tiendas` el fin de la prueba y el fin del pago. Una tienda
--  "vigente" es la que está aprobada y todavía está en prueba, en gracia o
--  pagada. Las vistas del catálogo sólo muestran productos de tiendas
--  vigentes (una tienda vencida deja de aparecer, pero NO se borra nada y el
--  dueño sigue viendo su tienda y sus pedidos).
--
--  ORDEN: correr DESPUÉS de 01–18. El 20 se apoya en este archivo.
--  Este archivo RE-ESCRIBE las 3 vistas del catálogo: si volvés a correr el
--  10_ubicaciones.sql, volvé a correr ESTE archivo al final.
-- ============================================================================
```

## Línea 30

> Ancla: `create or replace function public.ventas_por_producto()`

```
-- ============================================================================
--  PARTE A · AGREGADO GLOBAL DE VENTAS
-- ============================================================================
```

## Línea 63

> Ancla: `alter table public.tiendas`

```
-- ============================================================================
--  PARTE B · SUSCRIPCIÓN DE TIENDAS
-- ============================================================================
```

## Línea 67

> Ancla: `alter table public.tiendas`

```
-- B.1 · Fechas de la suscripción
```

## Línea 72

> Ancla: `alter table public.tiendas`

```
-- Las tiendas nuevas arrancan con 30 días de prueba.
```

## Línea 76

> Ancla: `update public.tiendas`

```
-- Backfill: las tiendas que ya existían arrancan sus 30 días gratis AHORA
-- (no desde su creación, para que ninguna quede oculta el día de la migración).
```

## Línea 87

> Ancla: `create or replace function public.tienda_vigente(p_tienda_id uuid)`

```
-- B.2 · ¿La tienda está vigente para el catálogo público?
--      aprobada + (prueba | gracia | pago) vigente.
```

## Línea 111

> Ancla: `drop function if exists public.mi_suscripcion();`

```
-- B.3 · Estado de la suscripción para el panel de la tienda
```

## Línea 167

> Ancla: `create or replace function public.registrar_pago_tienda(`

```
-- B.4 · Registrar un pago (sólo admin; pensado para un futuro panel admin)
```

## Línea 215

> Ancla: `drop view if exists public.catalogo_productos;`

```
-- ============================================================================
--  PARTE C · VISTAS DEFINITIVAS DEL CATÁLOGO
--  (ranking arreglado + sólo tiendas vigentes)
-- ============================================================================
```

## Línea 224

> Ancla: `create view public.productos_mas_vendidos`

```
-- C.1 · productos_mas_vendidos
```

## Línea 266

> Ancla: `create view public.productos_mejor_calificados`

```
-- C.2 · productos_mejor_calificados
```

## Línea 301

> Ancla: `create view public.catalogo_productos`

```
-- C.3 · catalogo_productos
```

## Línea 356

```
-- ============================================================================
--  VERIFICACIÓN  (correr en el SQL Editor)
-- ============================================================================
--  1) Ranking con ventas reales (antes daba 0 para anon):
--     select producto, tienda, unidades_vendidas, total_calificaciones
--       from public.productos_mas_vendidos
--      order by unidades_vendidas desc limit 10;
--
--  2) Las tiendas demo quedan vigentes (30 días de prueba desde la migración):
--     select nombre, aprobada, prueba_hasta, pago_hasta,
--            public.tienda_vigente(id) as vigente
--       from public.tiendas order by created_at;
--
--  3) Registrar un pago de prueba (como admin logueado):
--     select public.registrar_pago_tienda('<uuid-de-la-tienda>', 1);
-- ============================================================================
```
