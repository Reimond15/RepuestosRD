# sql/17_mensajes.sql

<!-- 10 bloques · 60 líneas · original del commit 1310672 -->

10 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create table if not exists public.mensajes (`

```
-- ============================================================
-- 17 · CHAT INTERNO DEL PEDIDO  (anti-elusión)
-- ============================================================
--
-- PARA QUÉ SIRVE
--   El comprador y la tienda necesitan hablar (coordinar la entrega, avisar
--   que está listo, etc.) SIN intercambiar teléfono ni correo, para que la
--   operación no se vaya por fuera de la plataforma.
--
--   Con esto:
--     · Cada pedido tiene su hilo de mensajes.
--     · Solo lo ven el comprador del pedido y la tienda del pedido.
--     · El panel de la tienda DEJA DE mostrar el teléfono y el correo del
--       cliente (eso era una fuga de contacto directa).
--     · La dirección de entrega se muestra recién cuando la tienda confirma
--       el pedido (antes, el pedido todavía puede no ser real).
--
-- Idempotente: se puede correr las veces que haga falta.
-- Ejecutar DESPUÉS de 11 (reemplaza su función).
-- ============================================================
```

## Línea 22

> Ancla: `create table if not exists public.mensajes (`

```
-- ------------------------------------------------------------
-- 1 · Tabla de mensajes
-- ------------------------------------------------------------
```

## Línea 48

> Ancla: `create or replace function public.es_participante_del_pedido(p_pedido_id uuid)`

```
-- ------------------------------------------------------------
-- 2 · ¿Quién participa de un pedido?
--     (el comprador o el dueño de la tienda del pedido)
-- ------------------------------------------------------------
```

## Línea 71

> Ancla: `alter table public.mensajes enable row level security;`

```
-- ------------------------------------------------------------
-- 3 · RLS: solo los participantes leen y escriben su hilo
--     (sin update ni delete: un mensaje enviado no se edita ni se borra)
-- ------------------------------------------------------------
```

## Línea 90

> Ancla: `create or replace function public.marcar_mensajes_leidos(p_pedido_id uuid)`

```
-- ------------------------------------------------------------
-- 4 · Marcar como leídos (lo hace la app al abrir el chat)
-- ------------------------------------------------------------
```

## Línea 114

> Ancla: `create or replace function public.mensajes_sin_leer()`

```
-- ------------------------------------------------------------
-- 5 · Contador de mensajes sin leer (para el globito en la app)
-- ------------------------------------------------------------
```

## Línea 137

> Ancla: `alter table public.mensajes replica identity full;`

```
-- ------------------------------------------------------------
-- 6 · Realtime: que el chat se actualice solo (sin recargar)
-- ------------------------------------------------------------
```

## Línea 157

> Ancla: `drop function if exists public.pedidos_de_mi_tienda();`

```
-- ------------------------------------------------------------
-- 7 · Panel de la tienda SIN el contacto del cliente
--
--     Cambia la firma de la función de 11, así que primero se borra.
--     Ahora devuelve:
--       · cliente_nombre (para saber de quién es el pedido)
--       · sin_leer       (mensajes del chat que no leyó la tienda)
--       · direccion      (SOLO en delivery y desde que el pedido se confirma)
--     Se van cliente_telefono y cliente_email: la comunicación va por el chat.
-- ------------------------------------------------------------
```

## Línea 194

> Ancla: `case`

```
-- anti-elusión: la dirección recién aparece cuando el pedido se confirma
```

## Línea 228

```
-- ============================================================
-- VERIFICACIÓN
--   · Con una cuenta de tienda, la pestaña "Pedidos" ya NO muestra
--     teléfono ni correo, y aparece el botón "Chatear con el comprador".
--   · La dirección de un pedido nuevo (pendiente) aparece oculta; al
--     confirmarlo, se ve.
--   · Desde el SQL Editor las funciones devuelven vacío a propósito
--     (ahí auth.uid() es null).
-- ============================================================
```
