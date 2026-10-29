import type { SupabaseClient } from '@supabase/supabase-js';

import { BUCKETS, isConfigured, supabase } from '@/lib/supabase';
import type { Condicion, EstadoPedido } from '@/lib/constants';
import type {
  Bloqueo,
  Calificacion,
  Categoria,
  Compatibilidad,
  DetallePedido,
  EliminacionAdmin,
  LineaPedidoConNombre,
  Mensaje,
  MiSuscripcion,
  MotivoReporte,
  Pedido,
  PedidoConDetalle,
  PedidoTienda,
  PedidoTiendaConDetalle,
  Producto,
  ProductoCatalogo,
  ProductoMasVendido,
  ProductoMejorCalificado,
  ResenaProducto,
  ResultadoPrepararEliminacion,
  SinLeerPedido,
  SolicitudEliminacion,
  Tienda,
  TiendaAdmin,
  TipoConCategoria,
  TipoReporte,
  UbicacionRetiro,
  VerificacionAdmin,
  VerificacionTienda,
} from '@/types/database';

const db: SupabaseClient | null = supabase;

export const catalogoDisponible = isConfigured;

export function leerError(error: unknown): string {
  if (!error) return 'Error desconocido.';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && 'message' in error) return String(error.message);
  return 'Error desconocido.';
}

export async function buscarMasVendidos(
  nombres: string[] | null,
  limite = 12,
): Promise<ProductoMasVendido[]> {
  if (!db) return [];

  let consulta = db.from('productos_mas_vendidos').select('*').limit(limite);

  if (nombres && nombres.length > 0) consulta = consulta.in('categoria_nombre', nombres);

  const { data, error } = await consulta;
  if (error) throw error;

  return (data ?? []) as ProductoMasVendido[];
}

export async function buscarMejorCalificados(
  nombres: string[] | null,
  limite = 12,
): Promise<ProductoMejorCalificado[]> {
  if (!db) return [];

  let consulta = db.from('productos_mejor_calificados').select('*').limit(limite);

  if (nombres && nombres.length > 0) consulta = consulta.in('categoria_nombre', nombres);

  const { data, error } = await consulta;
  if (error) throw error;

  return (data ?? []) as ProductoMejorCalificado[];
}

export async function buscarCategorias(): Promise<Categoria[]> {
  if (!db) return [];

  const { data, error } = await db.from('categorias').select('*').order('nombre');
  if (error) throw error;

  return (data ?? []) as Categoria[];
}

export async function contarTiendas(): Promise<number> {
  if (!db) return 0;

  const { data, error } = await db.rpc('contar_tiendas_publicas');
  if (error) throw error;

  return typeof data === 'number' ? data : 0;
}

export async function buscarProductos(limite = 60): Promise<ProductoCatalogo[]> {
  if (!db) return [];

  const { data, error } = await db.from('catalogo_productos').select('*').limit(limite);

  if (error) throw error;

  return (data ?? []) as ProductoCatalogo[];
}

export async function buscarProductoPorId(id: string): Promise<ProductoCatalogo | null> {
  if (!db) return null;

  const { data, error } = await db
    .from('catalogo_productos')
    .select('*')
    .eq('producto_id', id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ProductoCatalogo | null;
}

export async function buscarTiendasPorIds(ids: string[]): Promise<Tienda[]> {
  if (!db || ids.length === 0) return [];

  const { data, error } = await db.from('tiendas').select('*').in('id', ids);

  if (error) throw error;
  return (data ?? []) as Tienda[];
}

export async function buscarUbicacionesRetiro(): Promise<UbicacionRetiro[]> {
  if (!db) return [];

  const { data, error } = await db.rpc('ubicaciones_de_mis_pedidos');

  if (error) throw error;
  return (data ?? []) as UbicacionRetiro[];
}

export async function preciosYStock(
  ids: string[],
): Promise<{ producto_id: string; precio: number; stock: number }[]> {
  if (!db || ids.length === 0) return [];

  const { data, error } = await db.from('productos').select('id, precio, stock').in('id', ids);

  if (error) throw error;
  return ((data ?? []) as { id: string; precio: number; stock: number }[]).map((p) => ({
    producto_id: p.id,
    precio: p.precio,
    stock: p.stock,
  }));
}

export async function crearPedidoYLineas(entrada: {
  clienteId: string;
  tiendaId: string;
  entrega: 'delivery' | 'retiro';
  direccion: string | null;
  formaPago: 'efectivo' | 'transferencia' | 'tarjeta';
  notas: string | null;
  lineas: { producto_id: string; cantidad: number }[];
}): Promise<string> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { data, error } = await db
    .from('pedidos')
    .insert({
      cliente_id: entrada.clienteId,
      tienda_id: entrada.tiendaId,
      entrega: entrada.entrega,
      direccion: entrada.direccion,
      forma_pago: entrada.formaPago,
      notas: entrada.notas,
    })
    .select('id')
    .single();

  if (error) throw error;

  const pedidoId: string = (data as { id: string }).id;

  const { error: errorLineas } = await db.from('detalle_pedido').insert(
    entrada.lineas.map((l) => ({
      pedido_id: pedidoId,
      producto_id: l.producto_id,
      cantidad: l.cantidad,
    })),
  );

  if (errorLineas) throw errorLineas;

  return pedidoId;
}

async function conLineas<T extends Pedido>(
  filas: T[],
): Promise<(T & { lineas: LineaPedidoConNombre[] })[]> {
  if (filas.length === 0) return [];

  const idsPedidos = filas.map((p) => p.id);

  const { data: detalle, error: errorDetalle } = await db!
    .from('detalle_pedido')
    .select('*')
    .in('pedido_id', idsPedidos);

  if (errorDetalle) throw errorDetalle;
  const lineas = (detalle ?? []) as DetallePedido[];

  const productoIds = [...new Set(lineas.map((d) => d.producto_id))];
  const productos: Producto[] =
    productoIds.length > 0
      ? await (async () => {
          const { data: prods, error: err } = await db!
            .from('productos')
            .select('*')
            .in('id', productoIds);
          if (err) throw err;
          return (prods ?? []) as Producto[];
        })()
      : [];

  return filas.map((p) => ({
    ...p,
    lineas: lineas
      .filter((d) => d.pedido_id === p.id)
      .map((d) => {
        const prod = productos.find((x) => x.id === d.producto_id);
        return {
          ...d,
          nombre: prod?.nombre ?? 'Producto',
          imagen: prod?.imagenes?.[0] ?? null,
        };
      }),
  }));
}

export async function buscarPedidosCliente(clienteId: string): Promise<PedidoConDetalle[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('pedidos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return conLineas((data ?? []) as Pedido[]);
}

export async function buscarPedidoPorId(pedidoId: string): Promise<PedidoConDetalle | null> {
  if (!db) return null;

  const { data, error } = await db
    .from('pedidos')
    .select('*')
    .eq('id', pedidoId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [conDetalle] = await conLineas([data as Pedido]);
  return conDetalle ?? null;
}

export async function buscarPedidosTienda(): Promise<PedidoTiendaConDetalle[]> {
  if (!db) return [];

  const { data, error } = await db.rpc('pedidos_de_mi_tienda');
  if (error) throw error;

  return conLineas((data ?? []) as PedidoTienda[]);
}

export async function actualizarEstadoPedido(
  pedidoId: string,
  estado: EstadoPedido,
): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db.from('pedidos').update({ estado }).eq('id', pedidoId);
  if (error) throw error;
}

export function compatibilidadATexto(compatibilidad: ProductoCatalogo['compatibilidad']): string[] {
  if (!Array.isArray(compatibilidad)) return [];

  return compatibilidad.map((c) => {
    if (typeof c !== 'object' || c === null) return '';
    const fila = c as Record<string, unknown>;

    const marca = String(fila.marca ?? '');
    const modelo = String(fila.modelo ?? '');
    const desde = Number(fila.anio_desde ?? 0);
    const hasta = Number(fila.anio_hasta ?? 0);

    const nombre = [marca, modelo].filter(Boolean).join(' ');
    return desde && hasta ? `${nombre} ${desde}-${hasta}`.trim() : nombre;
  }).filter(Boolean);
}

export async function buscarTipos(): Promise<TipoConCategoria[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('tipos_repuesto')
    .select('id, categoria_id, nombre, categorias(nombre)')
    .order('nombre');

  if (error) throw error;

  return (
    (data ?? []) as unknown as {
      id: string;
      categoria_id: string;
      nombre: string;
      categorias: { nombre: string } | null;
    }[]
  ).map((t) => ({
    id: t.id,
    categoria_id: t.categoria_id,
    nombre: t.nombre,
    categoria_nombre: t.categorias?.nombre ?? '',
  }));
}

export async function crearTipo(categoriaId: string, nombre: string): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db
    .from('tipos_repuesto')
    .insert({ categoria_id: categoriaId, nombre });

  if (error) throw error;
}

export async function actualizarTipo(
  id: string,
  categoriaId: string,
  nombre: string,
): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db
    .from('tipos_repuesto')
    .update({ categoria_id: categoriaId, nombre })
    .eq('id', id);

  if (error) throw error;
}

export async function eliminarTipo(id: string): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db.from('tipos_repuesto').delete().eq('id', id);
  if (error) throw error;
}

export async function listarTiendasAdmin(): Promise<TiendaAdmin[]> {
  if (!db) return [];

  const { data, error } = await db.rpc('admin_listar_tiendas');
  if (error) throw error;

  return (data ?? []) as TiendaAdmin[];
}

export async function aprobarTienda(tiendaId: string, aprobar: boolean): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db.rpc('admin_aprobar_tienda', {
    p_tienda_id: tiendaId,
    p_aprobar: aprobar,
  });

  if (error) throw error;
}

export async function marcarFundadora(tiendaId: string, marcar: boolean): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db.rpc('admin_marcar_fundadora', {
    p_tienda_id: tiendaId,
    p_marcar: marcar,
  });

  if (error) throw error;
}

export async function subirFotoVerificacion(
  duenoId: string,
  archivo: { uri: string; mimeType?: string | null },
): Promise<string> {
  if (!db) throw new Error('Supabase no está configurado.');

  const respuesta = await fetch(archivo.uri);
  const bytes = await respuesta.arrayBuffer();

  const tipo = archivo.mimeType ?? 'image/jpeg';
  const extension = tipo.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const aleatorio = Math.random().toString(36).slice(2, 8);
  const ruta = `${duenoId}/${Date.now()}-${aleatorio}.${extension}`;

  const { error } = await db.storage.from(BUCKETS.verificacion).upload(ruta, bytes, {
    contentType: tipo,
    upsert: false,
  });
  if (error) throw error;

  return ruta;
}

export async function urlFotoVerificacion(
  ruta: string | null,
  segundos = 3600,
): Promise<string | null> {
  if (!db || !ruta) return null;

  const { data, error } = await db.storage
    .from(BUCKETS.verificacion)
    .createSignedUrl(ruta, segundos);

  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function enviarVerificacion(
  fachada: string,
  interior: string,
): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db.rpc('enviar_verificacion_tienda', {
    p_fachada: fachada,
    p_interior: interior,
  });

  if (error) throw error;
}

export async function miVerificacion(): Promise<VerificacionTienda | null> {
  if (!db) return null;

  const { data, error } = await db.rpc('mi_verificacion_tienda');
  if (error) throw error;

  const filas = (data ?? []) as VerificacionTienda[];
  return filas[0] ?? null;
}

export async function listarVerificaciones(): Promise<VerificacionAdmin[]> {
  if (!db) return [];

  const { data, error } = await db.rpc('admin_listar_verificaciones');
  if (error) throw error;

  return (data ?? []) as VerificacionAdmin[];
}

export async function verificarTienda(
  tiendaId: string,
  aprobar: boolean,
  nota: string | null = null,
): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db.rpc('admin_verificar_tienda', {
    p_tienda_id: tiendaId,
    p_aprobar: aprobar,
    p_nota: nota,
  });

  if (error) throw error;
}

export async function buscarResenasProducto(productoId: string): Promise<ResenaProducto[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('resenas_producto')
    .select('*')
    .eq('producto_id', productoId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResenaProducto[];
}

export async function buscarCalificacionesDePedido(pedidoId: string): Promise<Calificacion[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('calificaciones')
    .select('*')
    .eq('pedido_id', pedidoId);

  if (error) throw error;
  return (data ?? []) as Calificacion[];
}

export async function buscarCalificacionesCliente(clienteId: string): Promise<Calificacion[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('calificaciones')
    .select('*')
    .eq('cliente_id', clienteId);

  if (error) throw error;
  return (data ?? []) as Calificacion[];
}

export async function crearCalificacion(entrada: {
  pedidoId: string;
  productoId: string;
  clienteId: string;
  estrellas: number;
  comentario: string | null;
}): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db.from('calificaciones').insert({
    pedido_id: entrada.pedidoId,
    producto_id: entrada.productoId,
    cliente_id: entrada.clienteId,
    estrellas: entrada.estrellas,
    comentario: entrada.comentario,
  });

  if (error) throw error;
}

export async function buscarProductosDeTienda(tiendaId: string): Promise<Producto[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('productos')
    .select('*')
    .eq('tienda_id', tiendaId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Producto[];
}

export async function buscarProductoBase(id: string): Promise<Producto | null> {
  if (!db) return null;

  const { data, error } = await db.from('productos').select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  return (data ?? null) as Producto | null;
}

export type ProductoEntrada = {
  categoria_id: string;
  tipo_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  condicion: Condicion;
  imagenes: string[];
  activo: boolean;
};

export async function crearProducto(
  tiendaId: string,
  entrada: ProductoEntrada,
): Promise<Producto> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { data, error } = await db
    .from('productos')
    .insert({ ...entrada, tienda_id: tiendaId })
    .select('*')
    .single();

  if (error) throw error;
  return data as Producto;
}

export async function actualizarProducto(
  id: string,
  cambios: Partial<ProductoEntrada>,
): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db.from('productos').update(cambios).eq('id', id);
  if (error) throw error;
}

export async function eliminarProducto(id: string): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db.from('productos').delete().eq('id', id);
  if (error) throw error;
}

export async function subirImagenProducto(
  productoId: string,
  archivo: { uri: string; mimeType?: string | null },
): Promise<string> {
  if (!db) throw new Error('Supabase no está configurado.');

  const respuesta = await fetch(archivo.uri);
  const bytes = await respuesta.arrayBuffer();

  const tipo = archivo.mimeType ?? 'image/jpeg';
  const extension = tipo.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const aleatorio = Math.random().toString(36).slice(2, 8);
  const ruta = `${productoId}/${Date.now()}-${aleatorio}.${extension}`;

  const { error } = await db.storage.from(BUCKETS.productos).upload(ruta, bytes, {
    contentType: tipo,
    upsert: false,
  });
  if (error) throw error;

  const { data } = db.storage.from(BUCKETS.productos).getPublicUrl(ruta);
  return data.publicUrl;
}

export type CompatibilidadEntrada = {
  marca: string;
  modelo: string;
  anio_desde: number;
  anio_hasta: number;
};

export async function buscarCompatibilidadDeProducto(
  productoId: string,
): Promise<Compatibilidad[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('compatibilidad')
    .select('*')
    .eq('producto_id', productoId)
    .order('marca');

  if (error) throw error;
  return (data ?? []) as Compatibilidad[];
}

export async function reemplazarCompatibilidad(
  productoId: string,
  filas: CompatibilidadEntrada[],
): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error: errBorrar } = await db
    .from('compatibilidad')
    .delete()
    .eq('producto_id', productoId);

  if (errBorrar) throw errBorrar;
  if (filas.length === 0) return;

  const { error } = await db
    .from('compatibilidad')
    .insert(filas.map((f) => ({ ...f, producto_id: productoId })));

  if (error) throw error;
}

export async function buscarMensajes(pedidoId: string): Promise<Mensaje[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('mensajes')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Mensaje[];
}

export async function enviarMensaje(entrada: {
  pedidoId: string;
  autorId: string;
  contenido: string;
}): Promise<Mensaje> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { data, error } = await db
    .from('mensajes')
    .insert({
      pedido_id: entrada.pedidoId,
      autor_id: entrada.autorId,
      contenido: entrada.contenido.trim(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Mensaje;
}

export async function marcarMensajesLeidos(pedidoId: string): Promise<void> {
  if (!db) return;

  const { error } = await db.rpc('marcar_mensajes_leidos', { p_pedido_id: pedidoId });
  if (error) throw error;
}

export async function buscarMensajesSinLeer(): Promise<SinLeerPedido[]> {
  if (!db) return [];

  const { data, error } = await db.rpc('mensajes_sin_leer');
  if (error) throw error;

  return (data ?? []) as SinLeerPedido[];
}

export async function buscarMiSuscripcion(): Promise<MiSuscripcion | null> {
  if (!db) return null;

  const { data, error } = await db.rpc('mi_suscripcion');
  if (error) throw error;

  const filas = (data ?? []) as MiSuscripcion[];
  return filas[0] ?? null;
}

export async function buscarMiSolicitudEliminacion(): Promise<SolicitudEliminacion | null> {
  if (!db) return null;

  const { data, error } = await db
    .from('solicitudes_eliminacion')
    .select('*')
    .neq('estado', 'completada')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as SolicitudEliminacion | null) ?? null;
}

export async function solicitarEliminacionCuenta(motivo: string | null): Promise<string> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { data, error } = await db.rpc('solicitar_eliminacion_cuenta', {
    p_motivo: motivo,
  });
  if (error) throw error;

  return String(data);
}

export async function listarEliminaciones(): Promise<EliminacionAdmin[]> {
  if (!db) return [];

  const { data, error } = await db.rpc('admin_listar_eliminaciones');
  if (error) throw error;

  return (data ?? []) as EliminacionAdmin[];
}

export async function eliminarCuentaAdmin(entrada: {
  usuarioId: string;
  solicitudId?: string | null;
}): Promise<ResultadoPrepararEliminacion & { solicitud_cerrada: boolean }> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { data, error } = await db.functions.invoke('eliminar-cuenta', {
    body: {
      usuario_id: entrada.usuarioId,
      solicitud_id: entrada.solicitudId ?? null,
    },
  });

  if (error) {
    let detalle = error.message;
    try {
      const cuerpo = await (error as { context?: Response }).context?.json();
      if (cuerpo?.error) detalle = String(cuerpo.error);
    } catch {
    }
    throw new Error(detalle);
  }

  const respuesta = (data ?? {}) as {
    detalle?: ResultadoPrepararEliminacion;
    solicitud_cerrada?: boolean;
  };

  return {
    tienda_anonimizada: respuesta.detalle?.tienda_anonimizada ?? false,
    productos_reasignados: respuesta.detalle?.productos_reasignados ?? 0,
    pedidos_reasignados: respuesta.detalle?.pedidos_reasignados ?? 0,
    solicitud_cerrada: respuesta.solicitud_cerrada ?? false,
  };
}

export async function buscarContraparteDelPedido(pedidoId: string): Promise<string | null> {
  if (!db) return null;

  const { data, error } = await db.rpc('contraparte_del_pedido', {
    p_pedido_id: pedidoId,
  });
  if (error) throw error;

  return (data as string | null) ?? null;
}

export async function crearReporte(entrada: {
  reportanteId: string;
  tipo: TipoReporte;
  motivo: MotivoReporte;
  detalle?: string | null;
  reportadoId?: string | null;
  productoId?: string | null;
  tiendaId?: string | null;
  pedidoId?: string | null;
  mensajeId?: string | null;
}): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const detalle = entrada.detalle?.trim();

  const { error } = await db.from('reportes').insert({
    reportante_id: entrada.reportanteId,
    tipo: entrada.tipo,
    motivo: entrada.motivo,
    detalle: detalle && detalle.length > 0 ? detalle : null,
    reportado_id: entrada.reportadoId ?? null,
    producto_id: entrada.productoId ?? null,
    tienda_id: entrada.tiendaId ?? null,
    pedido_id: entrada.pedidoId ?? null,
    mensaje_id: entrada.mensajeId ?? null,
  });

  if (error) throw error;
}

export async function bloquearUsuario(bloqueadorId: string, bloqueadoId: string): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db
    .from('bloqueos')
    .insert({ bloqueador_id: bloqueadorId, bloqueado_id: bloqueadoId });

  if (error) throw error;
}

export async function desbloquearUsuario(bloqueadorId: string, bloqueadoId: string): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db
    .from('bloqueos')
    .delete()
    .eq('bloqueador_id', bloqueadorId)
    .eq('bloqueado_id', bloqueadoId);

  if (error) throw error;
}

export async function buscarMisBloqueos(bloqueadorId: string): Promise<Bloqueo[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('bloqueos')
    .select('*')
    .eq('bloqueador_id', bloqueadorId);

  if (error) throw error;
  return (data ?? []) as Bloqueo[];
}