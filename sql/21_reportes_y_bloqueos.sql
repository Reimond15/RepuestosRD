create table if not exists public.reportes (
  id            uuid        primary key default gen_random_uuid(),
  reportante_id uuid        not null references public.usuarios (id) on delete cascade,
  reportado_id  uuid        references public.usuarios (id) on delete set null,
  tipo          text        not null
                  check (tipo in ('producto', 'tienda', 'usuario', 'mensaje')),
  producto_id   uuid        references public.productos (id) on delete cascade,
  tienda_id     uuid        references public.tiendas  (id) on delete cascade,
  pedido_id     uuid        references public.pedidos  (id) on delete set null,
  mensaje_id    uuid        references public.mensajes (id) on delete cascade,
  motivo        text        not null
                  check (motivo in (
                    'estafa', 'producto_prohibido', 'acoso',
                    'contacto_fuera_de_la_app', 'spam', 'otro'
                  )),
  detalle       text,
  estado        text        not null default 'pendiente'
                  check (estado in ('pendiente', 'revisado', 'accionado', 'descartado')),
  created_at    timestamptz not null default now(),
  resuelto_en   timestamptz,

  constraint reportes_detalle_largo
    check (detalle is null or char_length(detalle) <= 1000)
);

comment on table public.reportes is
  'Reportes de contenido/usuarios (Google Play, política UGC). Los resuelve el admin.';

create index if not exists reportes_pendientes_idx
  on public.reportes (created_at desc) where estado = 'pendiente';
create index if not exists reportes_reportado_idx
  on public.reportes (reportado_id);

alter table public.reportes enable row level security;

drop policy if exists reportes_select on public.reportes;
create policy reportes_select on public.reportes
  for select to authenticated
  using (reportante_id = auth.uid() or public.es_admin());

drop policy if exists reportes_insert on public.reportes;
create policy reportes_insert on public.reportes
  for insert to authenticated
  with check (reportante_id = auth.uid());

drop policy if exists reportes_update_admin on public.reportes;
create policy reportes_update_admin on public.reportes
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

revoke all on public.reportes from anon, authenticated;
grant select, insert, update on public.reportes to authenticated;

create table if not exists public.bloqueos (
  bloqueador_id uuid        not null references public.usuarios (id) on delete cascade,
  bloqueado_id  uuid        not null references public.usuarios (id) on delete cascade,
  created_at    timestamptz not null default now(),

  primary key (bloqueador_id, bloqueado_id),
  constraint bloqueos_no_yo check (bloqueador_id <> bloqueado_id)
);

comment on table public.bloqueos is
  'Bloqueos entre usuarios (Google Play, UGC 1:1). Oculta el chat entre las dos partes.';

create index if not exists bloqueos_bloqueado_idx on public.bloqueos (bloqueado_id);

alter table public.bloqueos enable row level security;

drop policy if exists bloqueos_select on public.bloqueos;
create policy bloqueos_select on public.bloqueos
  for select to authenticated
  using (bloqueador_id = auth.uid() or public.es_admin());

drop policy if exists bloqueos_insert on public.bloqueos;
create policy bloqueos_insert on public.bloqueos
  for insert to authenticated
  with check (bloqueador_id = auth.uid());

drop policy if exists bloqueos_delete on public.bloqueos;
create policy bloqueos_delete on public.bloqueos
  for delete to authenticated
  using (bloqueador_id = auth.uid());

revoke all on public.bloqueos from anon, authenticated;
grant select, insert, delete on public.bloqueos to authenticated;

create or replace function public.hay_bloqueo(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$  select exists (
    select 1
      from public.bloqueos b
     where (b.bloqueador_id = p_a and b.bloqueado_id = p_b)
        or (b.bloqueador_id = p_b and b.bloqueado_id = p_a)
  );
$$;

comment on function public.hay_bloqueo(uuid, uuid) is
  'true si cualquiera de los dos usuarios bloqueó al otro.';

revoke all on function public.hay_bloqueo(uuid, uuid) from public;
grant execute on function public.hay_bloqueo(uuid, uuid) to authenticated;

create or replace function public.contraparte_del_pedido(p_pedido_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$  select case
           when pe.cliente_id = auth.uid() then t.dueno_id
           when t.dueno_id   = auth.uid() then pe.cliente_id
           else null
         end
    from public.pedidos pe
    left join public.tiendas t on t.id = pe.tienda_id
   where pe.id = p_pedido_id;
$$;

comment on function public.contraparte_del_pedido(uuid) is
  'El otro participante del pedido (comprador <-> dueño de la tienda) para quien llama.';

revoke all on function public.contraparte_del_pedido(uuid) from public;
grant execute on function public.contraparte_del_pedido(uuid) to authenticated;

drop policy if exists mensajes_select_participantes on public.mensajes;
create policy mensajes_select_participantes on public.mensajes
  for select to authenticated
  using (
    public.es_participante_del_pedido(pedido_id)
    and not public.hay_bloqueo(auth.uid(), autor_id)
  );

drop policy if exists mensajes_insert_participantes on public.mensajes;
create policy mensajes_insert_participantes on public.mensajes
  for insert to authenticated
  with check (
    autor_id = auth.uid()
    and public.es_participante_del_pedido(pedido_id)
    and not public.hay_bloqueo(auth.uid(), public.contraparte_del_pedido(pedido_id))
  );

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
     and not public.hay_bloqueo(auth.uid(), m.autor_id)
     and (pe.cliente_id = auth.uid() or t.dueno_id = auth.uid())
   group by m.pedido_id;
$$;

revoke all on function public.mensajes_sin_leer() from public;
grant execute on function public.mensajes_sin_leer() to authenticated;

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
          and m.autor_id <> auth.uid()
          and not public.hay_bloqueo(auth.uid(), m.autor_id)),
      0
    )::bigint as sin_leer
  from public.pedidos pe
  join public.tiendas  t on t.id = pe.tienda_id
  join public.usuarios u on u.id = pe.cliente_id
  where t.dueno_id = auth.uid()
  order by pe.created_at desc;
$$;

comment on function public.pedidos_de_mi_tienda() is
  'Pedidos de la tienda del usuario. Sin contacto del cliente y con la dirección oculta hasta confirmar. Excluye mensajes de usuarios bloqueados.';

revoke all on function public.pedidos_de_mi_tienda() from public;
grant execute on function public.pedidos_de_mi_tienda() to authenticated;

notify pgrst, 'reload schema';
