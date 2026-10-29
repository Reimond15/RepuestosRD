# sql/20_eliminar_cuenta.sql

<!-- 8 bloques · 95 líneas · original del commit 1310672 -->

8 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create table if not exists public.solicitudes_eliminacion (`

```
-- ============================================================================
--  20 · ELIMINACIÓN DE CUENTA  (requisito de Google Play)
-- ============================================================================
--
--  POR QUÉ
--  Google Play exige que toda app que permita crear cuenta ofrezca:
--     (a) una vía DENTRO de la app para eliminar la cuenta y sus datos, y
--     (b) un ENLACE WEB donde se pueda pedir lo mismo sin reinstalar la app.
--
--  CÓMO FUNCIONA ACÁ
--  La app NO puede borrar la cuenta de `auth.users` por su cuenta (eso
--  requiere la clave `service_role`, que nunca va en el cliente). Entonces el
--  usuario REGISTRA la solicitud desde la app, se borran de inmediato sus
--  datos personales que no rompen nada, y el ADMIN cierra la eliminación
--  (ver "PROCEDIMIENTO DEL ADMIN" al final).
--
--  App:  src/app/eliminar-cuenta.tsx   (vía dentro de la app)
--  Web:  /legal/eliminar-cuenta        (enlace web, sin necesidad de la app)
--
--  Idempotente: se puede correr las veces que haga falta.
--  Ejecutar DESPUÉS de 01–19.
-- ============================================================================
```

## Línea 25

> Ancla: `create table if not exists public.solicitudes_eliminacion (`

```
-- ============================================================================
--  1 · Tabla de solicitudes
-- ============================================================================
```

## Línea 30

> Ancla: `usuario_id uuid references public.usuarios (id) on delete set null,`

```
-- si luego se borra la cuenta, la solicitud queda igual (con el correo)
```

## Línea 48

> Ancla: `alter table public.solicitudes_eliminacion enable row level security;`

```
-- RLS: cada usuario ve y crea SOLO las suyas; el admin ve y resuelve todas.
```

## Línea 71

> Ancla: `drop function if exists public.solicitar_eliminacion_cuenta(text);`

```
-- ============================================================================
--  2 · RPC que registra la solicitud (la llama la app)
--
--  Además de registrarla, borra de inmediato los datos personales que se
--  pueden eliminar sin romper pedidos ni historial:
--     · los mensajes de chat que escribió,
--     · las calificaciones que dejó,
--     · la ubicación exacta de su tienda (si es dueño),
--     · su teléfono.
--  Lo que queda (pedidos, ficha de la tienda, correo) lo cierra el admin,
--  porque los pedidos se deben conservar por trazabilidad/comprobantes.
-- ============================================================================
```

## Línea 106

> Ancla: `select id into v_id`

```
-- Si ya hay una solicitud sin cerrar, devolvemos esa (no duplicamos).
```

## Línea 118

> Ancla: `delete from public.mensajes       where autor_id   = v_uid;`

```
-- Borrado inmediato de datos personales que no rompen nada.
```

## Línea 145

```
-- ============================================================================
--  VERIFICACIÓN
-- ----------------------------------------------------------------------------
--  1) Con una cuenta logueada, la app puede llamar a la RPC:
--       select public.solicitar_eliminacion_cuenta('quiero borrar mi cuenta');
--     (desde el SQL Editor devuelve error a propósito: ahí auth.uid() es null)
--
--  2) Listado de solicitudes pendientes:
--       select id, email, motivo, estado, created_at
--         from public.solicitudes_eliminacion
--        order by created_at desc;
--
-- ============================================================================
--  PROCEDIMIENTO DEL ADMIN  (cerrar una solicitud)
-- ----------------------------------------------------------------------------
--  Conservamos los PEDIDOS por trazabilidad y comprobantes, pero borramos
--  TODOS los datos personales. Pasos:
--
--  A) Anonimizar la ficha de la tienda (si el usuario es dueño de una):
--       update public.tiendas
--          set nombre = 'Tienda cerrada',
--              logo_url = null,
--              zonas = '{}',
--              aprobada = false
--        where dueno_id = '<UUID-DEL-USUARIO>';
--
--  B) Reasignar sus pedidos a una cuenta "eliminada" para poder borrar la
--     cuenta (la FK pedidos.cliente_id es ON DELETE RESTRICT). Creá UNA sola
--     vez esa cuenta en Authentication → Add user (por ejemplo
--     eliminado@repuestosrd.invalid, Auto Confirm) y usá su UUID:
--       update public.pedidos
--          set cliente_id = '<UUID-CUENTA-ELIMINADA>'
--        where cliente_id = '<UUID-DEL-USUARIO>';
--       -- los pedidos de su tienda, igual (si aplica):
--       update public.pedidos
--          set tienda_id = '<UUID-TIENDA-PLACEHOLDER>'
--        where tienda_id in (select id from public.tiendas
--                             where dueno_id = '<UUID-DEL-USUARIO>');
--
--     ⚠️ Un dueño de tienda con pedidos no se puede borrar en cascada sin
--     reasignar antes esos pedidos. Si preferís no hacerlo, dejá la tienda
--     anonimizada del paso (A) y borrá solo la cuenta del usuario.
--
--  C) Borrar la cuenta:  Supabase → Authentication → Users → Delete user.
--     Al borrarla, `usuarios` y (si no quedó nada RESTRICT) `tiendas`,
--     `productos` y `tiendas_ubicacion` se borran en cascada.
--
--  D) Marcar la solicitud como completada:
--       update public.solicitudes_eliminacion
--          set estado = 'completada', resuelto_en = now()
--        where id = '<UUID-SOLICITUD>';
--
--  E) Responder al correo del usuario confirmando el borrado.
-- ============================================================================
```
