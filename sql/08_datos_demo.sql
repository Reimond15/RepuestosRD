begin;

do $$declare
  v_faltan text := '';
begin
  if not exists (select 1 from auth.users where email = 'tienda1@repuestosrd.test') then
    v_faltan := v_faltan || '  · tienda1@repuestosrd.test   (Repuestos El Che)
';
  end if;
  if not exists (select 1 from auth.users where email = 'tienda2@repuestosrd.test') then
    v_faltan := v_faltan || '  · tienda2@repuestosrd.test   (Auto Repuestos RD)
';
  end if;
  if not exists (select 1 from auth.users where email = 'tienda3@repuestosrd.test') then
    v_faltan := v_faltan || '  · tienda3@repuestosrd.test   (Repuestos del Este)
';
  end if;
  if not exists (select 1 from auth.users where email = 'cliente@repuestosrd.test') then
    v_faltan := v_faltan || '  · cliente@repuestosrd.test   (comprador)
';
  end if;

  if v_faltan <> '' then
    raise exception E'
Faltan usuarios en Authentication → Users.

%  Creá esos usuarios con "Auto Confirm User" tildado, y después volvé a
   correr este mismo archivo.', v_faltan;
  end if;
end $$;

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

insert into public.usuarios (id, nombre, telefono, email, rol)
select
  au.id,
  v.nombre,
  v.telefono,
  au.email,
  v.rol
from auth.users au
join (values
  ('tienda1@repuestosrd.test', 'Repuestos El Che',   '809-555-0101', 'tienda'),
  ('tienda2@repuestosrd.test', 'Auto Repuestos RD',  '809-555-0202', 'tienda'),
  ('tienda3@repuestosrd.test', 'Repuestos del Este', '809-555-0404', 'tienda'),
  ('cliente@repuestosrd.test', 'Juan Pérez',         '809-555-0303', 'cliente')
) as v(email, nombre, telefono, rol)
  on v.email = au.email;

insert into public.tiendas
  (dueno_id, nombre, direccion, logo_url, ofrece_delivery, costo_delivery, zonas, latitude, longitude, aprobada)
select
  u.id,
  v.nombre,
  v.direccion,
  null,
  true,
  v.costo,
  v.zonas,
  v.lat,
  v.lng,
  true
from auth.users u
join (values
  (
    'tienda1@repuestosrd.test',
    'Repuestos El Che',
    'Av. Duarte 45, Santo Domingo Oeste',
    150,
    array[
      'Santo Domingo Oeste', 'Santo Domingo Centro',
      'Gazcue', 'San Carlos', 'Villa Mella'
    ],
    18.4786,
    -70.0116
  ),
  (
    'tienda2@repuestosrd.test',
    'Auto Repuestos RD',
    'Av. 27 de Febrero 120, Santo Domingo Oeste',
    200,
    array[
      'Santo Domingo Oeste', 'Santo Domingo Centro',
      'Naco', 'Los Jardines', 'Herrera'
    ],
    18.4752,
    -70.0036
  ),
  (
    'tienda3@repuestosrd.test',
    'Repuestos del Este',
    'Av. San Vicente de Paul 88, Santo Domingo Este',
    200,
    array[
      'Santo Domingo Este', 'Los Mina', 'San Isidro',
      'Boca Chica'
    ],
    18.4866,
    -69.8170
  )
) as v(email, nombre, direccion, costo, zonas, lat, lng)
  on v.email = u.email;

insert into public.productos
  (tienda_id, categoria_id, tipo_id, nombre, descripcion, precio, stock, imagenes, condicion)
select
  t.tienda_id,
  c.categoria_id,
  tr.tipo_id,
  p.nombre,
  p.descripcion,
  p.precio,
  p.stock,
  array[p.imagen],
  p.condicion
from (
  values
    ('t1', 'motocicletas', 'Frenos',
     'Pastilla de freno delantera Honda XR150',
     'Pastillas de cerámica originales para el freno delantero. Se venden de a un juego.',
     850, 60, 'https://picsum.photos/seed/repuestosrd01/800/600', 'original'),

    ('t1', 'motocicletas', 'Filtro de aceite',
     'Filtro de aceite Honda XR150',
     'Filtro de aceite para motor de 150cc. Cambiar cada 2000 km.',
     350, 120, 'https://picsum.photos/seed/repuestosrd02/800/600', 'original'),

    ('t1', 'motocicletas', 'Batería',
     'Batería 12V 6Ah para moto',
     'Batería sellada de gel, con terminales estándar.',
     2200, 40, 'https://picsum.photos/seed/repuestosrd03/800/600', 'original'),

    ('t1', 'motocicletas', 'Manija y embrague',
     'Cable de acelerador Honda XR150',
     'Cable completo con funda y retorno.',
     1200, 25, 'https://picsum.photos/seed/repuestosrd04/800/600', 'generico'),

    ('t1', 'motocicletas', 'Frenos de disco',
     'Disco de freno trasero 220mm',
     'Disco de acero inoxidable de 220mm.',
     1450, 30, 'https://picsum.photos/seed/repuestosrd05/800/600', 'original'),

    ('t1', 'motocicletas', 'Bujías',
     'Bujía de encendido NGK',
     'Bujía de iridio, gap standard.',
     620, 90, 'https://picsum.photos/seed/repuestosrd06/800/600', 'original'),

    ('t1', 'motocicletas', 'Amortiguadores',
     'Amortiguador trasero de moto (par)',
     'Par de amortiguadores traseros para 150cc.',
     3200, 18, 'https://picsum.photos/seed/repuestosrd07/800/600', 'nuevo'),

    ('t1', 'motocicletas', 'Motor',
     'Aceite de motor 10W-30 (galón)',
     'Aceite mineral de 4 tiempos para motor de 150cc.',
     1850, 70, 'https://picsum.photos/seed/repuestosrd08/800/600', 'nuevo'),

    ('t2', 'carros', 'Batería',
     'Batería 12V 35Ah para carro',
     'Batería libre de mantenimiento, 35 amperes/hora.',
     6200, 28, 'https://picsum.photos/seed/repuestosrd09/800/600', 'original'),

    ('t2', 'carros', 'Discos de freno',
     'Disco de freno ventilado 260mm',
     'Disco ventilado de acero al carbono.',
     2850, 52, 'https://picsum.photos/seed/repuestosrd10/800/600', 'original'),

    ('t2', 'carros', 'Filtro de aceite',
     'Filtro de aceite Toyota Corolla',
     'Filtro de aceite original de fábrica.',
     480, 110, 'https://picsum.photos/seed/repuestosrd11/800/600', 'original'),

    ('t2', 'carros', 'Pastillas de freno',
     'Pastillas de freno delanteras (juego)',
     'Juego de pastillas delanteras, incluye aviso de desgaste.',
     1950, 65, 'https://picsum.photos/seed/repuestosrd12/800/600', 'original'),

    ('t2', 'carros', 'Amortiguadores',
     'Amortiguador delantero de carro (par)',
     'Par de amortiguadores delanteros a gas.',
     5400, 20, 'https://picsum.photos/seed/repuestosrd13/800/600', 'nuevo'),

    ('t2', 'carros', 'Cuadro eléctrico',
     'Alternador 12V 90A',
     'Alternador nuevo, la instalación se coordina con la tienda.',
     7800, 12, 'https://picsum.photos/seed/repuestosrd14/800/600', 'nuevo'),

    ('t2', 'guaguas', 'Filtro de aire',
     'Filtro de aire Roots GAC',
     'Filtro de aire para Roots GAC y Guaguas 3.0.',
     1650, 34, 'https://picsum.photos/seed/repuestosrd15/800/600', 'original'),

    ('t2', 'guaguas', 'Amortiguadores',
     'Amortiguador trasero de guagua (par)',
     'Par de amortiguadores traseros para Roots GAC.',
     4750, 45, 'https://picsum.photos/seed/repuestosrd16/800/600', 'original'),

    ('t2', 'guaguas', 'Batería',
     'Batería 12V 100Ah guagua',
     'Batería para Roots GAC y Toyota Hiace.',
     9800, 16, 'https://picsum.photos/seed/repuestosrd17/800/600', 'original'),

    ('t2', 'guaguas', 'Bujías',
     'Bujías de encendido (pack 4)',
     'Juego de 4 bujías de platino.',
     980, 210, 'https://picsum.photos/seed/repuestosrd18/800/600', 'original'),

    ('t2', 'guaguas', 'Espejos',
     'Espejo lateral eléctrico',
     'Espejo lateral con motor y señal.',
     2300, 26, 'https://picsum.photos/seed/repuestosrd19/800/600', 'nuevo'),

    ('t3', 'carros', 'Discos de freno',
     'Disco de freno ventilado 280mm',
     'Disco ventilado de acero al carbono, para carros más grandes.',
     3100, 40, 'https://picsum.photos/seed/repuestosrd20/800/600', 'original'),

    ('t3', 'motocicletas', 'Frenos',
     'Pastilla de freno delantera Honda CB190R',
     'Pastillas de cerámica para el freno delantero de la CB190R.',
     950, 55, 'https://picsum.photos/seed/repuestosrd21/800/600', 'original'),

    ('t3', 'guaguas', 'Batería',
     'Batería 12V 90Ah guagua',
     'Batería para Roots GAC y Toyota Hiace, con arranque en frío.',
     9200, 14, 'https://picsum.photos/seed/repuestosrd22/800/600', 'original')
) as p(llave, slug_categoria, tipo, nombre, descripcion, precio, stock, imagen, condicion)
join lateral (
  select td.id as tienda_id
    from public.tiendas td
    join public.usuarios tu on tu.id = td.dueno_id
   where tu.email = case p.llave
                     when 't1' then 'tienda1@repuestosrd.test'
                     when 't2' then 'tienda2@repuestosrd.test'
                     else          'tienda3@repuestosrd.test'
                   end
   limit 1
) t on true
join lateral (
  select c.id as categoria_id
    from public.categorias c
   where c.slug = p.slug_categoria
   limit 1
) c on true
join lateral (
  select tr.id as tipo_id
    from public.tipos_repuesto tr
    join public.categorias c2 on c2.id = tr.categoria_id
   where c2.slug = p.slug_categoria
     and tr.nombre = p.tipo
   limit 1
) tr on true;

insert into public.compatibilidad (producto_id, marca, modelo, anio_desde, anio_hasta)
select pr.id, c.marca, c.modelo, c.anio_desde, c.anio_hasta
from (
  values
    ('Pastilla de freno delantera Honda XR150',  'Honda',  'XR150',   2015, 2023),
    ('Filtro de aceite Honda XR150',            'Honda',  'XR150',   2015, 2023),
    ('Batería 12V 6Ah para moto',               'Honda',  'XR150',   2014, 2024),
    ('Batería 12V 6Ah para moto',               'Yamaha', 'DT150',   2014, 2023),
    ('Cable de acelerador Honda XR150',         'Honda',  'XR150',   2015, 2023),
    ('Disco de freno trasero 220mm',             'Honda',  'XR150',   2015, 2023),
    ('Bujía de encendido NGK',                   'Honda',  'XR150',   2015, 2023),
    ('Bujía de encendido NGK',                   'Yamaha', 'DT150',   2014, 2023),
    ('Amortiguador trasero de moto (par)',       'Honda',  'XR150',   2015, 2023),
    ('Aceite de motor 10W-30 (galón)',          'Honda',  'XR150',   2015, 2024),
    ('Aceite de motor 10W-30 (galón)',          'Yamaha', 'DT150',   2014, 2023),

    ('Batería 12V 35Ah para carro',             'Toyota',  'Corolla', 2018, 2023),
    ('Disco de freno ventilado 260mm',          'Toyota',  'Corolla', 2018, 2023),
    ('Filtro de aceite Toyota Corolla',         'Toyota',  'Corolla', 2018, 2023),
    ('Pastillas de freno delanteras (juego)',   'Toyota',  'Corolla', 2018, 2023),
    ('Amortiguador delantero de carro (par)',   'Toyota',  'Corolla', 2019, 2023),
    ('Alternador 12V 90A',                      'Toyota',  'Corolla', 2018, 2022),
    ('Batería 12V 35Ah para carro',             'Nissan',  'Sentra',  2017, 2023),
    ('Disco de freno ventilado 260mm',          'Nissan',  'Sentra',  2017, 2023),
    ('Pastillas de freno delanteras (juego)',   'Nissan',  'Sentra',  2017, 2023),
    ('Filtro de aceite Toyota Corolla',         'Nissan',  'Sentra',  2017, 2023),
    ('Amortiguador delantero de carro (par)',   'Hyundai', 'Elantra', 2018, 2023),
    ('Alternador 12V 90A',                      'Hyundai', 'Elantra', 2018, 2023),

    ('Filtro de aire Roots GAC',                 'Roots', 'GAC',   2018, 2023),
    ('Amortiguador trasero de guagua (par)',     'Roots', 'GAC',   2018, 2023),
    ('Batería 12V 100Ah guagua',                 'Roots', 'GAC',   2018, 2023),
    ('Bujías de encendido (pack 4)',             'Roots', 'GAC',   2018, 2023),
    ('Espejo lateral eléctrico',                 'Roots', 'GAC',   2018, 2023),
    ('Filtro de aire Roots GAC',                 'Toyota', 'Hiace', 2017, 2023),
    ('Batería 12V 100Ah guagua',                 'Toyota', 'Hiace', 2017, 2023),
    ('Amortiguador trasero de guagua (par)',     'Toyota', 'Hiace', 2017, 2023),

    ('Disco de freno ventilado 280mm',            'Toyota',  'Corolla', 2020, 2024),
    ('Disco de freno ventilado 280mm',            'Nissan',  'Sentra',  2020, 2024),
    ('Pastilla de freno delantera Honda CB190R',  'Honda',   'CB190R',  2020, 2024),
    ('Batería 12V 90Ah guagua',                   'Toyota',  'Hiace',   2017, 2024),
    ('Batería 12V 90Ah guagua',                   'Roots',   'GAC',     2018, 2024)
) as c(nombre_producto, marca, modelo, anio_desde, anio_hasta)
join public.productos pr on pr.nombre = c.nombre_producto;

insert into public.pedidos
  (id, cliente_id, tienda_id, entrega, direccion, forma_pago, estado, notas, created_at)
select
  v.id::uuid,
  cl.id,
  ti.id,
  v.entrega,
  v.direccion,
  v.forma_pago,
  'entregado',
  v.notas,
  now() - make_interval(days => v.dias)
from (values
  ('00000001-0000-4000-8000-000000000001', 't1', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'efectivo',      'Llamar antes de llegar', 12),
  ('00000001-0000-4000-8000-000000000002', 't1', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'transferencia', null,                             11),
  ('00000001-0000-4000-8000-000000000003', 't1', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'efectivo',      null,                             10),
  ('00000001-0000-4000-8000-000000000004', 't1', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'efectivo',      null,                              9),
  ('00000001-0000-4000-8000-000000000005', 't2', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'efectivo',      null,                              8),
  ('00000001-0000-4000-8000-000000000006', 't2', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'transferencia', null,                              7),
  ('00000001-0000-4000-8000-000000000007', 't2', 'retiro',      null,                                 'efectivo',      'Recojo en tienda',             6),
  ('00000001-0000-4000-8000-000000000008', 't2', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'efectivo',      null,                              5),
  ('00000001-0000-4000-8000-000000000009', 't2', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'efectivo',      'Se tardaron un poco',          4),
  ('00000001-0000-4000-8000-000000000010', 't2', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'transferencia', null,                              3),
  ('00000001-0000-4000-8000-000000000011', 't2', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'efectivo',      null,                              2),
  ('00000001-0000-4000-8000-000000000012', 't2', 'delivery',    'Calle Duarte 30, Santo Domingo Oeste', 'efectivo',      null,                              1),

  ('00000001-0000-4000-8000-000000000013', 't3', 'delivery',    'Av. Sabana Larga 5, Santo Domingo Este',   'efectivo',      null,                             5),
  ('00000001-0000-4000-8000-000000000014', 't3', 'delivery',    'Av. Sabana Larga 5, Santo Domingo Este',   'transferencia', 'Llamar al llegar',                4),
  ('00000001-0000-4000-8000-000000000015', 't3', 'retiro',      null,                                       'efectivo',      null,                             2)
) as v(id, llave, entrega, direccion, forma_pago, notas, dias)
join lateral (
  select u.id from public.usuarios u
   where u.email = 'cliente@repuestosrd.test' limit 1
) cl on true
join lateral (
  select td.id from public.tiendas td
    join public.usuarios tu on tu.id = td.dueno_id
   where tu.email = case v.llave
                     when 't1' then 'tienda1@repuestosrd.test'
                     when 't2' then 'tienda2@repuestosrd.test'
                     else          'tienda3@repuestosrd.test'
                   end
   limit 1
) ti on true;

insert into public.detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
select v.pedido_id::uuid, pr.id, v.cantidad, null
from (
  values
    ('00000001-0000-4000-8000-000000000001', 'Pastilla de freno delantera Honda XR150', 2),
    ('00000001-0000-4000-8000-000000000001', 'Filtro de aceite Honda XR150',           3),

    ('00000001-0000-4000-8000-000000000002', 'Pastilla de freno delantera Honda XR150', 1),
    ('00000001-0000-4000-8000-000000000002', 'Cable de acelerador Honda XR150',        1),

    ('00000001-0000-4000-8000-000000000003', 'Pastilla de freno delantera Honda XR150', 1),
    ('00000001-0000-4000-8000-000000000003', 'Filtro de aceite Honda XR150',           1),

    ('00000001-0000-4000-8000-000000000004', 'Filtro de aceite Honda XR150',           2),
    ('00000001-0000-4000-8000-000000000004', 'Bujía de encendido NGK',                 1),

    ('00000001-0000-4000-8000-000000000005', 'Batería 12V 35Ah para carro',           1),
    ('00000001-0000-4000-8000-000000000005', 'Pastillas de freno delanteras (juego)',  1),

    ('00000001-0000-4000-8000-000000000006', 'Batería 12V 35Ah para carro',           1),
    ('00000001-0000-4000-8000-000000000006', 'Disco de freno ventilado 260mm',         2),

    ('00000001-0000-4000-8000-000000000007', 'Batería 12V 35Ah para carro',           1),
    ('00000001-0000-4000-8000-000000000007', 'Disco de freno ventilado 260mm',         1),

    ('00000001-0000-4000-8000-000000000008', 'Disco de freno ventilado 260mm',         1),
    ('00000001-0000-4000-8000-000000000008', 'Filtro de aire Roots GAC',               1),

    ('00000001-0000-4000-8000-000000000009', 'Filtro de aire Roots GAC',               1),
    ('00000001-0000-4000-8000-000000000009', 'Amortiguador trasero de guagua (par)',   1),

    ('00000001-0000-4000-8000-000000000010', 'Filtro de aire Roots GAC',               1),
    ('00000001-0000-4000-8000-000000000010', 'Amortiguador trasero de guagua (par)',   1),

    ('00000001-0000-4000-8000-000000000011', 'Amortiguador trasero de guagua (par)',   1),
    ('00000001-0000-4000-8000-000000000011', 'Bujías de encendido (pack 4)',           1),

    ('00000001-0000-4000-8000-000000000012', 'Amortiguador trasero de guagua (par)',   1),
    ('00000001-0000-4000-8000-000000000012', 'Espejo lateral eléctrico',               1),

    ('00000001-0000-4000-8000-000000000005', 'Amortiguador delantero de carro (par)',  1),
    ('00000001-0000-4000-8000-000000000006', 'Filtro de aceite Toyota Corolla',        2),
    ('00000001-0000-4000-8000-000000000008', 'Batería 12V 100Ah guagua',              1),
    ('00000001-0000-4000-8000-000000000004', 'Disco de freno trasero 220mm',           1),
    ('00000001-0000-4000-8000-000000000004', 'Aceite de motor 10W-30 (galón)',        1),

    ('00000001-0000-4000-8000-000000000013', 'Disco de freno ventilado 280mm',          1),
    ('00000001-0000-4000-8000-000000000013', 'Pastilla de freno delantera Honda CB190R', 2),

    ('00000001-0000-4000-8000-000000000014', 'Batería 12V 90Ah guagua',                1),
    ('00000001-0000-4000-8000-000000000014', 'Disco de freno ventilado 280mm',          1),

    ('00000001-0000-4000-8000-000000000015', 'Pastilla de freno delantera Honda CB190R', 1),
    ('00000001-0000-4000-8000-000000000015', 'Batería 12V 90Ah guagua',                1)
) as v(pedido_id, nombre_producto, cantidad)
join public.productos pr on pr.nombre = v.nombre_producto
join public.pedidos pe on pe.id = v.pedido_id::uuid
                       and pe.tienda_id = pr.tienda_id;

alter table public.calificaciones disable trigger trg_validar_calificacion;

insert into public.calificaciones (pedido_id, producto_id, cliente_id, estrellas, comentario)
select
  v.pedido_id::uuid,
  pr.id,
  cl.id,
  v.estrellas,
  v.comentario
from (
  values
    ('00000001-0000-4000-8000-000000000001', 'Pastilla de freno delantera Honda XR150', 5, 'Excelente frenado, y llegó rapidísimo.'),
    ('00000001-0000-4000-8000-000000000002', 'Pastilla de freno delantera Honda XR150', 5, 'Original de verdad, como nuevas.'),
    ('00000001-0000-4000-8000-000000000003', 'Pastilla de freno delantera Honda XR150', 4, 'Buena, aunque el precio subió un poco.'),

    ('00000001-0000-4000-8000-000000000001', 'Filtro de aceite Honda XR150',           4, 'El que siempre, sin quejarse.'),
    ('00000001-0000-4000-8000-000000000003', 'Filtro de aceite Honda XR150',           4, 'Bien y a buen precio.'),
    ('00000001-0000-4000-8000-000000000004', 'Filtro de aceite Honda XR150',           5, 'Excelente, se lo recomiendo a todos.'),

    ('00000001-0000-4000-8000-000000000005', 'Batería 12V 35Ah para carro',           5, 'Arranca a la primera, la recomiendo.'),
    ('00000001-0000-4000-8000-000000000006', 'Batería 12V 35Ah para carro',           5, 'La mejor compra que hice acá.'),
    ('00000001-0000-4000-8000-000000000007', 'Batería 12V 35Ah para carro',           4, 'Buena, el empaque bien hecho.'),

    ('00000001-0000-4000-8000-000000000006', 'Disco de freno ventilado 260mm',         4, 'Se siente la diferencia al frenar.'),
    ('00000001-0000-4000-8000-000000000007', 'Disco de freno ventilado 260mm',         4, 'Bueno, el delivery se tardó un poco.'),
    ('00000001-0000-4000-8000-000000000008', 'Disco de freno ventilado 260mm',         5, 'Excelente, no tiene un solo rayon.'),

    ('00000001-0000-4000-8000-000000000008', 'Filtro de aire Roots GAC',               5, 'Justo lo que necesitaba la guagua.'),
    ('00000001-0000-4000-8000-000000000009', 'Filtro de aire Roots GAC',               4, 'Bien y a tiempo.'),
    ('00000001-0000-4000-8000-000000000010', 'Filtro de aire Roots GAC',               5, 'Perfecto'),

    ('00000001-0000-4000-8000-000000000009', 'Amortiguador trasero de guagua (par)',   4, 'La guagua volvió a la normalidad.'),
    ('00000001-0000-4000-8000-000000000010', 'Amortiguador trasero de guagua (par)',   5, 'Excelente, lo instalaron en el rato.'),
    ('00000001-0000-4000-8000-000000000011', 'Amortiguador trasero de guagua (par)',   5, 'Excelente, misma calidad que el de fabrica.'),

    ('00000001-0000-4000-8000-000000000002', 'Cable de acelerador Honda XR150',        3, 'Sirve, aunque lo encontré más caro en otro lado.'),
    ('00000001-0000-4000-8000-000000000004', 'Bujía de encendido NGK',                 5, 'Arranque perfecto.'),
    ('00000001-0000-4000-8000-000000000005', 'Pastillas de freno delanteras (juego)',  4, 'Buenas, hacen su trabajo.'),
    ('00000001-0000-4000-8000-000000000005', 'Amortiguador delantero de carro (par)',  4, 'Cómodo de instalar.'),
    ('00000001-0000-4000-8000-000000000011', 'Bujías de encendido (pack 4)',           3, 'Cumplen, pero las de iridio salen mejor.'),
    ('00000001-0000-4000-8000-000000000012', 'Espejo lateral eléctrico',              5, 'Se foldó en dos días y el motor va suave.'),
    ('00000001-0000-4000-8000-000000000004', 'Aceite de motor 10W-30 (galón)',        5, 'Buen precio para lo que es.'),
    ('00000001-0000-4000-8000-000000000004', 'Disco de freno trasero 220mm',           4, 'Bien y rápido.'),
    ('00000001-0000-4000-8000-000000000008', 'Batería 12V 100Ah guagua',              5, 'Aguantó el mes de calor sin problema.'),

    ('00000001-0000-4000-8000-000000000013', 'Disco de freno ventilado 280mm',         5, 'Buen freno, lo instalé el mismo día.'),
    ('00000001-0000-4000-8000-000000000014', 'Disco de freno ventilado 280mm',         4, 'Bien, llegó rápido al Este también.'),
    ('00000001-0000-4000-8000-000000000013', 'Pastilla de freno delantera Honda CB190R', 4, 'Buena calidad, cumple.'),
    ('00000001-0000-4000-8000-000000000015', 'Pastilla de freno delantera Honda CB190R', 5, 'Frenó perfecto, la recomiendo.'),
    ('00000001-0000-4000-8000-000000000014', 'Batería 12V 90Ah guagua',               5, 'Arranca fuerte, se siente la diferencia.'),
    ('00000001-0000-4000-8000-000000000015', 'Batería 12V 90Ah guagua',               4, 'Buena, aunque un poco cara.')
) as v(pedido_id, nombre_producto, estrellas, comentario)
join public.productos pr on pr.nombre = v.nombre_producto
join lateral (
  select u.id from public.usuarios u
   where u.email = 'cliente@repuestosrd.test' limit 1
) cl on true;

alter table public.calificaciones enable trigger trg_validar_calificacion;

commit;

select 'tiendas'        as tabla, count(*) as filas from public.tiendas
union all select 'productos',      count(*) from public.productos
union all select 'compatibilidad', count(*) from public.compatibilidad
union all select 'pedidos',        count(*) from public.pedidos
union all select 'detalle_pedido', count(*) from public.detalle_pedido
union all select 'calificaciones', count(*) from public.calificaciones;

select producto, tienda, categoria_nombre, promedio_estrellas, total_calificaciones
  from public.productos_mejor_calificados
 order by promedio_estrellas desc, total_calificaciones desc, producto;

select producto, tienda, categoria_nombre, unidades_vendidas
  from public.productos_mas_vendidos
 order by unidades_vendidas desc, producto;

select count(*) as productos_publicos
  from public.catalogo_productos;

select tgname              as trigger,
       case tgenabled when 'O' then 'habilitado ✅'
                       when 'D' then 'DESHABILITADO ⚠'
                       else tgenabled end as estado
  from pg_trigger
 where tgname = 'trg_validar_calificacion';
