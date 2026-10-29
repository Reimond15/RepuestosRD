# sql/06_storage.sql

<!-- 9 bloques · 22 líneas · original del commit 1310672 -->

9 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)`

```
-- ============================================================
-- 06 · STORAGE (bucket de imagenes)
-- Imagenes de productos: lectura publica, escritura solo de la
-- tienda duena. Tambien permitimos logo de tienda.
-- ============================================================
```

## Línea 17

> Ancla: `create or replace function public.es_dueno_de_producto(p_producto_id uuid)`

```
-- ------------------------------------------------------------
-- Helper: el usuario es dueno de la tienda duena del producto
-- de la carpeta {producto_id}/
--   ruta esperada:  productos/<producto_id>/<archivo>
-- ------------------------------------------------------------
```

## Línea 38

> Ancla: `create or replace function public.uuid_de_la_ruta(ruta text)`

```
-- sanity: product_id debe ser un uuid valido antes de castear
```

## Línea 53

> Ancla: `drop policy if exists "productos bucket: leer" on storage.objects;`

```
-- ------------------------------------------------------------
-- Politicas del bucket 'productos'
-- ------------------------------------------------------------
```

## Línea 57

> Ancla: `drop policy if exists "productos bucket: leer" on storage.objects;`

```
-- lectura publica de las imagenes
```

## Línea 63

> Ancla: `drop policy if exists "productos bucket: subir" on storage.objects;`

```
-- insertar: solo el dueno del producto de la carpeta
```

## Línea 72

> Ancla: `drop policy if exists "productos bucket: renombrar" on storage.objects;`

```
-- actualizar nombre / mover
```

## Línea 85

> Ancla: `drop policy if exists "productos bucket: borrar" on storage.objects;`

```
-- borrar
```

## Línea 94

> Ancla: `insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)`

```
-- ------------------------------------------------------------
-- Logo de la tienda: cada dueno escribe en su propia carpeta
--   ruta esperada:  logos/<dueno_id>/<archivo>
-- ------------------------------------------------------------
```
