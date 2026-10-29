# sql/10_ubicaciones.sql

<!-- 14 bloques · 45 líneas · original del commit 1310672 -->

14 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `alter table public.tiendas`

```
-- ============================================================================
--  10 · UBICACIÓN DE TIENDAS  (latitude / longitude)
-- ============================================================================
--
--  PARA QUÉ SIRVE
--  Agrega las coordenadas de cada tienda para mostrar el mapa y la distancia
--  en kilómetros al cliente. La app (= 09_seguridad.sql en la base viva)
--  necesita estas columnas en `tiendas` y en las 3 vistas del catálogo.
--
--  CÓMO CORRERLO
--  En Supabase → SQL Editor → New query → pegar TODO este archivo → Run.
--  Es RE-EJECUTABLE y no borra nada: si ya está aplicado, no duplica.
--
--  DESPUÉS DE CORRERLO
--  Si todavía no creaste la tienda demo del Este, esto actualiza solo las 2
--  que existan. Para tener la 3ª tienda (Repuestos del Este), creá el usuario
--    tienda3@repuestosrd.test   (rol: tienda, Auto Confirm User)
--  y volvé a correr el archivo 08_datos_demo.sql (actualizado con la 3ª
--  tienda y las coordenadas). Los dueños de tienda reales cargan su
--  ubicación desde su pantalla de tienda.
-- ============================================================================
```

## Línea 23

> Ancla: `alter table public.tiendas`

```
-- ---------------------------------------------------------------------------
--  1) Columnas en `tiendas`
-- ---------------------------------------------------------------------------
```

## Línea 30

> Ancla: `do $$`

```
-- ambas a la vez o ninguna (idempotente)
```

## Línea 42

> Ancla: `update public.tiendas t`

```
-- ---------------------------------------------------------------------------
--  2) Coordenadas de las tiendas demo (si existen)
-- ---------------------------------------------------------------------------
```

## Línea 57

> Ancla: `update public.tiendas t`

```
-- también puede que la dirección demo sea vieja: se refresca si quedó null
```

## Línea 70

> Ancla: `drop view if exists public.catalogo_productos;`

```
-- ---------------------------------------------------------------------------
--  3) Vistas con las coordenadas de la tienda
--
--  Se recrean igual que en 03_vistas.sql pero con `tienda_lat`, `tienda_lng`
--  y `tienda_direccion`. `security_invoker` se mantiene.
-- ---------------------------------------------------------------------------
```

## Línea 81

> Ancla: `create view public.productos_mas_vendidos`

```
-- 3.1 · productos_mas_vendidos
```

## Línea 127

> Ancla: `create view public.productos_mejor_calificados`

```
-- 3.2 · productos_mejor_calificados
```

## Línea 165

> Ancla: `create view public.catalogo_productos`

```
-- 3.3 · catalogo_productos
```

## Línea 211

> Ancla: `select 'columnas tiendas' as que, string_agg(column_name, ', ' order by ordinal_position) as detalle`

```
-- ============================================================================
--  VERIFICACIÓN
-- ============================================================================
```

## Línea 215

> Ancla: `select 'columnas tiendas' as que, string_agg(column_name, ', ' order by ordinal_position) as detalle`

```
-- Las 3 vistas nuevas tienen que devolver las columnas de ubicación.
```

## Línea 221

> Ancla: `select t.nombre, t.direccion, t.latitude, t.longitude`

```
-- Las tiendas aprobadas con coordenadas (si la tienda3 no existe, salen 2).
```

## Línea 227

> Ancla: `select count(*) as productos_publicos,`

```
-- El catálogo tiene que seguir intacto y traer la ubicación de la tienda.
```

## Línea 232

> Ancla: `select tgname as trigger, tgenabled as estado`

```
-- Los triggers de seguridad del 09 deben seguir habilitados ('O').
```
