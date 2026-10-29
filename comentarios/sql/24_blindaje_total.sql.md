# sql/24_blindaje_total.sql

<!-- 30 bloques · 159 líneas · original del commit 1310672 -->

30 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `drop view if exists public.catalogo_productos;`

```
-- ============================================================================
--  24 · BLINDAJE TOTAL  (cierra #1–#6 y encierra al rol anónimo)
-- ============================================================================
--
--  QUÉ CIERRA (hallazgos de la auditoría)
--   #1  anon ya NO puede leer NINGUNA columna de `calificaciones`.
--   #2  nadie se auto-aprueba la tienda por INSERT.
--   #3  nadie se auto-sirve la suscripción por UPDATE.
--   #4  una tienda VENCIDA no expone sus productos ni por acceso directo.
--   #5  la dirección EXACTA del pedido deja de estar en `pedidos.direccion`
--       (queda SIEMPRE NULL) y pasa a una tabla privada; la tienda la ve sólo
--       por el RPC y sólo cuando el pedido ya dejó de estar "pendiente".
--   #6  `calificaciones` deja de ser legible ENTERA por cualquier usuario
--       logueado: ahora cada usuario lee sólo SUS propias calificaciones.
--       Las reseñas PÚBLICAS (sin PII) las sirven las vistas del catálogo,
--       que pasan a ejecutarse como su dueño (no como el invocante).
--   +   anon queda en "deny-by-default": se le quita TODO y se le devuelve
--       únicamente la lectura pública (vistas del catálogo + categorías/tipos).
--
--  ---------------------------------------------------------------------------
--  Incluye TODO lo de `23_hardening.sql`: PODÉS CORRER SÓLO ESTE ARCHIVO.
--  Idempotente y re-ejecutable. NO borra ni reescribe datos de la app.
--  Correr DESPUÉS de 01–22 (o de 23, es lo mismo).
--
--  OJO: si más adelante volvés a correr 04_rls.sql, 03_vistas.sql, 10_…,
--       13_resenas.sql o 19_…, VOLVÉ A CORRER ESTE ARCHIVO AL FINAL, porque
--       ellos reescriben las vistas y los permisos que acá endurecemos.
-- ============================================================================
```

## Línea 31

> Ancla: `drop view if exists public.catalogo_productos;`

```
-- ============================================================================
--  PARTE 1 · #6 + #1 — las vistas del catálogo dejan de leer `calificaciones`
--  como el invocante.
--
--  POR QUÉ: para que un usuario logueado vea las reseñas PÚBLICAS de CUALQUIER
--  producto, la vista tendría que leer filas ajenas de `calificaciones`. Con
--  RLS no se puede "ocultar una columna pero mostrar la fila". La solución
--  limpia es que la vista corra como su DUEÑO (no como el invocante): así lee
--  todas las filas y expone SÓLO las columnas seguras (producto, estrellas,
--  comentario, fecha). El dueño de las tablas (rol del SQL Editor) NO está
--  sujeto a RLS; por eso funciona y por eso hay que dejarlo por escrito.
--
--  EFECTO: las vistas siguen mostrando EXACTAMENTE lo mismo que antes (ya
--  filtraban visibilidad a mano: `p.activo`, `t.aprobada`, `tienda_vigente`),
--  pero dejan de necesitar permiso de lectura sobre las tablas base.
-- ============================================================================
```

## Línea 48

> Ancla: `drop view if exists public.catalogo_productos;`

```
-- Bajar en orden de dependencia (catalogo -> vista_calificaciones_producto).
```

## Línea 56

> Ancla: `create view public.vista_calificaciones_producto as`

```
-- 1.1 · Promedio de estrellas por producto
```

## Línea 73

> Ancla: `create view public.vista_calificaciones_tienda as`

```
-- 1.2 · Promedio de estrellas por tienda
--      (filtros explícitos porque corre como dueño, sin RLS)
```

## Línea 104

> Ancla: `create view public.productos_mas_vendidos as`

```
-- 1.3 · Ranking de ventas
```

## Línea 142

> Ancla: `create view public.productos_mejor_calificados as`

```
-- 1.4 · Mejor calificados (mínimo 3 calificaciones)
```

## Línea 173

> Ancla: `create view public.catalogo_productos as`

```
-- 1.5 · Catálogo público
```

## Línea 221

> Ancla: `create view public.resenas_producto as`

```
-- 1.6 · Reseñas de un producto (sin datos del cliente)
```

## Línea 233

> Ancla: `revoke all on public.calificaciones from anon;`

```
-- 1.7 · anon ya no necesita `calificaciones`: se le quita del todo.
```

## Línea 236

> Ancla: `drop policy if exists calificaciones_select_public on public.calificaciones;`

```
-- 1.8 · #6: un usuario logueado sólo lee SUS calificaciones (o el admin).
```

## Línea 244

> Ancla: `create or replace function public.guardar_aprobacion_tienda()`

```
-- ============================================================================
--  PARTE 2 · #2 y #3 — la tienda no se auto-aprueba ni se auto-suscribe
--  (reemplaza al trigger de aprobación de 09_seguridad.sql)
-- ============================================================================
```

## Línea 257

> Ancla: `new.aprobada       := false;`

```
-- Nadie se crea la tienda ya aprobada ni con la suscripción pagada.
```

## Línea 287

> Ancla: `drop policy if exists productos_select_public on public.productos;`

```
-- ============================================================================
--  PARTE 3 · #4 — la suscripción también se hace cumplir en la RLS de lectura
-- ============================================================================
```

## Línea 316

> Ancla: `drop policy if exists productos_select_comprados on public.productos;`

```
-- IMPORTANTE (no romper el historial): el fix #4 oculta los productos de una
-- tienda vencida. Pero el COMPRADOR tiene que seguir viendo el nombre y la foto
-- de los productos que ÉL compró (pantalla "Mis pedidos"), aunque la tienda
-- haya vencido después. Esta política se SUMA (OR) a las de lectura: sólo
-- habilita los productos que aparecen en un pedido del propio usuario.
```

## Línea 333

> Ancla: `create table if not exists public.pedidos_direccion (`

```
-- ============================================================================
--  PARTE 4 · #5 — la dirección EXACTA del pedido vive en una tabla privada
--
--  ANTES: `pedidos.direccion` guardaba la calle. El RPC se la ocultaba a la
--  tienda hasta confirmar, pero la POLÍTICA RLS no: la tienda podía leerla por
--  acceso directo a la tabla (bypass del RPC). Fuga real de PII.
--
--  AHORA: `pedidos.direccion` queda SIEMPRE NULL. Un trigger BEFORE copia la
--  dirección a `pedidos_direccion` (privada, con RLS por fila) y limpia la
--  columna pública. El comprador la ve; la tienda sólo si el pedido ya no está
--  "pendiente"; el admin siempre. El RPC sigue funcionando (corre como dueño).
--
--  Nota: la FK de `pedidos_direccion` es DIFERIBLE porque el trigger escribe
--  en el BEFORE INSERT, cuando la fila de `pedidos` todavía no existe en disco
--  (mismo patrón que `tiendas_ubicacion` en 18_tiendas_privacidad.sql).
-- ============================================================================
```

## Línea 365

> Ancla: `create or replace function public.puede_ver_direccion_pedido(p_pedido_id uuid)`

```
-- Quién puede leerla (por fila).
```

## Línea 397

> Ancla: `revoke all on public.pedidos_direccion from anon, authenticated, public;`

```
-- Nadie escribe por la API: la dirección la escribe el trigger (security definer).
```

## Línea 401

> Ancla: `create or replace function public.sanear_direccion_pedido()`

```
-- El trigger: valida + mueve + limpia el campo público.
--   · el CHECK `pedidos_direccion_requerida` de la tabla ya no puede aplicarse
--     (la columna queda NULL), así que la regla "delivery exige dirección" se
--     reimplementa acá.
```

## Línea 412

> Ancla: `if new.entrega = 'delivery'`

```
-- 1) Un pedido con envío necesita dirección (misma regla que el CHECK viejo).
```

## Línea 422

> Ancla: `if new.direccion is not null`

```
-- 2) Guardamos la dirección exacta en la tabla privada y limpiamos la pública.
```

## Línea 444

> Ancla: `alter table public.pedidos drop constraint if exists pedidos_direccion_requerida;`

```
-- El CHECK de `pedidos` que exigía la dirección deja de existir (la columna
-- ahora es siempre NULL y la regla vive en el trigger de arriba).
```

## Línea 451

> Ancla: `insert into public.pedidos_direccion (pedido_id, direccion)`

```
-- Backfill: mover las direcciones ya existentes y limpiar la “fuga” histórica.
```

## Línea 461

> Ancla: `drop function if exists public.pedidos_de_mi_tienda();`

```
-- El RPC de la tienda ahora lee la dirección de la tabla privada.
```

## Línea 525

> Ancla: `revoke all on all tables in schema public from anon;`

```
-- ============================================================================
--  PARTE 5 · anon: "deny-by-default"
--
--  Supabase concede ALL a anon/authenticated en cada tabla nueva del schema
--  public. Eso hace que la seguridad dependa sólo de RLS. Acá se le QUITA todo
--  a anon y se le devuelve EXACTAMENTE la lectura pública que necesita.
--
--  Gracias a la PARTE 1 (vistas corriendo como dueño), anon ya NO necesita
--  permiso sobre `productos`, `tiendas`, `compatibilidad` ni `calificaciones`.
-- ============================================================================
```

## Línea 537

> Ancla: `grant select on`

```
-- OJO: al hacer `drop view` + `create view` se pierden los GRANT de las vistas;
-- por eso se reconceden ACÁ, tanto a anon como a authenticated (si faltara el
-- de authenticated, el catálogo se rompería para los usuarios con sesión).
```

## Línea 551

> Ancla: `revoke truncate, references, trigger on all tables in schema public`

```
-- Nadie (ni anon ni authenticated) necesita TRUNCATE/REFERENCES/TRIGGER por la
-- API de PostgREST; quitarlos es defensa en profundidad (TRUNCATE no respeta
-- RLS).
```

## Línea 558

> Ancla: `notify pgrst, 'reload schema';`

```
-- ============================================================================
--  PARTE 6 · avisar a la API de los cambios de esquema
-- ============================================================================
```

## Línea 564

```
-- ============================================================================
--  VERIFICACIÓN
-- ----------------------------------------------------------------------------
--  A) En la app (lo importante):
--     · El catálogo (inicio / buscar / detalle de producto) y las ESTRELLAS
--       siguen igual, con y sin sesión.
--     · Un comprador que califica ve su reseña; otro usuario la ve en el
--       detalle del producto (vía vista), pero NO puede leer la tabla.
--     · El panel de la tienda sigue mostrando la dirección SOLO cuando el
--       pedido ya no está "pendiente".
--
--  B) Con la anon key (probar sin sesión), esto debe FALLAR con permiso:
--       GET /rest/v1/calificaciones?select=*
--       GET /rest/v1/productos?select=*
--       GET /rest/v1/tiendas?select=*
--       GET /rest/v1/pedidos?select=*
--     Y esto debe seguir funcionando:
--       GET /rest/v1/catalogo_productos?select=*&limit=5
--       GET /rest/v1/resenas_producto?select=*&limit=5
--       GET /rest/v1/productos_mas_vendidos?select=*&limit=5
--
--  C) Con la sesión de un usuario tienda, debe FALLAR:
--       update public.tiendas set aprobada = true where dueno_id = auth.uid();
--       update public.tiendas set pago_hasta = '2099-01-01' where dueno_id = auth.uid();
--     Y con la clave pública, `GET /rest/v1/pedidos_direccion?select=*` → [].
--
--  D) En el SQL Editor (dueño, sin RLS): esto debe devolver el pedido completo:
--       select pe.id, pe.direccion, pd.direccion
--         from public.pedidos pe
--         left join public.pedidos_direccion pd on pd.pedido_id = pe.id
--        order by pe.created_at desc limit 5;
--     -> `pe.direccion` SIEMPRE null; `pd.direccion` con la dirección real.
-- ============================================================================
```

## Línea 599

```
-- ============================================================================
--  OPCIONAL (decisión tuya) · "deny-by-default" también para tablas FUTURAS
-- ----------------------------------------------------------------------------
--  Lo de la PARTE 5 protege lo que YA existe. Si querés que CUALQUIER tabla
--  nueva del schema `public` nazca SIN permisos para anon/authenticated (y
--  tengas que otorgarlos explícitamente en cada migración), descomentá esto.
--  Riesgo: si más adelante creás una tabla y olvidás el `grant`, la app no la
--  verá. Por eso va comentado.
-- ============================================================================
-- alter default privileges for role postgres in schema public
--   revoke select, insert, update, delete, truncate, references, trigger
--   on tables from anon, authenticated;
```
