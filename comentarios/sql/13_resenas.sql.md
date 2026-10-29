# sql/13_resenas.sql

<!-- 5 bloques · 33 líneas · original del commit 1310672 -->

5 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `drop view if exists public.resenas_producto cascade;`

```
-- ============================================================
-- 13 · RESEÑAS  (Etapa 6)
-- Pega este archivo en el SQL Editor de Supabase DESPUÉS de 04_rls.sql
-- (o solo, si ya tenías la base creada). Es idempotente: se puede repetir.
--
-- Qué agrega:
--   * La vista pública `resenas_producto` (sin datos del cliente), que es
--     lo que muestra el detalle del producto.
--   * Lectura pública por COLUMNAS de `calificaciones` para el rol anon,
--     para que la vista (security_invoker) funcione sin sesión.
--     El anon NUNCA ve `cliente_id` ni `pedido_id`.
--   * Reafirma la política de lectura pública (por si se corre suelto).
--
-- La ESCRITURA no cambia: sigue gobernada por `calificaciones_insert_own`
-- y por el trigger `validar_calificacion` (solo pedidos "entregado" del
-- propio cliente y con el producto dentro del pedido).
-- ============================================================
```

## Línea 19

> Ancla: `drop view if exists public.resenas_producto cascade;`

```
-- ------------------------------------------------------------
-- 1. Vista pública de reseñas
-- ------------------------------------------------------------
```

## Línea 40

> Ancla: `grant select (producto_id, estrellas, comentario, created_at)`

```
-- ------------------------------------------------------------
-- 2. Lectura pública de las reseñas (solo esas 4 columnas)
-- ------------------------------------------------------------
```

## Línea 48

> Ancla: `drop policy if exists calificaciones_select_public on public.calificaciones;`

```
-- ------------------------------------------------------------
-- 3. Reafirmar la política de lectura pública
-- ------------------------------------------------------------
```

## Línea 57

```
-- ------------------------------------------------------------
-- 4. Verificación rápida
-- ------------------------------------------------------------
-- Debe devolver las reseñas de un producto cualquiera:
--   select * from public.resenas_producto limit 5;
-- Y como anon (sin sesión) el cliente NO debe poder ver cliente_id:
--   select cliente_id from public.calificaciones limit 1;  -- error esperado
```
