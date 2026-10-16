# Supabase — paso a paso

Todo lo que tenés que hacer **a mano** en Supabase para que la app funcione.
Son 6 pasos + crear los usuarios de prueba. La primera vez te lleva unos 20
minutos.

Los archivos SQL que hay que correr están en `C:\Users\Theki\Desktop\repuesto`.

---

## Paso 1 — Crear el proyecto

1. Entrá a <https://supabase.com/dashboard> y logueate.
2. `New project`.
3. **Organization**: la que tengas (o creá una nueva).
4. **Name**: `repuestos-rd`
5. **Database Password**: inventá una fuerte y **anótala**. No hay forma de recuperarla desde el dashboard.
6. **Region**: `US East (North Virginia)` — la más cercana a Santo Domingo.
7. `Create new project`.

Tarda unos 2 minutos. Vas a ver una pantalla de "Setting up project".

> **Importante:** creá un proyecto **nuevo**, dedicado a este marketplace. No uses
> un proyecto que ya tengas con otra cosa, porque los archivos SQL crean tablas
> con nombres genéricos (`usuarios`, `pedidos`, `productos`).

---

## Paso 2 — Correr los 18 archivos SQL

1. Barra izquierda → ícono **`SQL`** → botón **`New query`**.
2. Abrí `C:\Users\Theki\Desktop\repuesto\01_esquema.sql`, copiá **todo** y pegalo en el editor.
3. Presioná **`Run`** (abajo a la derecha, o `Ctrl + Enter`).
4. Esperá el cartel verde `Success`.
5. Repetí con el siguiente archivo. **En este orden exacto:**

| # | Archivo | Qué hace |
|---|---------|----------|
| 1 | `01_esquema.sql` | Las 9 tablas |
| 2 | `02_funciones_triggers.sql` | Triggers de registro, validaciones, stock, totales + hardening |
| 3 | `03_vistas.sql` | Catálogo y rankings (con columnas de ubicación) |
| 4 | `04_rls.sql` | Row Level Security |
| 5 | `05_datos_iniciales.sql` | 3 categorías + tipos de repuesto |
| 6 | `06_storage.sql` | Buckets de imágenes |
| 7 | `07_verificacion.sql` | Checks (opcional) |
| 8 | `08_datos_demo.sql` | Datos de demostración (opcional, requiere el Paso 7 de acá abajo) |
| 9 | `09_seguridad.sql` | Parche de seguridad P0 (idempotente) |
| 10 | `10_ubicaciones.sql` | Columnas `latitude`/`longitude` + vistas con ubicación |
| 11 | `11_panel_tienda.sql` | Función para el panel de la tienda |
| 12 | `12_tipos_repuesto.sql` | Limpieza de nombres de tipos (acentos y typos) |
| 13 | `13_resenas.sql` | Vista pública `resenas_producto` + lectura de reseñas sin sesión |
| 14 | `14_panel_productos.sql` | Políticas para que la tienda vea todos sus productos (panel) |
| 15 | `15_tiendas_rls.sql` | La lectura pública de `tiendas` solo muestra las aprobadas |
| 16 | `16_limpiar_demo.sql` | **Antes de publicar**: borra tiendas/productos/pedidos y las reseñas de ejemplo |
| 17 | `17_mensajes.sql` | Chat interno del pedido (anti-elusión) + panel de tienda sin el contacto del cliente |
| 18 | `18_tiendas_privacidad.sql` | Ubicación exacta de la tienda a una tabla privada: el catálogo queda con la zona aproximada |
| 19 | `19_catalogo_y_suscripcion.sql` | Ranking de ventas arreglado + suscripción de la tienda (prueba/gracia/vencida) |
| 20 | `20_eliminar_cuenta.sql` | Eliminación de cuenta (requisito de Google Play): solicitudes + RPC |
| 21 | `21_reportes_y_bloqueos.sql` | Reportar contenido/usuarios y bloquear a la contraparte del chat (contenido de usuarios) |

**El orden importa.** El 02 usa columnas del 01, el 03 usa tablas del 01, el 04
usa objetos del 01–03, el 10 recrea las vistas del 03, el 12 limpia lo que sembró
el 05, el 13 agrega la vista de reseñas sobre el 03/04, el 14 agrega las políticas
del panel de productos, el 15 endurece la lectura pública de `tiendas`, el 17
crea el chat y **reemplaza la función del panel del 11**, el 18 mueve la
ubicación exacta a una tabla privada (**después del 10**) y el 19 reescribe las
3 vistas del catálogo (**después del 10**).

> **`09_seguridad.sql`**: es el parche de seguridad P0. Si recién empezás, el `02`
> y el `04` que corriste ya traen los fixes incluidos y el 09 es redundante (pero
> inofensivo, es idempotente). Si tu base ya tenía el `02`/`04` viejos, corré el
> 09 y listo.

> **`10`, `11`, `12`, `13`, `14`, `15`, `17`, `18`, `19`, `20` y `21`** son para una base que ya existía. En
> una instalación nueva son inofensivos igual: recrean/actualizan sin duplicar.

> 🔒 **`18`** mueve la dirección de calle y las coordenadas exactas a la tabla privada
> `tiendas_ubicacion` (solo las ve el dueño y el comprador de un retiro confirmado), deja
> `tiendas.direccion` en `NULL` y redondea `latitude`/`longitude` a ~1 km. Si volvés a
> correr `10_ubicaciones.sql`, **volvé a correr `18` al final**.

### Si un archivo sale rojo

Copiá el error **completo** y mandámelo. No sigas al siguiente archivo hasta
que el anterior esté en verde.

Dos errores que son normales y podés ignorar:
- `notice: ... already exists` → es solo un aviso, no un error.
- Aviso de que una función ya existe → el `create or replace` la actualizó.

---

## Paso 3 — Activar el login por email

1. Barra izquierda → **`Authentication`**.
2. Pestaña **`Sign In / Providers`**.
3. Buscá **`Email`** y poné el interruptor en **ON**.
4. **Desactivá "Confirm email"** (o *Confirm signup*), **solo para desarrollo**.

> ⚠️ Si dejás "Confirm email" activado, te registrás pero **nunca podés entrar**
> a la app, y parece un bug del código. Vas a perder horas por esto.

5. En **`Authentication` → `URL Configuration`**:
   - Para probar en el teléfono con Expo Go no hace falta tocar nada.

---

## Paso 4 — Sacar las 2 claves

1. Barra izquierda → ícono de **engranaje** ⚙️ (abajo) → **`API`**.
2. En el bloque **Project URL** copiá algo como `https://abcdefgh.supabase.co`.
   - Esta es la **API**, no la dirección del sitio web.
3. En **Project API Keys** copiá la que dice **`anon` `public`**.
   - Empieza con `eyJ`.
   - Es pública **por diseño**: va en la app sin problema. Lo que protege los datos
     son las reglas de RLS que ya instalamos en el paso 2.
   - 🔴 **Nunca** uses la `service_role` ni la nueva `secret` en la app.

---

## Paso 5 — Pegarlas en la app

En `C:\Users\Theki\Desktop\RepuestosRD` existe un archivo `.env`. Abrilo y pegá
tus valores:

```
EXPO_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Sin comillas, sin espacios al final. Guardá.

Si algún día no encontrás el `.env`, el original está en `.env.example`
(que además tiene comentarios explicando cada cosa).

---

## Paso 6 — Reiniciar y comprobar

```bash
cd C:\Users\Theki\Desktop\RepuestosRD
npx expo start -c
```

La **`-c` es obligatoria**: sin ella Metro usa la versión vieja del `.env`.

Escaneá el QR con **Expo Go** (o apretá `a` / `i` si estás en un emulador).

### Debería pasar esto

- La app **deja de mostrar** la pantalla "Falta conectar Supabase" y aparece el
  inicio con las pestañas.
- En **Buscar** ya ves productos (si corriste el `08`).
- **Cuenta** muestra "Entrá o creá tu cuenta" si no iniciaste sesión.

### Comprobar desde la base

Volvé al **SQL Editor** y corré:

```sql
-- 1) categorías, tipos de repuesto y que no queden nombres viejos
select c.nombre as categoria, count(t.id) as tipos
  from categorias c
  left join tipos_repuesto t on t.categoria_id = c.id
 group by c.nombre;
```

Debés ver 3 filas con ~20–30 tipos cada una.

```sql
-- 2) RLS activo en las 9 tablas
select tablename, rowsecurity
  from pg_tables
 where schemaname = 'public'
 order by tablename;
```

Las 9 deben tener `rowsecurity = true`.

```sql
-- 3) las vistas existen
select table_name from information_schema.views
 where table_schema = 'public';
```

```sql
-- 4) la función del panel de tienda existe
select proname from pg_proc where proname = 'pedidos_de_mi_tienda';
```

---

## Paso 7 — Usuarios de prueba (para el `08_datos_demo.sql`)

El demo no puede inventar usuarios de `auth` desde SQL: creálos a mano.

`Authentication → Users → Add user → Create new user`. En cada uno tildá
**"Auto Confirm User"**:

| # | email | nombre | rol en la app |
|---|-------|--------|---------------|
| 1 | `tienda1@repuestosrd.test` | Repuestos El Che | Tienda |
| 2 | `tienda2@repuestosrd.test` | Auto Repuestos RD | Tienda |
| 3 | `tienda3@repuestosrd.test` | Repuestos del Este | Tienda |
| 4 | `cliente@repuestosrd.test` | Juan Pérez | Comprador |

> Cuando creás un usuario, el trigger `manejar_nuevo_usuario` le crea su fila en
> `usuarios` leyendo el rol de la metadata. Si no ponés metadata, queda como
> comprador; pero el `08_datos_demo.sql` **igual** baja y vuelve a crear esos
> perfiles con el rol correcto, así que no hace falta pelear con la metadata.

Entonces:

1. Creá los 4 usuarios con **Auto Confirm User** tildado.
2. Corré `08_datos_demo.sql`. Él solo crea los `usuarios` con el rol correcto
   (2 tiendas + 1 cliente), las 3 tiendas **ya aprobadas**, los productos, los
   pedidos y las calificaciones.

Opcional: si querés que el rol quede bien **antes** de correr el demo, en el
diálogo "Add user" poné en **User Metadata** algo así:

```json
{ "rol": "tienda", "nombre": "Repuestos El Che", "nombre_tienda": "Repuestos El Che" }
```

Para entrar con contraseña, en **Authentication → Users** elegí el usuario y usá
**"Reset password"** (o creá los usuarios con una contraseña y tildá Auto
Confirm).

### Cuenta de administrador (opcional)

El CRUD de tipos de repuesto (`Cuenta → Administrar tipos de repuesto`) es solo
para `admin`. Creá un usuario más (por ejemplo `admin@repuestosrd.test`, Auto
Confirm) y ascendelo:

```sql
update usuarios set rol = 'admin' where email = 'admin@repuestosrd.test';
```

---

## Cosas que vas a necesitar hacer más adelante

**Aprobar una tienda** que se registró desde la app:

```sql
update tiendas set aprobada = true where nombre = 'Repuestos El Che';
```

**Ver el catálogo sin crear nada**, para probar que la lectura pública funciona:

```sql
select nombre, precio, tienda from catalogo_productos limit 10;
```

**Ajustar la ubicación exacta** de una tienda (desde el `18` la exacta vive en
`tiendas_ubicacion`; `tiendas` solo guarda una versión aproximada para el catálogo):

```sql
update public.tiendas_ubicacion
   set direccion = 'Av. Duarte 45, Santo Domingo Oeste',
       latitude = 18.478600,
       longitude = -70.011600
 where tienda_id = (select id from public.tiendas where nombre = 'Repuestos El Che');
```

La ficha pública (`tiendas.latitude/longitude`) queda redondeada sola a ~1 km.

---

## Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| Pantalla "Falta conectar Supabase" | Faltan las keys o el `.env` | Revisá el paso 5 y usá `npx expo start -c` |
| Pegaste las keys y sigue igual | Metro cacheó el `.env` | `npx expo start -c` (la `-c`) |
| "Invalid login credentials" siempre | Dejaste "Confirm email" activo | Paso 3, desactivá "Confirm email" |
| Un SQL sale rojo | Orden equivocado o error de tipeo | Mandame el error completo |
| `permission denied for table usuarios` | El SQL se corrió a medias | Volvé a correr `04_rls.sql` |
| El panel de tienda dice "No pudimos cargar" | Falta correr el `11` | Corré `11_panel_tienda.sql` |
| Los tipos salen sin acentos (`Bateria`) | Corriste el `05` viejo | Corré `12_tipos_repuesto.sql` |
| No aparecen tiendas cerca | Faltan las coordenadas | Corré `10_ubicaciones.sql` |
| Las reseñas no se ven (o dan error de permisos) | Falta correr el `13` | Corré `13_resenas.sql` |
| El `07` tira `invalid input syntax for type uuid` | Los ejemplos usaban `'<UUID>'` literales | Recopiá el `07_verificacion.sql` corregido (ya no usa placeholders) |
| El `08` se corta con "El producto no pertenece a la tienda de este pedido" | El seed tenía 2 líneas cruzadas entre tiendas | Recopiá el `08_datos_demo.sql` corregido (ya está arreglado) |
| El `08` dice que faltan usuarios | No creaste los 4 usuarios de prueba en Authentication | Paso 7: crealos con "Auto Confirm User" y volvé a correrlo |
| En "Mis repuestos" no veo mis productos pausados | Falta correr el `14` | Corré `14_panel_productos.sql` |
| Al subir fotos da error de RLS | Falta correr el `06` | Corré `06_storage.sql` (bucket `productos` + políticas) |
| El detalle del producto ya no muestra la dirección de la tienda | Es intencional desde el `18` (anti-elusión) | El comprador la ve al confirmarse el retiro; si querés, corré `18` de nuevo |
| Al comprador no le aparece la dirección del retiro | El pedido no está confirmado, o falta el `18` | La tienda debe confirmar; corré `18_tiendas_privacidad.sql` |
| No aparecen las tiendas que todavía no aprobé | Es intencional desde el `15` | Aprobalas: `update tiendas set aprobada = true where ...` |
| El ranking de "más vendidos" muestra `0` ventas | Faltaba el `19` (las vistas no podían leer las ventas por RLS) | Corré `19_catalogo_y_suscripcion.sql` |
| Una tienda aprobada no aparece en el catálogo | Puede estar **vencida** (prueba/pago + 5 días de gracia) | Registrá el pago: `select public.registrar_pago_tienda('<uuid>', 1)`, o mirá `prueba_hasta`/`pago_hasta` |
| "Eliminar mi cuenta" da error | Falta correr el `20` | Corré `20_eliminar_cuenta.sql` |
| No puedo borrar un usuario desde Authentication | Tiene pedidos (`ON DELETE RESTRICT`) | Reasigná sus pedidos primero (procedimiento al final del `20`) |
| El chat dice "No pudimos cargar" | Falta correr el `17` | Corré `17_mensajes.sql` |
| El chat no se actualiza solo | Realtime no está activado | El `17` lo activa; volvé a correrlo |
| Reportar o bloquear da error | Falta correr el `21` | Corré `21_reportes_y_bloqueos.sql` |
| Después de correr el `17`, dejó de funcionar el bloqueo | El `17` recrea las policies/funciones del chat | Volvé a correr el `21` al final |
| Puerto 8081 ocupado | Otro Metro corriendo | `npx expo start -c --port 8082` |

---

## Dónde está cada cosa

| Necesitás | Está en |
|---|---|
| Los archivos SQL | `C:\Users\Theki\Desktop\repuesto\` |
| La app | `C:\Users\Theki\Desktop\RepuestosRD\` |
| Los colores (cambialos acá) | `RepuestosRD\src\theme\colors.ts` |
| Cómo se conecta cada cosa | `RepuestosRD\src\lib\supabase.ts` |
| Las consultas | `RepuestosRD\src\lib\queries.ts` |
| Los tipos de la base | `RepuestosRD\src\types\database.generated.ts` |
