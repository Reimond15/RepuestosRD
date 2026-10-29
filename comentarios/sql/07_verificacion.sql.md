# sql/07_verificacion.sql

<!-- 19 bloques · 30 líneas · original del commit 1310672 -->

19 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `select c.nombre as categoria, count(t.id) as tipos`

```
-- ============================================================
-- 07 · VERIFICACION Y EJEMPLOS DE CONSULTA
-- Opcional: ejecuta esto para comprobar que todo quedo bien.
-- ============================================================
```

## Línea 6

> Ancla: `select c.nombre as categoria, count(t.id) as tipos`

```
-- 1) Categorias y cantidad de tipos
```

## Línea 13

> Ancla: `select table_name, table_type`

```
-- 2) Las 9 tablas y las 5 vistas existen
```

## Línea 20

> Ancla: `select tablename, rowsecurity`

```
-- 3) RLS esta activo en todas las tablas
```

## Línea 26

> Ancla: `select tablename,`

```
-- 4) Cuantas politicas hay por tabla
```

## Línea 37

> Ancla: `select c.relname as vista,`

```
-- 5) Las vistas respetan RLS (security_invoker = true)
```

## Línea 47

> Ancla: `select nombre, categoria, tipo, precio, tienda, promedio_estrellas, compatibilidad`

```
-- ============================================================
-- EJEMPLOS DE CONSULTA DESDE EL APP
-- ============================================================
```

## Línea 51

> Ancla: `select nombre, categoria, tipo, precio, tienda, promedio_estrellas, compatibilidad`

```
-- Catalogo publico (funciona con la anon key, sin sesion)
```

## Línea 57

> Ancla: `select *`

```
-- Catalogo filtrado por categoria
```

## Línea 63

> Ancla: `select *`

```
-- Buscar repuestos por vehiculo compatible
```

## Línea 68

> Ancla: `select producto, tienda, categoria_nombre, unidades_vendidas, promedio_estrellas`

```
-- Mas vendidos, todas las categorias
```

## Línea 73

> Ancla: `select producto, tienda, unidades_vendidas`

```
-- Mas vendidos de UNA categoria
```

## Línea 79

> Ancla: `select producto, tienda, categoria_nombre, promedio_estrellas, total_calificaciones`

```
-- Mejor calificados, todas las categorias
```

## Línea 84

> Ancla: `select producto, tienda, promedio_estrellas, total_calificaciones`

```
-- Mejor calificados de UNA categoria
```

## Línea 90

> Ancla: `select * from public.vista_calificaciones_producto`

```
-- Promedio de estrellas de UN producto (toma uno real; 0 filas si todavía no hay)
```

## Línea 94

> Ancla: `select * from public.vista_calificaciones_tienda`

```
-- Promedio de estrellas de UNA tienda (toma una real; 0 filas si todavía no hay)
```

## Línea 99

```
-- ============================================================
-- CREAR UN ADMIN (una sola vez, desde el SQL Editor con tu
-- cuenta de owner). Cambia el correo por el del administrador.
-- ============================================================
-- update public.usuarios set rol = 'admin' where email = 'admin@tuapp.com';
```

## Línea 105

```
-- Aprobar una tienda (desde el Dashboard o con service_role)
-- update public.tiendas set aprobada = true where nombre = 'Repuestos El Che';
```

## Línea 108

```
-- Darle rol admin a un usuario ya registrado, por id
-- update public.usuarios set rol = 'admin' where id = '<UUID>';
```
