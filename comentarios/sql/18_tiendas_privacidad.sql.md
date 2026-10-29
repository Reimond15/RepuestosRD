# sql/18_tiendas_privacidad.sql

<!-- 14 bloques · 68 líneas · original del commit 1310672 -->

14 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `create table if not exists public.tiendas_ubicacion (`

```
-- ============================================================================
--  18 · PRIVACIDAD DE LA DIRECCIÓN DE LAS TIENDAS  (anti-elusión)
-- ============================================================================
--
--  PROBLEMA
--  La dirección de calle y las coordenadas EXACTAS de cada tienda viven en
--  `public.tiendas`, y esa tabla es legible por cualquiera (rol anon). Con la
--  clave pública de la app se puede pedir `tiendas?select=direccion` y obtener
--  el local exacto sin pasar por la plataforma. El catálogo
--  (`catalogo_productos.tienda_direccion`) también la publica.
--
--  SOLUCIÓN (sin tocar los privilegios de `tiendas`)
--  La ubicación exacta se mueve a `public.tiendas_ubicacion`, una tabla privada
--  con RLS. `tiendas` queda como ficha PÚBLICA sin dirección y con coordenadas
--  redondeadas (~1 km), garantizado por un trigger en cada insert/update.
--
--    · el DUEÑO de la tienda (y el admin) ve la ubicación exacta;
--    · el COMPRADOR de un pedido de RETIRO ya confirmado también la ve
--      (RPC `ubicaciones_de_mis_pedidos`);
--    · el resto del mundo solo ve la zona aproximada.
--
--  Se eligió tabla privada + RLS (y no revocar el `select` por columna en
--  `tiendas`) para NO cambiar los privilegios de una tabla que referencian
--  ~15 políticas RLS: así ninguna política existente cambia de comportamiento.
--
--  ORDEN: correr DESPUÉS de 01–17. Es RE-EJECUTABLE.
--  Si volvés a correr `10_ubicaciones.sql`, corré el 18 al final otra vez.
-- ============================================================================
```

## Línea 30

> Ancla: `create table if not exists public.tiendas_ubicacion (`

```
-- ---------------------------------------------------------------------------
--  1) Tabla privada con la ubicación exacta
--      FK DIFERIBLE: el trigger la escribe en el BEFORE INSERT de `tiendas`,
--      cuando la fila padre todavía no fue insertada en disco.
-- ---------------------------------------------------------------------------
```

## Línea 51

> Ancla: `drop policy if exists tienda_ubicacion_select on public.tiendas_ubicacion;`

```
-- ---------------------------------------------------------------------------
--  2) RLS: quién puede ver / editar la ubicación exacta
-- ---------------------------------------------------------------------------
```

## Línea 58

> Ancla: `exists (`

```
-- el dueño (o el admin) ve la suya
```

## Línea 65

> Ancla: `or exists (`

```
-- o el comprador de un pedido de RETIRO ya confirmado con esa tienda
```

## Línea 99

> Ancla: `revoke all on public.tiendas_ubicacion from anon;`

```
-- el anon no tiene nada que hacer acá
```

## Línea 103

> Ancla: `insert into public.tiendas_ubicacion (tienda_id, direccion, latitude, longitude)`

```
-- ---------------------------------------------------------------------------
--  3) Migrar lo que hoy está en `tiendas`
--      (primero se copia, para no perder el dato exacto)
-- ---------------------------------------------------------------------------
```

## Línea 113

> Ancla: `update public.tiendas`

```
-- ficha pública: sin dirección de calle y con coordenadas redondeadas (~1 km)
```

## Línea 129

> Ancla: `create or replace function public.sanear_ubicacion_tienda()`

```
-- ---------------------------------------------------------------------------
--  4) Trigger: la ficha pública NUNCA guarda la ubicación exacta
--
--     Al escribir una dirección o coordenadas exactas (en el registro o en un
--     update, por ejemplo al correr `10_ubicaciones.sql`), las guarda en la
--     tabla privada y redondea la fila pública. Es la garantía a prueba de
--     futuros cambios de código.
-- ---------------------------------------------------------------------------
```

## Línea 144

> Ancla: `if (new.direccion is not null`

```
-- ¿La escritura trae ubicación exacta? (dirección nueva, o coordenadas con
  -- más precisión que 2 decimales). Si no, no tocamos la tabla privada.
```

## Línea 160

> Ancla: `new.direccion := null;`

```
-- La fila pública queda sin dirección y con coordenadas aproximadas.
```

## Línea 173

> Ancla: `create or replace function public.ubicaciones_de_mis_pedidos()`

```
-- ---------------------------------------------------------------------------
--  5) El comprador ve la ubicación exacta solo al confirmarse el retiro
-- ---------------------------------------------------------------------------
```

## Línea 207

> Ancla: `notify pgrst, 'reload schema';`

```
-- Que la API (PostgREST) vea la tabla y la función nuevas sin esperar.
```

## Línea 210

```
-- ============================================================================
--  VERIFICACIÓN (desde la app, no desde el editor)
--   · Sin sesión, el catálogo muestra la ZONA (no la calle) y una distancia
--     estimada. Con la clave pública, `tiendas?select=direccion` devuelve NULL
--     y las coordenadas vienen con 2 decimales.
--   · Como comprador con un pedido de retiro PENDIENTE no ves la dirección;
--     al confirmarlo la tarjeta muestra "Retirar en: <dirección>" con el mapa.
--   · Como tienda, seguís entrando a tu panel con normalidad.
-- ============================================================================
```
