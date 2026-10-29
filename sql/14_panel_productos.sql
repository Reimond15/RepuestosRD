drop policy if exists productos_select_propios on public.productos;
create policy productos_select_propios on public.productos
  for select to authenticated
  using (exists (
    select 1
      from public.tiendas t
     where t.id = productos.tienda_id
       and t.dueno_id = auth.uid()
  ));

drop policy if exists productos_select_admin on public.productos;
create policy productos_select_admin on public.productos
  for select to authenticated
  using (public.es_admin());
