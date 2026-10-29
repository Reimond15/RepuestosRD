create or replace function public.ventas_por_producto()
returns table (
  producto_id uuid,
  unidades    integer,
  pedidos     integer
)
language sql
stable
security definer
set search_path = public
as $$  select
    d.producto_id,
    sum(d.cantidad)::integer             as unidades,
    count(distinct d.pedido_id)::integer as pedidos
  from public.detalle_pedido d
  join public.pedidos pe
    on pe.id = d.pedido_id
   and pe.estado = 'entregado'
  group by d.producto_id;
$$;

comment on function public.ventas_por_producto() is
  'Ventas entregadas por producto (agregado global) para el ranking. security definer: las vistas security_invoker no pueden leer detalle_pedido por RLS.';

revoke all on function public.ventas_por_producto() from public;
grant execute on function public.ventas_por_producto() to anon, authenticated;

alter table public.tiendas
  add column if not exists prueba_hasta timestamptz,
  add column if not exists pago_hasta   timestamptz;

alter table public.tiendas
  alter column prueba_hasta set default (now() + interval '30 days');

update public.tiendas
   set prueba_hasta = now() + interval '30 days'
 where prueba_hasta is null;

comment on column public.tiendas.prueba_hasta is
  'Fin de los 30 días gratis de prueba.';
comment on column public.tiendas.pago_hasta is
  'Fin del período pagado (se extiende al registrar un pago).';

create or replace function public.tienda_vigente(p_tienda_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$  select exists (
    select 1
      from public.tiendas t
     where t.id = p_tienda_id
       and coalesce(t.pago_hasta, t.prueba_hasta, t.created_at + interval '30 days')
           + interval '5 days' > now()
  );
$$;

comment on function public.tienda_vigente(uuid) is
  'true si la tienda sigue en prueba, en gracia o pagada (filtro del catálogo).';

revoke all on function public.tienda_vigente(uuid) from public;
grant execute on function public.tienda_vigente(uuid) to anon, authenticated;

drop function if exists public.mi_suscripcion();

create function public.mi_suscripcion()
returns table (
  estado           text,
  dias_restantes   integer,
  dias_gracia      integer,
  vence_en         timestamptz,
  disponible_hasta timestamptz,
  prueba_hasta     timestamptz,
  pago_hasta       timestamptz
)
language sql
stable
security definer
set search_path = public
as $$  with t as (
    select
      ti.prueba_hasta,
      ti.pago_hasta,
      coalesce(ti.pago_hasta, ti.prueba_hasta,
               ti.created_at + interval '30 days') as vence
    from public.tiendas ti
    where ti.dueno_id = auth.uid() or public.es_admin()
    order by ti.created_at
    limit 1
  )
  select
    case
      when now() <= vence then
        case
          when pago_hasta is not null and pago_hasta >= now() then 'activa'
          else 'prueba'
        end
      when now() <= vence + interval '5 days' then 'gracia'
      else 'vencida'
    end::text as estado,
    greatest(0, ceil(extract(epoch from (vence - now())) / 86400))::integer
      as dias_restantes,
    greatest(0, ceil(extract(epoch from (vence + interval '5 days' - now())) / 86400))::integer
      as dias_gracia,
    vence as vence_en,
    vence + interval '5 days' as disponible_hasta,
    prueba_hasta,
    pago_hasta
  from t;
$$;

comment on function public.mi_suscripcion() is
  'Estado de la suscripción de la tienda del usuario (o de cualquier tienda si es admin).';

revoke all on function public.mi_suscripcion() from public;
grant execute on function public.mi_suscripcion() to authenticated;

create or replace function public.registrar_pago_tienda(
  p_tienda_id uuid,
  p_meses     integer default 1
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$declare
  v_base  timestamptz;
  v_nuevo timestamptz;
begin
  if not public.es_admin() then
    raise exception 'Solo un admin puede registrar pagos de suscripción';
  end if;

  if p_meses is null or p_meses < 1 or p_meses > 24 then
    raise exception 'Cantidad de meses inválida (entre 1 y 24)';
  end if;

  select greatest(now(), coalesce(t.pago_hasta, t.prueba_hasta, now()))
    into v_base
    from public.tiendas t
   where t.id = p_tienda_id;

  if v_base is null then
    raise exception 'Tienda no encontrada: %', p_tienda_id;
  end if;

  v_nuevo := v_base + make_interval(months => p_meses);

  update public.tiendas
     set pago_hasta = v_nuevo
   where id = p_tienda_id;

  return v_nuevo;
end;
$$;

comment on function public.registrar_pago_tienda(uuid, integer) is
  'Extiende la suscripción de una tienda N meses. Sólo admin.';

revoke all on function public.registrar_pago_tienda(uuid, integer) from public;
grant execute on function public.registrar_pago_tienda(uuid, integer) to authenticated;

drop view if exists public.catalogo_productos;
drop view if exists public.productos_mas_vendidos;
drop view if exists public.productos_mejor_calificados;

create view public.productos_mas_vendidos
with (security_invoker = true)
as
with cal as (
  select
    c.producto_id,
    count(c.id)::integer      as n,
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
left join public.ventas_por_producto() v on v.producto_id = p.id
left join cal on cal.producto_id = p.id
where p.activo
  and public.tienda_vigente(t.id)
order by unidades_vendidas desc, total_calificaciones desc, p.nombre;

comment on view public.productos_mas_vendidos is
  'Ranking de ventas: unidades entregadas (globales) por producto. Solo productos activos de tiendas aprobadas y vigentes.';

grant select on public.productos_mas_vendidos to anon, authenticated;

create view public.productos_mejor_calificados
with (security_invoker = true)
as
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
left join public.ventas_por_producto() v on v.producto_id = p.id
where p.activo
  and public.tienda_vigente(t.id)
group by p.id, p.nombre, p.precio, t.id, t.nombre, t.latitude, t.longitude,
         t.direccion, cat.id, cat.nombre, v.unidades
having count(c.id) >= 3
order by promedio_estrellas desc, total_calificaciones desc, p.nombre;

comment on view public.productos_mejor_calificados is
  'Productos activos (de tiendas aprobadas y vigentes) con mínimo 3 calificaciones, ordenados por promedio.';

grant select on public.productos_mejor_calificados to anon, authenticated;

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
where p.activo
  and public.tienda_vigente(t.id);

comment on view public.catalogo_productos is
  'Catálogo público: productos activos de tiendas aprobadas y vigentes.';

grant select on public.catalogo_productos to anon, authenticated;

notify pgrst, 'reload schema';
