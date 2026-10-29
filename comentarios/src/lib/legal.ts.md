# src/lib/legal.ts

<!-- 18 bloques · 47 líneas · original del commit 1310672 -->

18 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `export const NEGOCIO = {`

```
/**
 * ============================================================================
 *  DATOS DEL NEGOCIO Y TEXTOS LEGALES
 *
 *  ⭐ EDITAR SOLO ACÁ los datos del responsable. Las páginas de
 *  `src/app/legal/` leen de aquí, así que un cambio se refleja en todas.
 *
 *  RepuestosRD hoy es un proyecto individual (persona física) sin oficina:
 *  el domicilio legal se muestra como ciudad, nunca una dirección de casa.
 * ============================================================================
 */
```

## Línea 14

> Ancla: `nombreComercial: 'RepuestosRD',`

```
/** Nombre con el que se conoce la plataforma. */
```

## Línea 16

> Ancla: `responsable: 'Reimond Peña',`

```
/** Persona física responsable (aparece en Términos y Privacidad). */
```

## Línea 18

> Ancla: `rnc: 'En trámite',`

```
/** RNC pendiente. Actualizar aquí cuando esté emitido. */
```

## Línea 20

> Ancla: `ciudad: 'Santo Domingo Oeste',`

```
/** Domicilio legal: solo ciudad, NUNCA la dirección de la casa. */
```

## Línea 24

> Ancla: `email: 'soporte.repuestord@gmail.com',`

```
/**
   * Buzón único de la plataforma. Se usa para TODO: soporte, privacidad,
   * eliminación de cuenta y reportes de contenido. Un solo correo revisado a
   * diario es más seguro que varios que se pueden quedar sin mirar.
   */
```

## Línea 30

> Ancla: `emailPrivacidad: 'soporte.repuestord@gmail.com',`

```
/** Mismo buzón (ver arriba): los derechos de privacidad llegan acá. */
```

## Línea 32

> Ancla: `telefono: null as string | null,`

```
/** Sin teléfono público por ahora: la atención es por correo. */
```

## Línea 34

> Ancla: `horario: null as string | null,`

```
/** Sin horario fijo publicado; se responde por correo lo antes posible. */
```

## Línea 38

> Ancla: `export const LEGAL_ACTUALIZADO = '21 de octubre de 2026';`

```
/** Fecha de la última revisión de los documentos legales. */
```

## Línea 41

> Ancla: export const CONTACTO_TEXTO = `${NEGOCIO.email}`;

```
/** Texto de contacto listo para incrustar en los documentos. */
```

## Línea 44

> Ancla: `export const PAGINAS_LEGALES = [`

```
/**
 * Documentos legales, en el orden en que se muestran.
 * Se usa en el índice `/legal` y en la tarjeta de la pantalla Cuenta.
 */
```

## Línea 57

> Ancla: `export const ELIMINACION = {`

```
/**
 * ============================================================================
 *  ELIMINACIÓN DE CUENTA  (requisito de Google Play)
 *
 *  Google Play pide DOS vías:
 *    1. dentro de la app  → `/eliminar-cuenta`
 *    2. un enlace WEB     → `URL_ELIMINACION_WEB` (GitHub Pages, sin instalar)
 *
 *  ⚠️ Si cambiás de dominio, actualizá `dominioWeb` (afecta ambas URLs).
 *  Pegá `URL_ELIMINACION_WEB` en Play Console (Data safety → Data deletion) y
 *  `URL_PRIVACIDAD_WEB` en la ficha de la tienda (Política de privacidad).
 * ============================================================================
 */
```

## Línea 78

> Ancla: `rutaWeb: '/legal/eliminar-cuenta',`

```
/** Ruta pública (sirve en la web, sin instalar la app). */
```

## Línea 80

> Ancla: `dominioWeb: 'https://reimond15.github.io/RepuestosRD',`

```
/** Dominio público de los documentos legales (GitHub Pages). */
```

## Línea 84

> Ancla: export const ENLACE_ELIMINACION_EMAIL = `mailto:${NEGOCIO.emailPrivacidad}?subject=${encodeURIComponent(

```
/** Enlace `mailto:` que abre el correo con el pedido de eliminación listo. */
```

## Línea 89

> Ancla: export const URL_ELIMINACION_WEB = `${ELIMINACION.dominioWeb}/eliminar-cuenta.html`;

```
/** URL pública del recurso de eliminación (la que se pega en Play Console). */
```

## Línea 92

> Ancla: export const URL_PRIVACIDAD_WEB = `${ELIMINACION.dominioWeb}/privacidad.html`;

```
/** URL pública de la política de privacidad (Play Console → Política de privacidad). */
```
