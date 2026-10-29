# src/app/eliminar-cuenta.tsx

<!-- 3 bloques · 15 líneas · original del commit 1310672 -->

3 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 17

> Ancla: `const CONFIRMACION = 'ELIMINAR';`

```
/** Palabra que hay que escribir para habilitar el borrado. */
```

## Línea 22

> Ancla: `export default function PantallaEliminarCuenta() {`

```
/**
 * ============================================================================
 *  ELIMINAR MI CUENTA
 *
 *  Requisito de Google Play: vía DENTRO de la app para pedir el borrado de la
 *  cuenta y sus datos (la web es `/legal/eliminar-cuenta`).
 *
 *  La app no puede borrar `auth.users` por su cuenta (eso pide la clave
 *  `service_role`, que nunca viaja al cliente). Acá se REGISTRA la solicitud y
 *  se borran de inmediato los datos personales que no rompen nada; el cierre
 *  definitivo lo hace la administración (ver 20_eliminar_cuenta.sql).
 * ============================================================================
 */
```

## Línea 57

> Ancla: `await supabase?.auth.signOut();`

```
// Cerramos la sesión: la cuenta ya no debe usarse.
```
