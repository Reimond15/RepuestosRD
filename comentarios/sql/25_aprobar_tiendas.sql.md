# sql/25_aprobar_tiendas.sql

<!-- 12 bloques · 86 líneas · original del commit 1310672 -->

12 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `select`

```
-- ============================================================================
--  25 · LISTADO Y APROBACIÓN DE TIENDAS (para el SQL Editor de Supabase)
-- ============================================================================
--
--  Este archivo NO se ejecuta de una: son CONSULTAS y COMANDOS para copiar y
--  pegar en Supabase Dashboard > SQL Editor > New query > Run.
--
--  Contexto:
--    - Cuando alguien se registra como tienda, la fila entra en public.tiendas
--      con `aprobada = false` (el trigger `guardar_aprobacion_tienda` lo fuerza;
--      el dueño NO puede auto-aprobarse).
--    - La tienda aparece en el catálogo solo si está `aprobada = true`
--      Y `tienda_vigente()` = true (prueba de 30 días o pago vigente).
--    - Desde el SQL Editor, `auth.uid()` es NULL, así que el trigger NO bloquea
--      y vos SÍ podés aprobar / marcar fundadoras.
--
--  Orden recomendado: 1) ver pendientes  →  2) aprobar  →  3) (opcional) fundadora
-- ============================================================================
```

## Línea 21

> Ancla: `select`

```
-- ============================================================================
--  1 · VER LAS TIENDAS PENDIENTES CON SU DUEÑO (nombre + correo)
-- ============================================================================
--  Muestra solo las NO aprobadas, con los datos del dueño para saber quién es
--  quién, y el estado de la suscripción (prueba / pago / fundador).
```

## Línea 48

> Ancla: `select`

```
-- ============================================================================
--  2 · VER TODAS LAS TIENDAS (aprobadas y pendientes) — panorama completo
-- ============================================================================
--  Útil para auditar el cupo de fundadoras y quién está vencido.
```

## Línea 68

> Ancla: `update public.tiendas`

```
-- ============================================================================
--  3 · APROBAR UNA TIENDA (y reiniciar su prueba de 30 días)
-- ============================================================================
--  Copiá el `tienda_id` del listado (paso 1) y pegalo acá.
--  Reinicia la prueba para que los 30 días gratis corran DESDE la aprobación
--  (si no, corren desde el registro y podés regalar menos días).
```

## Línea 79

> Ancla: `select count(*) as fundadoras_marcadas`

```
--  Si preferís NO reiniciar la prueba (dejar la fecha original de registro),
--  usá esta versión en su lugar:
--  update public.tiendas set aprobada = true where id = 'PEGA-AQUI-EL-TIENDA_ID';
```

## Línea 84

> Ancla: `select count(*) as fundadoras_marcadas`

```
-- ============================================================================
--  4 · MARCAR UNA TIENDA COMO FUNDADORA (RD$100/mes por 12 meses)
-- ============================================================================
--  Tope: máximo 25 fundadoras. Los 12 meses corren desde que se marca.
--  Requiere que la tienda ya esté aprobada (corré el paso 3 primero).
```

## Línea 90

> Ancla: `select count(*) as fundadoras_marcadas`

```
--  4a) Ver cuántas fundadoras van marcadas (no debe pasar de 25)
```

## Línea 95

> Ancla: `update public.tiendas`

```
--  4b) Marcar la fundadora (el `and ... < 25` frena el comando si ya hay 25)
```

## Línea 104

> Ancla: `update public.tiendas`

```
-- ============================================================================
--  5 · APROBAR + MARCAR FUNDADORA EN UN SOLO PASO (atajo)
-- ============================================================================
--  Si la tienda ya es de las primeras 25, este UPDATE hace todo junto.
```

## Línea 117

> Ancla: `update public.tiendas`

```
-- ============================================================================
--  6 · REGISTRAR UN PAGO (extiende `pago_hasta`)
-- ============================================================================
--  Cuando el dueño te transfiere, extendés su suscripción sumando meses.
--
--  OJO: la función `registrar_pago_tienda(...)` exige `es_admin()`, y
--  `es_admin()` depende de `auth.uid()` (un usuario logueado). Desde el SQL
--  Editor de Supabase `auth.uid()` es NULL, así que esa función FALLA ahí.
--  Por eso, desde el editor usá el UPDATE directo:
--
--   1 mes:
--     update public.tiendas
--        set pago_hasta = greatest(now(), coalesce(pago_hasta, prueba_hasta, now()))
--                         + interval '1 month'
--      where id = 'PEGA-AQUI-EL-TIENDA_ID';
--
--   6 meses:
--     update public.tiendas
--        set pago_hasta = greatest(now(), coalesce(pago_hasta, prueba_hasta, now()))
--                         + interval '6 months'
--      where id = 'PEGA-AQUI-EL-TIENDA_ID';
--
--   12 meses:
--     update public.tiendas
--        set pago_hasta = greatest(now(), coalesce(pago_hasta, prueba_hasta, now()))
--                         + interval '12 months'
--      where id = 'PEGA-AQUI-EL-TIENDA_ID';
--
--  (La función `registrar_pago_tienda` queda para cuando exista el panel admin
--   dentro de la app; ahí sí hay sesión y `es_admin()` funciona.)
```

## Línea 149

> Ancla: `update public.tiendas`

```
-- ============================================================================
--  7 · RECHAZAR / DESACTIVAR UNA TIENDA (si es falsa o estafa)
-- ============================================================================
--  La desaprueba: deja de aparecer en el catálogo al instante.
```

## Línea 158

```
-- ============================================================================
--  8 · RESET DE EMERGENCIA (volver a marcar el esquema si PostgREST quedó viejo)
-- ============================================================================
--  Rara vez hace falta, pero si el listado no refleja un cambio, corré esto:
--  notify pgrst, 'reload schema';
```
