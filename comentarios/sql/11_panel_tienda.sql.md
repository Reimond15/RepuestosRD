# sql/11_panel_tienda.sql

<!-- 2 bloques · 31 líneas · original del commit 1310672 -->

2 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create or replace function public.pedidos_de_mi_tienda()`

```
-- ============================================================
-- 11 · PANEL DE TIENDA
--
-- El dueño de una tienda (rol 'tienda') tiene que ver los pedidos que le
-- llegaron, con el nombre y el teléfono del cliente para poder coordinar la
-- entrega. El problema: la política `usuarios_select_own` de 04_rls.sql solo
-- deja leer la fila propia, así que la tienda NO puede leer el perfil del
-- comprador con un select normal.
--
-- Solución: una función `security definer` que lee `pedidos` + `usuarios`
-- saltándose RLS, pero filtra por `t.dueno_id = auth.uid()`: cada tienda ve
-- únicamente SUS pedidos. Se revoca de `public` y se otorga solo a
-- `authenticated`.
--
-- Nota: las líneas de cada pedido SÍ se pueden leer con RLS normal
-- (`detalle_select_involved`), así que la app las trae aparte.
--
-- Idempotente: se puede correr las veces que haga falta.
-- ============================================================
```

## Línea 69

```
-- ============================================================
-- VERIFICACIÓN
--   Del lado de la app: entrá con una cuenta de tienda y abrí la pestaña
--   "Pedidos". Tiene que listar SOLO los pedidos de esa tienda, con el
--   nombre y el teléfono de cada cliente.
--
--   Con una cuenta de comprador o admin sin tienda, la función devuelve
--   vacío (no sos dueño de ninguna tienda).
--
--   Desde el SQL Editor la función no sirve de prueba: ahí `auth.uid()` es
--   null, así que siempre devuelve vacío. Es a propósito.
-- ============================================================
```
