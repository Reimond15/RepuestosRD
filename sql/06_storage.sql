insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos', 'productos', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.es_dueno_de_producto(p_producto_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$  select exists (
    select 1
      from public.productos p
      join public.tiendas t on t.id = p.tienda_id
     where p.id = p_producto_id
       and t.dueno_id = auth.uid()
  );
$$;

create or replace function public.uuid_de_la_ruta(ruta text)
returns uuid
language plpgsql
immutable
as $$begin
  return (split_part(rtrim(ruta, '/'), '/'))::uuid;
exception when others then
  return null;
end;
$$;

grant execute on function public.es_dueno_de_producto(uuid) to authenticated;

drop policy if exists "productos bucket: leer" on storage.objects;
create policy "productos bucket: leer" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'productos');

drop policy if exists "productos bucket: subir" on storage.objects;
create policy "productos bucket: subir" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'productos'
    and public.es_dueno_de_producto(public.uuid_de_la_ruta(name))
  );

drop policy if exists "productos bucket: renombrar" on storage.objects;
create policy "productos bucket: renombrar" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'productos'
    and public.es_dueno_de_producto(public.uuid_de_la_ruta(name))
  )
  with check (
    bucket_id = 'productos'
    and public.es_dueno_de_producto(public.uuid_de_la_ruta(name))
  );

drop policy if exists "productos bucket: borrar" on storage.objects;
create policy "productos bucket: borrar" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'productos'
    and public.es_dueno_de_producto(public.uuid_de_la_ruta(name))
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "logos bucket: subir" on storage.objects;
create policy "logos bucket: subir" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logos bucket: borrar" on storage.objects;
create policy "logos bucket: borrar" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
