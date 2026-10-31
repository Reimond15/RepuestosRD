alter table public.tiendas
  add column if not exists representante text;

comment on column public.tiendas.representante is
  'Persona de contacto de la tienda. Se pide en el registro; si falta, se usa el nombre del dueno.';

create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rol text;
  v_nombre text;
  v_telefono text;
  v_representante text;
begin
  v_rol := case
             when new.raw_user_meta_data ->> 'rol' = 'tienda' then 'tienda'
             else 'cliente'
           end;

  v_nombre := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'nombre'), ''),
    split_part(new.email, '@', 1)
  );
  v_telefono := nullif(btrim(new.raw_user_meta_data ->> 'telefono'), '');
  v_representante := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'representante'), ''),
    v_nombre
  );

  if v_telefono is null
     and (new.raw_user_meta_data ->> 'rol') is not null then
    raise exception 'El telefono es obligatorio para crear la cuenta.';
  end if;

  insert into public.usuarios (id, nombre, telefono, email, rol)
  values (new.id, v_nombre, v_telefono, new.email, v_rol)
  on conflict (id) do update
    set nombre   = excluded.nombre,
        telefono = excluded.telefono,
        email    = excluded.email;

  if v_rol = 'tienda' then
    insert into public.tiendas (dueno_id, nombre, direccion, representante)
    values (
      new.id,
      coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'nombre_tienda'), ''),
        'Tienda de ' || split_part(new.email, '@', 1)
      ),
      nullif(new.raw_user_meta_data ->> 'direccion', ''),
      v_representante
    )
    on conflict (dueno_id) do update
      set representante = coalesce(public.tiendas.representante, excluded.representante);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_nuevo_usuario on auth.users;
create trigger trg_nuevo_usuario
  after insert on auth.users
  for each row execute function public.manejar_nuevo_usuario();

update public.tiendas t
   set representante = u.nombre
  from public.usuarios u
 where u.id = t.dueno_id
   and t.representante is null;

create or replace function public.admin_listar_contactos_tiendas()
returns table (
  tienda_id     uuid,
  tienda        text,
  representante text,
  telefono      text,
  correo        text,
  aprobada      boolean,
  created_at    timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.id                                as tienda_id,
    t.nombre                            as tienda,
    coalesce(t.representante, u.nombre) as representante,
    u.telefono,
    u.email                             as correo,
    t.aprobada,
    t.created_at
  from public.tiendas t
  join public.usuarios u on u.id = t.dueno_id
  where public.es_admin()
    and t.dueno_id is distinct from public.cuenta_fantasma_id()
  order by t.aprobada desc, t.nombre asc;
$$;

comment on function public.admin_listar_contactos_tiendas() is
  'Contactos de las tiendas (nombre, representante y telefono) para el administrador. Devuelve vacio si no sos admin.';

revoke all on function public.admin_listar_contactos_tiendas() from public;
grant execute on function public.admin_listar_contactos_tiendas() to authenticated;

notify pgrst, 'reload schema';
