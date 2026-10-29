# sql/22_precio_fundador.sql

<!-- 4 bloques · 37 líneas · original del commit 1310672 -->

4 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `do $$`

```
-- ============================================================================
--  22 · PRECIO DE FUNDADOR (RD$100/mes) PARA LAS PRIMERAS 25 TIENDAS
-- ============================================================================
--
--  Modelo:
--    - 30 días gratis (ya existe en 19)
--    - Precio fundador: RD$100/mes, primeras 25 tiendas, 12 meses desde que se marca
--    - Precio normal: RD$500/mes (luego de 12 meses o si no es fundadora)
--    - Gracia 5 días (ya existe)
--    - Los montos viven en el app (constants.ts); la base guarda quién y hasta cuándo
--
--  NOTA: es_admin() requiere un usuario logueado con rol admin (auth.uid() no es
--         nulo). Por eso, NO puede invocarse desde el SQL Editor de Supabase.
--         Para marcar fundadoras desde el SQL Editor, usá el UPDATE RAW al final.
--
```

## Línea 17

> Ancla: `do $$`

```
-- A · Añadir columnas de fundador a tiendas
```

## Línea 46

> Ancla: `drop function if exists public.mi_suscripcion();`

```
-- B · Recrear mi_suscripcion() con info de fundador
```

## Línea 112

```
-- C · SNIPPET PARA MARCAR FUNDADORAS (usar en SQL Editor)
--
-- 1) Ver cupo actual (cuántas fundadoras marcadas)
--    select count(*) as fundadoras_marcadas from public.tiendas where es_fundador;
--
-- 2) Marcar 1 tienda como fundadora (12 meses desde la marca). Requiere el UUID.
--    update public.tiendas
--       set es_fundador    = true,
--           fundador_hasta = now() + interval '12 months'
--     where id = '<UUID_TIENDA>'
--       and not es_fundador
--       and (select count(*) from public.tiendas where es_fundador) < 25;
--
-- 3) Desmarcar o cambiar fecha (solo si es necesario)
--    update public.tiendas set es_fundador = false, fundador_hasta = null where id = '<UUID>';
--    update public.tiendas set fundador_hasta = '2027-10-15 23:59:59+00' where id = '<UUID>';
--
--  Las tiendas ya aprobadas que quieras premiar como fundadoras: corré el UPDATE
--  con su UUID, siempre respetando el tope de 25.
-- ============================================================================
```
