# sql/09_seguridad.sql

<!-- 17 bloques · 82 líneas · original del commit 1310672 -->

17 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create or replace function public.manejar_nuevo_usuario()`

```
-- ============================================================================
--  09 · SEGURIDAD — PARCHE P0
--  Cierra los 6 huecos del marketplace. Se corre DESPUÉS del 08.
--
--  1. Un usuario NO puede auto-asignarse rol 'admin'.
--  2. Una tienda NO puede auto-aprobarse (aprobada = true).
--  3. El cliente NO puede fijar el precio_unitario de una línea.
--  4. Una línea de pedido DEBE pertenecer a la tienda del pedido y estar activa.
--  5. El pedido: solo se puede tocar el estado (y notas); total, cliente, tienda,
--     forma de pago, entrega y dirección quedan protegidos. El total SIEMPRE
--     es la suma de las líneas.
--  6. El stock se repone al borrar una línea y al cancelar un pedido.
--
--  Es RE-EJECUTABLE: usa create or replace / drop policy + create.
-- ============================================================================
```

## Línea 17

> Ancla: `create or replace function public.manejar_nuevo_usuario()`

```
-- ---------------------------------------------------------------------------
--  1. ROL PROTEGIDO
-- ---------------------------------------------------------------------------
--  (a) El registro re-insertado ya NO toca el rol: el rol queda fijado en el
--      primer registro (cliente o tienda según metadata; nunca 'admin').
-- ---------------------------------------------------------------------------
```

## Línea 32

> Ancla: `v_rol := case`

```
-- sanitizacion: solo cliente o tienda, cualquier otra cosa cae en cliente
```

## Línea 50

> Ancla: `if v_rol = 'tienda' then`

```
-- OJO: sin 'rol'. El rol nunca se reasigna, ni siquiera re-registrando.
```

## Línea 52

> Ancla: `if v_rol = 'tienda' then`

```
-- si es tienda, se crea su tienda sin aprobar
```

## Línea 67

> Ancla: `create or replace function public.guardar_rol_usuarios()`

```
-- (b) Guardia: cambiar el rol solo lo puede hacer un admin.
--     (En los archivos 01-08 el update de la propia fila pasaba RLS;
--      este trigger cierra la escalada de privilegios.)
```

## Línea 77

> Ancla: `if auth.uid() is not null`

```
-- auth.uid() es null en el SQL Editor / dashboard: ese camino queda libre
  -- para crear el primer admin. La API (app) siempre trae auth.uid().
```

## Línea 93

> Ancla: `create or replace function public.guardar_aprobacion_tienda()`

```
-- ---------------------------------------------------------------------------
--  2. APROBACIÓN DE TIENDA PROTEGIDA
--      El dueño no puede aprobar su propia tienda.
-- ---------------------------------------------------------------------------
```

## Línea 104

> Ancla: `if auth.uid() is not null`

```
-- La aprobacion para el SQL Editor / dashboard (auth.uid() es null),
  -- como no espera el primer aprobar. La API queda bloqueada.
```

## Línea 120

> Ancla: `create or replace function public.detalle_antes_de_guardar()`

```
-- ---------------------------------------------------------------------------
--  3. PRECIO SIEMPRE DEL PRODUCTO  +  4. PERTENENCIA DE LA LÍNEA
--      Reemplaza a la 2.5 de 02_funciones_triggers.sql.
--      · precio_unitario: SIEMPRE sale de productos, se ignora lo enviado.
--      · el producto debe ser de la tienda del pedido y estar activo.
-- ---------------------------------------------------------------------------
```

## Línea 136

> Ancla: `select p.precio into v_precio`

```
-- el precio NUNCA lo manda el cliente: se lee del producto (precio congelado)
```

## Línea 148

> Ancla: `if not exists (`

```
-- el producto tiene que ser de la tienda del pedido y estar activo
```

## Línea 181

> Ancla: `drop policy if exists detalle_insert_cliente on public.detalle_pedido;`

```
-- ---------------------------------------------------------------------------
--  4b. POLÍTICA detalle_insert_cliente REFORZADA
--      Defensa en profundidad a nivel RLS (además del trigger de arriba).
-- ---------------------------------------------------------------------------
```

## Línea 201

> Ancla: `create or replace function public.guardar_campos_pedido()`

```
-- ---------------------------------------------------------------------------
--  5. PEDIDO PROTEGIDO
--      · al crear: total = 0 (lo calculan las líneas)
--      · en updates sin ser admin:
--          - total debe ser EXACTAMENTE la suma de las líneas (así el
--            recálculo interno sigue pasando y un total falso se bloquea)
--          - cliente y tienda intocables
--          - entrega, forma de pago y dirección no se cambian después de
--            confirmar
--      · cancelado es terminal (no se reactiva)
-- ---------------------------------------------------------------------------
```

## Línea 224

> Ancla: `if auth.uid() is not null and not public.es_admin() then`

```
-- La verificacion de campos protege la API (auth.uid() presente).
  -- Desde el SQL Editor / dashboard (auth.uid() es null) quedan libres.
```

## Línea 263

> Ancla: `create or replace function public.devolver_stock_al_quitar_linea()`

```
-- ---------------------------------------------------------------------------
--  6. STOCK QUE SE REPONE
--      · al borrar una línea del pedido
--      · al cancelar el pedido (todas sus líneas)
-- ---------------------------------------------------------------------------
```

## Línea 310

```
-- ============================================================================
--  VERIFICACIÓN (corré esto después y avisame si algo no sale como esperás)
-- ============================================================================
-- select event_object_table as tabla, trigger_name
-- from information_schema.triggers
-- where trigger_name in ('trg_guardar_rol_usuarios',
--                        'trg_guardar_aprobacion_tienda',
--                        'trg_guardar_campos_pedido',
--                        'trg_devolver_stock_linea',
--                        'trg_devolver_stock_cancelado')
-- order by 1, 2;
-- ----------------------------------------------------------------------------
-- · 5 filas = los 5 triggers nuevos.
-- · El catálogo sigue igual para anon:  select count(*) from catalogo_productos;
-- · Prueba de auto-aprobación (con sesión de tienda): debe dar error
--     update public.tiendas set aprobada = true where dueno_id = <tu_id>;
-- ============================================================================
```
