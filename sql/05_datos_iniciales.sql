insert into public.categorias (nombre, slug) values
  ('Motocicletas', 'motocicletas'),
  ('Carros',       'carros'),
  ('Guaguas',      'guaguas')
on conflict (slug) do update set nombre = excluded.nombre;

insert into public.tipos_repuesto (categoria_id, nombre)
select c.id, t.nombre
from public.categorias c
cross join (values
  ('Frenos'),            ('Filtro de aceite'),       ('Filtro de aire'),
  ('Bujías'),             ('Batería'),                ('Cadena y piñón'),
  ('Suspensión'),         ('Llantas'),                ('Amortiguadores'),
  ('Frenos de disco'),    ('Cauchos'),                ('Escape'),
  ('Motor'),              ('Transmisión'),            ('Manija y embrague'),
  ('Espejo retrovisor'),  ('Faros'),                  ('Cuadro eléctrico'),
  ('Sistema de escape'),  ('Pastillas de freno'),     ('Discos de freno')
) as t(nombre)
where c.slug = 'motocicletas'
on conflict (categoria_id, nombre) do nothing;

insert into public.tipos_repuesto (categoria_id, nombre)
select c.id, t.nombre
from public.categorias c
cross join (values
  ('Frenos'),                ('Pastillas de freno'),     ('Discos de freno'),
  ('Filtro de aceite'),      ('Filtro de aire'),         ('Batería'),
  ('Bujías'),                 ('Cinta de distribución'),  ('Amortiguadores'),
  ('Suspensión'),            ('Llantas'),                ('Neumáticos'),
  ('Escape'),                ('Radiador'),               ('Bomba de agua'),
  ('Embrague'),              ('Transmisión'),            ('Diferencial'),
  ('Dirección'),             ('Rótulas'),                ('Terminales de dirección'),
  ('Faros'),                 ('Pilotos traseros'),       ('Espejos'),
  ('Cuadro eléctrico'),      ('Aire acondicionado'),     ('Sensor ABS'),
  ('Cigüeñal'),              ('Parabrisas'),             ('Portaplacas')
) as t(nombre)
where c.slug = 'carros'
on conflict (categoria_id, nombre) do nothing;

insert into public.tipos_repuesto (categoria_id, nombre)
select c.id, t.nombre
from public.categorias c
cross join (values
  ('Frenos'),               ('Pastillas de freno'),      ('Discos de freno'),
  ('Filtro de aceite'),     ('Filtro de aire'),          ('Batería'),
  ('Bujías'),                ('Cinta de distribución'),   ('Amortiguadores'),
  ('Suspensión'),           ('Llantas'),                 ('Neumáticos'),
  ('Escape'),               ('Radiador'),                ('Bomba de agua'),
  ('Transmisión'),          ('Dirección'),               ('Rótulas'),
  ('Puertas'),              ('Vidrios'),                 ('Faros'),
  ('Pilotos traseros'),     ('Climatización'),           ('Cuadro eléctrico'),
  ('Portaequipajes'),       ('Bumpers'),                 ('Espejos'),
  ('Cigüeñal'),             ('Asiento')
) as t(nombre)
where c.slug = 'guaguas'
on conflict (categoria_id, nombre) do nothing;

select c.nombre as categoria, count(t.id) as tipos
from public.categorias c
left join public.tipos_repuesto t on t.categoria_id = c.id
group by c.nombre
order by c.nombre;
