create or replace function public.contar_tiendas_publicas()
returns integer
language sql
stable
security definer
set search_path = public
as $$  select count(*)::integer
    from public.tiendas t
   where t.aprobada;
$$;

comment on function public.contar_tiendas_publicas() is
  'Cantidad de tiendas aprobadas para el contador de la portada. Solo devuelve un número.';

revoke all on function public.contar_tiendas_publicas() from public;
grant execute on function public.contar_tiendas_publicas() to anon, authenticated;

select public.contar_tiendas_publicas() as tiendas_aprobadas;
