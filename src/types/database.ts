import type {
  CategoriaSlug,
  Condicion,
  EstadoPedido,
  Rol,
} from '@/lib/constants';

// ============================================================================
//  Tipos que reflejan 1:1 el SQL de la base de datos.
//  En la Etapa 2 se reemplazan por los generados con:
//    npx supabase gen types typescript --project-id <TU_ID>
// ============================================================================

export type UUID = string;

export interface Usuario {
  id: UUID;
  nombre: string;
  telefono: string | null;
  email: string;
  rol: Rol;
  creado_en: string;
}

export interface Tienda {
  id: UUID;
  dueno_id: UUID;
  nombre: string;
  direccion: string | null;
  logo_url: string | null;
  ofrece_delivery: boolean;
  costo_delivery: number;
  zonas: string[];
  latitude: number | null;
  longitude: number | null;
  aprobada: boolean;
  /** true si el admin verificó la tienda con fotos. Da la insignia en el catálogo. */
  verificada: boolean;
  created_at: string;
}

/**
 * Estado de verificación de una tienda (RPC `mi_verificacion_tienda`).
 * Las fotos viven en el bucket PRIVADO `verificacion`; acá se guarda la RUTA,
 * no una URL pública. Se ven por URL firmada temporal (dueño + admin).
 */
export interface VerificacionTienda {
  estado: 'sin_enviar' | 'enviada' | 'verificada' | 'rechazada';
  foto_fachada: string | null;
  foto_interior: string | null;
  nota_rechazo: string | null;
  enviada_en: string | null;
  verificada_en: string | null;
}

/** Una verificación de tienda para el panel de administración. */
export interface VerificacionAdmin extends VerificacionTienda {
  tienda_id: UUID;
  tienda: string;
  correo_dueno: string;
}

export interface Categoria {
  id: UUID;
  nombre: string;
  slug: CategoriaSlug;
}

export interface TipoRepuesto {
  id: UUID;
  categoria_id: UUID;
  nombre: string;
}

/** Un tipo de repuesto con el nombre de su categoría (pantalla de administración). */
export interface TipoConCategoria extends TipoRepuesto {
  categoria_nombre: string;
}

export interface Producto {
  id: UUID;
  tienda_id: UUID;
  categoria_id: UUID;
  tipo_id: UUID;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  imagenes: string[];
  condicion: Condicion;
  activo: boolean;
  created_at: string;
}

export interface Compatibilidad {
  producto_id: UUID;
  marca: string;
  modelo: string;
  anio_desde: number;
  anio_hasta: number;
}

// ============================================================================
//  VISTAS
// ============================================================================

/** products_mas_vendidos */
export interface ProductoMasVendido {
  producto_id: UUID;
  producto: string;
  tienda_id: UUID;
  tienda: string;
  /** true si la tienda está verificada (insignia). */
  tienda_verificada?: boolean;
  /** Null en la base; opcionales en TS para que los mocks no tengan que repetirlos. */
  tienda_lat?: number | null;
  tienda_lng?: number | null;
  tienda_direccion?: string | null;
  categoria_id: UUID;
  categoria_nombre: string;
  precio_actual: number;
  stock: number;
  unidades_vendidas: number;
  pedidos: number;
  total_calificaciones: number;
  promedio_estrellas: number | null;
}

/** productos_mejor_calificados */
export interface ProductoMejorCalificado {
  producto_id: UUID;
  producto: string;
  tienda_id: UUID;
  tienda: string;
  /** true si la tienda está verificada (insignia). */
  tienda_verificada?: boolean;
  /** Null en la base; opcionales en TS para que los mocks no tengan que repetirlos. */
  tienda_lat?: number | null;
  tienda_lng?: number | null;
  tienda_direccion?: string | null;
  categoria_id: UUID;
  categoria_nombre: string;
  precio_actual: number;
  total_calificaciones: number;
  promedio_estrellas: number;
  unidades_vendidas: number;
}

/** catalogo_productos */
export interface ProductoCatalogo {
  producto_id: UUID;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  imagenes: string[];
  condicion: Condicion;
  categoria: string;
  categoria_slug: CategoriaSlug;
  tipo: string;
  tienda_id: UUID;
  tienda: string;
  tienda_logo: string | null;
  /** true si la tienda está verificada (insignia en la ficha). */
  tienda_verificada?: boolean;
  /** Null en la base; opcionales en TS para que los mocks no tengan que repetirlos. */
  tienda_lat?: number | null;
  tienda_lng?: number | null;
  tienda_direccion?: string | null;
  ofrece_delivery: boolean;
  costo_delivery: number;
  zonas: string[];
  created_at: string;
  total_calificaciones: number | null;
  promedio_estrellas: number | null;
  /** Calculado en el cliente (no viene de la vista): distancia a la tienda. */
  distancia_km?: number | null;
  compatibilidad: {
    marca: string;
    modelo: string;
    anio_desde: number;
    anio_hasta: number;
  }[] | null;
}

export interface DetallePedido {
  id: UUID;
  pedido_id: UUID;
  producto_id: UUID;
  cantidad: number;
  precio_unitario: number;
}

export interface Pedido {
  id: UUID;
  cliente_id: UUID;
  tienda_id: UUID;
  entrega: 'delivery' | 'retiro';
  direccion: string | null;
  forma_pago: 'efectivo' | 'transferencia' | 'tarjeta';
  estado: EstadoPedido;
  total: number;
  notas: string | null;
  created_at: string;
}

/** Línea de un pedido ya traída con el nombre e imagen del producto. */
export interface LineaPedidoConNombre extends DetallePedido {
  nombre: string;
  imagen: string | null;
}

/** Un pedido con sus líneas, listo para mostrar (lista de "Mis pedidos"). */
export interface PedidoConDetalle extends Pedido {
  lineas: LineaPedidoConNombre[];
}

/**
 * Ubicación exacta de la tienda para un pedido de retiro ya confirmado.
 * La base solo la devuelve al comprador del pedido y cuando la tienda ya lo
 * confirmó (RPC `ubicaciones_de_mis_pedidos`): antes de eso, el comprador ve
 * únicamente la zona aproximada (anti-elusión).
 */
export interface UbicacionRetiro {
  pedido_id: UUID;
  tienda_nombre: string;
  direccion: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** Un pedido de la tienda (RPC `pedidos_de_mi_tienda`). */
export interface PedidoTienda extends Pedido {
  cliente_nombre: string;
  /** Mensajes del chat que la tienda todavía no leyó. */
  sin_leer: number;
}

/** Pedido de la tienda con sus líneas, para el panel de colaboradores. */
export interface PedidoTiendaConDetalle extends PedidoTienda {
  lineas: LineaPedidoConNombre[];
}

export interface Calificacion {
  id: UUID;
  pedido_id: UUID;
  producto_id: UUID;
  cliente_id: UUID;
  estrellas: number;
  comentario: string | null;
  created_at: string;
}

/**
 * Un mensaje del chat interno de un pedido.
 *
 * Existe para que comprador y tienda se comuniquen SIN intercambiar teléfono
 * ni correo (anti-elusión). Solo lo ven los dos participantes del pedido.
 */
export interface Mensaje {
  id: UUID;
  pedido_id: UUID;
  autor_id: UUID;
  contenido: string;
  /** true cuando la contraparte ya lo leyó. */
  leido: boolean;
  created_at: string;
}

/** Cuántos mensajes sin leer tiene un pedido (RPC `mensajes_sin_leer`). */
export interface SinLeerPedido {
  pedido_id: UUID;
  sin_leer: number;
}

/** Motivos de un reporte. Deben coincidir con el `check` de `reportes.motivo`. */
export type MotivoReporte =
  | 'estafa'
  | 'producto_prohibido'
  | 'acoso'
  | 'contacto_fuera_de_la_app'
  | 'spam'
  | 'otro';

/** Qué se está reportando. Debe coincidir con el `check` de `reportes.tipo`. */
export type TipoReporte = 'producto' | 'tienda' | 'usuario' | 'mensaje';

/**
 * Un reporte de contenido o de usuario (Google Play, política UGC).
 * Lo crea cualquier usuario autenticado; lo resuelve el admin.
 */
export interface Reporte {
  id: UUID;
  reportante_id: UUID;
  reportado_id: UUID | null;
  tipo: TipoReporte;
  producto_id: UUID | null;
  tienda_id: UUID | null;
  pedido_id: UUID | null;
  mensaje_id: UUID | null;
  motivo: MotivoReporte;
  detalle: string | null;
  estado: 'pendiente' | 'revisado' | 'accionado' | 'descartado';
  created_at: string;
  resuelto_en: string | null;
}

/**
 * Un bloqueo entre usuarios (Google Play, política UGC para interacción 1:1).
 * Mientras exista, ninguno de los dos ve los mensajes del otro en el chat.
 */
export interface Bloqueo {
  bloqueador_id: UUID;
  bloqueado_id: UUID;
  created_at: string;
}

/**
 * Estado de la suscripción de la tienda (RPC `mi_suscripcion`).
 * RD$100/mes (precio de fundador) o RD$500/mes · 30 días de prueba · 5 días de gracia (ver SUSCRIPCION).
 */
export interface MiSuscripcion {
  /** `prueba` | `activa` | `gracia` | `vencida` */
  estado: 'prueba' | 'activa' | 'gracia' | 'vencida';
  /** Días hasta que vence la prueba o el pago (0 si ya venció). */
  dias_restantes: number;
  /** Días que quedan antes de salir del catálogo (incluye la gracia). */
  dias_gracia: number;
  /** Fin de la prueba o del pago. */
  vence_en: string;
  /** Fin de la gracia: después de esto la tienda sale del catálogo. */
  disponible_hasta: string;
  prueba_hasta: string | null;
  pago_hasta: string | null;
  /** true si la tienda fue marcada como fundadora. */
  es_fundador: boolean | null;
  /** fecha hasta la cual aplica el precio de fundador. */
  fundador_hasta: string | null;
  /** true si el precio de fundador está vigente hoy. */
  precio_fundador_vigente: boolean | null;
}

/**
 * Pedido de eliminación de cuenta (`solicitudes_eliminacion`).
 * Requisito de Google Play: la vía vive en la app y en `/legal/eliminar-cuenta`.
 */
export interface SolicitudEliminacion {
  id: UUID;
  usuario_id: UUID | null;
  email: string;
  motivo: string | null;
  estado: 'pendiente' | 'en_proceso' | 'completada';
  created_at: string;
  resuelto_en: string | null;
}

/**
 * Reseña pública de un producto (vista `resenas_producto`).
 * A propósito NO trae `cliente_id`: la reseña se muestra en el detalle del
 * producto a cualquiera, sin exponer quién la escribió.
 */
export interface ResenaProducto {
  producto_id: UUID;
  estrellas: number;
  comentario: string | null;
  created_at: string;
}

/**
 * Una tienda del panel de administración (RPC `admin_listar_tiendas`).
 * Trae los datos de la tienda + el nombre/correo del dueño + el estado de la
 * suscripción, todo en una sola fila para la pantalla del admin.
 */
export interface TiendaAdmin {
  tienda_id: UUID;
  tienda: string;
  direccion: string | null;
  ofrece_delivery: boolean;
  costo_delivery: number;
  aprobada: boolean;
  dueno_id: UUID;
  dueno: string;
  correo_dueno: string;
  telefono_dueno: string | null;
  es_fundador: boolean;
  fundador_hasta: string | null;
  prueba_hasta: string | null;
  pago_hasta: string | null;
  vigente: boolean;
  /** true si el admin ya verificó la tienda con fotos. */
  verificada: boolean;
  /** Estado de la verificación con fotos: sin_enviar | enviada | verificada | rechazada. */
  estado_verificacion: string;
  created_at: string;
}

// ============================================================================
//  Sesión
// ============================================================================

export interface Sesion {
  usuario: Usuario | null;
  cargando: boolean;
  tienda: Tienda | null;
}
