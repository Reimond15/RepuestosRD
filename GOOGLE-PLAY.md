# Publicar RepuestosRD en Google Play

Guía paso a paso, con las respuestas concretas para cada formulario de Play
Console. Lo que ya está resuelto en el código va marcado como ✅.

> ⚠️ Google cambia Play Console seguido. Verificá los textos exactos en pantalla
> antes de enviar. Lo importante (qué declarar y por qué) está acá.

---

## 0 · Antes de tocar Play Console

### 0.1 Cuenta de desarrollador

- Entrá a <https://play.google.com/console> y creá la cuenta.
- Elegí **cuenta personal** o **de organización**:
  - **Personal**: más barata, pero Google exige una **prueba cerrada con al
    menos 12 testers durante 14 días seguidos** antes de poder publicar
    (aplica a cuentas personales creadas después del 13/11/2023).
  - **Organización** (con RNC/registro): se salta esa prueba, pero pide
    verificación de la empresa.
- Google te va a pedir una **dirección** (puede quedar privada) y un
  **teléfono/email de contacto**. El email se publica en la ficha.

### 0.2 Proyecto EAS (una sola vez)

```bash
npx eas-cli@latest login
npx eas-cli@latest init     # agrega extra.eas.projectId a app.json
```

Ya están listos: `eas.json`, `slug: repuestosrd`, `package: com.repuestosrd.app`,
`versionCode` y `runtimeVersion` (política `appVersion`).

### 0.3 URLs legales públicas (obligatorio)

Play exige una **URL pública de la política de privacidad** y el **enlace de
eliminación de cuenta**. Se sacan del build web de la propia app:

```bash
npx expo export --platform web   # genera la carpeta dist/
```

Subí `dist/` a un hosting estático (Cloudflare Pages, Netlify, Vercel…). El
dominio previsto es `repuestosrd.app`. Vas a necesitar:

| Qué | URL |
|---|---|
| Política de privacidad | `https://repuestosrd.app/legal/privacidad` |
| Eliminar cuenta y datos | `https://repuestosrd.app/legal/eliminar-cuenta` |
| Términos y condiciones | `https://repuestosrd.app/legal/terminos` |
| Reembolsos | `https://repuestosrd.app/legal/reembolsos` |
| Aviso legal | `https://repuestosrd.app/legal/aviso-legal` |

> Si cambiás el dominio, actualizá `ELIMINACION.dominioWeb` en
> `src/lib/legal.ts` y volvé a exportar.

---

## 1 · Build y subida

```bash
npx eas-cli@latest build -p android --profile preview      # APK de prueba
npx eas-cli@latest build -p android --profile production   # AAB para Play
npx eas-cli@latest submit -p android --profile production  # sube el AAB
```

La primera vez, EAS crea y guarda la **clave de firma** (Play App Signing). No
la pierdas: queda en tu cuenta de Expo.

---

## 2 · App content (formularios obligatorios)

Están en **Play Console → App content**. Uno por uno:

### 2.1 Privacy policy ✅
Pegá `https://repuestosrd.app/legal/privacidad`. Debe ser una URL viva (no un
PDF, no un Google Doc).

### 2.2 App access ✅
La app se puede navegar sin cuenta, pero el chat y el panel de tienda requieren
sesión. Marcá **"Todas o algunas funcionalidades requieren acceso restringido"**
y creá **dos cuentas de prueba**:

- 1 comprador: `demo.comprador@repuestosrd.app` + contraseña.
- 1 tienda (aprobada, con 1 producto): `demo.tienda@repuestosrd.app`.

Pasos: registrá las cuentas desde la app, aprobá la tienda
(`update public.tiendas set aprobada = true …`) y **dejalas cargadas** en el
formulario. Ahí mismo escribí las instrucciones: "entrar con estas credenciales
para ver el panel de tienda y el chat".

### 2.3 Ads
**No** (la app no tiene publicidad).

### 2.4 Content rating (IARC)
Completá el cuestionario con sinceridad. Respuestas de referencia:

- Categoría: **Utilidad / Compras / Estilo de vida**.
- ¿Comparte ubicación con otros usuarios? **Sí** (la ubicación de la tienda se
  muestra tras confirmar un retiro). Explicá que es un marketplace local.
- ¿Los usuarios pueden interactuar/comunicarse? **Sí** (chat comprador–tienda).
- ¿Compras digitales? **No** (no hay compras dentro de la app).
- ¿Contenido generado por usuarios? **Sí** (fichas de productos y mensajes).

Suele dar **"Apto para todo público"** o "Adolescente". Usá lo que devuelva el
cuestionario, sin forzarlo.

### 2.5 Target audience
**18 años o más.** (La política de privacidad dice que es para mayores de edad, y
así evitás las reglas de "Familias".)

### 2.6 News app / COVID / Government / Health
**No** a todas.

### 2.7 Financial features
No ofrecés servicios financieros, cripto ni préstamos → **No**. (La suscripción
de la tienda es un cobro B2B, no un producto financiero.)

### 2.8 Data safety  ✅ (lo importante)

Marcá **"Sí, la app recopila o comparte datos"** y declaramos:

| Categoría | ¿Se recopila? | ¿Se comparte? | Para qué | Notas |
|---|---|---|---|---|
| Nombre | Sí | Sí (con la tienda del pedido) | Cuenta, pedidos | — |
| Correo | Sí | Sí (con la tienda del pedido) | Cuenta, avisos | — |
| Teléfono | Sí (opcional) | No | Contacto de la cuenta | Es opcional |
| Dirección | Sí | Sí (con la tienda del pedido) | Entrega del pedido | Solo si pedís delivery |
| Fotos | Sí | No | Imágenes de productos (tienda) | Solo la tienda |
| Mensajes (chat) | Sí | Sí (con la contraparte del pedido) | Comunicación del pedido | Chat in-app |
| Ubicación aprox. | **No** (se usa en el dispositivo) | No | Ordenar por cercanía | No se transmite |

- **Datos cifrados en tránsito:** Sí (HTTPS).
- **El usuario puede pedir que se borren sus datos:** **Sí** →
  pegá `https://repuestosrd.app/legal/eliminar-cuenta`.
- **Seguridad:** "Los datos se cifran en tránsito" y "Podés pedir el borrado".

> Ojo con la **ubicación**: en la app se usa solo en el dispositivo para ordenar
> por cercanía (no se guarda). Si algún día la mandás al servidor, actualizá esta
> declaración y la política de privacidad.

### 2.9 Location permissions
La ubicación es **en primer plano** (foreground), solo para ordenar por
cercanía. Si Play pide justificación, escribí: *"Ordenar tiendas por cercanía
para el usuario. No se almacena ni se comparte."* No declaramos ubicación en
segundo plano.

### 2.10 Data deletion ✅
Completá las preguntas de **"Data deletion"** dentro del Data safety:
- Ofrecés borrado de cuenta: **Sí**.
- URL: `https://repuestosrd.app/legal/eliminar-cuenta`.
- También podés mencionar la vía in-app (Cuenta → Eliminar mi cuenta).

---

## 3 · Store listing (ficha de la tienda)

| Campo | Valor sugerido |
|---|---|
| Nombre | `RepuestosRD` |
| Descripción corta (80) | `Repuestos de motos, carros y guaguas en RD, por zona.` |
| Descripción completa | Describí: buscar por marca/modelo/año, tiendas cercanas, pedido y chat interno, retiro o entrega. |
| Categoría | Compras (o Estilo de vida) |
| Email de contacto | `penareimond1@gmail.com` |
| Sitio web | `https://repuestosrd.app` |
| Política de privacidad | `https://repuestosrd.app/legal/privacidad` |

**Recursos gráficos:**
- Ícono 512×512 (PNG): exportá `assets/images/icon.png`, ya es 1264×1264.
- Gráfico destacado 1024×500.
- **Mínimo 2 capturas** de teléfono (ideal 4–8), 1080×1920 o similar.
- Si `supportsTablet: true`, conviene subir capturas de tablet de 7" y 10".

---

## 4 · Prueba cerrada → producción

- **Cuenta personal**: lanzá **Closed testing**, juntá **12 testers** y dejalo
  **14 días seguidos**. Recién ahí aparece la opción de pedir producción.
- **Cuenta de organización**: podés ir directo a producción (con revisión).
- Antes de subir, corré `16_limpiar_demo.sql` en Supabase para borrar los datos
  de demostración.
- Cargá la ficha completa, la clasificación y el Data safety **antes** de enviar:
  si falta algo, el envío se rechaza.

---

## 5 · Después de publicar (operación)

- **Suscripción**: revisá las tiendas vencidas y cobrá:
  ```sql
  select nombre, prueba_hasta, pago_hasta, public.tienda_vigente(id) as vigente
    from public.tiendas order by created_at;
  select public.registrar_pago_tienda('<uuid-tienda>', 1);
  ```
- **Eliminación de cuenta**: mirá las solicitudes y cerralas:
  ```sql
  select id, email, motivo, created_at
    from public.solicitudes_eliminacion
   where estado <> 'completada' order by created_at;
  ```
  El procedimiento completo está al final de `20_eliminar_cuenta.sql`.
- **Reportes de usuarios**: revisalos y cerralos:
  ```sql
  select id, tipo, motivo, detalle, created_at
    from public.reportes
   where estado = 'pendiente' order by created_at;

  update public.reportes
     set estado = 'accionado', resuelto_en = now()
   where id = '<UUID-DEL-REPORTE>';
  ```
- **Actualizaciones**: `npx eas-cli@latest build -p android --profile production`
  y volvé a subir (el `versionCode` sube solo).

---

## 6 · Riesgos a resolver antes de abrir al público

1. **Contenido generado por usuarios (UGC).** ✅ **Resuelto.** La app ya trae un
   sistema in-app para **reportar** contenido/usuarios (detalle de producto y
   chat) y para **bloquear** a la contraparte del chat 1:1
   (`21_reportes_y_bloqueos.sql`), que es lo que pide la política de UGC de
   Google Play. Modernízalo si agregás más superficies de contenido.
   - Pendiente menor: un panel de admin para ver/cerrar reportes (hoy se
     revisan por SQL).
2. **Revisión legal** de los textos (Ley 172-13, 358-05, 126-02) por un abogado.
3. **Captcha** en el registro (evita cuentas basura; también lo pide el
   auditor).
4. **Borrado 100% automático** de la cuenta (hoy lo cierra el admin). Una Edge
   Function con `service_role` lo automatiza.
5. **RNC / datos del negocio**: hoy dice "En trámite" en `src/lib/legal.ts`.
