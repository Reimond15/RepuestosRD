import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

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

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return json({ error: 'Falta el token de sesión.' }, 401);
  }

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

  const { data: preparado, error: errPreparar } = await comoUsuario.rpc(
    'admin_preparar_eliminacion',
    { p_usuario_id: usuarioId },
  );

  if (errPreparar) {
    return json({ error: `No se pudo preparar: ${errPreparar.message}` }, 400);
  }

  const comoAdmin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { error: errBorrar } = await comoAdmin.auth.admin.deleteUser(usuarioId);

  if (errBorrar) {
    return json(
      { error: `Los datos quedaron limpios, pero falló el borrado de la cuenta: ${errBorrar.message}` },
      500,
    );
  }

  let solicitudCerrada = false;
  if (solicitudId) {
    const { error: errCerrar } = await comoUsuario.rpc(
      'admin_marcar_eliminacion_completada',
      { p_solicitud_id: solicitudId },
    );
    solicitudCerrada = !errCerrar;
  } else {
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
