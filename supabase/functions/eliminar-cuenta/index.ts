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

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

/** Correo de la cuenta que recibe los pedidos de los usuarios eliminados. */
const CORREO_FANTASMA = 'eliminado@repuestosrd.invalid';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(cuerpo: unknown, status = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  // El navegador/cliente manda un preflight OPTIONS antes del POST.
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  if (req.method !== 'POST') {
    return json({ error: 'Usá POST.' }, 405);
  }

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !anonKey || !serviceKey) {
    return json({ error: 'Faltan los secretos de Supabase en la función.' }, 500);
  }

  // ------------------------------------------------------------------------
  //  1 · ¿Quién llama?  Se valida el token contra Supabase Auth.
  // ------------------------------------------------------------------------
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return json({ error: 'Falta el token de sesión.' }, 401);
  }

  // Cliente con la sesión del que llama: respeta RLS y es_admin().
  const comoUsuario = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: errAuth,
  } = await comoUsuario.auth.getUser();

  if (errAuth || !user) {
    return json({ error: 'Sesión inválida o expirada.' }, 401);
  }

  // ------------------------------------------------------------------------
  //  2 · ¿Es admin?  Se pregunta a la base, no al cliente.
  // ------------------------------------------------------------------------
  const { data: filaUsuario, error: errPerfil } = await comoUsuario
    .from('usuarios')
    .select('rol, email')
    .eq('id', user.id)
    .maybeSingle();

  if (errPerfil) {
    return json({ error: `No se pudo leer tu perfil: ${errPerfil.message}` }, 500);
  }

  if (!filaUsuario || filaUsuario.rol !== 'admin') {
    return json({ error: 'Solo un administrador puede eliminar cuentas.' }, 403);
  }

  // ------------------------------------------------------------------------
  //  3 · Leer el cuerpo
  // ------------------------------------------------------------------------
  let cuerpo: { usuario_id?: string; solicitud_id?: string };
  try {
    cuerpo = await req.json();
  } catch {
    return json({ error: 'El cuerpo debe ser JSON.' }, 400);
  }

  const usuarioId = (cuerpo.usuario_id ?? '').trim();
  const solicitudId = (cuerpo.solicitud_id ?? '').trim();

  if (!usuarioId) {
    return json({ error: 'Falta el usuario_id.' }, 400);
  }

  // ------------------------------------------------------------------------
  //  4 · Prohibiciones obvias
  // ------------------------------------------------------------------------
  if (usuarioId === user.id) {
    return json({ error: 'No podés eliminar tu propia cuenta de administrador.' }, 400);
  }

  const { data: fantasma } = await comoUsuario
    .from('usuarios')
    .select('id')
    .eq('email', CORREO_FANTASMA)
    .maybeSingle();

  if (!fantasma) {
    return json(
      { error: 'No existe la cuenta fantasma. Corré la migración 30 primero.' },
      500,
    );
  }

  if (usuarioId === fantasma.id) {
    return json({ error: 'Esa es la cuenta fantasma: no se puede eliminar.' }, 400);
  }

  // ------------------------------------------------------------------------
  //  5 · Preparar los datos (con la sesión del admin: RLS sigue mandando)
  // ------------------------------------------------------------------------
  const { data: preparado, error: errPreparar } = await comoUsuario.rpc(
    'admin_preparar_eliminacion',
    { p_usuario_id: usuarioId },
  );

  if (errPreparar) {
    return json({ error: `No se pudo preparar: ${errPreparar.message}` }, 400);
  }

  // ------------------------------------------------------------------------
  //  6 · Borrar la cuenta de auth.users  (acá SÍ hace falta service_role)
  // ------------------------------------------------------------------------
  const comoAdmin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { error: errBorrar } = await comoAdmin.auth.admin.deleteUser(usuarioId);

  if (errBorrar) {
    // Los datos ya quedaron anonimizados y los pedidos reasignados, así que
    // el estado es seguro: se puede reintentar.
    return json(
      { error: `Los datos quedaron limpios, pero falló el borrado de la cuenta: ${errBorrar.message}` },
      500,
    );
  }

  // ------------------------------------------------------------------------
  //  7 · Cerrar la solicitud (si nos la pasaron)
  // ------------------------------------------------------------------------
  let solicitudCerrada = false;
  if (solicitudId) {
    const { error: errCerrar } = await comoUsuario.rpc(
      'admin_marcar_eliminacion_completada',
      { p_solicitud_id: solicitudId },
    );
    solicitudCerrada = !errCerrar;
  } else {
    // Sin id explícito: cerramos las pendientes de ese usuario.
    const { error: errCerrar } = await comoUsuario
      .from('solicitudes_eliminacion')
      .update({ estado: 'completada', resuelto_en: new Date().toISOString() })
      .eq('usuario_id', usuarioId)
      .neq('estado', 'completada');
    solicitudCerrada = !errCerrar;
  }

  const fila = Array.isArray(preparado) ? preparado[0] : preparado;

  return json({
    ok: true,
    usuario_id: usuarioId,
    cuenta_borrada: true,
    solicitud_cerrada: solicitudCerrada,
    detalle: {
      tienda_anonimizada: fila?.tienda_anonimizada ?? false,
      productos_reasignados: fila?.productos_reasignados ?? 0,
      pedidos_reasignados: fila?.pedidos_reasignados ?? 0,
    },
  });
});
