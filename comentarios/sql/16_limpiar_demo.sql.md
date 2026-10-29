# sql/16_limpiar_demo.sql

<!-- 8 bloques · 39 líneas · original del commit 1310672 -->

8 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `begin;`

```
-- ============================================================================
--  16 · LIMPIAR DATOS DE EJEMPLO  (contraparte del 08)
-- ============================================================================
--
--  PARA QUÉ SIRVE
--  El archivo 08 siembra tiendas, productos, pedidos y CALIFICACIONES de
--  prueba (33 reseñas escritas por nosotros). Antes de publicar la app en
--  Google Play hay que borrar todo eso: mostrar reseñas que no escribieron
--  clientes reales es publicidad engañosa y va contra los Términos.
--
--  QUÉ BORRA
--    · Las calificaciones (reseñas) de los usuarios de prueba.
--    · Las líneas y los pedidos de prueba.
--    · Los perfiles, tiendas y productos de prueba (por cascada).
--    · Las cuentas de Auth de prueba (tienda1@…, tienda2@…, tienda3@…,
--      cliente@repuestosrd.test).
--
--  CUÁNDO CORRERLO
--    ⚠ SOLO antes de publicar / en la base de producción.
--    Si todavía estás probando la app, NO lo corras: te quedas sin datos y
--    las pantallas se ven vacías.
--
--  SEGURIDAD
--    · Solo toca las 4 cuentas de prueba. Nunca borra tiendas, productos ni
--      pedidos reales.
--    · Es RE-EJECUTABLE: correrlo dos veces no rompe nada.
--    · Verifica al final que no quedó nada de prueba.
-- ============================================================================
```

## Línea 32

> Ancla: `delete from public.calificaciones`

```
-- ---------------------------------------------------------------------------
--  PASO 1 · Borrar en el orden que piden las claves foráneas
-- ---------------------------------------------------------------------------
```

## Línea 36

> Ancla: `delete from public.calificaciones`

```
-- 1.a Reseñas escritas por los usuarios de prueba.
```

## Línea 46

> Ancla: `delete from public.detalle_pedido`

```
-- 1.b Líneas de pedidos de prueba.
```

## Línea 57

> Ancla: `delete from public.pedidos`

```
-- 1.c Pedidos de prueba.
```

## Línea 67

> Ancla: `delete from public.usuarios`

```
-- 1.d Perfiles de prueba. Al borrarlos caen sus tiendas y productos (cascada).
```

## Línea 74

> Ancla: `delete from auth.users`

```
-- 1.e Cuentas de Auth de prueba.
```

## Línea 81

> Ancla: `do $$`

```
-- ---------------------------------------------------------------------------
--  PASO 2 · Verificar que no quedó nada de prueba
-- ---------------------------------------------------------------------------
```
