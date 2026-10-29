alter table public.tiendas
  add column if not exists verificada boolean not null default false;

comment on column public.tiendas.verificada is
  'PÚBLICA: true si el admin verificó la tienda con fotos. Da la insignia en el catálogo. Las fotos son privadas.';

create table if not exists public.tiendas_verificacion (
  tienda_id        uuid primary key
                   references public.tiendas (id) on delete cascade,
  foto_fachada     text,
  foto_interior    text,
  estado           text not null default 'sin_enviar'
                   check (estado in ('sin_enviar', 'enviada', 'verificada', 'rechazada')),
  nota_rechazo     text,
  enviada_en       timestamptz,
  verificada_en    timestamptz,
  actualizado_en   timestamptz not null default now()
);

comment on table public.tiendas_verificacion is
  'Fotos (privadas) de verificación de la tienda + su estado. Solo el dueño y el admin.';

alter table public.tiendas_verificacion enable row level security;

create or replace function public.guardar_verificacion_tienda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  if current_setting('app.verificacion_admin', true) = 'on' then
    return new;
  end if;

  if not public.es_admin() then
    if tg_op = 'INSERT' then
      new.estado        := case when new.estado = 'enviada' then 'enviada' else 'sin_enviar' end;
    else
      new.estado        := case when new.estado = 'enviada' then 'enviada' else old.estado end;
    end if;
    new.nota_rechazo  := null;
    new.verificada_en := null;
  end if;

  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists trg_guardar_verificacion_tienda on public.tiendas_verificacion;
create trigger trg_guardar_verificacion_tienda
  before insert or update on public.tiendas_verificacion
  for each row execute function public.guardar_verificacion_tienda();

create or replace function public.sincronizar_verificada_tienda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  update public.tiendas
     set verificada = (new.estado = 'verificada')
   where id = new.tienda_id;

  return new;
end;
$$;

drop trigger if exists trg_sincronizar_verificada_tienda on public.tiendas_verificacion;
create trigger trg_sincronizar_verificada_tienda
  after insert or update of estado on public.tiendas_verificacion
  for each row execute function public.sincronizar_verificada_tienda();

drop policy if exists tienda_verificacion_select on public.tiendas_verificacion;
create policy tienda_verificacion_select on public.tiendas_verificacion
  for select to authenticated
  using (
    exists (
      select 1 from public.tiendas t
       where t.id = tiendas_verificacion.tienda_id
         and (t.dueno_id = auth.uid() or public.es_admin())
    )
  );

drop policy if exists tienda_verificacion_insert_own on public.tiendas_verificacion;
create policy tienda_verificacion_insert_own on public.tiendas_verificacion
  for insert to authenticated
  with check (exists (
    select 1 from public.tiendas t
     where t.id = tiendas_verificacion.tienda_id
       and t.dueno_id = auth.uid()
  ));

drop policy if exists tienda_verificacion_update on public.tiendas_verificacion;
create policy tienda_verificacion_update on public.tiendas_verificacion
  for update to authenticated
  using (
    exists (
      select 1 from public.tiendas t
       where t.id = tiendas_verificacion.tienda_id
         and (t.dueno_id = auth.uid() or public.es_admin())
    )
  )
  with check (
    exists (
      select 1 from public.tiendas t
       where t.id = tiendas_verificacion.tienda_id
         and (t.dueno_id = auth.uid() or public.es_admin())
    )
  );

revoke all on public.tiendas_verificacion from anon;
grant select, insert, update on public.tiendas_verificacion to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verificacion', 'verificacion', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "verificacion bucket: leer" on storage.objects;
create policy "verificacion bucket: leer" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'verificacion'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.es_admin()
    )
  );

drop policy if exists "verificacion bucket: subir" on storage.objects;
create policy "verificacion bucket: subir" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'verificacion'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "verificacion bucket: borrar" on storage.objects;
create policy "verificacion bucket: borrar" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'verificacion'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop function if exists public.admin_listar_tiendas();

create function public.admin_listar_tiendas()
returns table (
  tienda_id          uuid,
  tienda             text,
  direccion          text,
  ofrece_delivery    boolean,
  costo_delivery     numeric,
  aprobada           boolean,
  dueno_id           uuid,
  dueno              text,
  correo_dueno       text,
  telefono_dueno     text,
  es_fundador        boolean,
  fundador_hasta     timestamptz,
  prueba_hasta       timestamptz,
  pago_hasta         timestamptz,
  vigente            boolean,
  verificada         boolean,
  estado_verificacion text,
  created_at         timestamptz
)
language sql
stable
security definer
set search_path = public
as $$  select
    t.id                                             as tienda_id,
    t.nombre                                         as tienda,
    t.direccion,
    t.ofrece_delivery,
    t.costo_delivery,
    t.aprobada,
    t.dueno_id,
    u.nombre                                         as dueno,
    u.email                                          as correo_dueno,
    u.telefono                                       as telefono_dueno,
    t.es_fundador,
    t.fundador_hasta,
    t.prueba_hasta,
    t.pago_hasta,
    public.tienda_vigente(t.id)                      as vigente,
    t.verificada,
    coalesce(v.estado, 'sin_enviar')                 as estado_verificacion,
    t.created_at
  from public.tiendas t
  join public.usuarios u on u.id = t.dueno_id
  left join public.tiendas_verificacion v on v.tienda_id = t.id
  where public.es_admin()
  order by t.aprobada asc, t.created_at desc;
$$;

comment on function public.admin_listar_tiendas() is
  'Todas las tiendas con su dueño, estado de suscripción y verificación. Devuelve vacío si no sos admin.';

revoke all on function public.admin_listar_tiendas() from public;
grant execute on function public.admin_listar_tiendas() to authenticated;

create or replace function public.admin_listar_verificaciones()
returns table (
  tienda_id      uuid,
  tienda         text,
  correo_dueno   text,
  estado         text,
  foto_fachada   text,
  foto_interior  text,
  nota_rechazo   text,
  enviada_en     timestamptz,
  verificada_en  timestamptz
)
language sql
stable
security definer
set search_path = public
as $$  select
    t.id,
    t.nombre,
    u.email,
    coalesce(v.estado, 'sin_enviar'),
    v.foto_fachada,
    v.foto_interior,
    v.nota_rechazo,
    v.enviada_en,
    v.verificada_en
  from public.tiendas t
  join public.usuarios u on u.id = t.dueno_id
  left join public.tiendas_verificacion v on v.tienda_id = t.id
  where public.es_admin()
  order by
    case coalesce(v.estado, 'sin_enviar')
      when 'enviada' then 0
      when 'verificada' then 1
      when 'rechazada' then 2
      else 3
    end,
    t.created_at desc;
$$;

comment on function public.admin_listar_verificaciones() is
  'Verificaciones de todas las tiendas con las rutas de las fotos. Solo admin.';

revoke all on function public.admin_listar_verificaciones() from public;
grant execute on function public.admin_listar_verificaciones() to authenticated;

create or replace function public.admin_verificar_tienda(
  p_tienda_id uuid,
  p_aprobar   boolean default true,
  p_nota      text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede verificar tiendas.';
  end if;

  if p_tienda_id is null then
    raise exception 'Falta el id de la tienda.';
  end if;

  perform set_config('app.verificacion_admin', 'on', true);

  insert into public.tiendas_verificacion (tienda_id, estado)
  values (
    p_tienda_id,
    case when p_aprobar then 'verificada' else 'rechazada' end
  )
  on conflict (tienda_id) do update
    set estado        = case when p_aprobar then 'verificada' else 'rechazada' end,
        nota_rechazo  = case when p_aprobar then null else p_nota end,
        verificada_en = case when p_aprobar then now() else null end,
        actualizado_en = now();

  perform set_config('app.verificacion_admin', 'off', true);
end;
$$;

comment on function public.admin_verificar_tienda(uuid, boolean, text) is
  'Aprobar (true) o rechazar (false) la verificación de una tienda. Solo admin.';

revoke all on function public.admin_verificar_tienda(uuid, boolean, text) from public;
grant execute on function public.admin_verificar_tienda(uuid, boolean, text) to authenticated;

create or replace function public.enviar_verificacion_tienda(
  p_fachada  text,
  p_interior text
)
returns void
language plpgsql
security definer
set search_path = public
as $$declare
  v_tienda_id uuid;
begin
  select t.id into v_tienda_id
    from public.tiendas t
   where t.dueno_id = auth.uid();

  if v_tienda_id is null then
    raise exception 'No tenés una tienda a tu nombre.';
  end if;

  if p_fachada is null or p_interior is null then
    raise exception 'Tenés que subir las dos fotos: fachada e interior.';
  end if;

  insert into public.tiendas_verificacion
    (tienda_id, foto_fachada, foto_interior, estado, enviada_en, actualizado_en)
  values
    (v_tienda_id, p_fachada, p_interior, 'enviada', now(), now())
  on conflict (tienda_id) do update
    set foto_fachada  = excluded.foto_fachada,
        foto_interior = excluded.foto_interior,
        estado        = 'enviada',
        nota_rechazo  = null,
        enviada_en    = now(),
        actualizado_en = now();
end;
$$;

comment on function public.enviar_verificacion_tienda(text, text) is
  'La tienda manda sus 2 fotos (fachada + interior) a revisión.';

revoke all on function public.enviar_verificacion_tienda(text, text) from public;
grant execute on function public.enviar_verificacion_tienda(text, text) to authenticated;

create or replace function public.mi_verificacion_tienda()
returns table (
  estado         text,
  foto_fachada   text,
  foto_interior  text,
  nota_rechazo   text,
  enviada_en     timestamptz,
  verificada_en  timestamptz
)
language sql
stable
security definer
set search_path = public
as $$  select
    coalesce(v.estado, 'sin_enviar'),
    v.foto_fachada,
    v.foto_interior,
    v.nota_rechazo,
    v.enviada_en,
    v.verificada_en
  from public.tiendas t
  left join public.tiendas_verificacion v on v.tienda_id = t.id
  where t.dueno_id = auth.uid()
  limit 1;
$$;

comment on function public.mi_verificacion_tienda() is
  'Estado y fotos de la verificación de la tienda del usuario actual.';

revoke all on function public.mi_verificacion_tienda() from public;
grant execute on function public.mi_verificacion_tienda() to authenticated;

drop view if exists public.catalogo_productos;
create view public.catalogo_productos
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
  t.verificada      as tienda_verificada,
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

drop view if exists public.productos_mas_vendidos;
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
  t.verificada                    as tienda_verificada,
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

drop view if exists public.productos_mejor_calificados;
create view public.productos_mejor_calificados as
select
  p.id                             as producto_id,
  p.nombre                         as producto,
  t.id                             as tienda_id,
  t.nombre                         as tienda,
  t.verificada                     as tienda_verificada,
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
group by p.id, p.nombre, p.precio, t.id, t.nombre, t.verificada, t.latitude,
         t.longitude, t.direccion, cat.id, cat.nombre, v.unidades
having count(c.id) >= 3
order by promedio_estrellas desc, total_calificaciones desc, p.nombre;

comment on view public.productos_mejor_calificados is
  'Productos activos (de tiendas aprobadas y vigentes) con mínimo 3 calificaciones, ordenados por promedio.';

grant select on public.productos_mejor_calificados to anon, authenticated;

notify pgrst, 'reload schema';
