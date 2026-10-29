begin;

delete from public.calificaciones
 where cliente_id in (
   select id from public.usuarios
    where email in ('tienda1@repuestosrd.test',
                    'tienda2@repuestosrd.test',
                    'tienda3@repuestosrd.test',
                    'cliente@repuestosrd.test')
 );

delete from public.detalle_pedido
 where pedido_id in (
   select pe.id from public.pedidos pe
     join public.usuarios u on u.id = pe.cliente_id
    where u.email in ('tienda1@repuestosrd.test',
                      'tienda2@repuestosrd.test',
                      'tienda3@repuestosrd.test',
                      'cliente@repuestosrd.test')
 );

delete from public.pedidos
 where cliente_id in (
   select id from public.usuarios
    where email in ('tienda1@repuestosrd.test',
                    'tienda2@repuestosrd.test',
                    'tienda3@repuestosrd.test',
                    'cliente@repuestosrd.test')
 );

delete from public.usuarios
 where email in ('tienda1@repuestosrd.test',
                 'tienda2@repuestosrd.test',
                 'tienda3@repuestosrd.test',
                 'cliente@repuestosrd.test');

delete from auth.users
 where email in ('tienda1@repuestosrd.test',
                 'tienda2@repuestosrd.test',
                 'tienda3@repuestosrd.test',
                 'cliente@repuestosrd.test');

do $$declare
  v_usuarios     int;
  v_resenas      int;
  v_productos    int;
begin
  select count(*) into v_usuarios
    from public.usuarios
   where email like '%@repuestosrd.test';

  select count(*) into v_resenas
    from public.calificaciones c
    join public.usuarios u on u.id = c.cliente_id
   where u.email like '%@repuestosrd.test';

  select count(*) into v_productos
    from public.productos p
    join public.tiendas t on t.id = p.tienda_id
    join public.usuarios u on u.id = t.dueno_id
   where u.email like '%@repuestosrd.test';

  if v_usuarios + v_resenas + v_productos > 0 then
    raise exception 'Todavía quedan datos de prueba: % usuarios, % reseñas, % productos.',
      v_usuarios, v_resenas, v_productos;
  end if;

  raise notice 'Limpieza correcta: no quedan usuarios, reseñas ni productos de prueba.';
end $$;

commit;
