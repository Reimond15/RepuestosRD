create or replace function public.es_cliente_del_pedido(p_pedido_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$  select exists (
    select 1 from public.pedidos pe
     where pe.id = p_pedido_id
       and pe.cliente_id = auth.uid()
  );
$$;

comment on function public.es_cliente_del_pedido(uuid) is
  'true si el pedido pertenece al usuario actual. Salta RLS (security definer).';

revoke all on function public.es_cliente_del_pedido(uuid) from public;
grant execute on function public.es_cliente_del_pedido(uuid) to authenticated;

create or replace function public.puede_ver_pedido(p_pedido_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$  select exists (
    select 1
      from public.pedidos pe
      join public.tiendas t on t.id = pe.tienda_id
     where pe.id = p_pedido_id
       and (
         pe.cliente_id = auth.uid()
         or t.dueno_id = auth.uid()
         or public.es_admin()
       )
  );
$$;

comment on function public.puede_ver_pedido(uuid) is
  'true si el usuario es el cliente, el dueño de la tienda o admin. Salta RLS.';

revoke all on function public.puede_ver_pedido(uuid) from public;
grant execute on function public.puede_ver_pedido(uuid) to authenticated;

create or replace function public.puede_agregar_linea(
  p_pedido_id  uuid,
  p_producto_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$  select exists (
    select 1
      from public.pedidos pe
      join public.tiendas  t  on t.id = pe.tienda_id
      join public.productos pr on pr.id = p_producto_id
     where pe.id = p_pedido_id
       and pe.cliente_id = auth.uid()
       and pe.estado in ('pendiente', 'confirmado')
       and t.aprobada
       and public.tienda_vigente(t.id)
       and pr.activo
       and pr.tienda_id = pe.tienda_id
  );
$$;

comment on function public.puede_agregar_linea(uuid, uuid) is
  'true si el usuario puede agregar esa línea al pedido (cliente, pedido abierto, producto de la tienda aprobada y vigente). Salta RLS.';

revoke all on function public.puede_agregar_linea(uuid, uuid) from public;
grant execute on function public.puede_agregar_linea(uuid, uuid) to authenticated;

drop policy if exists detalle_select_involved on public.detalle_pedido;
create policy detalle_select_involved on public.detalle_pedido
  for select to authenticated
  using (public.puede_ver_pedido(detalle_pedido.pedido_id));

drop policy if exists detalle_insert_cliente on public.detalle_pedido;
create policy detalle_insert_cliente on public.detalle_pedido
  for insert to authenticated
  with check (public.puede_agregar_linea(detalle_pedido.pedido_id, detalle_pedido.producto_id));

drop policy if exists detalle_delete_cliente on public.detalle_pedido;
create policy detalle_delete_cliente on public.detalle_pedido
  for delete to authenticated
  using (
    public.es_cliente_del_pedido(detalle_pedido.pedido_id)
    and exists (
      select 1 from public.pedidos pe
       where pe.id = detalle_pedido.pedido_id
         and pe.estado = 'pendiente'
    )
  );

drop policy if exists detalle_update_admin on public.detalle_pedido;
create policy detalle_update_admin on public.detalle_pedido
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());
