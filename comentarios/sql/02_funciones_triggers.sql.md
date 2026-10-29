# sql/02_funciones_triggers.sql

<!-- 21 bloques · 61 líneas · original del commit 1310672 -->

21 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create or replace function public.manejar_nuevo_usuario()`

```
-- ============================================================
-- 02 · FUNCIONES Y TRIGGERS
-- Reglas de negocio que la base de datos garantiza sola.
-- ============================================================
```

## Línea 6

> Ancla: `create or replace function public.manejar_nuevo_usuario()`

```
-- ------------------------------------------------------------
-- 2.1 · Registro: crea usuarios (y tiendas) desde el registro
--      El rol llega en metadata 'rol' = 'cliente' | 'tienda'
--      'admin' NUNCA se acepta desde el registro.
-- ------------------------------------------------------------
```

## Línea 20

> Ancla: `v_rol := case`

```
-- sanitizacion: solo cliente o tienda, cualquier otra cosa cae en cliente
```

## Línea 39

> Ancla: `if v_rol = 'tienda' then`

```
-- si es tienda, se crea su tienda sin aprobar
```

## Línea 60

> Ancla: `create or replace function public.tocar_updated_at()`

```
-- ------------------------------------------------------------
-- 2.2 · updated_at automatico
-- ------------------------------------------------------------
```

## Línea 84

> Ancla: `create or replace function public.validar_producto_tienda()`

```
-- ------------------------------------------------------------
-- 2.3 · Producto: la tienda debe existir y estar aprobada
-- ------------------------------------------------------------
```

## Línea 106

> Ancla: `if not v_aprobada and coalesce((select rol from public.usuarios where id = auth.uid()), '') <> 'admin' then`

```
-- al actualizar, el admin puede dejar productos de una tienda
  -- todavia no aprobada; al crear, no.
```

## Línea 122

> Ancla: `create or replace function public.recalcular_total_pedido()`

```
-- ------------------------------------------------------------
-- 2.4 · Pedido: calcula el total desde detalle_pedido
-- ------------------------------------------------------------
```

## Línea 150

> Ancla: `create or replace function public.detalle_antes_de_guardar()`

```
-- ------------------------------------------------------------
-- 2.5 · Detalle: precio SIEMPRE del producto + pertenencia a la tienda
--      El precio que manda el cliente se IGNORA: se lee del producto.
--      Y la línea solo se acepta si el producto es de la tienda del
--      pedido y está activo (cierra 2 huecos del P0).
-- ------------------------------------------------------------
```

## Línea 166

> Ancla: `select p.precio into v_precio`

```
-- el precio NUNCA lo manda el cliente: se toma del producto
```

## Línea 178

> Ancla: `if not exists (`

```
-- el producto debe ser de la tienda del pedido y estar activo
```

## Línea 217

> Ancla: `create or replace function public.validar_calificacion()`

```
-- ------------------------------------------------------------
-- 2.6 · Calificacion: solo pedidos "entregado" y del propio cliente
-- ------------------------------------------------------------
```

## Línea 255

> Ancla: `if not exists (`

```
-- el producto debe pertenecer al pedido
```

## Línea 274

> Ancla: `create or replace function public.es_admin()`

```
-- ------------------------------------------------------------
-- 2.7 · Helper: el usuario actual es admin?
-- ------------------------------------------------------------
```

## Línea 291

> Ancla: `create or replace function public.mi_tienda_id()`

```
-- ------------------------------------------------------------
-- 2.8 · Helper: la tienda actual (id) del usuario
-- ------------------------------------------------------------
```

## Línea 305

> Ancla: `create or replace function public.guardar_rol_usuarios()`

```
-- ------------------------------------------------------------
-- 2.9 · SEGURIDAD — PARCHA LOS 6 HUECOS DEL P0
--      Los triggers van con security definer porque las políticas de
--      RLS de 04 dejan pasar updates de la propia fila (necesarios
--      para que el usuario pueda editar su perfil), y esa puerta no
--      puede distinguir campo de campo por sí sola.
-- ------------------------------------------------------------
```

## Línea 313

> Ancla: `create or replace function public.guardar_rol_usuarios()`

```
-- 2.9.1 · El rol no se auto-asigna: solo un admin puede cambiarlo.
--        (usuarios_update_own dejaba que cualquiera subiera su rol a 'admin'.)
```

## Línea 336

> Ancla: `create or replace function public.guardar_aprobacion_tienda()`

```
-- 2.9.2 · La tienda no se auto-aprueba.
--        (tiendas_update_own dejaba que el dueño se aprobara solo.)
```

## Línea 359

> Ancla: `create or replace function public.guardar_campos_pedido()`

```
-- 2.9.3 · Campos del pedido protegidos.
--        · al crear: total = 0 (el total lo calculan las líneas)
--        · en updates sin ser admin:
--            - total debe ser EXACTAMENTE la suma de las líneas
--            - cliente y tienda intocables
--            - entrega, forma de pago y dirección inmutables después
--              de 'confirmado'
--        · 'cancelado' es terminal: no se reactiva, ni por admin.
```

## Línea 416

> Ancla: `create or replace function public.devolver_stock_al_quitar_linea()`

```
-- 2.9.4 · El stock se repone al borrar una línea del pedido.
```

## Línea 436

> Ancla: `create or replace function public.devolver_stock_al_cancelar()`

```
-- 2.9.5 · El stock se repone al cancelar el pedido (todas sus líneas).
```
