# sql/08_datos_demo.sql

<!-- 41 bloques · 204 líneas · original del commit 1310672 -->

41 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `begin;`

```
-- ============================================================================
--  08 · DATOS DE EJEMPLO  (correlativo al 07)
-- ============================================================================
--
--  PARA QUÉ SIRVE
--  Los 7 archivos anteriores dejan la base VACÍA de productos. Sin esto, las
--  dos vistas de ranking ("Lo más vendido" y "Mejor calificados") devuelven
--  0 filas y la app se ve rota aunque esté bien configurada.
--
--  QUÉ CREA
--    · 3 tiendas YA APROBADAS (2 en Santo Domingo Oeste, 1 en Santo Domingo Este)
--    · 22 productos repartidos en Motocicletas, Carros y Guaguas
--    · Compatibilidad por marca / modelo / año
--    · 15 pedidos entregados con sus líneas
--    · 33 calificaciones: 3 por cada uno de los 6 productos que deben salir en
--      "Mejor calificados" (la vista exige mínimo 3), más reseñas sueltas
--
--  ─────────────────────────────────────────────────────────────────────────
--  ⚠ ANTES DE CORRERLO, TENÉS QUE HACER ESTO ⚠
--  ─────────────────────────────────────────────────────────────────────────
--
--  Las tiendas y los clientes apuntan a `auth.users`, y eso no se puede
--  inventar desde SQL de forma confiable. Creá 4 usuarios a mano:
--
--    Supabase → Authentication → Users →  "Add user" →  "Create new user"
--
--      | # | email                       | nombre            | rol en la app |
--      |---|-----------------------------|-------------------|---------------|
--      | 1 | tienda1@repuestosrd.test    | Repuestos El Che  | Tienda        |
--      | 2 | tienda2@repuestosrd.test    | Auto Repuestos RD | Tienda        |
--      | 3 | tienda3@repuestosrd.test    | Repuestos del Este| Tienda        |
--      | 4 | cliente@repuestosrd.test    | Juan Pérez        | Comprador     |
--
--  En cada uno tildá "Auto Confirm User". Si no, `auth.users` no tiene la
--  fila y este script se detiene.
--
--  Después volvé acá y corré este archivo. Los busca por email. Si falta
--  alguno te dice exactamente cuál y no deja nada a medias.
--
--  ─────────────────────────────────────────────────────────────────────────
--  📸 LAS FOTOS SON DE RELLENO
--  ─────────────────────────────────────────────────────────────────────────
--  Las imágenes apuntan a un servicio de fotos genéricas. NO son fotos de
--  repuestos: sirven para ver el diseño con imágenes reales cargando. Cuando
--  tengas las tuyas, subilas al bucket `productos` (Etapa 5) y cambiá estas
--  URLs en el bloque de productos.
--
--  ─────────────────────────────────────────────────────────────────────────
--  🔒 SEGURIDAD
--  ─────────────────────────────────────────────────────────────────────────
--  Para sembrar calificaciones hay que apagar un instante el trigger
--  `trg_validar_calificacion`, porque compara contra `auth.uid()` y eso
--  corriendo SQL directo es NULL → rechazaría todo. Acá somos nosotros, así
--  que se apaga, se siembran los datos y se vuelve a prender al final.
--
--  Lo que NO se relaja en ningún momento:
--    · el CHECK de 1 a 5 estrellas
--    · el UNIQUE de una reseña por pedido y producto
--    · el FK de que el producto esté realmente en ese pedido
--  Lo único relajado es "quién escribió la reseña", que acá somos nosotros.
--  El archivo verifica al final que el trigger quedó habilitado.
--
--  Es RE-EJECUTABLE: si lo corrés dos veces, no duplica nada.
-- ============================================================================
```

## Línea 68

> Ancla: `do $$`

```
-- ---------------------------------------------------------------------------
--  PASO 0 · Comprobar que existan los 3 usuarios
--
--  Va primero y con raise: si falta alguno, se detiene TODO acá y el
--  rollback no deja nada a medias.
-- ---------------------------------------------------------------------------
```

## Línea 105

> Ancla: `delete from public.calificaciones`

```
-- ---------------------------------------------------------------------------
--  PASO 1 · Empezar de cero con lo de la demo
--
--  Borra únicamente lo demo (los 3 usuarios de prueba), en el orden que
--  necesitan las claves foráneas. Así el archivo se puede correr otra vez.
-- ---------------------------------------------------------------------------
```

## Línea 140

> Ancla: `delete from public.usuarios`

```
-- productos y tiendas cuelgan de usuarios por cascada
```

## Línea 147

> Ancla: `insert into public.usuarios (id, nombre, telefono, email, rol)`

```
-- ---------------------------------------------------------------------------
--  PASO 2 · Perfiles en `usuarios`
--
--  `usuarios.id` es el mismo id que `auth.users.id`, así que se resuelve con
--  un subquery en vez de escribir un uuid a mano.
-- ---------------------------------------------------------------------------
```

## Línea 170

> Ancla: `insert into public.tiendas`

```
-- ---------------------------------------------------------------------------
--  PASO 3 · Las 3 tiendas, YA APROBADAS
--
--  `aprobada = true` a propósito: la vista `catalogo_productos` solo inner
--  joinea tiendas aprobadas, así que con `false` el catálogo sale vacío.
-- ---------------------------------------------------------------------------
```

## Línea 231

> Ancla: `insert into public.productos`

```
-- ---------------------------------------------------------------------------
--  PASO 4 · Productos
--
--  Precios en pesos dominicanos. El stock es generoso porque más abajo se
--  venden varios y el trigger lo descuenta.
--
--  `tipo` tiene que coincidir EXACTAMENTE con los nombres de
--  `tipos_repusto` que siembra el archivo 05 (Frenos, Filtro de aceite,
--  Bateria, Amortiguadores, Discos de freno, Pastillas de freno, ...).
--  Si un tipo no existe, el join lateral no lo encuentra y el producto no
--  se inserta; la verificación del final avisa.
-- ---------------------------------------------------------------------------
```

## Línea 258

> Ancla: `('t1', 'motocicletas', 'Frenos',`

```
-- ------------------------------------------------------- MOTOCICLETAS
```

## Línea 299

> Ancla: `('t2', 'carros', 'Batería',`

```
-- ------------------------------------------------------------- CARROS
```

## Línea 330

> Ancla: `('t2', 'guaguas', 'Filtro de aire',`

```
-- ----------------------------------------------------------- GUAQUAS
```

## Línea 356

> Ancla: `('t3', 'carros', 'Discos de freno',`

```
-- ------------------------------------------------- REPUESTOS DEL ESTE
```

## Línea 398

> Ancla: `insert into public.compatibilidad (producto_id, marca, modelo, anio_desde, anio_hasta)`

```
-- ---------------------------------------------------------------------------
--  PASO 5 · Compatibilidad (marca / modelo / año)
--
--  Esto es lo que hace útil el buscador: si escribís "XR150" o "Toyota"
--  encontrás el repuesto aunque el nombre del producto no lo diga.
-- ---------------------------------------------------------------------------
```

## Línea 409

> Ancla: `('Pastilla de freno delantera Honda XR150',  'Honda',  'XR150',   2015, 2023),`

```
-- Motocicletas
```

## Línea 422

> Ancla: `('Batería 12V 35Ah para carro',             'Toyota',  'Corolla', 2018, 2023),`

```
-- Carros
```

## Línea 436

> Ancla: `('Filtro de aire Roots GAC',                 'Roots', 'GAC',   2018, 2023),`

```
-- Guaguas
```

## Línea 446

> Ancla: `('Disco de freno ventilado 280mm',            'Toyota',  'Corolla', 2020, 2024),`

```
-- Repuestos del Este
```

## Línea 455

> Ancla: `insert into public.pedidos`

```
-- ---------------------------------------------------------------------------
--  PASO 6 · 15 pedidos, todos "entregado"
--
--  El estado importa: las dos vistas de ranking solo cuentan pedidos
--  entregados. Por eso todos van en ese estado.
--
--  `direccion` es obligatoria cuando entrega = 'delivery' (CHECK de la tabla);
--  en el pedido de retiro va null.
--
--  El id va fijo y uuid para que el archivo sea re-ejecutable y las califi-
--  caciones de abajo puedan apuntar a un pedido concreto.
-- ---------------------------------------------------------------------------
```

## Línea 494

> Ancla: `('00000001-0000-4000-8000-000000000013', 't3', 'delivery',    'Av. Sabana Larga 5, Santo Domingo Este',   'efectivo',      null,                             5),`

```
-- Repuestos del Este (los últimos le dan movimientos a la tienda nueva)
```

## Línea 514

> Ancla: `insert into public.detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)`

```
-- ---------------------------------------------------------------------------
--  PASO 7 · Las líneas de los pedidos
--
--  Los productos se buscan por nombre. `precio_unitario` va NULL apropósito:
--  el trigger lo toma del producto, que es exactamente lo que pasa cuando
--  alguien compra desde la app. El mismo trigger descuenta el stock.
--
--  Cada producto aparece como máximo una vez por pedido: hay un UNIQUE.
-- ---------------------------------------------------------------------------
```

## Línea 528

> Ancla: `('00000001-0000-4000-8000-000000000001', 'Pastilla de freno delantera Honda XR150', 2),`

```
-- el "más vendido" de motos
```

## Línea 541

> Ancla: `('00000001-0000-4000-8000-000000000005', 'Batería 12V 35Ah para carro',           1),`

```
-- el "más vendido" de carros
```

## Línea 554

> Ancla: `('00000001-0000-4000-8000-000000000009', 'Filtro de aire Roots GAC',               1),`

```
-- los mejor calificados de guaguas
```

## Línea 567

> Ancla: `('00000001-0000-4000-8000-000000000005', 'Amortiguador delantero de carro (par)',  1),`

```
-- extras, para que el catálogo no tenga solo 6 cosas
```

## Línea 571

> Ancla: `('00000001-0000-4000-8000-000000000004', 'Disco de freno trasero 220mm',           1),`

```
-- OJO: el Disco 220mm y el Aceite 10W-30 son productos de la tienda 1 (Repuestos
    -- El Che), así que van en un pedido de t1. Si se pusieran en un pedido de otra
    -- tienda, el trigger de la línea (producto de la tienda del pedido) rechaza el
    -- insert y aborta TODO el script.
```

## Línea 578

> Ancla: `('00000001-0000-4000-8000-000000000013', 'Disco de freno ventilado 280mm',          1),`

```
-- pedidos de Repuestos del Este
```

## Línea 589

> Ancla: `join public.pedidos pe on pe.id = v.pedido_id::uuid`

```
-- Defensa: solo entra la línea si el producto es de la MISMA tienda que el
-- pedido. Así, aunque alguien edite mal los valores de arriba, el script no
-- explota por el trigger `detalle_antes_de_guardar` (simplemente ignora la fila).
```

## Línea 595

> Ancla: `alter table public.calificaciones disable trigger trg_validar_calificacion;`

```
-- ---------------------------------------------------------------------------
--  PASO 8 · Calificaciones
--
--  Se apaga el trigger un instante (ver la nota de seguridad arriba).
--
--  Cada reseña tiene que apuntar a un pedido que REALMENTE contenga ese
--  producto, y no puede repetirse producto+pedido. Por eso cada fila de
--  abajo es un par (pedido, producto) distinto, y son 3 por producto en los
--  6 productos que deben aparecer en "Mejor calificados".
--
--  El trigger además exige estado 'entregado' y que el cliente sea el del
--  pedido: los 15 pedidos de arriba son del cliente de prueba y están
--  entregados, así que las dos condiciones se cumplen.
-- ---------------------------------------------------------------------------
```

## Línea 621

> Ancla: `('00000001-0000-4000-8000-000000000001', 'Pastilla de freno delantera Honda XR150', 5, 'Excelente frenado, y llegó rapidísimo.'),`

```
-- PASTILLA DE FRENO DELANTERA  (3 reseñas · promedio 4.67)
```

## Línea 626

> Ancla: `('00000001-0000-4000-8000-000000000001', 'Filtro de aceite Honda XR150',           4, 'El que siempre, sin quejarse.'),`

```
-- FILTRO DE ACEITE XR150      (3 reseñas · promedio 4.33)
```

## Línea 631

> Ancla: `('00000001-0000-4000-8000-000000000005', 'Batería 12V 35Ah para carro',           5, 'Arranca a la primera, la recomiendo.'),`

```
-- BATERÍA 35Ah                (3 reseñas · promedio 4.67)
```

## Línea 636

> Ancla: `('00000001-0000-4000-8000-000000000006', 'Disco de freno ventilado 260mm',         4, 'Se siente la diferencia al frenar.'),`

```
-- DISCO VENTILADO 260mm       (3 reseñas · promedio 4.33)
```

## Línea 641

> Ancla: `('00000001-0000-4000-8000-000000000008', 'Filtro de aire Roots GAC',               5, 'Justo lo que necesitaba la guagua.'),`

```
-- FILTRO DE AIRE ROOTS GAC    (3 reseñas · promedio 4.67)
```

## Línea 646

> Ancla: `('00000001-0000-4000-8000-000000000009', 'Amortiguador trasero de guagua (par)',   4, 'La guagua volvió a la normalidad.'),`

```
-- AMORTIGUADOR TRASERO GUAWA (3 reseñas · promedio 4.67)
```

## Línea 651

> Ancla: `('00000001-0000-4000-8000-000000000002', 'Cable de acelerador Honda XR150',        3, 'Sirve, aunque lo encontré más caro en otro lado.'),`

```
-- extras de 1 sola reseña: no aparecen en la vista (pide mínimo 3),
    -- pero existen y están para probar los otros filtros
```

## Línea 663

> Ancla: `('00000001-0000-4000-8000-000000000013', 'Disco de freno ventilado 280mm',         5, 'Buen freno, lo instalé el mismo día.'),`

```
-- Repuestos del Este: 2 reseñas por producto (rating sí, pero no llegan
    -- a las 3 que exige "Mejor calificados"; en "Lo más vendido" sí salen)
```

## Línea 682

> Ancla: `select 'tiendas'        as tabla, count(*) as filas from public.tiendas`

```
-- ============================================================================
--  VERIFICACIÓN
--
--  1) Tablas con filas          → tienen que dar 3, 22, 36, 15, 35 y 33
--  2) productos_mejor_calificados → 6 filas (los de 3 reseñas o más)
--  3) productos_mas_vendidos      → 22 filas
--  4) el trigger                  → tgenabled = 'O' (habilitado)
-- ============================================================================
```

## Línea 698

> Ancla: `select producto, tienda, categoria_nombre, promedio_estrellas, total_calificaciones`

```
-- "Mejor calificados": solo los que tienen 3 o más. Deberían salir 6.
```

## Línea 703

> Ancla: `select producto, tienda, categoria_nombre, unidades_vendidas`

```
-- "Lo más vendido": ordenado por unidades.
```

## Línea 708

> Ancla: `select count(*) as productos_publicos`

```
-- El catálogo público: lo que ve la app sin iniciar sesión.
```

## Línea 712

> Ancla: `select tgname              as trigger,`

```
-- El trigger tiene que quedar HABILITADO. Si dice 'D', algo se rompió.
```

## Línea 720

```
-- ============================================================================
--  SI QUERÉS BORRAR TODO LO DE PRUEBA
--
--  Corrá este bloque. Deja las 3 categorías y los tipos de repuesto, que son
--  los datos que la app siempre necesita.
--
--  Los productos y las tiendas se borran por cascada desde `usuarios`.
--
--    begin;
--    delete from public.usuarios
--     where email in ('tienda1@repuestosrd.test',
--                     'tienda2@repuestosrd.test',
--                     'tienda3@repuestosrd.test',
--                     'cliente@repuestosrd.test');
--    commit;
--
--  Esto no borra los usuarios de Authentication. Si querés empezar de cero
--  de verdad, borralos también desde Authentication → Users.
-- ============================================================================
```
