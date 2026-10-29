import type {
  CategoriaSlug,
  Condicion,
  EstadoPedido,
  Rol,
} from '@/lib/constants';

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
  verificada: boolean;
  created_at: string;
}

export interface VerificacionTienda {
  estado: 'sin_enviar' | 'enviada' | 'verificada' | 'rechazada';
  foto_fachada: string | null;
  foto_interior: string | null;
  nota_rechazo: string | null;
  enviada_en: string | null;
  verificada_en: string | null;
}

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

export interface ProductoMasVendido {
  producto_id: UUID;
  producto: string;
  tienda_id: UUID;
  tienda: string;
  tienda_verificada?: boolean;
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

export interface ProductoMejorCalificado {
  producto_id: UUID;
  producto: string;
  tienda_id: UUID;
  tienda: string;
  tienda_verificada?: boolean;
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
  tienda_verificada?: boolean;
  tienda_lat?: number | null;
  tienda_lng?: number | null;
  tienda_direccion?: string | null;
  ofrece_delivery: boolean;
  costo_delivery: number;
  zonas: string[];
  created_at: string;
  total_calificaciones: number | null;
  promedio_estrellas: number | null;
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

export interface LineaPedidoConNombre extends DetallePedido {
  nombre: string;
  imagen: string | null;
}

export interface PedidoConDetalle extends Pedido {
  lineas: LineaPedidoConNombre[];
}

export interface UbicacionRetiro {
  pedido_id: UUID;
  tienda_nombre: string;
  direccion: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PedidoTienda extends Pedido {
  cliente_nombre: string;
  sin_leer: number;
}

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

export interface Mensaje {
  id: UUID;
  pedido_id: UUID;
  autor_id: UUID;
  contenido: string;
  leido: boolean;
  created_at: string;
}

export interface SinLeerPedido {
  pedido_id: UUID;
  sin_leer: number;
}

export type MotivoReporte =
  | 'estafa'
  | 'producto_prohibido'
  | 'acoso'
  | 'contacto_fuera_de_la_app'
  | 'spam'
  | 'otro';

export type TipoReporte = 'producto' | 'tienda' | 'usuario' | 'mensaje';

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

export interface Bloqueo {
  bloqueador_id: UUID;
  bloqueado_id: UUID;
  created_at: string;
}

export interface MiSuscripcion {
  estado: 'prueba' | 'activa' | 'gracia' | 'vencida';
  dias_restantes: number;
  dias_gracia: number;
  vence_en: string;
  disponible_hasta: string;
  prueba_hasta: string | null;
  pago_hasta: string | null;
  es_fundador: boolean | null;
  fundador_hasta: string | null;
  precio_fundador_vigente: boolean | null;
}

export interface SolicitudEliminacion {
  id: UUID;
  usuario_id: UUID | null;
  email: string;
  motivo: string | null;
  estado: 'pendiente' | 'en_proceso' | 'completada';
  created_at: string;
  resuelto_en: string | null;
}

export interface EliminacionAdmin {
  id: UUID;
  usuario_id: UUID | null;
  email: string;
  motivo: string | null;
  estado: 'pendiente' | 'en_proceso' | 'completada';
  created_at: string;
  resuelto_en: string | null;
  es_tienda: boolean;
  tienda: string | null;
  pedidos: number;
  tiene_backup: boolean;
}

export interface ResultadoPrepararEliminacion {
  tienda_anonimizada: boolean;
  productos_reasignados: number;
  pedidos_reasignados: number;
}

export interface ResenaProducto {
  producto_id: UUID;
  estrellas: number;
  comentario: string | null;
  created_at: string;
}

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
  verificada: boolean;
  estado_verificacion: string;
  created_at: string;
}

export interface Sesion {
  usuario: Usuario | null;
  cargando: boolean;
  tienda: Tienda | null;
}
