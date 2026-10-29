# sql/21_reportes_y_bloqueos.sql

<!-- 12 bloques · 62 líneas · original del commit 1310672 -->

12 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create table if not exists public.reportes (`

```
-- ============================================================================
--  21 · REPORTES Y BLOQUEOS  (requisito de Google Play: contenido de usuarios)
-- ============================================================================
--
--  POR QUÉ
--  Google Play (política "User Generated Content") exige que una app con
--  contenido de usuarios:
--     · acepte términos antes de publicar contenido  → ya está (consentimiento
--       en el registro: ver src/app/ingresar.tsx);
--     · tenga un sistema DENTRO de la app para REPORTAR contenido y usuarios;
--     · tenga una forma de BLOQUEAR usuarios en interacciones 1:1 (nuestro
--       chat del pedido es exactamente eso).
--
--  QUÉ HACE ESTE ARCHIVO
--     · `reportes`  → el usuario reporta un producto, una tienda o a una
--                     persona. Lo lee y lo resuelve el admin.
--     · `bloqueos`  → el usuario bloquea a otro. A partir de ahí, ninguno de
--                     los dos vuelve a ver los mensajes del otro en el chat
--                     (RLS) y el bloqueado ya no puede escribirle.
--
--  Idempotente: se puede correr las veces que haga falta.
--  Ejecutar DESPUÉS de 17 (reemplaza policies y funciones de mensajes)
--  y de 20.
-- ============================================================================
```

## Línea 27

> Ancla: `create table if not exists public.reportes (`

```
-- ============================================================================
--  1 · Tabla de reportes
-- ============================================================================
```

## Línea 33

> Ancla: `reportado_id  uuid        references public.usuarios (id) on delete set null,`

```
-- a quién se reporta (puede quedar null: lo resuelve el admin)
```

## Línea 64

> Ancla: `alter table public.reportes enable row level security;`

```
-- RLS: cada quien ve y crea los suyos; el admin ve y resuelve todos.
```

## Línea 87

> Ancla: `create table if not exists public.bloqueos (`

```
-- ============================================================================
--  2 · Tabla de bloqueos
--
--  bloqueador_id bloqueó a bloqueado_id. La fila la ve el bloqueador (y el
--  admin); el bloqueado no se entera (solo descubre que no puede escribir).
-- ============================================================================
```

## Línea 128

> Ancla: `create or replace function public.hay_bloqueo(p_a uuid, p_b uuid)`

```
-- ============================================================================
--  3 · Funciones de apoyo
-- ============================================================================
```

## Línea 132

> Ancla: `create or replace function public.hay_bloqueo(p_a uuid, p_b uuid)`

```
-- ¿Hay bloqueo entre dos usuarios, en cualquier dirección?
```

## Línea 154

> Ancla: `create or replace function public.contraparte_del_pedido(p_pedido_id uuid)`

```
-- La contraparte del pedido (para el usuario que llama). Null si no participa.
```

## Línea 179

> Ancla: `drop policy if exists mensajes_select_participantes on public.mensajes;`

```
-- ============================================================================
--  4 · El bloqueo toca el chat: reemplaza las policies de `mensajes`
--
--  · select: no veo los mensajes de quien bloqueé (ni de quien me bloqueó).
--  · insert: nadie escribe si hay un bloqueo entre las dos partes.
-- ============================================================================
```

## Línea 203

> Ancla: `create or replace function public.mensajes_sin_leer()`

```
-- ============================================================================
--  5 · Los contadores de "sin leer" no cuentan mensajes bloqueados
-- ============================================================================
```

## Línea 227

> Ancla: `drop function if exists public.pedidos_de_mi_tienda();`

```
-- Igual que en 17, pero el contador `sin_leer` excluye a los bloqueados.
```

## Línea 292

```
-- ============================================================================
--  VERIFICACIÓN
-- ----------------------------------------------------------------------------
--  1) Reportes pendientes:
--       select id, tipo, motivo, estado, created_at
--         from public.reportes order by created_at desc;
--  2) Bloqueos hechos:
--       select * from public.bloqueos order by created_at desc;
--  3) Desde la app: reportar un producto y bloquear a la contraparte del chat.
--     Tras bloquear, los mensajes de esa persona desaparecen y ya no se puede
--     escribir en ese hilo (en cualquier dirección).
-- ============================================================================
```
