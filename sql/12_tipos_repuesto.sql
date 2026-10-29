update public.tipos_repuesto t
   set nombre = v.nuevo
  from (values
    ('Bateria',                 'Batería'),
    ('Bujias',                  'Bujías'),
    ('Suspension',              'Suspensión'),
    ('Neumaticos',              'Neumáticos'),
    ('Transmision',             'Transmisión'),
    ('Transmission',            'Transmisión'),
    ('Direccion',               'Dirección'),
    ('Rotulas',                 'Rótulas'),
    ('Terminales de direccion', 'Terminales de dirección'),
    ('Cuadro electrico',        'Cuadro eléctrico'),
    ('Cinta de distribucion',   'Cinta de distribución'),
    ('Climatizacion',           'Climatización'),
    ('Embriague',               'Embrague'),
    ('Cadena y piñon',          'Cadena y piñón'),
    ('Crio de motor',           'Cigüeñal'),
    ('Porta',                   'Portaplacas')
  ) as v(viejo, nuevo)
 where t.nombre = v.viejo;
