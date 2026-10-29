create or replace function public.admin_aprobar_tienda(
  p_tienda_id uuid,
  p_aprobar   boolean default true
)
returns void
language plpgsql
security definer
set search_path = public
as $$begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede aprobar tiendas.';
  end if;

  if p_tienda_id is null then
    raise exception 'Falta el id de la tienda.';
  end if;

  if p_aprobar then
    update public.tiendas
       set aprobada     = true,
           prueba_hasta = now() + interval '30 days'
     where id = p_tienda_id;
  else
    update public.tiendas
       set aprobada = false
     where id = p_tienda_id;
  end if;

  if not found then
    raise exception 'No existe la tienda %', p_tienda_id;
  end if;
end;
$$;

comment on function public.admin_aprobar_tienda(uuid, boolean) is
  'Aprobar (true) o rechazar (false) una tienda. Al aprobar, reinicia la prueba de 30 días. Solo admin.';

revoke all on function public.admin_aprobar_tienda(uuid, boolean) from public;
grant execute on function public.admin_aprobar_tienda(uuid, boolean) to authenticated;

create or replace function public.admin_marcar_fundadora(
  p_tienda_id uuid,
  p_marcar    boolean default true
)
returns void
language plpgsql
security definer
set search_path = public
as $$declare
  v_ya_es      boolean;
  v_marcadas   integer;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede cambiar el precio de fundador.';
  end if;

  if p_tienda_id is null then
    raise exception 'Falta el id de la tienda.';
  end if;

  select t.es_fundador into v_ya_es
    from public.tiendas t
   where t.id = p_tienda_id;

  if v_ya_es is null then
    raise exception 'No existe la tienda %', p_tienda_id;
  end if;

  if p_marcar then
    if v_ya_es then
      return;
    end if;

    select count(*) into v_marcadas
      from public.tiendas
     where es_fundador;

    if v_marcadas >= 25 then
      raise exception 'Ya hay 25 tiendas fundadoras marcadas (tope alcanzado).';
    end if;

    update public.tiendas
       set es_fundador    = true,
           fundador_hasta = now() + interval '12 months'
     where id = p_tienda_id;
  else
    update public.tiendas
       set es_fundador    = false,
           fundador_hasta = null
     where id = p_tienda_id;
  end if;
end;
$$;

comment on function public.admin_marcar_fundadora(uuid, boolean) is
  'Marcar/desmarcar una tienda como fundadora (RD$100/mes, 12 meses, tope 25). Solo admin.';

revoke all on function public.admin_marcar_fundadora(uuid, boolean) from public;
grant execute on function public.admin_marcar_fundadora(uuid, boolean) to authenticated;

create or replace function public.admin_listar_tiendas()
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
    t.created_at
  from public.tiendas t
  join public.usuarios u on u.id = t.dueno_id
  where public.es_admin()
  order by t.aprobada asc, t.created_at desc;
$$;

comment on function public.admin_listar_tiendas() is
  'Todas las tiendas con su dueño y estado de suscripción. Devuelve vacío si no sos admin.';

revoke all on function public.admin_listar_tiendas() from public;
grant execute on function public.admin_listar_tiendas() to authenticated;

notify pgrst, 'reload schema';
