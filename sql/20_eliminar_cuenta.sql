create table if not exists public.solicitudes_eliminacion (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios (id) on delete set null,
  email      text not null,
  motivo     text,
  estado     text not null default 'pendiente'
               check (estado in ('pendiente', 'en_proceso', 'completada')),
  created_at timestamptz not null default now(),
  resuelto_en timestamptz
);

comment on table public.solicitudes_eliminacion is
  'Pedidos de eliminación de cuenta (requisito de Google Play). Las cierra el admin.';

create index if not exists solicitudes_eliminacion_idx
  on public.solicitudes_eliminacion (created_at desc);
create index if not exists solicitudes_eliminacion_pendientes_idx
  on public.solicitudes_eliminacion (estado) where estado <> 'completada';

alter table public.solicitudes_eliminacion enable row level security;

drop policy if exists solicitudes_eliminacion_select on public.solicitudes_eliminacion;
create policy solicitudes_eliminacion_select on public.solicitudes_eliminacion
  for select to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

drop policy if exists solicitudes_eliminacion_insert on public.solicitudes_eliminacion;
create policy solicitudes_eliminacion_insert on public.solicitudes_eliminacion
  for insert to authenticated
  with check (usuario_id = auth.uid() or public.es_admin());

drop policy if exists solicitudes_eliminacion_update_admin on public.solicitudes_eliminacion;
create policy solicitudes_eliminacion_update_admin on public.solicitudes_eliminacion
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

revoke all on public.solicitudes_eliminacion from anon, authenticated;
grant select, insert, update on public.solicitudes_eliminacion to authenticated;

drop function if exists public.solicitar_eliminacion_cuenta(text);

create function public.solicitar_eliminacion_cuenta(p_motivo text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_id    uuid;
begin
  if v_uid is null then
    raise exception 'Tenés que iniciar sesión para pedir la eliminación de tu cuenta.';
  end if;

  select email into v_email from public.usuarios where id = v_uid;

  if v_email is null then
    raise exception 'No encontramos tu cuenta.';
  end if;

  select id into v_id
    from public.solicitudes_eliminacion
   where usuario_id = v_uid
     and estado <> 'completada'
   order by created_at desc
   limit 1;

  if v_id is not null then
    return v_id;
  end if;

  delete from public.mensajes       where autor_id   = v_uid;
  delete from public.calificaciones where cliente_id = v_uid;

  delete from public.tiendas_ubicacion tu
    using public.tiendas t
   where tu.tienda_id = t.id
     and t.dueno_id = v_uid;

  update public.usuarios set telefono = null where id = v_uid;

  insert into public.solicitudes_eliminacion (usuario_id, email, motivo)
  values (v_uid, v_email, nullif(btrim(coalesce(p_motivo, '')), ''))
  returning id into v_id;

  return v_id;
end $$;

comment on function public.solicitar_eliminacion_cuenta(text) is
  'Registra el pedido de eliminación de cuenta del usuario actual y borra de inmediato sus datos personales no esenciales.';

revoke all on function public.solicitar_eliminacion_cuenta(text) from public;
grant execute on function public.solicitar_eliminacion_cuenta(text) to authenticated;

notify pgrst, 'reload schema';
