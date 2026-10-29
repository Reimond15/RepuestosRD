select
  t.id                             as tienda_id,
  t.nombre                         as tienda,
  t.direccion,
  t.ofrece_delivery,
  t.costo_delivery,
  u.nombre                         as dueno,
  u.email                          as correo_dueno,
  u.telefono                       as telefono_dueno,
  t.aprobada,
  t.prueba_hasta,
  t.pago_hasta,
  t.es_fundador,
  t.fundador_hasta,
  public.tienda_vigente(t.id)      as vigente,
  t.created_at                     as registrada
from public.tiendas t
join public.usuarios u on u.id = t.dueno_id
where t.aprobada = false
order by t.created_at asc;

select
  t.id                             as tienda_id,
  t.nombre                         as tienda,
  u.nombre                         as dueno,
  u.email                          as correo_dueno,
  t.aprobada,
  t.es_fundador,
  t.pago_hasta,
  t.prueba_hasta,
  public.tienda_vigente(t.id)      as vigente,
  t.created_at
from public.tiendas t
join public.usuarios u on u.id = t.dueno_id
order by t.aprobada asc, t.created_at desc;

update public.tiendas
   set aprobada     = true,
       prueba_hasta = now() + interval '30 days'
 where id = 'PEGA-AQUI-EL-TIENDA_ID';

select count(*) as fundadoras_marcadas
  from public.tiendas
 where es_fundador;

update public.tiendas
   set es_fundador    = true,
       fundador_hasta = now() + interval '12 months'
 where id = 'PEGA-AQUI-EL-TIENDA_ID'
   and not es_fundador
   and (select count(*) from public.tiendas where es_fundador) < 25;

update public.tiendas
   set aprobada       = true,
       prueba_hasta   = now() + interval '30 days',
       es_fundador    = true,
       fundador_hasta = now() + interval '12 months'
 where id = 'PEGA-AQUI-EL-TIENDA_ID'
   and (select count(*) from public.tiendas where es_fundador) < 25;

update public.tiendas
   set aprobada = false
 where id = 'PEGA-AQUI-EL-TIENDA_ID';
