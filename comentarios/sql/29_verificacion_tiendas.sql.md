# sql/29_verificacion_tiendas.sql

<!-- 30 bloques · 107 líneas · original del commit 1310672 -->

30 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `alter table public.tiendas`

```
-- ============================================================================
--  29 · VERIFICACIÓN DE TIENDAS CON FOTOS (opcional) + INSIGNIA PÚBLICA
-- ============================================================================
--
--  QUÉ HACE
--    Deja que una tienda suba 2 fotos (fachada + interior) para que el admin
--    verifique que el local existe de verdad. Si el admin la verifica, sale la
--    insignia "Tienda verificada" en el catálogo.
--
--    · OPCIONAL: NO bloquea la aprobación de la tienda. Solo da la insignia.
--    · 2 FOTOS: fachada + interior.
--    · La INSIGNIA sí se ve en el catálogo.
--
--  POR QUÉ DOS LUGARES DISTINTOS (tabla privada + columna pública)
--    · Las FOTOS revelan el local → van a un bucket PRIVADO (`verificacion`) y
--      a una tabla privada con RLS (`tiendas_verificacion`). Solo las ve el
--      dueño y el admin, por URL firmada temporal.
--    · La INSIGNIA necesita ser pública (la ve cualquier visitante en el
--      catálogo) → se copia a un booleano en `tiendas`: `verificada`.
--
--  POR QUÉ NO UNA POLÍTICA QUE CONSULTE LA TABLA PRIVADA DESDE `tiendas`
--    Ese patrón es exactamente el que causó la recursión de RLS que arreglamos
--    en `28_fix_rls_recursion.sql`. Un booleano denormalizado evita cualquier
--    subconsulta entre políticas y es a prueba de recursión.
--
--  SEGURIDAD
--    · El DUEÑO NO puede auto-verificarse: un trigger fuerza que, si no es
--      admin, `estado` solo pueda pasar a 'enviada' y `verificada` sea false.
--    · Las RPC `admin_*` validan `es_admin()` adentro.
--    · Todas las funciones son `security definer` con `search_path = public`.
--
--  ORDEN: correr DESPUÉS de 28. Es RE-EJECUTABLE.
-- ============================================================================
```

## Línea 36

> Ancla: `alter table public.tiendas`

```
-- ============================================================================
--  PASO 1 · Columna pública de la insignia + tabla privada con las fotos
-- ============================================================================
```

## Línea 40

> Ancla: `alter table public.tiendas`

```
-- 1.1 · La insignia (pública, no sensible: solo el sí/no)
```

## Línea 47

> Ancla: `create table if not exists public.tiendas_verificacion (`

```
-- 1.2 · Los datos de la verificación (privados)
```

## Línea 67

> Ancla: `create or replace function public.guardar_verificacion_tienda()`

```
-- ============================================================================
--  PASO 2 · Trigger anti auto-verificación
--           El dueño solo puede dejar el estado en 'enviada'. Los cambios de
--           estado los hace la RPC del admin (que es `security definer` y
--           marca una bandera para que el trigger no la bloquee).
-- ============================================================================
```

## Línea 81

> Ancla: `if current_setting('app.verificacion_admin', true) = 'on' then`

```
-- Adentro de una RPC de admin (bandera activada) no bloqueamos nada.
```

## Línea 86

> Ancla: `if not public.es_admin() then`

```
-- Si NO es admin, el dueño solo puede mandar a revisión:
  -- no se auto-verifica ni se cambia la nota de rechazo a mano.
```

## Línea 108

> Ancla: `create or replace function public.sincronizar_verificada_tienda()`

```
-- Cuando una verificación pasa a 'verificada'/'rechazada', sincroniza el
-- booleano público `tiendas.verificada`. Se hace con un trigger AFTER para que
-- el catálogo nunca quede desincronizado.
```

## Línea 132

> Ancla: `drop policy if exists tienda_verificacion_select on public.tiendas_verificacion;`

```
-- ============================================================================
--  PASO 3 · RLS de la tabla privada
-- ============================================================================
```

## Línea 136

> Ancla: `drop policy if exists tienda_verificacion_select on public.tiendas_verificacion;`

```
-- El dueño ve la suya; el admin ve todas.
```

## Línea 148

> Ancla: `drop policy if exists tienda_verificacion_insert_own on public.tiendas_verificacion;`

```
-- El dueño inserta la suya (el trigger fuerza el estado).
```

## Línea 158

> Ancla: `drop policy if exists tienda_verificacion_update on public.tiendas_verificacion;`

```
-- El dueño actualiza la suya (el trigger fuerza el estado); el admin también.
```

## Línea 181

> Ancla: `insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)`

```
-- ============================================================================
--  PASO 4 · Bucket PRIVADO `verificacion` + sus políticas de Storage
--           Ruta: verificacion/<dueno_id>/<archivo>
-- ============================================================================
```

## Línea 196

> Ancla: `drop policy if exists "verificacion bucket: leer" on storage.objects;`

```
-- leer: el dueño de la carpeta o el admin
```

## Línea 208

> Ancla: `drop policy if exists "verificacion bucket: subir" on storage.objects;`

```
-- subir: cada dueño en su propia carpeta
```

## Línea 217

> Ancla: `drop policy if exists "verificacion bucket: borrar" on storage.objects;`

```
-- borrar: el dueño de la carpeta
```

## Línea 227

> Ancla: `drop function if exists public.admin_listar_tiendas();`

```
-- ============================================================================
--  PASO 5 · RPC del panel admin
-- ============================================================================
```

## Línea 231

> Ancla: `drop function if exists public.admin_listar_tiendas();`

```
-- 5.0 · Extender `admin_listar_tiendas` (de 26) con la insignia y el estado
--        de verificación. Se recrea igual pero con 2 columnas nuevas.
--        OJO: hay que DROP primero, porque `create or replace` no deja
--        cambiar el tipo de retorno de una función que ya existe.
```

## Línea 296

> Ancla: `create or replace function public.admin_listar_verificaciones()`

```
-- 5.1 · Listar verificaciones (con las rutas de las fotos) — solo admin
```

## Línea 345

> Ancla: `create or replace function public.admin_verificar_tienda(`

```
-- 5.2 · Aprobar o rechazar la verificación — solo admin
```

## Línea 365

> Ancla: `perform set_config('app.verificacion_admin', 'on', true);`

```
-- Bandera para que el trigger anti auto-verificación no bloquee al admin.
```

## Línea 390

> Ancla: `create or replace function public.enviar_verificacion_tienda(`

```
-- ============================================================================
--  PASO 6 · RPC de la tienda
-- ============================================================================
```

## Línea 394

> Ancla: `create or replace function public.enviar_verificacion_tienda(`

```
-- 6.1 · Enviar las 2 fotos a revisión
```

## Línea 440

> Ancla: `create or replace function public.mi_verificacion_tienda()`

```
-- 6.2 · El dueño consulta su propio estado y sus fotos
```

## Línea 475

> Ancla: `drop view if exists public.catalogo_productos;`

```
-- ============================================================================
--  PASO 7 · Exponer la insignia en las vistas del catálogo
--
--  Estas son las MISMAS definiciones de `24_blindaje_total.sql` (la última que
--  las redefinió), solo que se agrega la columna `t.verificada as
--  tienda_verificada`. OJO: NO llevan `security_invoker` — corren como el
--  dueño de las tablas, que es justinamente lo que 24 dejó armado.
-- ============================================================================
```

## Línea 484

> Ancla: `drop view if exists public.catalogo_productos;`

```
-- 7.1 · catalogo_productos
```

## Línea 538

> Ancla: `drop view if exists public.productos_mas_vendidos;`

```
-- 7.2 · productos_mas_vendidos
```

## Línea 581

> Ancla: `drop view if exists public.productos_mejor_calificados;`

```
-- 7.3 · productos_mejor_calificados
```

## Línea 617

> Ancla: `notify pgrst, 'reload schema';`

```
-- ============================================================================
--  Recargar el esquema de PostgREST
-- ============================================================================
```

## Línea 623

```
-- ============================================================================
--  VERIFICACIÓN
-- ============================================================================
--  1) La columna y la tabla existen:
--     select verificada from public.tiendas limit 1;
--     select * from public.tiendas_verificacion limit 1;
--
--  2) Como tienda: subí las 2 fotos desde la app y luego
--     select public.mi_verificacion_tienda();
--     → estado = 'enviada'.
--
--  3) Como admin: aprobá la verificación con
--     select public.admin_verificar_tienda('<uuid>', true);
--     → `tiendas.verificada` pasa a true y el catálogo muestra la insignia.
-- ============================================================================
```
