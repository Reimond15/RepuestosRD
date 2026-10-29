alter table public.usuarios       enable row level security;
alter table public.tiendas        enable row level security;
alter table public.categorias     enable row level security;
alter table public.tipos_repuesto enable row level security;
alter table public.productos      enable row level security;
alter table public.compatibilidad enable row level security;
alter table public.pedidos        enable row level security;
alter table public.detalle_pedido enable row level security;
alter table public.calificaciones enable row level security;

drop policy if exists usuarios_select_own on public.usuarios;
create policy usuarios_select_own on public.usuarios
  for select to authenticated
  using (id = auth.uid() or public.es_admin());

drop policy if exists usuarios_update_own on public.usuarios;
create policy usuarios_update_own on public.usuarios
  for update to authenticated
  using (id = auth.uid() or public.es_admin())
  with check (id = auth.uid() or public.es_admin());

drop policy if exists tiendas_select_public on public.tiendas;
create policy tiendas_select_public on public.tiendas
  for select to anon, authenticated
  using (aprobada or dueno_id = auth.uid() or public.es_admin());

drop policy if exists tiendas_insert_own on public.tiendas;
create policy tiendas_insert_own on public.tiendas
  for insert to authenticated
  with check (dueno_id = auth.uid());

drop policy if exists tiendas_update_own on public.tiendas;
create policy tiendas_update_own on public.tiendas
  for update to authenticated
  using (dueno_id = auth.uid() or public.es_admin())
  with check (dueno_id = auth.uid() or public.es_admin());

drop policy if exists categorias_select_public on public.categorias;
create policy categorias_select_public on public.categorias
  for select to anon, authenticated
  using (true);

drop policy if exists categorias_write_admin on public.categorias;
create policy categorias_write_admin on public.categorias
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

drop policy if exists tipos_select_public on public.tipos_repuesto;
create policy tipos_select_public on public.tipos_repuesto
  for select to anon, authenticated
  using (true);

drop policy if exists tipos_write_admin on public.tipos_repuesto;
create policy tipos_write_admin on public.tipos_repuesto
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

drop policy if exists productos_select_public on public.productos;
create policy productos_select_public on public.productos
  for select to anon, authenticated
  using (activo and exists (
    select 1 from public.tiendas t
     where t.id = productos.tienda_id and t.aprobada
  ));

drop policy if exists productos_select_propios on public.productos;
create policy productos_select_propios on public.productos
  for select to authenticated
  using (exists (select 1 from public.tiendas t
                  where t.id = productos.tienda_id
                    and t.dueno_id = auth.uid()));

drop policy if exists productos_select_admin on public.productos;
create policy productos_select_admin on public.productos
  for select to authenticated
  using (public.es_admin());

drop policy if exists productos_insert_own on public.productos;
create policy productos_insert_own on public.productos
  for insert to authenticated
  with check (
    exists (select 1 from public.tiendas t
             where t.id = productos.tienda_id
               and t.dueno_id = auth.uid())
  );

drop policy if exists productos_update_own on public.productos;
create policy productos_update_own on public.productos
  for update to authenticated
  using (exists (select 1 from public.tiendas t
                  where t.id = productos.tienda_id
                    and t.dueno_id = auth.uid())
         or public.es_admin())
  with check (exists (select 1 from public.tiendas t
                       where t.id = productos.tienda_id
                         and t.dueno_id = auth.uid())
              or public.es_admin());

drop policy if exists productos_delete_own on public.productos;
create policy productos_delete_own on public.productos
  for delete to authenticated
  using (exists (select 1 from public.tiendas t
                  where t.id = productos.tienda_id
                    and t.dueno_id = auth.uid())
         or public.es_admin());

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
  ));

drop policy if exists compatibilidad_write_own on public.compatibilidad;
create policy compatibilidad_write_own on public.compatibilidad
  for all to authenticated
  using (exists (
    select 1
      from public.productos p
      join public.tiendas t on t.id = p.tienda_id
     where p.id = compatibilidad.producto_id
       and t.dueno_id = auth.uid()
  ))
  with check (exists (
    select 1
      from public.productos p
      join public.tiendas t on t.id = p.tienda_id
     where p.id = compatibilidad.producto_id
       and t.dueno_id = auth.uid()
  ));

drop policy if exists pedidos_select_involved on public.pedidos;
create policy pedidos_select_involved on public.pedidos
  for select to authenticated
  using (
    cliente_id = auth.uid()
    or exists (select 1 from public.tiendas t
                where t.id = pedidos.tienda_id
                  and t.dueno_id = auth.uid())
    or public.es_admin()
  );

drop policy if exists pedidos_insert_own_cliente on public.pedidos;
create policy pedidos_insert_own_cliente on public.pedidos
  for insert to authenticated
  with check (cliente_id = auth.uid());

drop policy if exists pedidos_update_involved on public.pedidos;
create policy pedidos_update_involved on public.pedidos
  for update to authenticated
  using (
    exists (select 1 from public.tiendas t
             where t.id = pedidos.tienda_id
               and t.dueno_id = auth.uid())
    or public.es_admin()
  )
  with check (
    exists (select 1 from public.tiendas t
             where t.id = pedidos.tienda_id
               and t.dueno_id = auth.uid())
    or public.es_admin()
  );

drop policy if exists pedidos_delete_admin on public.pedidos;
create policy pedidos_delete_admin on public.pedidos
  for delete to authenticated
  using (public.es_admin());

drop policy if exists detalle_select_involved on public.detalle_pedido;
create policy detalle_select_involved on public.detalle_pedido
  for select to authenticated
  using (exists (
    select 1 from public.pedidos pe
     where pe.id = detalle_pedido.pedido_id
       and (pe.cliente_id = auth.uid()
            or exists (select 1 from public.tiendas t
                        where t.id = pe.tienda_id
                          and t.dueno_id = auth.uid())
            or public.es_admin())
  ));

drop policy if exists detalle_insert_cliente on public.detalle_pedido;
create policy detalle_insert_cliente on public.detalle_pedido
  for insert to authenticated
  with check (exists (
    select 1 from public.pedidos pe
     where pe.id = detalle_pedido.pedido_id
       and pe.cliente_id = auth.uid()
       and pe.estado in ('pendiente', 'confirmado')
       and exists (select 1 from public.tiendas t
                    where t.id = pe.tienda_id and t.aprobada)
       and exists (select 1 from public.productos pr
                    where pr.id = detalle_pedido.producto_id
                      and pr.activo
                      and pr.tienda_id = pe.tienda_id)
  ));

drop policy if exists detalle_update_admin on public.detalle_pedido;
create policy detalle_update_admin on public.detalle_pedido
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists detalle_delete_cliente on public.detalle_pedido;
create policy detalle_delete_cliente on public.detalle_pedido
  for delete to authenticated
  using (exists (
    select 1 from public.pedidos pe
     where pe.id = detalle_pedido.pedido_id
       and pe.cliente_id = auth.uid()
       and pe.estado = 'pendiente'
  ));

drop policy if exists calificaciones_select_public on public.calificaciones;
create policy calificaciones_select_public on public.calificaciones
  for select to anon, authenticated
  using (true);

drop policy if exists calificaciones_insert_own on public.calificaciones;
create policy calificaciones_insert_own on public.calificaciones
  for insert to authenticated
  with check (cliente_id = auth.uid());

drop policy if exists calificaciones_update_own on public.calificaciones;
create policy calificaciones_update_own on public.calificaciones
  for update to authenticated
  using (cliente_id = auth.uid())
  with check (cliente_id = auth.uid());

drop policy if exists calificaciones_delete_own on public.calificaciones;
create policy calificaciones_delete_own on public.calificaciones
  for delete to authenticated
  using (cliente_id = auth.uid() or public.es_admin());

grant usage on schema public to anon, authenticated;

grant select on
  public.vista_calificaciones_producto,
  public.vista_calificaciones_tienda,
  public.productos_mas_vendidos,
  public.productos_mejor_calificados,
  public.catalogo_productos,
  public.resenas_producto,
  public.categorias,
  public.tipos_repuesto
to anon, authenticated;

grant select, insert, update on
  public.usuarios
to authenticated;

grant select, insert, update on
  public.tiendas
to authenticated;

grant select, insert, update, delete on
  public.productos,
  public.compatibilidad
to authenticated;

grant select, insert, update on
  public.pedidos
to authenticated;

grant select, insert, update, delete on
  public.detalle_pedido
to authenticated;

grant select, insert, update, delete on
  public.calificaciones
to authenticated;

grant select (producto_id, estrellas, comentario, created_at)
  on public.calificaciones
to anon;

grant execute on function public.es_admin()   to anon, authenticated;
grant execute on function public.mi_tienda_id() to authenticated;
grant execute on function public.manejar_nuevo_usuario() to service_role;
