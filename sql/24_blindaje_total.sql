drop view if exists public.catalogo_productos;
drop view if exists public.productos_mejor_calificados;
drop view if exists public.productos_mas_vendidos;
drop view if exists public.vista_calificaciones_tienda;
drop view if exists public.vista_calificaciones_producto;
drop view if exists public.resenas_producto;

create view public.vista_calificaciones_producto as
select
  c.producto_id,
  count(*)::integer                        as total_calificaciones,
  round(avg(c.estrellas)::numeric, 2)      as promedio_estrellas,
  count(*) filter (where c.estrellas = 5)  as estrellas_5,
  count(*) filter (where c.estrellas = 4)  as estrellas_4,
  count(*) filter (where c.estrellas = 3)  as estrellas_3,
  count(*) filter (where c.estrellas = 2)  as estrellas_2,
  count(*) filter (where c.estrellas = 1)  as estrellas_1
from public.calificaciones c
group by c.producto_id;

comment on view public.vista_calificaciones_producto is
  'Promedio de estrellas por producto. Filtro: where producto_id = <uuid>.';

create view public.vista_calificaciones_tienda as
with por_producto as (
  select
    p.tienda_id,
    c.producto_id,
    count(c.id)::integer      as n,
    avg(c.estrellas)::numeric as media
  from public.productos p
  join public.calificaciones c on c.producto_id = p.id
  where p.activo
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
where t.aprobada
group by t.id, t.nombre
order by promedio_estrellas desc nulls last, t.nombre;

comment on view public.vista_calificaciones_tienda is
  'Promedio de estrellas por tienda. Filtro: where tienda_id = <uuid>.';

create view public.productos_mas_vendidos as
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

create view public.productos_mejor_calificados as
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

create view public.catalogo_productos as
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

create view public.resenas_producto as
select
  c.producto_id,
  c.estrellas,
  c.comentario,
  c.created_at
from public.calificaciones c;

comment on view public.resenas_producto is
  'Resenas de un producto (sin datos del cliente). Filtro: where producto_id = <uuid>.';

revoke all on public.calificaciones from anon;

drop policy if exists calificaciones_select_public on public.calificaciones;
drop policy if exists calificaciones_select_own    on public.calificaciones;
create policy calificaciones_select_own on public.calificaciones
  for select to authenticated
  using (cliente_id = auth.uid() or public.es_admin());

create or replace function public.guardar_aprobacion_tienda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  if auth.uid() is not null and not public.es_admin() then
    if tg_op = 'INSERT' then
      new.aprobada       := false;
      new.prueba_hasta   := now() + interval '30 days';
      new.pago_hasta     := null;
      new.es_fundador    := false;
      new.fundador_hasta := null;
    else
      if new.aprobada is distinct from old.aprobada then
        raise exception 'Solo un administrador puede aprobar una tienda.';
      end if;

      if new.pago_hasta       is distinct from old.pago_hasta
         or new.prueba_hasta  is distinct from old.prueba_hasta
         or new.es_fundador   is distinct from old.es_fundador
         or new.fundador_hasta is distinct from old.fundador_hasta then
        raise exception 'Solo un administrador puede cambiar la suscripcion de una tienda.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guardar_aprobacion_tienda on public.tiendas;
create trigger trg_guardar_aprobacion_tienda
  before insert or update on public.tiendas
  for each row execute function public.guardar_aprobacion_tienda();

drop policy if exists productos_select_public on public.productos;
create policy productos_select_public on public.productos
  for select to anon, authenticated
  using (
    activo
    and exists (
      select 1 from public.tiendas t
       where t.id = productos.tienda_id
         and t.aprobada
    )
    and public.tienda_vigente(productos.tienda_id)
  );

drop policy if exists compatibilidad_select_public on public.compatibilidad;
create policy compatibilidad_select_public on public.compatibilidad
  for select to anon, authenticated
  using (exists (
    select 1
      from public.productos p
      join public.tiendas t on t.id = p.tienda_id
     where p.id = compatibilidad.producto_id
       and p.activo
       and t.aprobada
       and public.tienda_vigente(t.id)
  ));

drop policy if exists productos_select_comprados on public.productos;
create policy productos_select_comprados on public.productos
  for select to authenticated
  using (exists (
    select 1
      from public.detalle_pedido d
      join public.pedidos pe on pe.id = d.pedido_id
     where d.producto_id = productos.id
       and pe.cliente_id = auth.uid()
  ));

create table if not exists public.pedidos_direccion (
  pedido_id      uuid primary key,
  direccion      text not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint pedidos_direccion_pedido_fk
    foreign key (pedido_id) references public.pedidos (id)
    on delete cascade deferrable initially deferred
);

comment on table public.pedidos_direccion is
  'Dirección EXACTA de entrega del pedido (privada). `pedidos.direccion` queda siempre NULL.';

alter table public.pedidos_direccion enable row level security;

create or replace function public.puede_ver_direccion_pedido(p_pedido_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$  select exists (
    select 1
      from public.pedidos pe
      join public.tiendas t on t.id = pe.tienda_id
     where pe.id = p_pedido_id
       and (
         pe.cliente_id = auth.uid()
         or (t.dueno_id = auth.uid() and pe.estado <> 'pendiente')
         or public.es_admin()
       )
  );
$$;

comment on function public.puede_ver_direccion_pedido(uuid) is
  'true si el usuario puede ver la dirección de ese pedido: el comprador, el dueño de la tienda (solo tras confirmar) o el admin.';

revoke all on function public.puede_ver_direccion_pedido(uuid) from public;
grant execute on function public.puede_ver_direccion_pedido(uuid) to authenticated;

drop policy if exists pedidos_direccion_select on public.pedidos_direccion;
create policy pedidos_direccion_select on public.pedidos_direccion
  for select to authenticated
  using (public.puede_ver_direccion_pedido(pedido_id));

revoke all on public.pedidos_direccion from anon, authenticated, public;
grant select on public.pedidos_direccion to authenticated;

create or replace function public.sanear_direccion_pedido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  if new.entrega = 'delivery'
     and nullif(btrim(coalesce(new.direccion, '')), '') is null
     and not exists (
       select 1 from public.pedidos_direccion pd where pd.pedido_id = new.id
     )
  then
    raise exception 'La dirección de entrega es obligatoria para pedidos con envío.';
  end if;

  if new.direccion is not null
     and (tg_op = 'INSERT' or new.direccion is distinct from old.direccion) then
    insert into public.pedidos_direccion (pedido_id, direccion)
    values (new.id, new.direccion)
    on conflict (pedido_id) do update
      set direccion  = excluded.direccion,
          updated_at = now();
  end if;

  new.direccion := null;
  return new;
end;
$$;

revoke all on function public.sanear_direccion_pedido() from public;

drop trigger if exists trg_sanear_direccion_pedido on public.pedidos;
create trigger trg_sanear_direccion_pedido
  before insert or update on public.pedidos
  for each row execute function public.sanear_direccion_pedido();

alter table public.pedidos drop constraint if exists pedidos_direccion_requerida;

comment on column public.pedidos.direccion is
  'SIEMPRE NULL (blindaje #5). La dirección exacta está en `pedidos_direccion`.';

insert into public.pedidos_direccion (pedido_id, direccion)
select pe.id, pe.direccion
  from public.pedidos pe
 where pe.direccion is not null
on conflict (pedido_id) do update
  set direccion = excluded.direccion, updated_at = now();

update public.pedidos set direccion = null where direccion is not null;

drop function if exists public.pedidos_de_mi_tienda();

create function public.pedidos_de_mi_tienda()
returns table (
  id             uuid,
  cliente_id     uuid,
  tienda_id      uuid,
  entrega        text,
  direccion      text,
  forma_pago     text,
  estado         text,
  total          numeric,
  notas          text,
  created_at     timestamptz,
  cliente_nombre text,
  sin_leer       bigint
)
language sql
stable
security definer
set search_path = public
as $$  select
    pe.id,
    pe.cliente_id,
    pe.tienda_id,
    pe.entrega::text,
    case
      when pe.entrega = 'delivery'
       and pe.estado in ('confirmado', 'preparando', 'enviado', 'entregado')
      then pd.direccion
      else null
    end as direccion,
    pe.forma_pago::text,
    pe.estado::text,
    pe.total,
    pe.notas,
    pe.created_at,
    u.nombre as cliente_nombre,
    coalesce(
      (select count(*)
         from public.mensajes m
        where m.pedido_id = pe.id
          and m.leido = false
          and m.autor_id <> auth.uid()
          and not public.hay_bloqueo(auth.uid(), m.autor_id)),
      0
    )::bigint as sin_leer
  from public.pedidos pe
  join public.tiendas  t on t.id = pe.tienda_id
  join public.usuarios u on u.id = pe.cliente_id
  left join public.pedidos_direccion pd on pd.pedido_id = pe.id
  where t.dueno_id = auth.uid()
  order by pe.created_at desc;
$$;

comment on function public.pedidos_de_mi_tienda() is
  'Pedidos de la tienda del usuario. Sin contacto del cliente y con la dirección oculta hasta confirmar. Excluye mensajes de usuarios bloqueados.';

revoke all on function public.pedidos_de_mi_tienda() from public;
grant execute on function public.pedidos_de_mi_tienda() to authenticated;

revoke all on all tables in schema public from anon;

grant select on
  public.catalogo_productos,
  public.productos_mas_vendidos,
  public.productos_mejor_calificados,
  public.resenas_producto,
  public.vista_calificaciones_producto,
  public.vista_calificaciones_tienda,
  public.categorias,
  public.tipos_repuesto
to anon, authenticated;

revoke truncate, references, trigger on all tables in schema public
  from anon, authenticated;

notify pgrst, 'reload schema';
