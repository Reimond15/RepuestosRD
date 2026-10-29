# sql/30_eliminar_cuenta_admin.sql

<!-- 25 bloques · 118 líneas · original del commit 1310672 -->

25 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `do $$`

```
-- ============================================================================
--  30 · ELIMINACIÓN DE CUENTA EN 1 TOQUE (parte SQL)
-- ============================================================================
--
--  QUÉ HACE
--    Prepara la base para que el admin pueda cerrar una solicitud de
--    eliminación con UN toque desde la app, en vez de hacer 5 pasos a mano.
--
--    · Crea (o recupera) la CUENTA FANTASMA que recibe los pedidos huérfanos.
--    · Agrega las RPC que usa el panel: listar y cerrar solicitudes.
--    · La cuenta de `auth.users` la borra la Edge Function
--      (`supabase/functions/eliminar-cuenta`) porque eso pide la clave
--      `service_role`, que NUNCA puede viajar al celular.
--
--  POR QUÉ UNA CUENTA FANTASMA (y no borrar los pedidos)
--    `pedidos.cliente_id` es ON DELETE RESTRICT: un pedido no puede quedar
--    sin cliente. Si borráramos los pedidos, perderíamos el historial de
--    ventas y los comprobantes, y la Política de Privacidad publicada promete
--    conservarlos por trazabilidad. Así que los pedidos se reasignan a una
--    cuenta que no pertenece a nadie real (`eliminado@repuestosrd.invalid`).
--
--  SEGURIDAD
--    · La cuenta fantasma NO puede iniciar sesión: es un usuario de auth sin
--      contraseña útil y con el correo en el dominio reservado `.invalid`
--      (RFC 2606: nunca se resolverá a un correo real).
--    · Las RPC validan `es_admin()` adentro.
--    · Todo `security definer` con `search_path = public`.
--
--  ORDEN: correr DESPUÉS de 29. Es RE-EJECUTABLE.
-- ============================================================================
```

## Línea 33

> Ancla: `do $$`

```
-- ============================================================================
--  PASO 1 · Cuenta fantasma que recibe los pedidos de las cuentas borradas
--           Se crea en `auth.users` para que `public.usuarios` la siga por
--           el trigger de alta (01_esquema.sql).
-- ============================================================================
```

## Línea 45

> Ancla: `select id into v_id from auth.users where email = v_email;`

```
-- ¿Ya existe? (por correo, en auth.users)
```

## Línea 75

> Ancla: `crypt(gen_random_uuid()::text || gen_random_uuid()::text, gen_salt('bf')),`

```
-- Contraseña aleatoria imposible de adivinar: la cuenta no se usa para
      -- entrar, solo para sostener los pedidos. `crypt` con gen_random_bytes
      -- produce un hash bcrypt válido que nadie conoce.
```

## Línea 96

> Ancla: `insert into public.usuarios (id, email, nombre, rol)`

```
-- Nos aseguramos de que exista la fila en public.usuarios y de que sea
  -- un cliente normal, sin tienda y sin rol elevado.
```

## Línea 103

> Ancla: `update public.usuarios set rol = 'cliente' where id = v_id;`

```
-- Por si el trigger de alta le puso otro rol.
```

## Línea 108

> Ancla: `do $$`

```
-- ============================================================================
--  PASO 1.b · Tienda fantasma (recibe los pedidos de las tiendas cerradas)
--
--  `pedidos.tienda_id` es NOT NULL y ON DELETE RESTRICT, así que un pedido no
--  puede quedar sin tienda. Cuando se elimina la cuenta de un vendedor, sus
--  pedidos se reasignan a esta tienda cerrada para conservar el historial.
-- ============================================================================
```

## Línea 140

> Ancla: `update public.tiendas`

```
-- Que quede siempre en el estado correcto.
```

## Línea 148

> Ancla: `create or replace function public.cuenta_fantasma_id()`

```
-- ============================================================================
--  PASO 2 · ¿Dónde quedó la cuenta fantasma?  (para consultarla en la app)
-- ============================================================================
```

## Línea 171

> Ancla: `create or replace function public.cuenta_fantasma_tienda_id()`

```
-- ============================================================================
--  PASO 2.b · ¿Dónde quedó la tienda fantasma?
-- ============================================================================
```

## Línea 196

> Ancla: `drop function if exists public.admin_listar_eliminaciones();`

```
-- ============================================================================
--  PASO 3 · Listar solicitudes de eliminación (solo admin)
-- ============================================================================
```

## Línea 211

> Ancla: `es_tienda      boolean,`

```
-- contexto útil para decidir antes de borrar
```

## Línea 233

> Ancla: `exists (select 1 from auth.users au where au.id = s.usuario_id) as tiene_backup`

```
-- Si la cuenta ya no existe en auth, no hay nada que borrar.
```

## Línea 250

> Ancla: `drop function if exists public.admin_marcar_eliminacion_completada(uuid);`

```
-- ============================================================================
--  PASO 4 · Marcar una solicitud como completada (solo admin)
--           La llama la Edge Function DESPUÉS de borrar la cuenta.
-- ============================================================================
```

## Línea 281

> Ancla: `drop function if exists public.admin_preparar_eliminacion(uuid);`

```
-- ============================================================================
--  PASO 5 · Preparar los datos ANTES de borrar la cuenta (solo admin)
--
--  Esto es lo que hace que el borrado no falle por las FK RESTRICT:
--    1) reasigna sus pedidos de comprador a la cuenta fantasma
--       (pedidos.cliente_id es RESTRICT);
--    2) si es dueño de una tienda: mueve sus productos y sus pedidos a la
--       tienda fantasma (pedidos.tienda_id y detalle_pedido.producto_id son
--       RESTRICT), y anonimiza la ficha de la tienda.
--
--  IMPORTANTE: los productos NO se borran, se MUEVEN a la tienda cerrada. Así
--  el historial de pedidos queda intacto (un detalle de pedido no puede quedar
--  apuntando a un producto que ya no existe). Como la tienda fantasma está
--  desaprobada, esos productos no aparecen en el catálogo.
--
--  Se expone como RPC para poder llamarla desde la app y ver el detalle.
--  NO borra la cuenta: eso lo hace la Edge Function con service_role.
-- ============================================================================
```

## Línea 328

> Ancla: `if p_usuario_id = auth.uid() then`

```
-- Nunca permitir borrar la propia cuenta del admin ni la fantasma.
```

## Línea 347

> Ancla: `select t.id into v_tienda_id from public.tiendas t where t.dueno_id = p_usuario_id;`

```
-- ¿Es dueño de una tienda?
```

## Línea 351

> Ancla: `update public.tiendas`

```
-- 1) Anonimizar la ficha de la tienda.
```

## Línea 361

> Ancla: `update public.productos`

```
-- 2) Mover los productos a la tienda fantasma. NO se borran: un
    --    detalle_pedido no puede quedar apuntando a un producto inexistente.
    --    (Si NO tuviera pedidos, se podrían borrar; moverlos siempre es seguro.)
```

## Línea 369

> Ancla: `update public.pedidos`

```
-- 3) Los pedidos de su tienda pasan a la tienda fantasma.
```

## Línea 374

> Ancla: `delete from public.tiendas_ubicacion where tienda_id = v_tienda_id;`

```
-- 4) Su ubicación privada ya no debe existir.
```

## Línea 378

> Ancla: `delete from public.calificaciones where cliente_id = p_usuario_id;`

```
-- 5) Los pedidos como comprador pasan a la cuenta fantasma.
  --
  --  OJO: `calificaciones` tiene una FK compuesta (pedido_id, cliente_id) →
  --  pedidos(id, cliente_id) SIN "on update cascade". Por eso hay que borrar
  --  las calificaciones del usuario ANTES de reasignar sus pedidos, o el
  --  UPDATE falla por esa restricción. (Son datos suyos igual: se van.)
```

## Línea 391

> Ancla: `delete from public.mensajes       where autor_id     = p_usuario_id;`

```
-- Limpieza de datos personales que quedaban.
```

## Línea 409

> Ancla: `do $$`

```
-- ============================================================================
--  PASO 6 · Permitir que el estado 'en_proceso' exista
--           (por si la tabla no lo contemplaba)
-- ============================================================================
```

## Línea 438

```
-- ============================================================================
--  VERIFICACIÓN
-- ============================================================================
--  1) La cuenta fantasma existe y es cliente:
--       select public.cuenta_fantasma_id();
--       select id, email, nombre, rol from public.usuarios
--        where email = 'eliminado@repuestosrd.invalid';
--
--  2) La tienda fantasma existe y está cerrada:
--       select public.cuenta_fantasma_tienda_id();
--       select id, nombre, aprobada from public.tiendas
--        where dueno_id = public.cuenta_fantasma_id();
--
--  3) Ver las solicitudes pendientes (como admin):
--       select * from public.admin_listar_eliminaciones();
-- ============================================================================
```
