# RepuestosRD

Marketplace de repuestos de vehículos para República Dominicana.
React Native + Expo (TypeScript) + Supabase.

---

## Estado actual

| Etapa | Qué es | Estado |
|---|---|---|
| 1 | Base Expo, tema, navegación, conexión a Supabase | ✅ hecha |
| 2 | Registro e inicio de sesión (con rol comprador / tienda) | ✅ hecha |
| 3 | Catálogo real, búsqueda por compatibilidad y detalle de producto | ✅ hecha |
| 4 | Carrito multi-tienda, checkout y pedidos | ✅ hecha |
| 5 | Panel de la tienda (pedidos por cliente y cambio de estado) | ✅ hecha |
| 6 | Calificaciones (mostrarlas y calificar un pedido entregado) | ✅ hecha |
| 7 | Panel de productos de la tienda (publicar, editar, pausar y borrar) | ✅ hecha |
| 8 | Fotos de los repuestos desde el teléfono (`expo-image-picker` + Storage) | ✅ hecha |

Además, ya funcionan:

- **Ubicación y zonas dinámicas**: la app pide la ubicación del usuario **solo
  cuando hace falta** (no al abrir). El inicio ordena los rankings por cercanía
  (radio de 60 km) y el detalle del producto muestra la tienda con mapa y
  distancia en km.
- **Búsqueda por checklist** de marca / modelo / año, filtrando por categoría
  (motos, carros, guaguas).
- **Stock real**: lo agotado no se puede agregar al carrito y se marca en la
  tarjeta.
- **Administración de tipos de repuesto** (solo rol `admin`): crear, editar y
  borrar los tipos con los que las tiendas clasifican cada repuesto.
- **Panel de productos de la tienda**: cada tienda publica, edita, pausa y borra
  sus repuestos, y carga su compatibilidad (marca/modelo/año desde–hasta). Los
  productos pausados no se borran: quedan fuera del catálogo pero visibles en el
  panel. Borrar un repuesto que ya tiene pedidos lo impide la base (mejor pausarlo).
- **Fotos desde el teléfono**: al publicar o editar un repuesto podés subir hasta 5
  fotos por vez desde la galería (además de pegar una URL). Se suben al bucket
  `productos` recién cuando guardás, así no queda basura si cancelás.
- **Páginas legales** (`/legal`, sin necesidad de iniciar sesión): Privacidad,
  Términos y Condiciones, Cookies, Reembolsos y Aviso Legal. Los datos del
  responsable viven en `src/lib/legal.ts`. El registro y el checkout exigen
  **aceptar** los Términos y la Privacidad antes de continuar.
- **Íconos propios**: `scripts/generar-iconos.ps1` los arma desde
  `assets/images/logo.png` (fondo negro, sin transparencia en el ícono principal
  y silueta para el tema monocromo). Los assets de plantilla de Expo/Meta/React
  se eliminaron.

> La app **no crashea** sin claves de Supabase: muestra una pantalla con los
> pasos para conectarlo (`SetupRequired`).

---

## Arrancar

```bash
npm install
npx expo start -c
```

La **`-c`** importa: limpia la caché de Metro, y sin ella los cambios en `.env`
no se ven.

Escaneá el QR con **Expo Go**.

### Conectar Supabase

Todo el detalle en **[`SUPABASE-PASO-A-PASO.md`](./SUPABASE-PASO-A-PASO.md)**.
Resumen: crear proyecto → correr los SQL de `Desktop\repuesto` **en orden**
(`01` … `15`) → activar login por email → crear los usuarios de prueba → copiar
`Project URL` y `anon public` a `.env` → `npx expo start -c`.

---

## Cómo se usa

### Comprador

1. Entra a **Inicio**: ve los más vendidos y mejor calificados **de su zona**.
2. **Buscar**: marca moto/carro/guagua y filtra por marca, modelo y año.
3. Abre un producto: ve precio, stock, compatibilidad, la **tienda con su mapa
   y la distancia en km** desde donde estás, y las **reseñas** de otros
   compradores.
4. Agrega al **carrito** y paga en **checkout**. Si comprás en varias tiendas,
   se genera **un pedido por tienda** (el envío se coordina aparte y no entra
   en el total del pedido). Cuando son varias tiendas, elegís con un **botón de
   radio** si todas entregan en la **misma dirección** (la escribís una sola
   vez) o si cada una va a una dirección distinta.
5. Sigue el estado en **Pedidos**: Recibido → Confirmado → En camino →
   Entregado (o Cancelado).
6. Cuando el pedido está **Entregado**, aparece el botón **Calificar compra**:
   elegís estrellas y un comentario por cada repuesto del pedido. Las reseñas se
   ven en el detalle de cada producto (para todos, incluso sin sesión).

### Tienda (colaborador)

La cuenta con rol `tienda` usa la misma pestaña **Pedidos** como su panel:

- Ve **solo los pedidos de su tienda**, con el **nombre y el teléfono del
  cliente** y la dirección de entrega.
- Avanza el pedido con un botón: **Confirmar** → **Marcar en camino** →
  **Marcar entregado**, y puede **Cancelar** mientras no esté entregado.

> El contacto del cliente lo entrega la función `pedidos_de_mi_tienda()`
> (`11_panel_tienda.sql`) porque la RLS de `usuarios` no deja leer perfiles
> ajenos con un `select` normal.

### Administrador

En **Cuenta** aparece el botón **“Administrar tipos de repuesto”**
(`/admin/tipos`): lista los tipos por categoría y permite agregar, renombrar,
mover de categoría y borrar. No se puede borrar un tipo que esté en uso por
algún producto.

---

## Ubicación y zonas

Sin dependencias nuevas de mapa: el botón **“Abrir en el mapa”** usa un *deep
link* a Google Maps (`https://www.google.com/maps/search/?api=1&query=lat,lng`).

- Store de ubicación: `src/store/ubicacion.ts` (Zustand).
- Distancias y orden por cercanía: `src/lib/geo.ts` (haversine, radio 60 km).
- Permiso: se pide **solo al tocar** el accesorio de ubicación o el botón del
  detalle. Si se deniega, la app sigue funcionando sin zona.

---

## Estructura

```
src/
├─ app/                          ← rutas (Expo Router)
│  ├─ _layout.tsx                tema + sesión + guarda de config
│  ├─ +not-found.tsx
│  ├─ ingresar.tsx               login + registro
│  ├─ checkout.tsx               confirmar y crear el pedido
│  ├─ producto/[id].tsx          detalle: precio, stock, tienda + mapa + distancia + reseñas
│  ├─ calificar/[pedidoId].tsx   dejar reseña de un pedido entregado
│  ├─ chat/[pedidoId].tsx        chat comprador ↔ tienda (anti-elusión)
│  ├─ mis-productos.tsx          lista de repuestos de la tienda (panel)
│  ├─ mi-producto/[id].tsx       alta/edición de repuesto (fotos, precio, compatibilidad)
│  ├─ admin/tipos.tsx            CRUD de tipos de repuesto (admin)
│  ├─ legal/                     privacidad, términos, cookies, reembolsos, aviso legal
│  └─ (tabs)/
│     ├─ _layout.tsx             barra inferior: Inicio, Buscar, Carrito, Pedidos, Cuenta
│     ├─ index.tsx               Inicio (zona dinámica)
│     ├─ buscar.tsx              búsqueda + checklist
│     ├─ carrito.tsx             carrito multi-tienda
│     ├─ pedidos.tsx             "Mis pedidos" o panel de la tienda
│     └─ cuenta.tsx              perfil, rol, zona, accesos
├─ components/
│  ├─ ProductCard.tsx            tarjeta con imagen, precio, distancia, tienda
│  ├─ SectionProductos.tsx       carrusel horizontal del inicio
│  ├─ Stars.tsx                  estrellas doradas
│  ├─ SelectorEstrellas.tsx      estrellas tocables para calificar (1 a 5)
│  ├─ CategoryChips.tsx          filtro Todos / Motocicletas / Carros / Guaguas
│  ├─ EmptyState.tsx
│  ├─ LegalDoc.tsx               plantilla de las páginas legales
│  ├─ ConsentimientoLegal.tsx    casilla de Términos/Privacidad
│  ├─ WebShell.tsx               contenedor adaptable (teléfono / escritorio)
│  └─ SetupRequired.tsx          pantalla de guarda sin claves
├─ hooks/
│  ├─ useSesion.tsx              usuario + su ficha de tienda
│  ├─ useCatalogo.ts             rankings, búsqueda y detalle (ordenados por cercanía)
│  ├─ usePedidos.ts              pedidos del comprador
│  ├─ usePedidosTienda.ts        pedidos de la tienda
│  ├─ useMensajes.ts             chat del pedido (Realtime + marcar leído)
│  ├─ useMisProductos.ts         repuestos de la tienda (panel)
│  ├─ useTipos.ts                tipos de repuesto + categorías (admin)
│  ├─ useResenas.ts              reseñas públicas de un producto
│  ├─ useCampoEnfocado.ts        sube el formulario cuando se abre el teclado
│  └─ useResponsive.ts           teléfono vs escritorio
├─ lib/
│  ├─ supabase.ts                cliente + isConfigured + buckets
│  ├─ queries.ts                 todas las consultas a Supabase
│  ├─ geo.ts                     distancia, orden por cercanía, URL de mapa
│  ├─ constants.ts               categorías, estados, pasos del pedido
│  ├─ legal.ts                   ⭐ datos del negocio y documentos legales
│  └─ format.ts                  RD$, fechas, teléfonos
├─ store/
│  ├─ carrito.ts                 carrito (Zustand, persistido en AsyncStorage)
│  └─ ubicacion.ts               ubicación del usuario (Zustand)
├─ theme/
│  ├─ colors.ts                  ⭐ LOS COLORES — editar solo aquí
│  └─ index.ts                   tema de Paper armado desde colors.ts
└─ types/
   ├─ database.ts                tipos del dominio, más cómodo de leer
   └─ database.generated.ts      tipos generados de Supabase
```

---

## Cambiar los colores

Todo está en **un solo archivo**:

```
src/theme/colors.ts
```

| Color | Hex | Dónde se usa |
|---|---|---|
| Fondo | `#0D0D0D` | Fondo de la app |
| Superficie | `#1C1C1C` | Tarjetas, barra inferior, campos |
| Primario | `#6B7A2F` | Botones, elementos activos |
| Primario claro | `#8A9A3B` | Enlaces, textos destacados |
| Texto | `#F5F5F0` | Texto principal |
| Estrellas | `#F2B705` | Calificaciones |

Cambiás un valor ahí y cambia en toda la app.

---

## Base de datos

Los SQL están en `C:\Users\Theki\Desktop\repuesto`, en este orden:

| # | Archivo | Contenido |
|---|---|---|
| 1 | `01_esquema.sql` | Las 9 tablas |
| 2 | `02_funciones_triggers.sql` | Triggers de registro, validación, stock, totales + hardening |
| 3 | `03_vistas.sql` | `catalogo_productos`, rankings, promedios (con columnas de ubicación) |
| 4 | `04_rls.sql` | Row Level Security |
| 5 | `05_datos_iniciales.sql` | 3 categorías + tipos de repuesto |
| 6 | `06_storage.sql` | Buckets `productos` y `logos` |
| 7 | `07_verificacion.sql` | Checks y consultas de ejemplo |
| 8 | `08_datos_demo.sql` | Datos de demostración: 3 tiendas, 22 productos, 15 pedidos |
| 9 | `09_seguridad.sql` | Parche de seguridad P0 (idempotente) |
| 10 | `10_ubicaciones.sql` | Columnas `latitude`/`longitude` y vistas con ubicación |
| 11 | `11_panel_tienda.sql` | RPC `pedidos_de_mi_tienda()` para el panel de la tienda |
| 12 | `12_tipos_repuesto.sql` | Limpieza de nombres de tipos (acentos y typos) |
| 13 | `13_resenas.sql` | Vista pública `resenas_producto` y lectura de reseñas sin sesión |
| 14 | `14_panel_productos.sql` | Políticas para que la tienda vea todos sus productos (panel) |
| 15 | `15_tiendas_rls.sql` | La lectura pública de `tiendas` solo muestra las aprobadas |
| 16 | `16_limpiar_demo.sql` | **Antes de publicar**: borra tiendas/productos/pedidos y las reseñas de ejemplo |
| 17 | `17_mensajes.sql` | Chat interno del pedido + panel de tienda sin el contacto del cliente |
| 18 | `18_tiendas_privacidad.sql` | Ubicación exacta de la tienda a una tabla privada: el catálogo queda con la zona aproximada |
| 19 | `19_catalogo_y_suscripcion.sql` | Arregla el ranking de ventas y agrega la suscripción de la tienda (prueba/gracia/vencida) |
| 20 | `20_eliminar_cuenta.sql` | Eliminación de cuenta (requisito de Google Play): solicitudes + RPC |
| 21 | `21_reportes_y_bloqueos.sql` | Reportar contenido/usuarios y bloquear a la contraparte del chat (requisito de Google Play: contenido de usuarios) |

### Reportes y bloqueos

Google Play (política de **contenido de usuarios**) exige que la app tenga,
dentro de la app, cómo **reportar** contenido y **bloquear** a la otra parte en
el chat 1:1. Se reporta un producto o a una persona (menú ⋮ del chat) y se puede
bloquear a la contraparte: al bloquear, la RLS oculta los mensajes entre ambos y
ninguno puede volver a escribir en ese hilo.

### Eliminación de cuenta

Google Play exige **dos vías**: dentro de la app (Cuenta → **Eliminar mi cuenta**)
y un **enlace web** (`/legal/eliminar-cuenta`, sin necesidad de instalar la app).
La app registra la solicitud y borra de inmediato los datos personales no
esenciales; el cierre definitivo (borrar la cuenta de `auth.users`) lo hace el
admin, porque requiere la clave `service_role` (procedimiento al final de
`20_eliminar_cuenta.sql`).

### Suscripción de la tienda

**RD$500/mes · 30 días gratis · 5 días de gracia.** Las tiendas nuevas arrancan
con 30 días de prueba (`tiendas.prueba_hasta`); al pagar se extiende
`tiendas.pago_hasta`. Una tienda **vencida** deja de aparecer en el catálogo (no
se borra nada: el dueño sigue viendo su tienda y sus pedidos). El panel de la
tienda muestra su estado (aviso de prueba, activa, gracia o vencida). El cobro
es manual por ahora: el admin registra el pago con
`public.registrar_pago_tienda(<uuid>, 1)`.

### Ubicación exacta de la tienda (anti-elusión)

La dirección de calle y las coordenadas exactas viven en `tiendas_ubicacion`
(privada), **no** en `tiendas` (que es pública). RLS:

- La ve el **dueño** de la tienda (y el admin).
- La ve el **comprador de un pedido de retiro ya confirmado** (RPC
  `ubicaciones_de_mis_pedidos`).
- El catálogo solo muestra la **zona aproximada** (~1 km) y la distancia
  estimada. Al confirmarse el retiro, la tarjeta del pedido muestra
  "Retirar en: <dirección>".

### Chat del pedido (anti-elusión)

El comprador y la tienda hablan **dentro de la app** (`/chat/[pedidoId]`), sin
intercambiar teléfono ni correo:

- Tabla `mensajes` con RLS: solo la ven los dos participantes del pedido.
- Se actualiza en vivo con **Realtime** (si no está disponible, igual funciona
  cargando al abrir).
- El panel de la tienda **ya no muestra** el teléfono ni el correo del cliente,
  y la dirección de entrega aparece recién cuando el pedido se confirma.
- Los mensajes sin leer se marcan con la RPC `marcar_mensajes_leidos` y se
  cuentan con `mensajes_sin_leer` (el globito del botón de chat).
- Desde el menú **⋮** del chat se puede **reportar** a la persona y
  **bloquearla** (requisito de Google Play: contenido de usuarios). Al bloquear,
  los mensajes entre ambos se ocultan y ninguno puede escribir en ese hilo.

### Estados del pedido

La base guarda 6 estados; el cliente ve 4. La traducción está en
`src/lib/constants.ts` → `ETAPAS_PEDIDO` y `PROGRESO_PEDIDO`:

| En la base | Lo ve el cliente | Botón de la tienda |
|---|---|---|
| `pendiente` | Recibido | Confirmar pedido |
| `confirmado` | Confirmado | Marcar en camino |
| `preparando` | En camino | Marcar entregado |
| `enviado` | En camino | Marcar entregado |
| `entregado` | Entregado | — |
| `cancelado` | Cancelado | — |

---

## Detalles técnicos

**Expo SDK 57** · React Native 0.86 · React 19.2 · Expo Router 57 (JS tabs)
React Native Paper 5 · Supabase JS 2 · Zustand 5 · `expo-location` · `expo-image-picker`

Las rutas viven en `src/app/`, no en `app/`. Está configurado en el
`package.json` por Expo Router.

### Imports

Usá el alias `@/`:

```ts
import { colors } from '@/theme';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
```

### Seguridad

La `anon key` va en la app sin problema: es pública por diseño. Lo que protege
los datos son las políticas RLS. **Nunca** pongas la `service_role` ni la
`secret` en el cliente.

---

## Comandos

```bash
npx expo start -c      # arrancar con caché limpia
npx expo start         # arrancar normal
npx expo lint          # eslint
npx tsc --noEmit       # verificar tipos
npx expo-doctor        # diagnosticar la configuración
npx expo install <pkg> # instalar paquete con la versión correcta del SDK
```

Regenerar los íconos (PowerShell, Windows):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/generar-iconos.ps1
```

Usá siempre `npx expo install` y no `npm install`, así los paquetes quedan en la
versión que el SDK espera.

---

## Legal

Los documentos están en `src/app/legal/` y los leen de un único archivo de datos:

```
src/lib/legal.ts   →   NEGOCIO (responsable, RNC, ciudad, correo) + PAGINAS_LEGALES
```

| Documento | Ruta |
|---|---|
| Índice | `/legal` |
| Privacidad | `/legal/privacidad` |
| Términos y Condiciones | `/legal/terminos` |
| Cookies | `/legal/cookies` |
| Reembolsos | `/legal/reembolsos` |
| Aviso Legal | `/legal/aviso-legal` |
| Eliminar cuenta y datos | `/legal/eliminar-cuenta` |

Para la ficha de **Google Play** vas a necesitar la **URL pública de la política
de privacidad** (`https://<tu-dominio>/legal/privacidad`) y la **URL de eliminación
de cuenta** (`https://<tu-dominio>/legal/eliminar-cuenta`). Si cambiás un dato del
negocio, cambialo una sola vez en `src/lib/legal.ts`.

> Estas páginas describen lo que la app hace **hoy**. Si tocás qué datos se
> guardan o con quién se comparten, actualizá también el texto.

---

## Publicar en Android (Google Play)

El proyecto ya tiene `eas.json` y `app.json` listos (`slug: repuestosrd`,
`package: com.repuestosrd.app`, `runtimeVersion` por `appVersion`).

```bash
npx eas-cli@latest login          # iniciar sesión en tu cuenta de Expo
npx eas-cli@latest init           # crea el proyecto en EAS y agrega extra.eas.projectId
npx eas-cli@latest build -p android --profile preview      # APK para probar en tu teléfono
npx eas-cli@latest build -p android --profile production   # AAB para Play
npx eas-cli@latest submit -p android --profile production  # subir a Play
```

- `preview` genera un **APK** para instalar y probar directo.
- `production` genera el **AAB** (lo que Play pide) y autoincrementa el
  `versionCode`.
- El build de **desarrollo** (para notificaciones push) necesita
  `npx expo install expo-dev-client` antes de usarse.

El detalle de cada formulario de Play Console está en **`GOOGLE-PLAY.md`**.

---

## Pendientes

- **Chat**: ya funciona dentro de la app. Falta la **notificación push** al
  comprador cuando la tienda responde (necesita build de desarrollo + FCM).
- **Suscripción de tiendas**: cobro mensual implementado (RD$500/mes · 30 días
  gratis · 5 de gracia; la tienda vencida sale del catálogo). El cobro es manual
  por ahora; falta automatizarlo (Azul) y un panel admin para registrar pagos.
- **Eliminación de cuenta**: implementada (app + web). Falta automatizar el
  borrado total con una Edge Function (hoy lo cierra el admin).
- **Llamadas con número puente** (tipo Uber): fase posterior al lanzamiento.
- **Botón "Reportar" y bloqueo de usuarios** (chat + fichas): **implementado**
  (`21_reportes_y_bloqueos.sql`), que es lo que pide Google Play en apps con
  contenido de usuarios. Falta un panel de admin para ver y cerrar los reportes
  (hoy se revisan por SQL).
- **Revisión legal**: los textos legales los redactó la IA con los requisitos de
  la Ley 172-13, la Ley 358-05 y la Ley 126-02. **Los tiene que revisar un
  abogado** antes de publicar.
- **Delivery**: el costo se coordina aparte; todavía no se cobra ni se elige
  repartidor.
- **Validación con esquema**: hoy los formularios (registro, checkout, repuesto)
  validan a mano; conviene un esquema único (ver `auditor/reporte_seguridad.md`).
- **Captcha en Auth** antes de abrir al público (auditoría, severidad baja).
- **`expo-secure-store`** para el refresh token de la sesión, si se quiere cifrar
  en reposo (auditoría, P9).
