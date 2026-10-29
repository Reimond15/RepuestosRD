# sql/04_rls.sql

<!-- 17 bloques · 67 líneas · original del commit 1310672 -->

17 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `alter table public.usuarios       enable row level security;`

```
-- ============================================================
-- 04 · ROW LEVEL SECURITY
--
--   anon          -> SOLO lectura del catalogo (y vistas publicas)
--   authenticated -> cliente: sus pedidos y sus calificaciones
--                    tienda: sus pedidos, sus productos, su ficha
--                    admin:   todo
--
-- Ejecutar DESPUES de 01, 02 y 03.
-- ============================================================
```

## Línea 22

> Ancla: `drop policy if exists usuarios_select_own on public.usuarios;`

```
-- ------------------------------------------------------------
-- 4.1 · usuarios
-- ------------------------------------------------------------
```

## Línea 36

> Ancla: `drop policy if exists tiendas_select_public on public.tiendas;`

```
-- Nadie inserta/borra usuarios desde el cliente:
-- el unico INSERT viene del trigger de registro.
-- El rol 'admin' solo se cambia desde el Dashboard o con service_role;
-- el trigger 2.9.1 bloquea cualquier intento de la API de autosubirse.
```

## Línea 42

> Ancla: `drop policy if exists tiendas_select_public on public.tiendas;`

```
-- ------------------------------------------------------------
-- 4.2 · tiendas
-- ------------------------------------------------------------
-- lectura publica: el catalogo necesita ver nombre, delivery, zonas.
-- Un visitante solo ve las tiendas APROBADAS y su dueno (o el admin) ve
-- tambien la propia, aunque todavia no este aprobada. (Endurecida en 15.)
```

## Línea 64

> Ancla: `drop policy if exists categorias_select_public on public.categorias;`

```
-- nota: 'aprobada' solo la cambia el admin. La política deja pasar el
--       update del propio dueno (edicion de perfil); el trigger 2.9.2
--       bloquea que ese mismo update toque 'aprobada'.
--       El trigger de registro usa security definer, asi que ignora RLS.
```

## Línea 70

> Ancla: `drop policy if exists categorias_select_public on public.categorias;`

```
-- ------------------------------------------------------------
-- 4.3 · categorias y tipos_repuesto  (referencia, lectura publica)
-- ------------------------------------------------------------
```

## Línea 94

> Ancla: `drop policy if exists productos_select_public on public.productos;`

```
-- ------------------------------------------------------------
-- 4.4 · productos
--      Publico: solo de tiendas aprobadas y activos.
--      Tienda: escribe solo los suyos.
-- ------------------------------------------------------------
```

## Línea 107

> Ancla: `drop policy if exists productos_select_propios on public.productos;`

```
-- La tienda ve TODOS sus productos (también los inactivos y los de una
-- tienda todavía no aprobada), para poder administrarlos desde el panel.
```

## Línea 116

> Ancla: `drop policy if exists productos_select_admin on public.productos;`

```
-- El admin ve todo (incluidos los inactivos).
```

## Línea 152

> Ancla: `drop policy if exists compatibilidad_select_public on public.compatibilidad;`

```
-- ------------------------------------------------------------
-- 4.5 · compatibilidad
--      Publica para productos visibles; escritura de la tienda.
-- ------------------------------------------------------------
```

## Línea 187

> Ancla: `drop policy if exists pedidos_select_involved on public.pedidos;`

```
-- ------------------------------------------------------------
-- 4.6 · pedidos
--      El comprador ve solo los suyos, la tienda solo los suyos,
--      el admin ve todo. El INSERT exige sesion iniciada.
-- ------------------------------------------------------------
```

## Línea 208

> Ancla: `drop policy if exists pedidos_update_involved on public.pedidos;`

```
-- el cliente no cambia el estado; la tienda si (y el admin)
```

## Línea 231

> Ancla: `drop policy if exists detalle_select_involved on public.detalle_pedido;`

```
-- ------------------------------------------------------------
-- 4.7 · detalle_pedido
-- ------------------------------------------------------------
```

## Línea 247

> Ancla: `drop policy if exists detalle_insert_cliente on public.detalle_pedido;`

```
-- solo el cliente del pedido agrega lineas, y solo si no esta entregado.
-- Defensa en profundidad (ademas del trigger 2.5): el producto DEBE ser
-- de la tienda del pedido y estar activo, asi un detalle no se cuela de
-- otra tienda ni de un producto dado de baja.
```

## Línea 284

> Ancla: `drop policy if exists calificaciones_select_public on public.calificaciones;`

```
-- ------------------------------------------------------------
-- 4.8 · calificaciones
--      Lectura publica (se muestran en el catalogo).
--      Escritura solo con sesion, y el trigger valida el resto.
-- ------------------------------------------------------------
```

## Línea 311

> Ancla: `grant usage on schema public to anon, authenticated;`

```
-- ------------------------------------------------------------
-- 4.9 · Permisos de las vistas (lectura publica)
--      Las vistas con security_invoker heredan los permisos del
--      usuario, asi que solo hay que conceder SELECT.
-- ------------------------------------------------------------
```

## Línea 354

> Ancla: `grant select (producto_id, estrellas, comentario, created_at)`

```
-- Las reseñas se ven sin sesion (detalle del producto). El anon solo puede
-- leer las columnas de la reseña: nunca `cliente_id` ni `pedido_id`.
```
