create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$declare
  v_rol text;
begin
  v_rol := case
             when new.raw_user_meta_data ->> 'rol' = 'tienda' then 'tienda'
             else 'cliente'
           end;

  insert into public.usuarios (id, nombre, telefono, email, rol)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nombre'), ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'telefono', ''),
    new.email,
    v_rol
  )
  on conflict (id) do update
    set nombre   = excluded.nombre,
        telefono = excluded.telefono,
        email    = excluded.email;

  if v_rol = 'tienda' then
    insert into public.tiendas (dueno_id, nombre, direccion)
    values (
      new.id,
      coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nombre_tienda'), ''), 'Tienda de ' || split_part(new.email, '@', 1)),
      nullif(new.raw_user_meta_data ->> 'direccion', '')
    )
    on conflict (dueno_id) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.guardar_rol_usuarios()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  if auth.uid() is not null
     and new.rol is distinct from old.rol
     and not public.es_admin() then
    raise exception 'Solo un administrador puede cambiar el rol.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guardar_rol_usuarios on public.usuarios;
create trigger trg_guardar_rol_usuarios
  before update of rol on public.usuarios
  for each row execute function public.guardar_rol_usuarios();

create or replace function public.guardar_aprobacion_tienda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  if auth.uid() is not null
     and new.aprobada is distinct from old.aprobada
     and not public.es_admin() then
    raise exception 'Solo un administrador puede aprobar una tienda.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guardar_aprobacion_tienda on public.tiendas;
create trigger trg_guardar_aprobacion_tienda
  before update of aprobada on public.tiendas
  for each row execute function public.guardar_aprobacion_tienda();

create or replace function public.detalle_antes_de_guardar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$declare
  v_precio numeric(12, 2);
  v_stock  integer;
begin
  select p.precio into v_precio
    from public.productos p
   where p.id = new.producto_id;

  if v_precio is null then
    raise exception 'El producto no existe.';
  end if;

  new.precio_unitario := v_precio;

  if tg_op = 'INSERT' then
    if not exists (
      select 1
        from public.productos pr
        join public.pedidos pe on pe.id = new.pedido_id and pe.tienda_id = pr.tienda_id
       where pr.id = new.producto_id
         and pr.activo
    ) then
      raise exception 'El producto no pertenece a la tienda de este pedido o no está activo.';
    end if;

    select p.stock into v_stock
      from public.productos p
     where p.id = new.producto_id
       for update;

    if v_stock is null then
      raise exception 'El producto no existe.';
    end if;

    if v_stock < new.cantidad then
      raise exception 'Stock insuficiente. Disponible: %, solicitado: %.', v_stock, new.cantidad;
    end if;

    update public.productos
       set stock = stock - new.cantidad
     where id = new.producto_id;
  end if;

  return new;
end;
$$;

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

create or replace function public.guardar_campos_pedido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  if tg_op = 'INSERT' then
    new.total := 0;
    return new;
  end if;

  if auth.uid() is not null and not public.es_admin() then
    if new.total is distinct from old.total
       and new.total is distinct from (
         select coalesce(sum(d.cantidad * d.precio_unitario), 0)
           from public.detalle_pedido d
          where d.pedido_id = new.id
       ) then
      raise exception 'El total se calcula desde las líneas del pedido.';
    end if;

    if new.cliente_id is distinct from old.cliente_id
       or new.tienda_id  is distinct from old.tienda_id then
      raise exception 'No podés cambiar el cliente ni la tienda del pedido.';
    end if;

    if new.estado <> 'pendiente' and (
         new.entrega    is distinct from old.entrega
      or new.forma_pago is distinct from old.forma_pago
      or new.direccion  is distinct from old.direccion
    ) then
      raise exception 'La entrega y el pago no se cambian después de confirmar.';
    end if;
  end if;

  if old.estado = 'cancelado' and new.estado is distinct from 'cancelado' then
    raise exception 'Un pedido cancelado no se puede reactivar.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guardar_campos_pedido on public.pedidos;
create trigger trg_guardar_campos_pedido
  before insert or update on public.pedidos
  for each row execute function public.guardar_campos_pedido();

create or replace function public.devolver_stock_al_quitar_linea()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  update public.productos
     set stock = stock + old.cantidad
   where id = old.producto_id;
  return old;
end;
$$;

drop trigger if exists trg_devolver_stock_linea on public.detalle_pedido;
create trigger trg_devolver_stock_linea
  after delete on public.detalle_pedido
  for each row execute function public.devolver_stock_al_quitar_linea();

create or replace function public.devolver_stock_al_cancelar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$begin
  if new.estado = 'cancelado' and old.estado is distinct from 'cancelado' then
    update public.productos p
       set stock = p.stock + d.cantidad
      from public.detalle_pedido d
     where d.pedido_id = new.id
       and p.id = d.producto_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_devolver_stock_cancelado on public.pedidos;
create trigger trg_devolver_stock_cancelado
  before update of estado on public.pedidos
  for each row execute function public.devolver_stock_al_cancelar();
