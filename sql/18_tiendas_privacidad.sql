create table if not exists public.tiendas_ubicacion (
  tienda_id      uuid primary key,
  direccion      text,
  latitude       numeric(9, 6),
  longitude      numeric(9, 6),
  actualizado_en timestamptz not null default now(),
  constraint tiendas_ubicacion_tienda_fk
    foreign key (tienda_id) references public.tiendas (id)
    on delete cascade deferrable initially deferred
);

comment on table public.tiendas_ubicacion is
  'Ubicación EXACTA de la tienda (privada). La ficha pública `tiendas` solo lleva la zona aproximada.';

alter table public.tiendas_ubicacion enable row level security;

drop policy if exists tienda_ubicacion_select on public.tiendas_ubicacion;
create policy tienda_ubicacion_select on public.tiendas_ubicacion
  for select to authenticated
  using (
    exists (
      select 1
        from public.tiendas t
       where t.id = tiendas_ubicacion.tienda_id
         and (t.dueno_id = auth.uid() or public.es_admin())
    )
    or exists (
      select 1
        from public.pedidos pe
       where pe.tienda_id = tiendas_ubicacion.tienda_id
         and pe.cliente_id = auth.uid()
         and pe.entrega = 'retiro'
         and pe.estado in ('confirmado', 'preparando', 'enviado', 'entregado')
    )
  );

drop policy if exists tienda_ubicacion_insert_own on public.tiendas_ubicacion;
create policy tienda_ubicacion_insert_own on public.tiendas_ubicacion
  for insert to authenticated
  with check (exists (
    select 1 from public.tiendas t
     where t.id = tiendas_ubicacion.tienda_id
       and t.dueno_id = auth.uid()
  ));

drop policy if exists tienda_ubicacion_update_own on public.tiendas_ubicacion;
create policy tienda_ubicacion_update_own on public.tiendas_ubicacion
  for update to authenticated
  using (exists (
    select 1 from public.tiendas t
     where t.id = tiendas_ubicacion.tienda_id
       and t.dueno_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.tiendas t
     where t.id = tiendas_ubicacion.tienda_id
       and t.dueno_id = auth.uid()
  ));

revoke all on public.tiendas_ubicacion from anon;
grant select, insert, update on public.tiendas_ubicacion to authenticated;

insert into public.tiendas_ubicacion (tienda_id, direccion, latitude, longitude)
select t.id, t.direccion, t.latitude, t.longitude
  from public.tiendas t
 where t.direccion is not null or t.latitude is not null
on conflict (tienda_id) do nothing;

update public.tiendas
   set direccion = null,
       latitude  = round(latitude, 2),
       longitude = round(longitude, 2)
 where direccion is not null
    or latitude  is distinct from round(latitude, 2)
    or longitude is distinct from round(longitude, 2);

comment on column public.tiendas.direccion is
  'PÚBLICA y siempre NULL: la dirección exacta está en `tiendas_ubicacion` (privada).';
comment on column public.tiendas.latitude is
  'Latitud APROXIMADA (~1 km) para el catálogo. La exacta está en `tiendas_ubicacion`.';
comment on column public.tiendas.longitude is
  'Longitud APROXIMADA (~1 km) para el catálogo. La exacta está en `tiendas_ubicacion`.';

create or replace function public.sanear_ubicacion_tienda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  if (new.direccion is not null
        and (tg_op = 'INSERT' or new.direccion is distinct from old.direccion))
     or (new.latitude  is not null and new.latitude  <> round(new.latitude, 2))
     or (new.longitude is not null and new.longitude <> round(new.longitude, 2)) then

    insert into public.tiendas_ubicacion (tienda_id, direccion, latitude, longitude)
    values (new.id, new.direccion, new.latitude, new.longitude)
    on conflict (tienda_id) do update
      set direccion      = coalesce(excluded.direccion, tiendas_ubicacion.direccion),
          latitude       = coalesce(excluded.latitude,  tiendas_ubicacion.latitude),
          longitude      = coalesce(excluded.longitude, tiendas_ubicacion.longitude),
          actualizado_en = now();
  end if;

  new.direccion := null;
  new.latitude  := round(new.latitude, 2);
  new.longitude := round(new.longitude, 2);
  return new;
end;
$$;

drop trigger if exists trg_sanear_ubicacion_tienda on public.tiendas;
create trigger trg_sanear_ubicacion_tienda
  before insert or update on public.tiendas
  for each row execute function public.sanear_ubicacion_tienda();

create or replace function public.ubicaciones_de_mis_pedidos()
returns table (
  pedido_id     uuid,
  tienda_nombre text,
  direccion     text,
  latitude      numeric,
  longitude     numeric
)
language sql
stable
set search_path = public
as $$  select pe.id,
         t.nombre,
         u.direccion,
         u.latitude,
         u.longitude
    from public.pedidos pe
    join public.tiendas t           on t.id = pe.tienda_id
    join public.tiendas_ubicacion u on u.tienda_id = pe.tienda_id
   where pe.cliente_id = auth.uid()
     and pe.entrega = 'retiro'
     and pe.estado in ('confirmado', 'preparando', 'enviado', 'entregado');
$$;

comment on function public.ubicaciones_de_mis_pedidos() is
  'Ubicación exacta de la tienda para los retiros ya confirmados del comprador (anti-elusión).';

revoke all on function public.ubicaciones_de_mis_pedidos() from public;
grant execute on function public.ubicaciones_de_mis_pedidos() to authenticated;

notify pgrst, 'reload schema';
