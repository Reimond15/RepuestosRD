# sql/05_datos_iniciales.sql

<!-- 5 bloques · 17 líneas · original del commit 1310672 -->

5 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `insert into public.categorias (nombre, slug) values`

```
-- ============================================================
-- 05 · DATOS INICIALES
-- 3 categorias + tipos de repuesto por vehiculo.
-- Idempotente: se puede ejecutar mas de una vez.
-- ============================================================
```

## Línea 13

> Ancla: `insert into public.tipos_repuesto (categoria_id, nombre)`

```
-- ------------------------------------------------------------
-- MOTOCICICLETAS
-- ------------------------------------------------------------
```

## Línea 31

> Ancla: `insert into public.tipos_repuesto (categoria_id, nombre)`

```
-- ------------------------------------------------------------
-- CARROS
-- ------------------------------------------------------------
```

## Línea 52

> Ancla: `insert into public.tipos_repuesto (categoria_id, nombre)`

```
-- ------------------------------------------------------------
-- GUAGUAS
-- ------------------------------------------------------------
```

## Línea 74

> Ancla: `select c.nombre as categoria, count(t.id) as tipos`

```
-- ------------------------------------------------------------
-- Verificacion
-- ------------------------------------------------------------
```
