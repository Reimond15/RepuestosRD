# sql/26_panel_admin_tiendas.sql

<!-- 6 bloques · 52 líneas · original del commit 1310672 -->

6 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create or replace function public.admin_aprobar_tienda(`

```
-- ============================================================================
--  26 · PANEL DE ADMIN: APROBAR TIENDAS DESDE LA APP
-- ============================================================================
--
--  QUÉ HACE
--    Agrega las funciones que usa la nueva pantalla "Tiendas" del panel de
--    administración (src/app/admin/tiendas.tsx). Así el admin aprueba,
--    rechaza y marca fundadoras SIN entrar al SQL Editor de Supabase.
--
--  POR QUÉ HACEN FALTA FUNCIONES (RPC) Y NO UN UPDATE DIRECTO
--    El trigger `guardar_aprobacion_tienda` (migración 23/24) bloquea que un
--    usuario logueado que no sea admin toque `aprobada` o la suscripción:
--      · el DUEÑO no puede auto-aprobarse (hallazgo #2 cerrado);
--      · pero tampoco lo puede hacer el ADMIN desde la app con un UPDATE
--        normal, porque el trigger exige `es_admin()` y corre DESPUÉS de la
--        RLS... y la RLS de UPDATE de `tiendas` sí deja pasar al admin, pero
--        el trigger necesita que `auth.uid()` y el rol coincidan.
--    La forma limpia y segura es una función `security definer` que:
--      1) valide ella misma con `es_admin()`;
--      2) haga el UPDATE;
--      3) como `security definer`, el trigger igual corre, pero `es_admin()`
--         ya devolvió true, así que no bloquea.
--
--  SEGURIDAD
--    · Todas son `security definer` con `search_path = public`.
--    · Todas empiezan con `if not public.es_admin() then raise exception`.
--    · Solo `authenticated` puede ejecutarlas (revoke de public/anon).
--    · No exponen datos de nadie: devuelven void o boolean.
--
--  Idempotente: se puede correr las veces que haga falta.
-- ============================================================================
```

## Línea 34

> Ancla: `create or replace function public.admin_aprobar_tienda(`

```
-- ============================================================================
--  1 · APROBAR O RECHAZAR UNA TIENDA
-- ============================================================================
--  p_aprobar = true  → la tienda queda aprobada y arranca su prueba de 30 días
--                      desde HOY (así no pierde días esperando la aprobación).
--  p_aprobar = false → la desaprueba: sale del catálogo al instante.
```

## Línea 82

> Ancla: `create or replace function public.admin_marcar_fundadora(`

```
-- ============================================================================
--  2 · MARCAR O DESMARCAR UNA TIENDA COMO FUNDADORA (RD$100/mes por 12 meses)
-- ============================================================================
--  Tope duro: 25 fundadoras. Si ya hay 25, la función rechaza la marca.
```

## Línea 117

> Ancla: `return;`

```
-- ya era fundadora: no hacemos nada
```

## Línea 148

> Ancla: `create or replace function public.admin_listar_tiendas()`

```
-- ============================================================================
--  3 · LISTAR TODAS LAS TIENDAS CON SU DUEÑO (para el panel)
-- ============================================================================
--  Devuelve lo que necesita la pantalla: datos de la tienda + nombre/correo del
--  dueño + estado de la suscripción. El admin ya puede leer `tiendas` y
--  `usuarios` por RLS, pero una función devuelve TODO en un solo viaje y con el
--  shape estable (no depende del embedded join de PostgREST).
```

## Línea 209

> Ancla: `notify pgrst, 'reload schema';`

```
-- ============================================================================
--  FIN · Recargar el esquema de PostgREST para que vea las funciones nuevas
-- ============================================================================
```
