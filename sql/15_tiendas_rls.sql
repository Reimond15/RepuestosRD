drop policy if exists tiendas_select_public on public.tiendas;
create policy tiendas_select_public on public.tiendas
  for select to anon, authenticated
  using (aprobada or dueno_id = auth.uid() or public.es_admin());
