# sql/15_tiendas_rls.sql

<!-- 1 bloques · 13 líneas · original del commit 1310672 -->

1 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `drop policy if exists tiendas_select_public on public.tiendas;`

```
-- ============================================================
-- 15 · TIENDAS: OCULTAR LAS NO APROBADAS (hallazgo P7)
--
--  Antes (`tiendas_select_public`) cualquier visitante podía leer TODAS
--  las tiendas, incluidas las que todavía no aprobamos, con su `dueno_id`.
--
--  Esta política deja leer:
--    - las tiendas aprobadas (lo que necesita el catálogo público), y
--    - la tienda propia (para el panel: ver si ya está aprobada), y
--    - todo, si sos admin.
--
--  Es re-ejecutable. Se corre DESPUÉS de 04_rls.sql.
-- ============================================================
```
