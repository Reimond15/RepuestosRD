# sql/14_panel_productos.sql

<!-- 2 bloques · 17 líneas · original del commit 1310672 -->

2 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `drop policy if exists productos_select_propios on public.productos;`

```
-- ============================================================
-- 14 · PANEL DE PRODUCTOS DE LA TIENDA
-- La tienda necesita ver TODOS sus repuestos (activos e inactivos)
-- para poder editarlos. La política pública `productos_select_public`
-- solo deja ver los activos de tiendas aprobadas, así que un producto
-- desactivado desaparecía para su propio dueño.
--
-- Esta política es ADITIVA: se suma (OR) a la pública. No cambia nada
-- de lo que ve el visitante sin sesión.
--
-- La compatibilidad ya queda cubierta por `compatibilidad_write_own`
-- (es `for all`, así que también permite leer la de tus productos).
--
-- Idempotente: se puede pegar varias veces.
-- ============================================================
```

## Línea 27

> Ancla: `drop policy if exists productos_select_admin on public.productos;`

```
-- El admin ya ve todo por `productos_update_own`/`delete_own`, pero no
-- tenía SELECT por rol: le damos lectura total explícita.
```
