revoke all on public.calificaciones from anon;

grant select (producto_id, estrellas, comentario, created_at, id)
  on public.calificaciones
  to anon;

create or replace function public.guardar_aprobacion_tienda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  if auth.uid() is not null and not public.es_admin() then
    if tg_op = 'INSERT' then
      new.aprobada       := false;
      new.prueba_hasta   := now() + interval '30 days';
      new.pago_hasta     := null;
      new.es_fundador    := false;
      new.fundador_hasta := null;
    else
      if new.aprobada is distinct from old.aprobada then
        raise exception 'Solo un administrador puede aprobar una tienda.';
      end if;

      if new.pago_hasta       is distinct from old.pago_hasta
         or new.prueba_hasta  is distinct from old.prueba_hasta
         or new.es_fundador   is distinct from old.es_fundador
         or new.fundador_hasta is distinct from old.fundador_hasta then
        raise exception 'Solo un administrador puede cambiar la suscripcion de una tienda.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guardar_aprobacion_tienda on public.tiendas;
create trigger trg_guardar_aprobacion_tienda
  before insert or update on public.tiendas
  for each row execute function public.guardar_aprobacion_tienda();

drop policy if exists productos_select_public on public.productos;
create policy productos_select_public on public.productos
  for select to anon, authenticated
  using (
    activo
    and exists (
      select 1 from public.tiendas t
       where t.id = productos.tienda_id
         and t.aprobada
    )
    and public.tienda_vigente(productos.tienda_id)
  );

drop policy if exists compatibilidad_select_public on public.compatibilidad;
create policy compatibilidad_select_public on public.compatibilidad
  for select to anon, authenticated
  using (exists (
    select 1
      from public.productos p
      join public.tiendas t on t.id = p.tienda_id
     where p.id = compatibilidad.producto_id
       and p.activo
       and t.aprobada
       and public.tienda_vigente(t.id)
  ));

notify pgrst, 'reload schema';
