import type { SupabaseClient } from '@supabase/supabase-js';

import { BUCKETS, isConfigured, supabase } from '@/lib/supabase';
import type { Condicion, EstadoPedido } from '@/lib/constants';
import type {
  Bloqueo,
  Calificacion,
  Categoria,
  Compatibilidad,
  DetallePedido,
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
  SinLeerPedido,
  SolicitudEliminacion,
  Tienda,
  TipoConCategoria,
  TipoReporte,
  UbicacionRetiro,
} from '@/types/database';

/**
 * ============================================================================
 *  Consultas del catálogo público
 *
 *  El catálogo se puede ver SIN sesión, así que estas consultas usan el
 *  mismo cliente que el resto de la app. Si el proyecto no está
 *  configurado, cada función devuelve una lista vacía y los hooks caen
 *  a los datos de prueba — la pantalla nunca se ve rota.
 * ============================================================================
 */

/** Cliente o null, para no repetir el chequeo en cada función. */
const db: SupabaseClient | null = supabase;

export const catalogoDisponible = isConfigured;

/** Convierte el error de Postgres en algo que se pueda mostrar al usuario. */
export function leerError(error: unknown): string {
  if (!error) return 'Error desconocido.';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && 'message' in error) return String(error.message);
  return 'Error desconocido.';
}

// ============================================================================
//  productos_mas_vendidos
// ============================================================================

export async function buscarMasVendidos(
  nombres: string[] | null,
  limite = 12,
): Promise<ProductoMasVendido[]> {
  if (!db) return [];

  let consulta = db.from('productos_mas_vendidos').select('*').limit(limite);

  // la vista ya viene ordenada de mayor a menor
  if (nombres && nombres.length > 0) consulta = consulta.in('categoria_nombre', nombres);

  const { data, error } = await consulta;
  if (error) throw error;

  return (data ?? []) as ProductoMasVendido[];
}

// ============================================================================
//  productos_mejor_calificados
//  La vista ya exige mínimo 3 calificaciones, no hace falta filtrar acá.
// ============================================================================

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

// ============================================================================
//  categorias
// ============================================================================

export async function buscarCategorias(): Promise<Categoria[]> {
  if (!db) return [];

  const { data, error } = await db.from('categorias').select('*').order('nombre');
  if (error) throw error;

  return (data ?? []) as Categoria[];
}

// ============================================================================
//  catalogo_productos  (búsqueda)
//
//  No filtra por texto: eso lo hace Postgres con el índice trigram de
//  `nombre`. Buscando el nombre del producto el plan es mejor y el
//  resultado trae también las marcas y modelos compatibles, que es lo
//  que hace útil este buscador para repuestos.
// ============================================================================

export async function buscarProductos(limite = 60): Promise<ProductoCatalogo[]> {
  if (!db) return [];

  const { data, error } = await db.from('catalogo_productos').select('*').limit(limite);

  if (error) throw error;

  return (data ?? []) as ProductoCatalogo[];
}

/** Un producto del catálogo por id, para la pantalla de detalle. */
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

/** Las tiendas de un carrito, para saber quién ofrece delivery y a qué costo. */
export async function buscarTiendasPorIds(ids: string[]): Promise<Tienda[]> {
  if (!db || ids.length === 0) return [];

  const { data, error } = await db.from('tiendas').select('*').in('id', ids);

  if (error) throw error;
  return (data ?? []) as Tienda[];
}

/**
 * Ubicación exacta de la tienda para los pedidos de RETIRO del comprador ya
 * confirmados. La RPC `ubicaciones_de_mis_pedidos` filtra por `auth.uid()` y
 * por estado, así que antes de confirmar no devuelve nada (anti-elusión).
 */
export async function buscarUbicacionesRetiro(): Promise<UbicacionRetiro[]> {
  if (!db) return [];

  const { data, error } = await db.rpc('ubicaciones_de_mis_pedidos');

  if (error) throw error;
  return (data ?? []) as UbicacionRetiro[];
}

/**
 * Precio y stock ACTUALES de los productos del carrito.
 * Se usa en el checkout: un precio puede haber cambiado después de
 * agregar al carrito, y el stock puede haber bajado.
 */
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

// ============================================================================
//  Pedidos (cliente)
//
//  Un pedido es de UNA sola tienda; el carrito se parte en uno por tienda.
//  Los triggers se encargan del total, del precio y del stock: acá solo se
//  crea el pedido y sus líneas.
// ============================================================================

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

/**
 * Completa una lista de pedidos con sus líneas (con nombre e imagen del
 * producto). Genérico para reusarlo tanto con los pedidos del cliente como
 * con los de la tienda (que además traen el contacto del cliente).
 */
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

/** Los pedidos del cliente con sus líneas (con nombre e imagen del producto). */
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

/** Un pedido del cliente por id, con sus líneas (para la pantalla de calificar). */
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

// ============================================================================
//  Pedidos (tienda / colaboradores)
//
//  El panel de la tienda usa el RPC `pedidos_de_mi_tienda()` (11_panel_tienda.sql)
//  porque la RLS de `usuarios` no deja leer el perfil del comprador con un
//  select normal. Las líneas sí se leen con RLS (detalle_select_involved).
// ============================================================================

/**
 * Los pedidos de la tienda del usuario.
 *
 * A propósito NO trae el contacto del cliente (la charla va por el chat) y la
 * dirección llega null hasta que el pedido se confirma (17_mensajes.sql).
 */
export async function buscarPedidosTienda(): Promise<PedidoTiendaConDetalle[]> {
  if (!db) return [];

  const { data, error } = await db.rpc('pedidos_de_mi_tienda');
  if (error) throw error;

  return conLineas((data ?? []) as PedidoTienda[]);
}

/** Cambia el estado de un pedido. La RLS solo deja hacerlo a su dueño. */
export async function actualizarEstadoPedido(
  pedidoId: string,
  estado: EstadoPedido,
): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db.from('pedidos').update({ estado }).eq('id', pedidoId);
  if (error) throw error;
}

/**
 * Aplana la compatibilidad (que viene como jsonb agregado) a una lista de
 * texto: "Honda XR150 2015-2023". Es lo que se muestra en la tarjeta.
 */
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

// ============================================================================
//  Tipos de repuesto (pantalla de administración)
//
//  Lectura pública (`tipos_select_public`); escritura solo admin
//  (`tipos_write_admin`). Si no sos admin, la base rechaza el insert/update/
//  delete y el error se muestra tal cual.
// ============================================================================

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

// ============================================================================
//  Calificaciones / reseñas
//
//  Lectura pública (`resenas_producto`, sin datos del cliente).
//  Escritura solo del propio comprador y solo sobre un pedido "entregado":
//  lo valida el trigger `validar_calificacion`, acá solo se inserta.
// ============================================================================

/** Las reseñas de un producto, de la más nueva a la más vieja. */
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

/** Las calificaciones que un pedido ya tiene (para no calificar dos veces). */
export async function buscarCalificacionesDePedido(pedidoId: string): Promise<Calificacion[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('calificaciones')
    .select('*')
    .eq('pedido_id', pedidoId);

  if (error) throw error;
  return (data ?? []) as Calificacion[];
}

/**
 * Todas las calificaciones de un cliente. Se usa en "Mis pedidos" para saber
 * qué pedidos ya están calificados sin una consulta por cada tarjeta.
 */
export async function buscarCalificacionesCliente(clienteId: string): Promise<Calificacion[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('calificaciones')
    .select('*')
    .eq('cliente_id', clienteId);

  if (error) throw error;
  return (data ?? []) as Calificacion[];
}

/** Deja una reseña (1 a 5 estrellas) de un producto de un pedido entregado. */
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

// ============================================================================
//  Panel de la tienda — productos
//
//  La RLS deja a la tienda crear/editar/borrar los productos de SU tienda
//  (y solo si la tienda está aprobada — lo valida el trigger
//  `validar_producto_tienda`). Acá solo se arman las consultas.
// ============================================================================

/** Todos los repuestos de una tienda, activos e inactivos (panel de la tienda). */
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

/** Un producto por id, sin pasar por el catálogo (incluye los inactivos). */
export async function buscarProductoBase(id: string): Promise<Producto | null> {
  if (!db) return null;

  const { data, error } = await db.from('productos').select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  return (data ?? null) as Producto | null;
}

/** Lo que la tienda puede mandar al crear/editar un repuesto. */
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

/**
 * Sube una foto del teléfono al bucket `productos`, dentro de la carpeta del
 * producto: `productos/<producto_id>/<archivo>`. Esa es la ruta que exige la
 * política de Storage (`06_storage.sql`): solo el dueño de la tienda del
 * producto puede escribir ahí.
 *
 * Lee el archivo local con `fetch` (funciona con las URIs `file://` / `content://`
 * que devuelve expo-image-picker) y lo manda como bytes. Devuelve la URL pública
 * para guardarla en `productos.imagenes`.
 */
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

// ============================================================================
//  Panel de la tienda — compatibilidad
// ============================================================================

export type CompatibilidadEntrada = {
  marca: string;
  modelo: string;
  anio_desde: number;
  anio_hasta: number;
};

/** La compatibilidad cargada de un producto. */
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

/**
 * Reemplaza toda la compatibilidad de un producto (borra y vuelve a insertar).
 * Es lo más simple para un formulario: el usuario ve y edita la lista completa.
 */
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

// ============================================================================
//  Chat interno del pedido (anti-elusión)
//
//  Comprador y tienda se escriben acá adentro, sin intercambiar teléfono ni
//  correo. La RLS (17_mensajes.sql) deja ver y escribir solo a los dos
//  participantes del pedido; `leido` se marca con una RPC porque no hay
//  policy de update.
// ============================================================================

/** Los mensajes de un pedido, del más viejo al más nuevo. */
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

/** Manda un mensaje al chat de un pedido. Devuelve la fila guardada. */
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

/** Marca como leídos los mensajes que mandó la contraparte en un pedido. */
export async function marcarMensajesLeidos(pedidoId: string): Promise<void> {
  if (!db) return;

  const { error } = await db.rpc('marcar_mensajes_leidos', { p_pedido_id: pedidoId });
  if (error) throw error;
}

/** Cuántos mensajes sin leer tiene cada pedido (para el globito del panel). */
export async function buscarMensajesSinLeer(): Promise<SinLeerPedido[]> {
  if (!db) return [];

  const { data, error } = await db.rpc('mensajes_sin_leer');
  if (error) throw error;

  return (data ?? []) as SinLeerPedido[];
}

// ============================================================================
//  Suscripción de la tienda
//  RD$100/mes precio de fundador (primeras 25 tiendas, 12 meses desde la marca)
//  o RD$500/mes. 30 días gratis · 5 días de gracia (19_catalogo_y_suscripcion.sql, 22_precio_fundador.sql)
// ============================================================================

/**
 * Estado de la suscripción de la tienda del usuario (o de cualquier tienda si
 * el usuario es admin). Devuelve null si el usuario no tiene tienda.
 */
export async function buscarMiSuscripcion(): Promise<MiSuscripcion | null> {
  if (!db) return null;

  const { data, error } = await db.rpc('mi_suscripcion');
  if (error) throw error;

  const filas = (data ?? []) as MiSuscripcion[];
  return filas[0] ?? null;
}

// ============================================================================
//  Eliminación de cuenta
//  Requisito de Google Play (20_eliminar_cuenta.sql).
//  La app registra la solicitud; el admin cierra el borrado definitivo.
// ============================================================================

/** Última solicitud de eliminación del usuario que todavía no se completó. */
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

/**
 * Registra el pedido de eliminación de la cuenta del usuario actual.
 * Devuelve el id de la solicitud. La RPC también borra de inmediato los datos
 * personales que no rompen nada (mensajes, calificaciones, teléfono).
 */
export async function solicitarEliminacionCuenta(motivo: string | null): Promise<string> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { data, error } = await db.rpc('solicitar_eliminacion_cuenta', {
    p_motivo: motivo,
  });
  if (error) throw error;

  return String(data);
}

// ============================================================================
//  Reportes y bloqueos
//  Requisito de Google Play (política de contenido de usuarios).
//  Ver 21_reportes_y_bloqueos.sql.
// ============================================================================

/** La contraparte del pedido (el otro participante) para quien llama. */
export async function buscarContraparteDelPedido(pedidoId: string): Promise<string | null> {
  if (!db) return null;

  const { data, error } = await db.rpc('contraparte_del_pedido', {
    p_pedido_id: pedidoId,
  });
  if (error) throw error;

  return (data as string | null) ?? null;
}

/** Crea un reporte de contenido o de usuario. Lo resuelve el admin. */
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

/** Bloquea a otro usuario: deja de ver sus mensajes en el chat. */
export async function bloquearUsuario(bloqueadorId: string, bloqueadoId: string): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db
    .from('bloqueos')
    .insert({ bloqueador_id: bloqueadorId, bloqueado_id: bloqueadoId });

  if (error) throw error;
}

/** Quita el bloqueo que el usuario le puso a otro. */
export async function desbloquearUsuario(bloqueadorId: string, bloqueadoId: string): Promise<void> {
  if (!db) throw new Error('Supabase no está configurado.');

  const { error } = await db
    .from('bloqueos')
    .delete()
    .eq('bloqueador_id', bloqueadorId)
    .eq('bloqueado_id', bloqueadoId);

  if (error) throw error;
}

/** Los usuarios que el usuario actual tiene bloqueados. */
export async function buscarMisBloqueos(bloqueadorId: string): Promise<Bloqueo[]> {
  if (!db) return [];

  const { data, error } = await db
    .from('bloqueos')
    .select('*')
    .eq('bloqueador_id', bloqueadorId);

  if (error) throw error;
  return (data ?? []) as Bloqueo[];
}