select c.nombre as categoria, count(t.id) as tipos
from public.categorias c
left join public.tipos_repuesto t on t.categoria_id = c.id
group by c.nombre
order by c.nombre;

select table_name, table_type
from information_schema.tables
where table_schema = 'public'
  and table_type in ('BASE TABLE', 'VIEW')
order by table_type, table_name;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

select tablename,
       count(*) filter (where cmd = 'SELECT')     as lecturas,
       count(*) filter (where cmd = 'INSERT')     as inserciones,
       count(*) filter (where cmd = 'UPDATE')     as actualizaciones,
       count(*) filter (where cmd = 'DELETE')     as borrados
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;

select c.relname as vista,
       (c.reloptions @> array['security_invoker=true']) as usa_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'v'
order by c.relname;

select nombre, categoria, tipo, precio, tienda, promedio_estrellas, compatibilidad
from public.catalogo_productos
order by created_at desc nulls last
limit 20;

select *
from public.catalogo_productos
where categoria = 'Motocicletas'
order by precio;

select *
from public.catalogo_productos
where compatibilidad @> '[{"marca":"Yamaha","modelo":"FZ250","anio_desde":2015,"anio_hasta":2023}]'::jsonb;

select producto, tienda, categoria_nombre, unidades_vendidas, promedio_estrellas
from public.productos_mas_vendidos
limit 10;

select producto, tienda, unidades_vendidas
from public.productos_mas_vendidos
where categoria_nombre = 'Autobuses'
limit 10;

select producto, tienda, categoria_nombre, promedio_estrellas, total_calificaciones
from public.productos_mejor_calificados
limit 10;

select producto, tienda, promedio_estrellas, total_calificaciones
from public.productos_mejor_calificados
where categoria_nombre = 'Carros'
order by promedio_estrellas desc;

select * from public.vista_calificaciones_producto
 where producto_id = (select producto_id from public.calificaciones limit 1);

select * from public.vista_calificaciones_tienda
 where tienda_id = (select tienda_id from public.productos limit 1);
