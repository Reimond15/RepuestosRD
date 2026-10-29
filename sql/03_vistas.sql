drop view if exists public.vista_calificaciones_producto cascade;
create view public.vista_calificaciones_producto
with (security_invoker = true)
as
select
  c.producto_id,
  count(*)::integer                        as total_calificaciones,
  round(avg(c.estrellas)::numeric, 2)      as promedio_estrellas,
  count(*) filter (where c.estrellas = 5) as estrellas_5,
  count(*) filter (where c.estrellas = 4) as estrellas_4,
  count(*) filter (where c.estrellas = 3) as estrellas_3,
  count(*) filter (where c.estrellas = 2) as estrellas_2,
  count(*) filter (where c.estrellas = 1) as estrellas_1
from public.calificaciones c
group by c.producto_id;

comment on view public.vista_calificaciones_producto is
  'Promedio de estrellas por producto. Filtro: where producto_id = <uuid>.';

drop view if exists public.vista_calificaciones_tienda cascade;
create view public.vista_calificaciones_tienda
with (security_invoker = true)
as
with por_producto as (
  select
    p.tienda_id,
    c.producto_id,
    count(c.id)::integer          as n,
    avg(c.estrellas)::numeric     as media
  from public.productos p
  join public.calificaciones c on c.producto_id = p.id
  group by p.tienda_id, c.producto_id
)
select
  t.id                            as tienda_id,
  t.nombre                        as tienda,
  coalesce(sum(pp.n), 0)::integer as total_calificaciones,
  case
    when coalesce(sum(pp.n), 0) > 0
    then round((sum(pp.n * pp.media) / sum(pp.n))::numeric, 2)
  end                             as promedio_estrellas
from public.tiendas t
left join por_producto pp on pp.tienda_id = t.id
group by t.id, t.nombre
order by promedio_estrellas desc nulls last, t.nombre;

comment on view public.vista_calificaciones_tienda is
  'Promedio de estrellas por tienda. Filtro: where tienda_id = <uuid>.';

drop view if exists public.productos_mas_vendidos cascade;
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

comment on view public.productos_mas_vendidos is
  'Ranking de ventas: unidades entregadas por producto. Filtrable por categoria_nombre.';

drop view if exists public.productos_mejor_calificados cascade;
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
group by p.id, p.nombre, p.precio, t.id, t.nombre,
         cat.id, cat.nombre, v.unidades
having count(c.id) >= 3
order by promedio_estrellas desc, total_calificaciones desc, p.nombre;

comment on view public.productos_mejor_calificados is
  'Productos con minimo 3 calificaciones, ordenados por promedio. Filtrable por categoria_nombre.';

drop view if exists public.catalogo_productos cascade;
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

comment on view public.catalogo_productos is
  'Catalogo publico: productos activos de tiendas aprobadas, con compatibilidad y promedio de estrellas.';

drop view if exists public.resenas_producto cascade;
create view public.resenas_producto
with (security_invoker = true)
as
select
  c.producto_id,
  c.estrellas,
  c.comentario,
  c.created_at
from public.calificaciones c;

comment on view public.resenas_producto is
  'Resenas de un producto (sin datos del cliente). Filtro: where producto_id = <uuid>.';
