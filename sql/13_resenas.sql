drop view if exists public.resenas_producto cascade;
create view public.resenas_producto
with (security_invoker = true)
as
select
  c.producto_id,
  c.estrellas,
  c.comentario,
  c.created_at
from public.calificaciones c;

comment on view public.resenas_producto is
  'Resenas de un producto (sin datos del cliente). Filtro: where producto_id = <uuid>.';

grant select on public.resenas_producto
to anon, authenticated;

grant select (producto_id, estrellas, comentario, created_at)
  on public.calificaciones
to anon;

drop policy if exists calificaciones_select_public on public.calificaciones;
create policy calificaciones_select_public on public.calificaciones
  for select to anon, authenticated
  using (true);
