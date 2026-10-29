do $$begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'tiendas'
       and column_name  = 'es_fundador'
  ) then
    alter table public.tiendas
      add column es_fundador boolean not null default false;
  end if;

  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'tiendas'
       and column_name  = 'fundador_hasta'
  ) then
    alter table public.tiendas
      add column fundador_hasta timestamptz null;
  end if;
end $$;

comment on column public.tiendas.es_fundador is
  'true si la tienda es de las primeras 25 y cobra RD$100/mes durante 12 meses.';
comment on column public.tiendas.fundador_hasta is
  'fecha hasta la cual aplica el precio de fundador. null si no aplica.';

drop function if exists public.mi_suscripcion();

create function public.mi_suscripcion()
returns table (
  estado                text,
  dias_restantes        integer,
  dias_gracia           integer,
  vence_en              timestamptz,
  disponible_hasta      timestamptz,
  prueba_hasta          timestamptz,
  pago_hasta            timestamptz,
  es_fundador           boolean,
  fundador_hasta        timestamptz,
  precio_fundador_vigente boolean
)
language sql
stable
security definer
set search_path = public
as $$  with t as (
    select
      ti.prueba_hasta,
      ti.pago_hasta,
      ti.es_fundador,
      ti.fundador_hasta,
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
    pago_hasta,
    es_fundador,
    fundador_hasta,
    (es_fundador and fundador_hasta is not null and now() < fundador_hasta) as precio_fundador_vigente
  from t;
$$;

comment on function public.mi_suscripcion() is
  'Estado de la suscripción de la tienda (o admin). Incluye info de precio fundador.';

revoke all on function public.mi_suscripcion() from public;
grant execute on function public.mi_suscripcion() to authenticated;

notify pgrst, 'reload schema';
