begin;

update public.tipos_repuesto t
   set nombre = v.nuevo
  from (values
    ('Manija y embrague', 'Maneta')
  ) as v(viejo, nuevo)
 where t.nombre = v.viejo
   and not exists (
     select 1 from public.tipos_repuesto x
      where x.categoria_id = t.categoria_id
        and x.nombre = v.nuevo
   );

create temporary table tmp_prod_demo on commit drop as
select p.id
  from public.productos p
  join public.tiendas   td on td.id = p.tienda_id
  join public.usuarios  u  on u.id  = td.dueno_id
  join public.tipos_repuesto t on t.id = p.tipo_id
 where u.email like '%@repuestosrd.test'
   and t.nombre in ('Neumáticos', 'Cauchos', 'Sistema de escape');

delete from public.detalle_pedido d
 using tmp_prod_demo x
 where d.producto_id = x.id;

delete from public.calificaciones c
 using tmp_prod_demo x
 where c.producto_id = x.id;

delete from public.productos p
 using tmp_prod_demo x
 where p.id = x.id;

delete from public.pedidos pe
 using public.usuarios u
 where pe.cliente_id = u.id
   and u.email like '%@repuestosrd.test'
   and not exists (
     select 1 from public.detalle_pedido d where d.pedido_id = pe.id
   );

delete from public.tipos_repuesto
 where nombre in ('Neumáticos', 'Cauchos', 'Sistema de escape');

insert into public.tipos_repuesto (categoria_id, nombre)
select c.id, t.nombre
  from public.categorias c
 cross join (values
   ('Embrague'),
   ('Carburador'),
   ('Inyectores'),
   ('Kit de arrastre'),
   ('Manubrio'),
   ('Rines'),
   ('Horquilla'),
   ('Guardafango'),
   ('Asiento'),
   ('Pedales'),
   ('Cilindro maestro'),
   ('Tensor de cadena'),
   ('Bomba de gasolina'),
   ('Bobina de encendido'),
   ('Regulador de voltaje'),
   ('Disco de embrague')
 ) as t(nombre)
 where c.slug = 'motocicletas'
on conflict (categoria_id, nombre) do nothing;

insert into public.tipos_repuesto (categoria_id, nombre)
select c.id, t.nombre
  from public.categorias c
 cross join (values
   ('Alternador'),
   ('Marcha'),
   ('Bomba de gasolina'),
   ('Bomba de frenos'),
   ('Tambor de freno'),
   ('Líquido de frenos'),
   ('Motor'),
   ('Caja de velocidades'),
   ('Turbo'),
   ('Inyectores'),
   ('Bobina de encendido'),
   ('Mangueras'),
   ('Compresor de A/C'),
   ('Kit de arrastre'),
   ('Guardafangos'),
   ('Bocina'),
   ('Sensor de oxígeno'),
   ('Bomba de aceite'),
   ('Termostato'),
   ('Filtro de combustible')
 ) as t(nombre)
 where c.slug = 'carros'
on conflict (categoria_id, nombre) do nothing;

insert into public.tipos_repuesto (categoria_id, nombre)
select c.id, t.nombre
  from public.categorias c
 cross join (values
   ('Alternador'),
   ('Marcha'),
   ('Bomba de gasolina'),
   ('Bomba de frenos'),
   ('Tambor de freno'),
   ('Líquido de frenos'),
   ('Motor'),
   ('Caja de velocidades'),
   ('Turbo'),
   ('Inyectores'),
   ('Bobina de encendido'),
   ('Mangueras'),
   ('Compresor de A/C'),
   ('Filtro de combustible'),
   ('Sensor de oxígeno'),
   ('Bomba de aceite'),
   ('Termostato'),
   ('Guardafangos'),
   ('Bocina')
 ) as t(nombre)
 where c.slug = 'guaguas'
on conflict (categoria_id, nombre) do nothing;

commit;
