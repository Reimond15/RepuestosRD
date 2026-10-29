create table if not exists public.mensajes (
  id         uuid        primary key default gen_random_uuid(),
  pedido_id  uuid        not null references public.pedidos (id)  on delete cascade,
  autor_id   uuid        not null references public.usuarios (id) on delete cascade,
  contenido  text        not null,
  leido      boolean     not null default false,
  created_at timestamptz not null default now(),

  constraint mensajes_contenido_largo
    check (char_length(btrim(contenido)) between 1 and 2000)
);

comment on table public.mensajes is
  'Mensajes del chat de un pedido. Solo los ven el comprador y la tienda del pedido.';
comment on column public.mensajes.leido is
  'true cuando la contraparte ya lo leyó (lo marca la app con marcar_mensajes_leidos).';

create index if not exists mensajes_pedido_idx
  on public.mensajes (pedido_id, created_at);

create index if not exists mensajes_sin_leer_idx
  on public.mensajes (pedido_id) where leido = false;

create or replace function public.es_participante_del_pedido(p_pedido_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$  select exists (
    select 1
      from public.pedidos pe
      left join public.tiendas t on t.id = pe.tienda_id
     where pe.id = p_pedido_id
       and (pe.cliente_id = auth.uid() or t.dueno_id = auth.uid())
  );
$$;

revoke all on function public.es_participante_del_pedido(uuid) from public;
grant execute on function public.es_participante_del_pedido(uuid) to authenticated;

alter table public.mensajes enable row level security;

drop policy if exists mensajes_select_participantes on public.mensajes;
create policy mensajes_select_participantes on public.mensajes
  for select to authenticated
  using (public.es_participante_del_pedido(pedido_id));

drop policy if exists mensajes_insert_participantes on public.mensajes;
create policy mensajes_insert_participantes on public.mensajes
  for insert to authenticated
  with check (
    autor_id = auth.uid()
    and public.es_participante_del_pedido(pedido_id)
  );

create or replace function public.marcar_mensajes_leidos(p_pedido_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$begin
  if not public.es_participante_del_pedido(p_pedido_id) then
    raise exception 'No participás de ese pedido.';
  end if;

  update public.mensajes
     set leido = true
   where pedido_id = p_pedido_id
     and autor_id <> auth.uid()
     and leido = false;
end $$;

revoke all on function public.marcar_mensajes_leidos(uuid) from public;
grant execute on function public.marcar_mensajes_leidos(uuid) to authenticated;

create or replace function public.mensajes_sin_leer()
returns table (pedido_id uuid, sin_leer bigint)
language sql
stable
security definer
set search_path = public
as $$  select m.pedido_id, count(*)::bigint
    from public.mensajes m
    join public.pedidos pe on pe.id = m.pedido_id
    left join public.tiendas t on t.id = pe.tienda_id
   where m.leido = false
     and m.autor_id <> auth.uid()
     and (pe.cliente_id = auth.uid() or t.dueno_id = auth.uid())
   group by m.pedido_id;
$$;

revoke all on function public.mensajes_sin_leer() from public;
grant execute on function public.mensajes_sin_leer() to authenticated;

alter table public.mensajes replica identity full;

do $$begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
         from pg_publication_tables
        where pubname    = 'supabase_realtime'
          and schemaname = 'public'
          and tablename  = 'mensajes'
     )
  then
    alter publication supabase_realtime add table public.mensajes;
  end if;
end $$;

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
      then pe.direccion
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
          and m.autor_id <> auth.uid()),
      0
    )::bigint as sin_leer
  from public.pedidos pe
  join public.tiendas  t on t.id = pe.tienda_id
  join public.usuarios u on u.id = pe.cliente_id
  where t.dueno_id = auth.uid()
  order by pe.created_at desc;
$$;

comment on function public.pedidos_de_mi_tienda() is
  'Pedidos de la tienda del usuario. Sin el contacto del cliente (la charla va por el chat) y con la dirección oculta hasta confirmar.';

revoke all on function public.pedidos_de_mi_tienda() from public;
grant execute on function public.pedidos_de_mi_tienda() to authenticated;
