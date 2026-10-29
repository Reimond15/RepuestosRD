# sql/12_tipos_repuesto.sql

<!-- 2 bloques · 39 líneas · original del commit 1310672 -->

2 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `update public.tipos_repuesto t`

```
-- ============================================================
-- 12 · LIMPIEZA DE TIPOS DE REPUESTO
--
--  Las versiones anteriores de 05_datos_iniciales.sql sembraron los tipos
--  sin acentos y con algunos errores de tipeo:
--     Bateria · Bujias · Suspension · Neumaticos · Transmision/Transmission
--     Direccion · Rotulas · Cuadro electrico · Cinta de distribucion
--     Climatizacion · Embriague · Cadena y piñon
--  Además había dos nombres que no se entendían:
--     'Crio de motor'  →  'Cigüeñal'
--     'Porta'          →  'Portaplacas'
--
--  Este archivo RENOMBRA esas filas en una base que ya corría el seed viejo.
--  Los productos apuntan al tipo por `tipo_id`, así que el rename los sigue
--  sin tocar nada más.
--
--  OJO: 05 ya quedó corregido para instalaciones nuevas. Este archivo es solo
--  para la base que ya tenía los nombres viejos. Es idempotente: si ya está
--  limpio, no cambia ninguna fila.
--
--  ¿Siguen apareciendo tipos de más (sinónimos como "Sistema de escape" y
--  "Cauchos")? Borralos desde la pantalla Administración → Tipos de repuesto.
-- ============================================================
```

## Línea 47

```
-- ============================================================
-- VERIFICACIÓN
--   No tiene que quedar ningún nombre viejo:
--
--     select nombre from public.tipos_repuesto
--      where nombre in ('Bateria','Bujias','Suspension','Neumaticos',
--                       'Transmision','Transmission','Cuadro electrico',
--                       'Crio de motor','Porta');
--   → 0 filas.
--
--   Y el conteo por categoría:
--     select c.nombre, count(t.id)
--       from public.categorias c
--       left join public.tipos_repuesto t on t.categoria_id = c.id
--      group by c.nombre order by c.nombre;
-- ============================================================
```
