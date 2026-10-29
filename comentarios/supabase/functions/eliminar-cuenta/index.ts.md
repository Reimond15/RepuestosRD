# supabase/functions/eliminar-cuenta/index.ts

<!-- 13 bloques · 64 líneas · original del commit 1310672 -->

13 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';`

```
// ============================================================================
//  Edge Function · eliminar-cuenta
// ============================================================================
//
//  QUÉ HACE
//    Cierra de verdad una solicitud de eliminación de cuenta, en un solo
//    llamado desde el panel de administración.
//
//  POR QUÉ UNA EDGE FUNCTION (y no hacerlo desde la app)
//    Borrar un usuario de `auth.users` exige la clave `service_role`, que
//    tiene control TOTAL del proyecto. Si esa clave estuviera en el celular,
//    cualquiera que la extrajera podría leer y borrar toda la base.
//    Acá la clave vive como SECRETO del servidor de Supabase y nunca sale.
//
//  SEGURIDAD (lo más importante de este archivo)
//    1. Se verifica el JWT del que llama (no se confía en lo que manda).
//    2. Se comprueba que el que llama sea ADMIN, consultando la base.
//    3. Se prohíbe borrarse a sí mismo y borrar la cuenta fantasma.
//    4. `admin_preparar_eliminacion` corre con la sesión del admin, así que
//       las políticas RLS y `es_admin()` siguen aplicando.
//    5. Solo al final, ya validado todo, se usa `service_role` para borrar
//       la cuenta de `auth.users`.
//
//  ORDEN DE OPERACIONES (el mismo que documenta 20_eliminar_cuenta.sql)
//    1. Anonimizar la tienda (si es dueño de una).
//    2. Borrar sus productos (detalle_pedido.producto_id es RESTRICT).
//    3. Reasignar sus pedidos a la cuenta fantasma (pedidos.cliente_id RESTRICT).
//    4. Reasignar los pedidos de su tienda (pedidos.tienda_id RESTRICT).
//    5. Borrar la cuenta de auth.users (arrastra el resto por CASCADE).
//    6. Marcar la solicitud como completada.
//
//  DEPLOY
//    supabase functions deploy eliminar-cuenta
//
//  SECRETOS QUE NECESITA (los pone Supabase solo, no hay que configurarlos)
//    SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
// ============================================================================
```

## Línea 41

> Ancla: `const CORREO_FANTASMA = 'eliminado@repuestosrd.invalid';`

```
/** Correo de la cuenta que recibe los pedidos de los usuarios eliminados. */
```

## Línea 58

> Ancla: `if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });`

```
// El navegador/cliente manda un preflight OPTIONS antes del POST.
```

## Línea 73

> Ancla: `const authHeader = req.headers.get('Authorization') ?? '';`

```
// ------------------------------------------------------------------------
  //  1 · ¿Quién llama?  Se valida el token contra Supabase Auth.
  // ------------------------------------------------------------------------
```

## Línea 83

> Ancla: `const comoUsuario = createClient(url, anonKey, {`

```
// Cliente con la sesión del que llama: respeta RLS y es_admin().
```

## Línea 98

> Ancla: `const { data: filaUsuario, error: errPerfil } = await comoUsuario`

```
// ------------------------------------------------------------------------
  //  2 · ¿Es admin?  Se pregunta a la base, no al cliente.
  // ------------------------------------------------------------------------
```

## Línea 115

> Ancla: `let cuerpo: { usuario_id?: string; solicitud_id?: string };`

```
// ------------------------------------------------------------------------
  //  3 · Leer el cuerpo
  // ------------------------------------------------------------------------
```

## Línea 132

> Ancla: `if (usuarioId === user.id) {`

```
// ------------------------------------------------------------------------
  //  4 · Prohibiciones obvias
  // ------------------------------------------------------------------------
```

## Línea 156

> Ancla: `const { data: preparado, error: errPreparar } = await comoUsuario.rpc(`

```
// ------------------------------------------------------------------------
  //  5 · Preparar los datos (con la sesión del admin: RLS sigue mandando)
  // ------------------------------------------------------------------------
```

## Línea 168

> Ancla: `const comoAdmin = createClient(url, serviceKey, { auth: { persistSession: false } });`

```
// ------------------------------------------------------------------------
  //  6 · Borrar la cuenta de auth.users  (acá SÍ hace falta service_role)
  // ------------------------------------------------------------------------
```

## Línea 176

> Ancla: `return json(`

```
// Los datos ya quedaron anonimizados y los pedidos reasignados, así que
    // el estado es seguro: se puede reintentar.
```

## Línea 184

> Ancla: `let solicitudCerrada = false;`

```
// ------------------------------------------------------------------------
  //  7 · Cerrar la solicitud (si nos la pasaron)
  // ------------------------------------------------------------------------
```

## Línea 195

> Ancla: `const { error: errCerrar } = await comoUsuario`

```
// Sin id explícito: cerramos las pendientes de ese usuario.
```
