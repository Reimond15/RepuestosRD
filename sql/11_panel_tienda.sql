create or replace function public.pedidos_de_mi_tienda()
returns table (
  id               uuid,
  cliente_id       uuid,
  tienda_id        uuid,
  entrega          text,
  direccion        text,
  forma_pago       text,
  estado           text,
  total            numeric,
  notas            text,
  created_at       timestamptz,
  cliente_nombre   text,
  cliente_telefono text,
  cliente_email    text
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
    pe.direccion,
    pe.forma_pago::text,
    pe.estado::text,
    pe.total,
    pe.notas,
    pe.created_at,
    u.nombre  as cliente_nombre,
    u.telefono as cliente_telefono,
    u.email   as cliente_email
  from public.pedidos pe
  join public.tiendas t on t.id = pe.tienda_id
  join public.usuarios u on u.id = pe.cliente_id
  where t.dueno_id = auth.uid()
  order by pe.created_at desc;
$$;

comment on function public.pedidos_de_mi_tienda() is
  'Pedidos de la tienda del usuario autenticado, con el contacto del cliente.';

revoke all on function public.pedidos_de_mi_tienda() from public;
grant execute on function public.pedidos_de_mi_tienda() to authenticated;
