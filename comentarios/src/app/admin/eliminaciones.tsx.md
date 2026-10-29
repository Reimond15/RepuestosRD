# src/app/admin/eliminaciones.tsx

<!-- 3 bloques · 19 líneas · original del commit 1310672 -->

3 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 17

> Ancla: `export default function PantallaAdminEliminaciones() {`

```
/**
 * ============================================================================
 *  Panel de administración · Eliminaciones de cuenta
 *
 *  Requisito de Google Play: cuando un usuario pide borrar su cuenta, el
 *  borrado tiene que ocurrir DE VERDAD. Antes esto era un procedimiento de 5
 *  pasos a mano en el SQL Editor, fácil de olvidar (y de incumplir la política
 *  de privacidad publicada).
 *
 *  Acá el admin cierra una solicitud con UN toque. El borrado real corre en la
 *  Edge Function `eliminar-cuenta` de Supabase, porque borrar `auth.users` pide
 *  la clave `service_role`, que NUNCA puede viajar al celular.
 *
 *  Solo para el rol `admin`. Las RPC de la base validan `es_admin()` igual, así
 *  que un no-admin no puede hacer nada aunque llegue a esta pantalla.
 * ============================================================================
 */
```

## Línea 146

> Ancla: `<View style={styles.grupo}>`

```
{/* ---------------- pendientes ---------------- */}
```

## Línea 167

> Ancla: `{cerradas.length > 0 ? (`

```
{/* ---------------- cerradas ---------------- */}
```
