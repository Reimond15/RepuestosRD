# sql/23_hardening.sql

<!-- 6 bloques · 90 líneas · original del commit 1310672 -->

6 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `revoke all on public.calificaciones from anon;`

```
-- ============================================================================
--  23 · HARDENING DE SEGURIDAD  (cierra los hallazgos de la auditoría)
-- ============================================================================
--
--  Corrige 4 huecos. Los tres primeros son explotables de verdad:
--
--   #1  calificaciones: el rol `anon` (la clave pública de la app) podía leer
--       `cliente_id` y `pedido_id` de todas las reseñas.
--       Causa: Supabase concede por defecto ALL sobre toda tabla nueva del
--       schema `public` a anon/authenticated. El `grant select (…columnas…)`
--       de 13_resenas.sql SUMA permisos, NO restringe: anon conservaba el
--       SELECT completo. Se REVOCA todo y se vuelve a otorgar solo lo público.
--
--   #2  tiendas: cualquiera podía AUTO-APROBARSE por INSERT
--         insert into public.tiendas (…, aprobada = true)
--       porque el trigger `trg_guardar_aprobacion_tienda` sólo corría
--       `before update of aprobada` (no dispara en INSERT).
--
--   #3  tiendas: el dueño podía auto-servirse la suscripción por UPDATE
--       (`pago_hasta`, `prueba_hasta`, `es_fundador`, `fundador_hasta`),
--       sin pasar por el admin, y quedarse con el precio de fundador.
--
--   #4  productos / compatibilidad: el "ocultar la tienda vencida" estaba
--       sólo en las vistas del catálogo; las tablas base seguían devolviendo
--       los productos de una tienda vencida por acceso directo. Se agrega
--       `tienda_vigente()` a la RLS de lectura pública.
--
--  Idempotente y re-ejecutable. Correr DESPUÉS de 01–22.
--  NO toca datos: sólo permisos, políticas y un trigger.
--  OJO: si volvés a correr 04_rls.sql, volvé a correr ESTE archivo al final.
-- ============================================================================
```

## Línea 34

> Ancla: `revoke all on public.calificaciones from anon;`

```
-- ============================================================================
--  ARREGLO #1 · calificaciones: cerrar la lectura anónima de más
-- ============================================================================
--  anon sólo necesita, por las vistas del catálogo (security_invoker), estas
--  columnas: producto_id, estrellas, comentario, created_at, id.
--  NUNCA cliente_id ni pedido_id. El `id` lo usan las vistas de ranking
--  (count(c.id)) y no es sensible.
```

## Línea 49

> Ancla: `create or replace function public.guardar_aprobacion_tienda()`

```
-- ============================================================================
--  ARREGLO #2 y #3 · tiendas: ni auto-aprobación ni auto-suscripción
-- ============================================================================
--  Reemplaza al trigger de aprobación de 09_seguridad.sql. Ahora también:
--    · cubre el INSERT (cierra la auto-aprobación), y
--    · protege las 4 columnas de la suscripción.
--  El camino del SQL Editor / dashboard (auth.uid() es null) queda LIBRE,
--  igual que en 09: así se aprueba y se marca fundadora manualmente.
```

## Línea 66

> Ancla: `new.aprobada       := false;`

```
-- Nadie se crea la tienda ya aprobada ni con la suscripción pagada.
```

## Línea 96

> Ancla: `drop policy if exists productos_select_public on public.productos;`

```
-- ============================================================================
--  ARREGLO #4 · la suscripción también se hace cumplir en la RLS de lectura
-- ============================================================================
--  Antes: `productos_select_public` sólo miraba `activo` + tienda aprobada,
--  así que una tienda VENCIDA seguía siendo legible por acceso directo a la
--  tabla (se saltaba el filtro de las vistas). Ahora la RLS exige vigencia.
--  El dueño sigue viendo TODO lo suyo por `productos_select_propios`, y el
--  admin por `productos_select_admin`; no se les quita nada.
```

## Línea 135

```
-- ============================================================================
--  VERIFICACIÓN  (correr en el SQL Editor)
-- ============================================================================
--
--  1) RLS de tiendas OK (siguen viéndose las aprobadas y vigentes):
--     select nombre, aprobada, public.tienda_vigente(id) as vigente
--       from public.tiendas order by created_at;
--
--  2) El catálogo sigue funcionando para anon (probar sin sesión):
--     select * from public.catalogo_productos limit 5;
--     select * from public.resenas_producto limit 5;
--     select * from public.productos_mas_vendidos limit 5;
--
--  3) Con la anon key, esto YA NO debe devolver cliente_id (error de permiso):
--     GET /rest/v1/calificaciones?select=cliente_id
--
--  4) Con la sesión de un usuario tienda, esto DEBE fallar con error:
--     update public.tiendas set aprobada = true where dueno_id = auth.uid();
--       -> ERROR: Solo un administrador puede aprobar una tienda.
--     update public.tiendas set pago_hasta = '2099-01-01' where dueno_id = auth.uid();
--       -> ERROR: Solo un administrador puede cambiar la suscripcion de una tienda.
--
--  5) insert into public.tiendas (…, aprobada = true) desde la app:
--       -> la fila entra con aprobada = false (forzado por el trigger).
--
-- ============================================================================
--  PENDIENTE (no incluido a propósito, requiere decisión de diseño):
--   #5  anti-elusión: la tienda puede leer `pedidos.direccion` de un pedido
--       pendiente por acceso directo a la tabla (el RPC la oculta, la política
--       no). Se cierra moviendo la dirección exacta a una tabla privada o
--       revocando la columna y sirviéndola sólo por RPC.
--   #6  calificaciones legibles (todas las columnas/filas) por cualquier
--       usuario LOGUEADO. Se cierra sólo si las vistas del catálogo dejan de
--       leer `calificaciones` como el invocante; por eso no se toca acá.
-- ============================================================================
```
