do $$declare
  v_email  text := 'eliminado@repuestosrd.invalid';
  v_id     uuid;
  v_existe boolean;
begin
  select id into v_id from auth.users where email = v_email;

  if v_id is null then
    v_id := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    )
    values (
      v_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt(gen_random_uuid()::text || gen_random_uuid()::text, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nombre":"Cuenta eliminada","rol":"cliente"}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    );

    raise notice 'Cuenta fantasma creada: % (%)', v_email, v_id;
  else
    raise notice 'Cuenta fantasma ya existía: % (%)', v_email, v_id;
  end if;

  insert into public.usuarios (id, email, nombre, rol)
  values (v_id, v_email, 'Cuenta eliminada', 'cliente')
  on conflict (id) do update
    set rol = 'cliente';

  update public.usuarios set rol = 'cliente' where id = v_id;
end $$;

do $$declare
  v_fantasma uuid;
  v_tienda   uuid;
begin
  select id into v_fantasma
    from auth.users
   where email = 'eliminado@repuestosrd.invalid'
   limit 1;

  if v_fantasma is null then
    raise exception 'Falta la cuenta fantasma (Paso 1).';
  end if;

  select id into v_tienda
    from public.tiendas
   where dueno_id = v_fantasma;

  if v_tienda is null then
    insert into public.tiendas (dueno_id, nombre, aprobada)
    values (v_fantasma, 'Tienda cerrada', false)
    on conflict (dueno_id) do nothing;
    raise notice 'Tienda fantasma creada para %', v_fantasma;
  else
    update public.tiendas
       set nombre = 'Tienda cerrada', aprobada = false, verificada = false
     where id = v_tienda;
  end if;
end $$;

create or replace function public.cuenta_fantasma_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$  select id from public.usuarios
   where email = 'eliminado@repuestosrd.invalid'
   limit 1;
$$;

comment on function public.cuenta_fantasma_id() is
  'UUID de la cuenta que recibe los pedidos de usuarios eliminados.';

revoke all on function public.cuenta_fantasma_id() from public;
grant execute on function public.cuenta_fantasma_id() to authenticated;

create or replace function public.cuenta_fantasma_tienda_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$  select t.id
    from public.tiendas t
    join public.usuarios u on u.id = t.dueno_id
   where u.email = 'eliminado@repuestosrd.invalid'
   limit 1;
$$;

comment on function public.cuenta_fantasma_tienda_id() is
  'UUID de la tienda cerrada que recibe los pedidos de tiendas eliminadas.';

revoke all on function public.cuenta_fantasma_tienda_id() from public;
grant execute on function public.cuenta_fantasma_tienda_id() to authenticated;

drop function if exists public.admin_listar_eliminaciones();

create function public.admin_listar_eliminaciones()
returns table (
  id             uuid,
  usuario_id     uuid,
  email          text,
  motivo         text,
  estado         text,
  created_at     timestamptz,
  resuelto_en    timestamptz,
  es_tienda      boolean,
  tienda         text,
  pedidos        bigint,
  tiene_backup   boolean
)
language sql
stable
security definer
set search_path = public
as $$  select
    s.id,
    s.usuario_id,
    s.email,
    s.motivo,
    s.estado,
    s.created_at,
    s.resuelto_en,
    (t.id is not null)                        as es_tienda,
    t.nombre                                  as tienda,
    (select count(*) from public.pedidos p where p.cliente_id = s.usuario_id) as pedidos,
    exists (select 1 from auth.users au where au.id = s.usuario_id) as tiene_backup
  from public.solicitudes_eliminacion s
  left join public.tiendas t on t.dueno_id = s.usuario_id
  where public.es_admin()
  order by
    case s.estado when 'pendiente' then 0 when 'en_proceso' then 1 else 2 end,
    s.created_at desc;
$$;

comment on function public.admin_listar_eliminaciones() is
  'Solicitudes de eliminación de cuenta con el contexto para cerrarlas. Solo admin.';

revoke all on function public.admin_listar_eliminaciones() from public;
grant execute on function public.admin_listar_eliminaciones() to authenticated;

drop function if exists public.admin_marcar_eliminacion_completada(uuid);

create function public.admin_marcar_eliminacion_completada(p_solicitud_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede cerrar solicitudes de eliminación.';
  end if;

  update public.solicitudes_eliminacion
     set estado      = 'completada',
         resuelto_en = now()
   where id = p_solicitud_id;
end $$;

comment on function public.admin_marcar_eliminacion_completada(uuid) is
  'Marca una solicitud de eliminación como completada. Solo admin.';

revoke all on function public.admin_marcar_eliminacion_completada(uuid) from public;
grant execute on function public.admin_marcar_eliminacion_completada(uuid) to authenticated;

drop function if exists public.admin_preparar_eliminacion(uuid);

create function public.admin_preparar_eliminacion(p_usuario_id uuid)
returns table (
  tienda_anonimizada boolean,
  productos_reasignados integer,
  pedidos_reasignados integer
)
language plpgsql
security definer
set search_path = public
as $$declare
  v_fantasma        uuid;
  v_tienda_fantasma uuid;
  v_tienda_id       uuid;
  v_productos       integer := 0;
  v_pedidos         integer := 0;
  v_anon            boolean := false;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede preparar una eliminación.';
  end if;

  if p_usuario_id is null then
    raise exception 'Falta el id del usuario.';
  end if;

  if p_usuario_id = auth.uid() then
    raise exception 'No podés eliminar tu propia cuenta de administrador desde acá.';
  end if;

  select public.cuenta_fantasma_id() into v_fantasma;
  if v_fantasma is null then
    raise exception 'No existe la cuenta fantasma. Corré primero la migración 30.';
  end if;

  if p_usuario_id = v_fantasma then
    raise exception 'Esa es la cuenta fantasma: no se puede eliminar.';
  end if;

  select public.cuenta_fantasma_tienda_id() into v_tienda_fantasma;
  if v_tienda_fantasma is null then
    raise exception 'No existe la tienda fantasma. Corré primero la migración 30.';
  end if;

  select t.id into v_tienda_id from public.tiendas t where t.dueno_id = p_usuario_id;

  if v_tienda_id is not null then
    update public.tiendas
       set nombre     = 'Tienda cerrada',
           logo_url   = null,
           zonas      = '{}',
           aprobada   = false,
           verificada = false
     where id = v_tienda_id;
    v_anon := true;

    update public.productos
       set tienda_id = v_tienda_fantasma
     where tienda_id = v_tienda_id;
    get diagnostics v_productos = row_count;

    update public.pedidos
       set tienda_id = v_tienda_fantasma
     where tienda_id = v_tienda_id;

    delete from public.tiendas_ubicacion where tienda_id = v_tienda_id;
  end if;

  delete from public.calificaciones where cliente_id = p_usuario_id;

  update public.pedidos
     set cliente_id = v_fantasma
   where cliente_id = p_usuario_id;
  get diagnostics v_pedidos = row_count;

  delete from public.mensajes       where autor_id     = p_usuario_id;
  delete from public.bloqueos       where bloqueador_id = p_usuario_id
                                       or bloqueado_id  = p_usuario_id;
  update public.usuarios
     set nombre = 'Cuenta eliminada', telefono = null
   where id = p_usuario_id;

  return query select v_anon, v_productos, v_pedidos;
end $$;

comment on function public.admin_preparar_eliminacion(uuid) is
  'Anonimiza la tienda, borra sus productos y reasigna pedidos a la cuenta fantasma. Solo admin. NO borra la cuenta (eso lo hace la Edge Function).';

revoke all on function public.admin_preparar_eliminacion(uuid) from public;
grant execute on function public.admin_preparar_eliminacion(uuid) to authenticated;

do $$declare
  v_constraint text;
begin
  select con.conname into v_constraint
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
   where rel.relname = 'solicitudes_eliminacion'
     and con.contype = 'c'
     and pg_get_constraintdef(con.oid) like '%estado%';

  if v_constraint is not null then
    execute format('alter table public.solicitudes_eliminacion drop constraint %I', v_constraint);
  end if;

  alter table public.solicitudes_eliminacion
    add constraint solicitudes_eliminacion_estado_check
    check (estado in ('pendiente', 'en_proceso', 'completada'));
end $$;

notify pgrst, 'reload schema';
