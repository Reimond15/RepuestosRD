# sql/28_fix_rls_recursion.sql

<!-- 12 bloques · 82 líneas · original del commit 1310672 -->

12 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create or replace function public.es_cliente_del_pedido(p_pedido_id uuid)`

```
-- ============================================================================
--  28 · ROMPER EL CICLO DE RLS ENTRE detalle_pedido Y productos
-- ============================================================================
--
--  SÍNTOMA
--  Al confirmar un pedido (checkout) la app fallaba con:
--      infinite recursion detected in policy for relation "detalle_pedido"
--
--  CAUSA (verificada en el esquema)
--  Había un ciclo de políticas que se llaman entre sí:
--
--    detalle_pedido  →  detalle_insert_cliente / detalle_select_involved
--                        consultan   productos
--    productos       →  productos_select_comprados  (24_blindaje_total)
--                        consulta    detalle_pedido   ← vuelve al inicio
--
--  Cuando Postgres evalúa la política de `detalle_pedido` para leer productos
--  (y viceversa), entra en un bucle infinito y aborta la transacción. Eso
--  revienta justo al crear el pedido, que es cuando se insertan las líneas.
--
--  SOLUCIÓN
--  Romper la vía `detalle_pedido → productos` con funciones `security definer`,
--  que se saltan el RLS al consultar (mismo patrón que `puede_ver_direccion_pedido`
--  y `pedidos_de_mi_tienda`). Así ninguna política de `detalle_pedido` vuelve a
--  disparar las políticas de `productos`/`pedidos`.
--
--  NO se toca `productos_select_comprados`: con romper el ciclo desde el lado de
--  `detalle_pedido` alcanza, y esa política sigue protegiendo el historial.
--
--  QUÉ NO CAMBIA
--  Las REGLAS siguen siendo las mismas:
--    · solo el cliente del pedido agrega líneas;
--    · solo mientras el pedido está pendiente/confirmado;
--    · el producto debe ser de la tienda del pedido, estar activo y la tienda
--      aprobada y vigente;
--    · el cliente ve/borra solo las líneas de sus pedidos;
--    · la tienda ve las líneas de sus pedidos;
--    · el admin puede todo.
--  Lo único que cambia es DÓNDE se evalúan (dentro de una función que salta
--  RLS en vez de en la política recursiva).
--
--  Es idempotente: se puede correr las veces que haga falta.
-- ============================================================================
```

## Línea 46

> Ancla: `create or replace function public.es_cliente_del_pedido(p_pedido_id uuid)`

```
-- ============================================================================
--  PASO 1 · Funciones helper (security definer — saltan RLS)
-- ============================================================================
```

## Línea 50

> Ancla: `create or replace function public.es_cliente_del_pedido(p_pedido_id uuid)`

```
-- 1.1 · ¿El usuario actual es el CLIENTE de ese pedido?
```

## Línea 72

> Ancla: `create or replace function public.puede_ver_pedido(p_pedido_id uuid)`

```
-- 1.2 · ¿El usuario actual puede VER ese pedido? (cliente, dueño de la tienda o admin)
```

## Línea 100

> Ancla: `create or replace function public.puede_agregar_linea(`

```
-- 1.3 · ¿Se puede AGREGAR esa línea al pedido? (valida todo sin RLS recursivo)
--        Reglas: el pedido es del cliente, está pendiente/confirmado, la tienda
--        está aprobada y vigente, y el producto es de esa tienda y está activo.
```

## Línea 135

> Ancla: `drop policy if exists detalle_select_involved on public.detalle_pedido;`

```
-- ============================================================================
--  PASO 2 · Reescribir las políticas de detalle_pedido (sin consultas recursivas)
-- ============================================================================
```

## Línea 139

> Ancla: `drop policy if exists detalle_select_involved on public.detalle_pedido;`

```
-- 2.1 · SELECT: el cliente, la tienda del pedido o el admin.
```

## Línea 145

> Ancla: `drop policy if exists detalle_insert_cliente on public.detalle_pedido;`

```
-- 2.2 · INSERT: solo el cliente del pedido, con las validaciones de negocio.
```

## Línea 151

> Ancla: `drop policy if exists detalle_delete_cliente on public.detalle_pedido;`

```
-- 2.3 · DELETE: solo el cliente, y solo si el pedido sigue pendiente.
```

## Línea 164

> Ancla: `drop policy if exists detalle_update_admin on public.detalle_pedido;`

```
-- 2.4 · UPDATE: solo el admin (igual que antes).
```

## Línea 172

```
-- ============================================================================
--  PASO 3 · Romper también la vía por las POLÍTICAS de `pedidos`
--           (por si `pedidos_select_involved` consultara detalle_pedido)
-- ============================================================================
--  `pedidos_select_involved` hoy solo consulta `tiendas`, así que no cicla.
--  Se deja como está: la política ya es de una sola vía.
```

## Línea 180

```
-- ============================================================================
--  VERIFICACIÓN
-- ============================================================================
--
--  1) Que las funciones existan:
--     select proname from pg_proc
--      where proname in ('es_cliente_del_pedido','puede_ver_pedido','puede_agregar_linea');
--     → 3 filas.
--
--  2) Que la política de detalle_pedido ya NO mencione `productos`:
--     select policyname, qual::text, with_check::text
--       from pg_policies
--      where tablename = 'detalle_pedido';
--     → cual/with_check deben llamar a las funciones, NO hacer select de productos.
--
--  3) Prueba real: confirmá un pedido desde la app. NO debe salir el error de
--     recursión y el pedido debe crearse con sus líneas.
-- ============================================================================
```
