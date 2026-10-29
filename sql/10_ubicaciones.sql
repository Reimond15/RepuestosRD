alter table public.tiendas
  add column if not exists latitude  numeric(9, 6),
  add column if not exists longitude numeric(9, 6);

do $$begin
  if not exists (
    select 1 from pg_constraint where conname = 'tiendas_lat_lng_juntas'
  ) then
    execute 'alter table public.tiendas
             add constraint tiendas_lat_lng_juntas
             check ((latitude is null) = (longitude is null))';
  end if;
end $$;

update public.tiendas t
   set latitude  = v.lat,
       longitude = v.lng
  from public.usuarios u
  join (values
    ('tienda1@repuestosrd.test', 18.4786, -70.0116, 'Av. Duarte 45, Santo Domingo Oeste'),
    ('tienda2@repuestosrd.test', 18.4752, -70.0036, 'Av. 27 de Febrero 120, Santo Domingo Oeste'),
    ('tienda3@repuestosrd.test', 18.4866, -69.8170, 'Av. San Vicente de Paul 88, Santo Domingo Este')
  ) as v(email, lat, lng, direccion)
    on v.email = u.email
 where u.id = t.dueno_id;

update public.tiendas t
   set direccion = v.direccion
  from public.usuarios u
  join (values
    ('tienda1@repuestosrd.test', 'Av. Duarte 45, Santo Domingo Oeste'),
    ('tienda2@repuestosrd.test', 'Av. 27 de Febrero 120, Santo Domingo Oeste'),
    ('tienda3@repuestosrd.test', 'Av. San Vicente de Paul 88, Santo Domingo Este')
  ) as v(email, direccion)
    on v.email = u.email
 where u.id = t.dueno_id
   and t.direccion is null;

drop view if exists public.catalogo_productos;
drop view if exists public.productos_mas_vendidos;
drop view if exists public.productos_mejor_calificados;

create view public.productos_mas_vendidos
with (security_invoker = true)
as
with ventas as (
  select
    d.producto_id,
    sum(d.cantidad)::integer                  as unidades,
    count(distinct d.pedido_id)::integer      as pedidos
  from public.detalle_pedido d
  join public.pedidos pe
    on pe.id = d.pedido_id
   and pe.estado = 'entregado'
  group by d.producto_id
),
cal as (
  select
    c.producto_id,
    count(c.id)::integer   as n,
    avg(c.estrellas)::numeric as media
  from public.calificaciones c
  group by c.producto_id
)
select
  p.id                            as producto_id,
  p.nombre                        as producto,
  t.id                            as tienda_id,
  t.nombre                        as tienda,
  t.latitude                      as tienda_lat,
  t.longitude                     as tienda_lng,
  t.direccion                     as tienda_direccion,
  cat.id                          as categoria_id,
  cat.nombre                      as categoria_nombre,
  p.precio                        as precio_actual,
  p.stock                         as stock,
  coalesce(v.unidades, 0)         as unidades_vendidas,
  coalesce(v.pedidos, 0)          as pedidos,
  coalesce(cal.n, 0)              as total_calificaciones,
  case when cal.n > 0 then round(cal.media::numeric, 2) end as promedio_estrellas
from public.productos p
join public.tiendas    t   on t.id  = p.tienda_id and t.aprobada
join public.categorias cat on cat.id = p.categoria_id
left join ventas v   on v.producto_id  = p.id
left join cal    cal on cal.producto_id = p.id
order by unidades_vendidas desc, total_calificaciones desc, p.nombre;

create view public.productos_mejor_calificados
with (security_invoker = true)
as
with ventas as (
  select
    d.producto_id,
    sum(d.cantidad)::integer as unidades
  from public.detalle_pedido d
  join public.pedidos pe
    on pe.id = d.pedido_id
   and pe.estado = 'entregado'
  group by d.producto_id
)
select
  p.id                             as producto_id,
  p.nombre                         as producto,
  t.id                             as tienda_id,
  t.nombre                         as tienda,
  t.latitude                       as tienda_lat,
  t.longitude                      as tienda_lng,
  t.direccion                      as tienda_direccion,
  cat.id                           as categoria_id,
  cat.nombre                       as categoria_nombre,
  p.precio                         as precio_actual,
  count(c.id)::integer             as total_calificaciones,
  round(avg(c.estrellas)::numeric, 2) as promedio_estrellas,
  coalesce(v.unidades, 0)          as unidades_vendidas
from public.productos p
join public.tiendas    t   on t.id  = p.tienda_id and t.aprobada
join public.categorias cat on cat.id = p.categoria_id
join public.calificaciones c on c.producto_id = p.id
left join ventas v on v.producto_id = p.id
group by p.id, p.nombre, p.precio, t.id, t.nombre, t.latitude, t.longitude,
         t.direccion, cat.id, cat.nombre, v.unidades
having count(c.id) >= 3
order by promedio_estrellas desc, total_calificaciones desc, p.nombre;

create view public.catalogo_productos
with (security_invoker = true)
as
select
  p.id              as producto_id,
  p.nombre          as nombre,
  p.descripcion     as descripcion,
  p.precio          as precio,
  p.stock           as stock,
  p.imagenes        as imagenes,
  p.condicion       as condicion,
  cat.nombre        as categoria,
  cat.slug          as categoria_slug,
  tr.nombre         as tipo,
  t.id              as tienda_id,
  t.nombre          as tienda,
  t.logo_url        as tienda_logo,
  t.latitude        as tienda_lat,
  t.longitude       as tienda_lng,
  t.direccion       as tienda_direccion,
  t.ofrece_delivery as ofrece_delivery,
  t.costo_delivery  as costo_delivery,
  t.zonas           as zonas,
  p.created_at      as created_at,
  v.total_calificaciones,
  v.promedio_estrellas,
  (
    select jsonb_agg(
             jsonb_build_object(
               'marca',      co.marca,
               'modelo',     co.modelo,
               'anio_desde', co.anio_desde,
               'anio_hasta', co.anio_hasta
             ) order by co.marca, co.modelo, co.anio_desde
           )
      from public.compatibilidad co
     where co.producto_id = p.id
  ) as compatibilidad
from public.productos p
join public.tiendas          t   on t.id  = p.tienda_id and t.aprobada
join public.categorias       cat on cat.id = p.categoria_id
join public.tipos_repuesto   tr  on tr.id  = p.tipo_id
left join public.vista_calificaciones_producto v on v.producto_id = p.id
where p.activo;

select 'columnas tiendas' as que, string_agg(column_name, ', ' order by ordinal_position) as detalle
  from information_schema.columns
 where table_schema = 'public' and table_name = 'tiendas'
   and column_name in ('latitude', 'longitude');

select t.nombre, t.direccion, t.latitude, t.longitude
  from public.tiendas t
 where t.aprobada
 order by t.nombre;

select count(*) as productos_publicos,
       count(tienda_lat) as con_ubicacion
  from public.catalogo_productos;

select tgname as trigger, tgenabled as estado
  from pg_trigger
 where tgname in ('trg_guardar_rol_usuarios', 'trg_guardar_aprobacion_tienda',
                  'trg_guardar_campos_pedido', 'trg_devolver_stock_linea',
                  'trg_devolver_stock_cancelado')
 order by tgname;