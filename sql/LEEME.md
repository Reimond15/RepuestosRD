# Marketplace de repuestos — Supabase

SQL listo para pegar en el **SQL Editor** de Supabase.

## Cómo ejecutarlo (5 minutos)

1. Entra a <https://supabase.com/dashboard> → tu proyecto → ícono **`SQL`** en la barra izquierda (o `New query`).
2. **Abre una pestaña nueva** con `+` y pega **un archivo completo**.
3. Presiona **`Run`** (o `Ctrl/Cmd + Enter`). Espera el cartel verde `Success`.
4. Repite con el siguiente archivo, **en este orden exacto**:

| # | Archivo | Qué hace |
|---|---------|----------|
| 1 | `01_esquema.sql` | Las 9 tablas, tipos, checks, índices y FKs |
| 2 | `02_funciones_triggers.sql` | Trigger de registro, validaciones, stock, totales + seguridad P0 |
| 3 | `03_vistas.sql` | Las 5 vistas (incluye las 2 de ranking) |
| 4 | `04_rls.sql` | RLS + políticas + permisos de lectura pública |
| 5 | `05_datos_iniciales.sql` | 3 categorías + tipos de repuesto (motos, carros, autobuses) |
| 6 | `06_storage.sql` | Buckets `productos` y `logos` + políticas |
| 7 | `07_verificacion.sql` | Opcional: checks y consultas de ejemplo |
| 8 | `08_datos_demo.sql` | Datos de demostración (3 tiendas aprobadas + 22 productos + 15 pedidos) |
| 9 | `09_seguridad.sql` | Parche P0: 5 triggers + política reforzada (idempotente) |
| 10 | `10_ubicaciones.sql` | Columnas `latitude`/`longitude` en `tiendas` + vistas con ubicación |
| 11 | `11_panel_tienda.sql` | RPC `pedidos_de_mi_tienda()` para el panel de la tienda |
| 12 | `12_tipos_repuesto.sql` | Limpieza de nombres de tipos (acentos y typos) |
| 13 | `13_resenas.sql` | Vista pública `resenas_producto` + lectura de reseñas sin sesión |
| 14 | `14_panel_productos.sql` | Políticas para que la tienda vea **todos** sus productos (activos e inactivos) |
| 15 | `15_tiendas_rls.sql` | Endurece la lectura de `tiendas`: un visitante solo ve las aprobadas |
| 16 | `16_limpiar_demo.sql` | **Solo antes de publicar**: borra tiendas, productos, pedidos y reseñas de prueba |
| 17 | `17_mensajes.sql` | Chat interno del pedido (anti-elusión) + panel de tienda sin el contacto del cliente |
| 18 | `18_tiendas_privacidad.sql` | Ubicación exacta de la tienda a una tabla privada (anti-elusión): el catálogo queda con la zona aproximada |
| 19 | `19_catalogo_y_suscripcion.sql` | Arregla el ranking de ventas (anon veía 0) y agrega la suscripción de la tienda (prueba/gracia/vencida) al catálogo |
| 20 | `20_eliminar_cuenta.sql` | Eliminación de cuenta (requisito de Google Play): tabla de solicitudes + RPC para pedirla desde la app |
| 21 | `21_reportes_y_bloqueos.sql` | Reportar contenido/usuarios y bloquear a la contraparte del chat (requisito de Google Play: contenido de usuarios) |

El orden importa: `02` usa columnas de `01`, `03` usa las tablas de `01`, `04` referencia los objetos de `01`–`03`, `10` recrea las vistas de `03`, `12` limpia lo que sembró el `05`, `13` agrega la vista de reseñas, `14` agrega las políticas de lectura del panel de la tienda, `15` restringe la lectura pública de `tiendas` a las aprobadas, `17` crea el chat y reemplaza la función del panel del `11`, `18` mueve la ubicación exacta a una tabla privada (por eso va **después** de `10`) y `19` reescribe las 3 vistas del catálogo (por eso va **después** de `10`). El `20` es independiente y se apoya en `17` (borra mensajes) y `18` (borra la ubicación privada). El `21` va **después de `17`** porque reemplaza las políticas y las funciones del chat (bloqueo) y de `20`.

> ⚠ **`16_limpiar_demo.sql` es aparte del resto.** NO va en la fila del orden normal: se corre **una sola vez, antes de publicar** en Google Play, para borrar las tiendas/productos/pedidos y las **33 reseñas de ejemplo** del `08`. Dejar reseñas inventadas en la app es publicidad engañosa. Después de correrlo, la app queda sin productos (correcto: los pone una tienda real). Es idempotente y solo borra los 4 correos `@repuestosrd.test`.

> Los archivos `02` y `04` **ya incluyen** los fixes de seguridad. El `09` es para
> bases que se crearon con versiones viejas de `02`/`04`: los re-aplica sin romper
> nada (todo es `create or replace` / `drop if exists`).

> `10`, `11`, `12`, `13`, `14`, `15`, `18`, `19`, `20` y `21` son para una base que **ya existía** (agregan ubicación,
> el panel de tienda, corrigen nombres, agregan la vista de reseñas, las políticas del
> panel de productos, endurecen la lectura de `tiendas`, privatizan la ubicación exacta,
> arreglan el ranking + agregan la suscripción, agregan la eliminación de cuenta y
> agregan los reportes y bloqueos).
> En una instalación nueva corren igual sin duplicar nada.

> 🔒 **`18` y la ubicación exacta.** Antes, `tiendas.direccion` y las coordenadas exactas
> eran legibles por cualquiera (incluso sin sesión), así que un tercero podía sacar el local
> exacto sin pasar por la plataforma. El `18` mueve esa ubicación a `public.tiendas_ubicacion`
> (con RLS: solo la ve el dueño y el comprador de un **retiro ya confirmado**), deja
> `tiendas.direccion` en `NULL` y pasa `latitude`/`longitude` a `numeric(9,2)` (~1 km). Si
> volvés a correr `10_ubicaciones.sql`, **volvé a correr `18` al final** para dejar `tiendas`
> saneada otra vez.

> 💰 **`19` y la suscripción + el ranking.** Dos cosas:
> 1. **Ranking:** `productos_mas_vendidos`/`productos_mejor_calificados` son
>    `security_invoker` y no podían leer `detalle_pedido`, así que **el anon veía
>    `unidades_vendidas = 0`**. El `19` calcula las ventas en una función
>    `security definer` (`ventas_por_producto()`) y deja el resto de la vista con RLS.
>    También esconde los productos **inactivos** del ranking.
> 2. **Suscripción (RD$100/mes fundador o RD$500/mes · 30 días gratis · 5 de gracia):** agrega
>    `tiendas.prueba_hasta` y `tiendas.pago_hasta`. Las 3 vistas del catálogo ahora
>    **solo muestran tiendas vigentes**: una tienda vencida (prueba/pago + 5 días de
>    gracia) deja de aparecer en el catálogo, sin borrar nada (el dueño sigue viendo su
>    tienda y sus pedidos, y el comprador sus pedidos).
> El `19` **reescribe las 3 vistas del catálogo**: si volvés a correr `10_ubicaciones.sql`,
> corré el `19` al final otra vez.

> **Si ya tienes tablas** y el SQL falla con `already exists`, los archivos usan `if not exists` / `drop ... if exists` en casi todo, así que es reejecutable. Las funciones usan `create or replace`.
> Si aparece el aviso *"cannot change security_invoker"*, estás en Postgres < 15: borra las vistas con `drop view cascade` y vuelve a correr `03_vistas.sql`.

---

## Después: crear tu primer admin y aprobar tiendas

Desde el mismo SQL Editor (estás con rol `postgres`, no lo restringe RLS):

```sql
-- 1) Convertir en admin (el rol NUNCA se asigna en el registro)
update public.usuarios set rol = 'admin' where email = 'tu@correo.com';

-- 2) Aprobar una tienda
update public.tiendas set aprobada = true where nombre = 'Repuestos El Che';
```

---

## Cómo se registra un usuario y qué pasa

Supabase crea la fila en `auth.users`. El trigger `trg_nuevo_usuario` crea el perfil.

### Opción A — Formulario propio (recomendado)

```js
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {                       // esto es raw_user_meta_data
      rol: 'tienda',              // 'cliente' | 'tienda'  ← "Quiero vender"
      nombre: 'Juan Pérez',
      telefono: '+593 99 123 4567',
      nombre_tienda: 'Repuestos El Che',   // solo si es tienda
      direccion: 'Av. Amazonas N34-56',
    },
  },
});
```

### Opción B — Metadata customization (Dashboard)

`Authentication → Sign In / Providers → Email` o en `Authentication → Users`:

```json
{
  "nombre": "Juan Pérez",
  "telefono": "+593 99 123 4567",
  "rol": "tienda"
}
```

**Qué hace el trigger:**

| `metadata.rol` | Resultado |
|---|---|
| `"tienda"` | crea `usuarios.rol = 'tienda'` **y** `tiendas` con `aprobada = false` y `nombre`; la `direccion` del registro va a `tiendas_ubicacion` (privada, ver `18`) |
| `"cliente"` o cualquier otro valor / ausente | crea `usuarios.rol = 'cliente'` |
| `"admin"` | **se ignora** → queda `cliente`. El admin es solo manual |

El trigger es `security definer`, así que escribe saltándose RLS aunque el usuario no tenga permiso en `usuarios`, `tiendas` ni `tiendas_ubicacion`.

---

## Permisos por rol (resumen)

| | anónimo (sin sesión) | cliente | tienda | admin |
|---|---|---|---|---|
| Ver catálogo, categorías, tipos, vistas | ✅ | ✅ | ✅ | ✅ |
| Crear pedido | ❌ | ✅ | ❌ | ✅ |
| Crear calificación | ❌ | ✅ (pedido entregado y suyo) | ❌ | ✅ |
| Ver pedidos | ❌ | solo los suyos | solo los suyos | todos |
| Publicar producto | ❌ | ❌ | ✅ **solo si aprobada** | ✅ |
| Editar productos | ❌ | ❌ | solo los suyos | todos |
| Ver productos de tienda **no aprobada** | ❌ | ❌ | solo los suyos | todos |
| Subir imágenes | ❌ | ❌ | ✅ su producto | — |
| Aprobar tienda / dar admin | ❌ | ❌ | ❌ | ✅ |

`anon` no tiene permiso de `insert` en `pedidos` ni `calificaciones`, así que aunque alguien falsee el cliente no puede crear nada sin sesión.

---

## Las reglas que pediste y dónde viven

| Regla | Implementación |
|---|---|
| Una calificación por pedido y producto | `constraint calificaciones_unica_por_pedido_producto unique (pedido_id, producto_id)` |
| Solo calificar pedido entregado y propio | trigger `trg_validar_calificacion` + FK compuesta `(pedido_id, cliente_id)` |
| Tienda no aprobada no publica | trigger `trg_validar_producto_tienda` **y** filtro `t.aprobada` en las políticas y vistas |
| Tienda no aprobada no aparece en catálogo | `join public.tiendas t on t.id = p.tienda_id and t.aprobada` en `catalogo_productos` y en las 2 vistas de ranking |
| El total del pedido es real | trigger `trg_detalle_recalcular_total` recalcula al insertar/borrar líneas + `trg_guardar_campos_pedido` bloquea totales falsos |
| El precio queda congelado | columna `detalle_pedido.precio_unitario`; el trigger `trg_detalle_antes_guardar` lo llena SIEMPRE con el precio del producto, ignora lo que mande el cliente |
| Sin sobreventa | trigger `trg_detalle_antes_guardar` bloquea la fila con `for update` y valida stock |
| Admin no se asigna en el registro | el trigger fuerza `'tienda'` o `'cliente'`, nunca `'admin'` |
| Solo sesión iniciada para pedidos/calificaciones | políticas `to authenticated` + `auth.uid()` obligatorio |
| Dirección exacta de la tienda oculta hasta confirmar | `tiendas_ubicacion` con RLS + RPC `ubicaciones_de_mis_pedidos()`; el catálogo solo muestra la zona aproximada (`18`) |
| Tienda vencida deja de aparecer en el catálogo | `public.tienda_vigente(id)` en las 3 vistas del catálogo; `prueba_hasta`/`pago_hasta` en `tiendas` (`19`) |

---

## Las vistas

Todas son `security_invoker = true`, o sea **heredan las políticas RLS de las tablas base**. El `anon` puede leerlas porque las tablas de catálogo (`categorias`, `tipos_repuesto`, `tiendas`, `productos`, `compatibilidad`, `calificaciones`) tienen lectura pública.

> Las 3 vistas del catálogo (`catalogo_productos`, `productos_mas_vendidos`,
> `productos_mejor_calificados`) además **solo muestran tiendas vigentes**
> (aprobada + prueba/gracia/pago sin vencer) — ver la sección de la suscripción.

### `productos_mas_vendidos`
Unidades vendidas **solo de pedidos `entregado`**, tienda aprobada y vigente, de mayor a menor.
Las ventas las calcula `public.ventas_por_producto()` (una función `security definer`),
porque como vista `security_invoker` no podría leer `detalle_pedido` por RLS.

```sql
-- Todas las categorías
select producto, tienda, categoria_nombre, unidades_vendidas, promedio_estrellas
from public.productos_mas_vendidos
limit 10;

-- Filtrado por categoría
select producto, tienda, unidades_vendidas
from public.productos_mas_vendidos
where categoria_nombre = 'Autobuses';
```

### `productos_mejor_calificados`
Promedio y cantidad de calificaciones, **mínimo 3**, ordenado por promedio.

```sql
-- Todas las categorías
select producto, tienda, categoria_nombre, promedio_estrellas, total_calificaciones
from public.productos_mejor_calificados
limit 10;

-- Filtrado por categoría
select producto, promedio_estrellas, total_calificaciones
from public.productos_mejor_calificados
where categoria_nombre = 'Carros';
```

### Promedios por producto y por tienda

```sql
select * from public.vista_calificaciones_producto where producto_id = '<UUID>';
select * from public.vista_calificaciones_tienda    where tienda_id    = '<UUID>';
```

### `catalogo_productos`
Lo que ve el visitante sin sesión: producto + tienda + compatibilidad + promedio.

```sql
select nombre, categoria, tipo, precio, tienda, promedio_estrellas, compatibilidad
from public.catalogo_productos;

-- Buscar por vehículo compatible
select *
from public.catalogo_productos
where compatibilidad @> '[{"marca":"Yamaha","modelo":"FZ250","anio_desde":2015,"anio_hasta":2023}]'::jsonb;
```

### `resenas_producto`

Reseñas de un producto, **sin datos del cliente** (no expone `cliente_id`). Es
lo que muestra el detalle del producto, incluso sin sesión.

```sql
select estrellas, comentario, created_at
from public.resenas_producto
where producto_id = '<UUID>'
order by created_at desc;
```

---

## Ubicación exacta de la tienda (anti-elusión) — `18`

La dirección de calle y las coordenadas **exactas** ya no viven en `tiendas` (que es
pública), sino en `public.tiendas_ubicacion`, protegida con RLS:

| Quién | Qué ve |
|---|---|
| Visitante / cliente sin pedido | Solo la **zona aproximada** (~1 km) que expone el catálogo |
| Dueño de la tienda (y admin) | La dirección y coordenadas exactas de su tienda |
| Comprador con un pedido de **retiro ya confirmado** | La dirección exacta, vía `ubicaciones_de_mis_pedidos()` |

```sql
-- Como dueño de tienda (sesión iniciada): tu ubicación exacta
select * from public.tiendas_ubicacion where tienda_id = public.mi_tienda_id();

-- La ficha pública ya NO tiene dirección de calle (queda NULL)
select id, nombre, direccion, latitude, longitude from public.tiendas;
```

---

## Suscripción de la tienda — `19`

**RD$100/mes (fundador, 25 tiendas, 12 meses) o RD$500/mes (normal). 30 días gratis · 5 días de gracia.**

| Estado | Qué significa | Aparece en el catálogo |
|---|---|---|
| `prueba` | Los 30 días gratis (desde que se creó la tienda). | ✅ |
| `activa` | Pagó y está dentro del período. | ✅ |
| `gracia` | Venció hace menos de 5 días. | ✅ (con aviso) |
| `vencida` | Venció hace más de 5 días. | ❌ (oculta) |

Columnas nuevas en `tiendas`: `prueba_hasta` (default `now() + 30 days`) y `pago_hasta`
(`null` hasta el primer pago). La función `tienda_vigente(id)` es el filtro que usan las
vistas del catálogo. El panel de la tienda ve su estado con `mi_suscripcion()`.

```sql
-- Registrar un pago (sólo admin). Suma meses desde hoy o desde el vencimiento.
select public.registrar_pago_tienda('<uuid-de-la-tienda>', 1);

-- Alternativa manual desde el SQL Editor (estás como postgres, sin RLS):
update public.tiendas
   set pago_hasta = greatest(now(), coalesce(pago_hasta, prueba_hasta, now())) + interval '1 month'
 where nombre = 'Repuestos El Che';

-- Ver el estado de todas las tiendas
select nombre, aprobada, prueba_hasta, pago_hasta, public.tienda_vigente(id) as vigente
  from public.tiendas order by created_at;
```

> El cobro es **manual** por ahora: la tienda paga (transferencia/efectivo), el admin
> registra el pago y la tienda sigue visible. La automatización del cobro (Azul) es un
> paso posterior.

---

## Eliminación de cuenta — `20`

**Google Play exige** que toda app con registro ofrezca (1) una vía dentro de la app
para borrar la cuenta y sus datos, y (2) un enlace web para pedirlo sin instalar la app.

- **App:** Cuenta → **Eliminar mi cuenta** (`src/app/eliminar-cuenta.tsx`). El usuario
  escribe `ELIMINAR` para confirmar.
- **Web:** `/legal/eliminar-cuenta` (sale en el build web; es el enlace que va en Play
  Console).
- **Por qué no se borra solo:** borrar `auth.users` pide la clave `service_role`, que
  nunca va al cliente. La app **registra la solicitud** y borra de inmediato los datos
  personales que no rompen nada (mensajes, calificaciones, teléfono y la ubicación
  privada de la tienda). El cierre final lo hace el admin (pasos al final del `20`).

```sql
-- Solicitudes sin cerrar (las que tenés que atender)
select id, email, motivo, estado, created_at
  from public.solicitudes_eliminacion
 where estado <> 'completada'
 order by created_at;
```

> ⚠️ La FK `pedidos.cliente_id` es `ON DELETE RESTRICT`: un usuario **con pedidos** no
> se puede borrar en cascada sin reasignar antes esos pedidos a una cuenta "eliminada"
> (el procedimiento completo está comentado al final de `20_eliminar_cuenta.sql`). Los
> pedidos se conservan anonimizados por trazabilidad.

---

## Reportes y bloqueos — `21`

**Google Play (política de contenido de usuarios)** exige que la app tenga, dentro de
la app, una forma de **reportar** contenido/usuarios y de **bloquear** a la otra parte
en interacciones 1:1 (nuestro chat del pedido).

- **Reportar:** desde el detalle de un producto (*Reportar este producto*) y desde el
  chat (*menú ⋮ → Reportar*). Guarda en `public.reportes` con un motivo
  (`estafa`, `producto_prohibido`, `acoso`, `contacto_fuera_de_la_app`, `spam`, `otro`)
  y un detalle opcional. Solo lo ve el reportante y el admin.
- **Bloquear:** desde el chat (*menú ⋮ → Bloquear*). Guarda en `public.bloqueos`
  (una fila por par). A partir de ahí, la RLS de `mensajes` oculta los mensajes entre
  las dos partes y **ninguno** puede volver a escribir en ese hilo. Se deshace con
  *Desbloquear*.

```sql
-- Reportes pendientes (los revisás vos)
select id, tipo, motivo, detalle, created_at
  from public.reportes
 where estado = 'pendiente'
 order by created_at;

-- Cerrar un reporte
update public.reportes
   set estado = 'accionado', resuelto_en = now()
 where id = '<UUID-DEL-REPORTE>';
```

> ⚠️ El `21` **reemplaza** las políticas de `mensajes` y las funciones
> `mensajes_sin_leer()` y `pedidos_de_mi_tienda()` que creó el `17`. Si volvés a correr
> el `17`, tenés que volver a correr el `21` al final.

---

## Subir imágenes

Bucket `productos`, público, máx 5 MB, solo `jpg/png/webp/avif`.
**La ruta debe ser `productos/<producto_id>/<archivo>`** — la política extrae el `producto_id` de la ruta y verifica que esa tienda sea tuya.

La app ya hace esto desde el teléfono: **Mis repuestos → Editar → *Subir fotos del
teléfono*** (usa `expo-image-picker` y `subirImagenProducto` en `src/lib/queries.ts`).
El ejemplo de abajo es para hacerlo desde código/consola.

```js
// 1) crear el producto, guardar su id
const { data: prod } = await supabase.from('productos').insert({
  tienda_id, categoria_id, tipo_id,
  nombre: 'Pastilla de freno', precio: 24.90, stock: 40,
  condicion: 'original', imagenes: [],
}).select().single();

// 2) subir la imagen
const ruta = `productos/${prod.id}/frente.jpg`;
const { error } = await supabase.storage
  .from('productos')
  .upload(ruta, archivo, { upsert: true });

// 3) guardar la URL pública en productos.imagenes (text[])
await supabase.from('productos')
  .update({ imagenes: [supabase.storage.from('productos').getPublicUrl(ruta).data.publicUrl] })
  .eq('id', prod.id);
```

Bucket `logos`: ruta `logos/<dueno_id>/<archivo>`, mismo patrón con tu `user.id`.

---

## Limitaciones conocidas

- **El stock se repone al borrar una línea y al cancelar el pedido** (`trg_devolver_stock_linea` y `trg_devolver_stock_cancelado`). Editar la *cantidad* de una línea todavía no revalida/reponer: cuando agregues edición de líneas, revalida stock ahí.
- **`total` se recalcula, no se cobra.** El pago real se integra aparte (Stripe, PayPal, transferencia manual).
- **El carrito multi-tienda ya parte en varios pedidos** (uno por tienda) al hacer checkout. Cada pedido es de una sola tienda, que es lo que garantiza la base.
- **La app no cobra en línea.** El pago del pedido (efectivo/transferencia) se acuerda con la tienda. La **suscripción mensual de la tienda** (RD$500/mes) se cobra al principio de forma **manual**: el admin registra el pago y la tienda sigue visible (ver `19` y `22`).
- **El costo de delivery se coordina aparte** y no entra en el total del pedido (el total es solo productos).

## Siguiente paso

Registra un usuario de prueba, ábrelo desde una ventana privada (sin sesión) y confirma que `select * from catalogo_productos` devuelve filas: eso prueba que la lectura pública y RLS quedaron bien.
