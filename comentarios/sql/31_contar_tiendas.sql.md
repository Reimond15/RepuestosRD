# sql/31_contar_tiendas.sql

<!-- 2 bloques · 25 líneas · original del commit 1310672 -->

2 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create or replace function public.contar_tiendas_publicas()`

```
-- ============================================================
--  31 · CONTADOR PÚBLICO DE TIENDAS
--
--  La portada muestra "N tiendas" a la derecha del subtítulo.
--
--  ¿POR QUÉ UNA FUNCIÓN Y NO UNA CONSULTA DIRECTA A `tiendas`?
--  La tabla `public.tiendas` está CERRADA para `anon` a propósito: no
--  tiene GRANT SELECT (por eso una consulta directa desde la app
--  devuelve 401 "permission denied"). Lo público se lee por vistas y
--  funciones que corren con los permisos del dueño, igual que
--  `catalogo_productos` y `tienda_vigente`.
--
--  Esta función usa `security definer` y devuelve SOLO un número:
--  no expone nombres, dueños, correos, direcciones ni ningún otro
--  dato de las tiendas.
--
--  Cuenta las tiendas APROBADAS (decisión de producto). Si algún día
--  se quiere que el número sea idéntico al catálogo, se le agrega
--  `and public.tienda_vigente(t.id)` al where.
--
--  Es re-ejecutable. No toca datos ni cambia permisos de tablas.
-- ============================================================
```

## Línea 42

> Ancla: `select public.contar_tiendas_publicas() as tiendas_aprobadas;`

```
-- ------------------------------------------------------------
--  Verificación: tenés que ver un número (no un error).
-- ------------------------------------------------------------
```
