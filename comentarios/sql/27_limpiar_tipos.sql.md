# sql/27_limpiar_tipos.sql

<!-- 15 bloques · 96 líneas · original del commit 1310672 -->

15 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `begin;`

```
-- ============================================================================
--  27 · LIMPIAR Y COMPLETAR TIPOS DE REPUESTO
-- ============================================================================
--
--  PARA QUÉ SIRVE
--  Dejar la lista de "tipos de repuesto" canónica antes de abrir al público:
--    1. Borra los SINÓNIMOS / DUPLICADOS (Neumáticos, Cauchos, Sistema de
--       escape, etc.) que confunden a las tiendas al publicar.
--    2. Agrega los tipos de RD que faltaban (alternador, marcha, bomba de
--       gasolina, carburador, kit de arrastre, …).
--
--  POR QUÉ ES SEGURO
--  Los únicos productos que usan tipos duplicados son los de PRUEBA (sembrados
--  por 08_datos_demo.sql). Este script los borra a ellos primero (paso 1) y
--  después borra los tipos (paso 2). Nunca toca productos reales de tiendas
--  reales: el filtro es `email like '%@repuestosrd.test'`.
--
--  CUÁNDO CORRERLO
--  Antes de publicar. Es idempotente: correrlo dos veces no rompe nada.
--
--  OJO: si ya tenés tiendas REALES usando algún tipo de la lista de duplicados,
--  el paso 2 va a fallar con error de FK (a propósito). En ese caso NO sigas
--  borrando: reasigná esos productos a otro tipo primero.
-- ============================================================================
```

## Línea 28

> Ancla: `update public.tipos_repuesto t`

```
-- ---------------------------------------------------------------------------
--  PASO 0 · Renombrar tipos con nombres confusos (NO borra, renombra)
-- ---------------------------------------------------------------------------
--  Igual que 12_tipos_repuesto.sql: cambia el nombre y los productos que
--  apuntaban a él siguen apuntando por `tipo_id` (sin tocar nada más).
--
--    · 'Manija y embrague' (moto) mezcla dos piezas distintas. Se separa:
--        → 'Embrague'   (se crea en el paso 3 si no existe)
--        → 'Maneta'     (renombra la fila existente)
-- ---------------------------------------------------------------------------
```

## Línea 44

> Ancla: `and not exists (`

```
-- evita chocar con la constraint unique (categoria_id, nombre)
   -- si 'Maneta' ya existiera en la misma categoría
```

## Línea 52

> Ancla: `create temporary table tmp_prod_demo on commit drop as`

```
-- ---------------------------------------------------------------------------
--  PASO 1 · Borrar los productos de PRUEBA que usan tipos a eliminar
-- ---------------------------------------------------------------------------
--  Productos demo = los que cuelgan de una tienda cuyo dueño es una cuenta
--  @repuestosrd.test. Solo se borran si además su tipo está en la lista de
--  duplicados del paso 2.
--
--  Antes de borrar el producto hay que quitar lo que lo referencia:
--    · detalle_pedido → on delete RESTRICT (bloquearía el borrado)
--    · calificaciones → ya cae en cascada, pero se limpia igual por claridad
-- ---------------------------------------------------------------------------
```

## Línea 64

> Ancla: `create temporary table tmp_prod_demo on commit drop as`

```
-- 1.a Un producto demo de los que vamos a borrar.
```

## Línea 74

> Ancla: `delete from public.detalle_pedido d`

```
-- 1.b Líneas de pedido que los usan (RESTRICT no deja borrar si quedan).
```

## Línea 79

> Ancla: `delete from public.calificaciones c`

```
-- 1.c Calificaciones de esos productos.
```

## Línea 84

> Ancla: `delete from public.productos p`

```
-- 1.d Los productos.
```

## Línea 89

> Ancla: `delete from public.pedidos pe`

```
-- 1.e Pedidos de PRUEBA que se quedaron sin líneas (evita "pedidos fantasma").
```

## Línea 98

> Ancla: `delete from public.tipos_repuesto`

```
-- ---------------------------------------------------------------------------
--  PASO 2 · Borrar los tipos duplicados / sinónimos
-- ---------------------------------------------------------------------------
--  Regla: se deja el nombre canónico y se quita el sinónimo.
--    · 'Llantas'         ← se queda      | 'Neumáticos' / 'Cauchos'  → fuera
--    · 'Escape'          ← se queda      | 'Sistema de escape'      → fuera
--    · 'Frenos'          ← se queda      | (los específicos se quedan)
-- ---------------------------------------------------------------------------
```

## Línea 109

> Ancla: `insert into public.tipos_repuesto (categoria_id, nombre)`

```
-- ---------------------------------------------------------------------------
--  PASO 3 · Agregar los tipos que faltaban en RD
-- ---------------------------------------------------------------------------
--  Se insertan por categoría. `on conflict` evita duplicar si ya existían.
-- ---------------------------------------------------------------------------
```

## Línea 115

> Ancla: `insert into public.tipos_repuesto (categoria_id, nombre)`

```
-- ── MOTOCICLETAS ──────────────────────────────────────────────────────────
```

## Línea 140

> Ancla: `insert into public.tipos_repuesto (categoria_id, nombre)`

```
-- ── CARROS ────────────────────────────────────────────────────────────────
```

## Línea 169

> Ancla: `insert into public.tipos_repuesto (categoria_id, nombre)`

```
-- ── GUAGUAS ───────────────────────────────────────────────────────────────
```

## Línea 199

```
-- ============================================================================
--  VERIFICACIÓN  (corré esto después para confirmar)
-- ============================================================================
--
--  1) No debe quedar ningún sinónimo:
--     select nombre from public.tipos_repuesto
--      where nombre in ('Neumáticos','Cauchos','Sistema de escape',
--                       'Manija y embrague','Silín');
--     → 0 filas.
--
--  1.b) El rename quedó aplicado:
--     select nombre from public.tipos_repuesto where nombre = 'Maneta';
--     → 1 fila (en Motocicletas).
--
--  2) Conteo por categoría:
--     select c.nombre as categoria, count(t.id) as tipos
--       from public.categorias c
--       left join public.tipos_repuesto t on t.categoria_id = c.id
--      group by c.nombre
--      order by c.nombre;
--
--  3) Confirmar que no quedó ningún producto apuntando a un tipo borrado
--     (no debería haber ninguno; el FK lo garantiza):
--     select count(*) from public.productos p
--       left join public.tipos_repuesto t on t.id = p.tipo_id
--      where t.id is null;
--     → 0.
-- ============================================================================
```
