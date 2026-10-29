create extension if not exists "pgcrypto";

create table if not exists public.usuarios (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text    not null,
  telefono    text,
  email       text    not null,
  rol         text    not null default 'cliente'
                        check (rol in ('cliente', 'tienda', 'admin')),
  creado_en   timestamptz not null default now()
);

comment on table public.usuarios is 'Perfil 1:1 con auth.users. El rol lo define el registro y un trigger crea la fila.';

create table if not exists public.tiendas (
  id                uuid primary key default gen_random_uuid(),
  dueno_id          uuid not null unique references public.usuarios (id) on delete cascade,
  nombre            text not null,
  direccion         text,
  logo_url          text,
  ofrece_delivery   boolean not null default false,
  costo_delivery    numeric(10, 2) not null default 0
                        check (costo_delivery >= 0),
  zonas             text[] not null default '{}',
  latitude          numeric(9, 6),
  longitude         numeric(9, 6),
  aprobada          boolean not null default false,
  created_at        timestamptz not null default now(),

  constraint tiendas_costo_solo_si_delivery
    check (ofrece_delivery or costo_delivery = 0),
  constraint tiendas_lat_lng_juntas
    check ((latitude is null) = (longitude is null))
);

comment on column public.tiendas.zonas is 'Zonas de cobertura para delivery. Vacio = sin zonas definidas.';
comment on column public.tiendas.latitude  is 'Latitud del local (para el mapa y la distancia al cliente). Null = sin ubicacion cargada.';
comment on column public.tiendas.longitude is 'Longitud del local (para el mapa y la distancia al cliente). Null = sin ubicacion cargada.';

create table if not exists public.categorias (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null unique,
  slug      text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.tipos_repuesto (
  id            uuid primary key default gen_random_uuid(),
  categoria_id  uuid not null references public.categorias (id) on delete cascade,
  nombre        text not null,
  created_at    timestamptz not null default now(),

  constraint tipos_repuesto_nombre_unico_por_categoria unique (categoria_id, nombre)
);

create table if not exists public.productos (
  id            uuid primary key default gen_random_uuid(),
  tienda_id     uuid not null references public.tiendas (id) on delete cascade,
  categoria_id  uuid not null references public.categorias (id) on delete restrict,
  tipo_id       uuid not null references public.tipos_repuesto (id) on delete restrict,
  nombre        text not null,
  descripcion   text,
  precio        numeric(12, 2) not null check (precio > 0),
  stock         integer not null default 0 check (stock >= 0),
  imagenes      text[] not null default '{}',
  condicion     text not null default 'nuevo'
                        check (condicion in ('nuevo', 'usado', 'original', 'generico')),
  activo        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists productos_tienda_idx     on public.productos (tienda_id);
create index if not exists productos_categoria_idx  on public.productos (categoria_id);
create index if not exists productos_tipo_idx       on public.productos (tipo_id);
create index if not exists productos_activo_idx     on public.productos (activo) where activo;

create table if not exists public.compatibilidad (
  id            uuid primary key default gen_random_uuid(),
  producto_id   uuid not null references public.productos (id) on delete cascade,
  marca         text not null,
  modelo        text not null,
  anio_desde    smallint not null check (anio_desde between 1900 and 2100),
  anio_hasta    smallint not null check (anio_hasta between 1900 and 2100),

  constraint compatibilidad_rango_valido check (anio_hasta >= anio_desde),
  constraint compatibilidad_unica
    unique (producto_id, marca, modelo, anio_desde, anio_hasta)
);

create index if not exists compatibilidad_busqueda_idx
  on public.compatibilidad (producto_id, marca, modelo);

create table if not exists public.pedidos (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null references public.usuarios (id) on delete restrict,
  tienda_id     uuid not null references public.tiendas (id) on delete restrict,
  entrega       text not null default 'delivery'
                        check (entrega in ('delivery', 'retiro')),
  direccion     text,
  forma_pago    text not null default 'efectivo'
                        check (forma_pago in ('efectivo', 'transferencia', 'tarjeta')),
  estado        text not null default 'pendiente'
                        check (estado in ('pendiente', 'confirmado', 'preparando',
                                          'enviado', 'entregado', 'cancelado')),
  total         numeric(12, 2) not null default 0 check (total >= 0),
  notas         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint pedidos_direccion_requerida
    check (entrega = 'retiro' or nullif(btrim(direccion), '') is not null),

  constraint pedidos_id_cliente_unico unique (id, cliente_id)
);

create index if not exists pedidos_cliente_idx on public.pedidos (cliente_id, created_at desc);
create index if not exists pedidos_tienda_idx  on public.pedidos (tienda_id, created_at desc);
create index if not exists pedidos_estado_idx  on public.pedidos (estado);

create table if not exists public.detalle_pedido (
  id            uuid primary key default gen_random_uuid(),
  pedido_id     uuid not null references public.pedidos (id) on delete cascade,
  producto_id   uuid not null references public.productos (id) on delete restrict,
  cantidad      integer not null check (cantidad > 0),
  precio_unitario numeric(12, 2) not null check (precio_unitario > 0),

  constraint detalle_pedido_unico_por_producto unique (pedido_id, producto_id)
);

create index if not exists detalle_pedido_pedido_idx   on public.detalle_pedido (pedido_id);
create index if not exists detalle_pedido_producto_idx on public.detalle_pedido (producto_id);

create table if not exists public.calificaciones (
  id            uuid primary key default gen_random_uuid(),
  pedido_id     uuid not null references public.pedidos (id) on delete cascade,
  producto_id   uuid not null references public.productos (id) on delete cascade,
  cliente_id    uuid not null references public.usuarios (id) on delete cascade,
  estrellas     smallint not null check (estrellas between 1 and 5),
  comentario    text,
  created_at    timestamptz not null default now(),

  constraint calificaciones_unica_por_pedido_producto unique (pedido_id, producto_id),
  constraint calificaciones_cliente_es_del_pedido
    foreign key (pedido_id, cliente_id)
    references public.pedidos (id, cliente_id)
    on delete cascade
);

create index if not exists calificaciones_producto_idx on public.calificaciones (producto_id);
create index if not exists calificaciones_pedido_idx    on public.calificaciones (pedido_id);
