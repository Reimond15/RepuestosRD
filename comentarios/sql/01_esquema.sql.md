# sql/01_esquema.sql

<!-- 15 bloques · 37 líneas · original del commit 1310672 -->

15 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create extension if not exists "pgcrypto";`

```
-- ============================================================
-- 01 · ESQUEMA BASE
-- Marketplace de repuestos de vehículos
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================
```

## Línea 9

> Ancla: `create table if not exists public.usuarios (`

```
-- ------------------------------------------------------------
-- 1. usuarios
-- ------------------------------------------------------------
```

## Línea 24

> Ancla: `create table if not exists public.tiendas (`

```
-- ------------------------------------------------------------
-- 2. tiendas
-- ------------------------------------------------------------
```

## Línea 52

> Ancla: `create table if not exists public.categorias (`

```
-- ------------------------------------------------------------
-- 3. categorias
-- ------------------------------------------------------------
```

## Línea 62

> Ancla: `create table if not exists public.tipos_repuesto (`

```
-- ------------------------------------------------------------
-- 4. tipos_repuesto
-- ------------------------------------------------------------
```

## Línea 74

> Ancla: `create table if not exists public.productos (`

```
-- ------------------------------------------------------------
-- 5. productos
-- ------------------------------------------------------------
```

## Línea 99

> Ancla: `create table if not exists public.compatibilidad (`

```
-- ------------------------------------------------------------
-- 6. compatibilidad
-- ------------------------------------------------------------
```

## Línea 118

> Ancla: `create table if not exists public.pedidos (`

```
-- ------------------------------------------------------------
-- 7. pedidos
-- ------------------------------------------------------------
```

## Línea 138

> Ancla: `constraint pedidos_direccion_requerida`

```
-- si es retiro no debe exigir direccion; si es delivery, si
```

## Línea 142

> Ancla: `constraint pedidos_id_cliente_unico unique (id, cliente_id)`

```
-- clave candidata para vincular (pedido, cliente) desde calificaciones
```

## Línea 150

> Ancla: `create table if not exists public.detalle_pedido (`

```
-- ------------------------------------------------------------
-- 8. detalle_pedido
-- ------------------------------------------------------------
```

## Línea 158

> Ancla: `precio_unitario numeric(12, 2) not null check (precio_unitario > 0),`

```
-- precio congelado al momento de la compra
```

## Línea 167

> Ancla: `create table if not exists public.calificaciones (`

```
-- ------------------------------------------------------------
-- 9. calificaciones
-- ------------------------------------------------------------
```

## Línea 179

> Ancla: `constraint calificaciones_unica_por_pedido_producto unique (pedido_id, producto_id),`

```
-- REGLA: una sola calificación por pedido y producto
```

## Línea 181

> Ancla: `constraint calificaciones_cliente_es_del_pedido`

```
-- REGLA: el cliente del pedido debe ser quien califica
```
