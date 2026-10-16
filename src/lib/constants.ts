/**
 * Constantes del dominio. Acá viven las categorías, los estados del pedido
 * y la traducción entre lo que guarda la base y lo que ve el usuario.
 */

// ============================================================================
//  CATEGORÍAS — coinciden con la tabla `categorias` de la base
// ============================================================================

export const CATEGORIAS = [
  { slug: 'motocicletas', nombre: 'Motocicletas', icono: '🏍️' },
  { slug: 'carros', nombre: 'Carros', icono: '🚗' },
  { slug: 'guaguas', nombre: 'Guaguas', icono: '🚐' },
] as const;

export type CategoriaSlug = (typeof CATEGORIAS)[number]['slug'];

/** "Todos" es la opción por defecto de los filtros. */
export const CATEGORIA_TODOS = 'todos';
export type FiltroCategoria = CategoriaSlug | typeof CATEGORIA_TODOS;

export const nombreCategoria = (slug: string): string =>
  CATEGORIAS.find((c) => c.slug === slug)?.nombre ?? slug;

/**
 * Convierte la selección múltiple del checklist en los nombres que
 * esperan las vistas SQL (`.in('categoria_nombre', ...)`).
 * `[]` = sin filtro (null) = ver todo.
 */
export const nombresFiltro = (seleccion: CategoriaSlug[]): string[] | null => {
  if (seleccion.length === 0) return null;
  return seleccion
    .map((slug) => CATEGORIAS.find((c) => c.slug === slug)?.nombre)
    .filter((n): n is NonNullable<typeof n> => Boolean(n));
};

// ============================================================================
//  ESTADOS DEL PEDIDO
//  La base guarda: pendiente | confirmado | preparando | enviado | entregado | cancelado
//  El usuario ve:   Recibido | Confirmado | En camino  | Entregado   | Cancelado
// ============================================================================

export type EstadoPedido =
  | 'pendiente'
  | 'confirmado'
  | 'preparando'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

export const ETAPAS_PEDIDO: Record<
  EstadoPedido,
  { etiqueta: string; color: string; descripcion: string }
> = {
  pendiente: {
    etiqueta: 'Recibido',
    color: '#8A9A3B',
    descripcion: 'Tu pedido fue recibido, esperando que la tienda lo confirme.',
  },
  confirmado: {
    etiqueta: 'Confirmado',
    color: '#6B7A2F',
    descripcion: 'La tienda confirmó y está preparando tus repuestos.',
  },
  preparando: {
    etiqueta: 'En camino',
    color: '#F2B705',
    descripcion: 'Tu pedido va en camino.',
  },
  enviado: {
    etiqueta: 'En camino',
    color: '#F2B705',
    descripcion: 'Tu pedido va en camino.',
  },
  entregado: {
    etiqueta: 'Entregado',
    color: '#4CAF50',
    descripcion: 'Pedido entregado. ¡Ya puedes calificar!',
  },
  cancelado: {
    etiqueta: 'Cancelado',
    color: '#E5484D',
    descripcion: 'Este pedido fue cancelado.',
  },
};

/** Para la barra de progreso: los 4 estados que ve el cliente. */
export const PROGRESO_PEDIDO: { clave: EstadoPedido; etiqueta: string }[] = [
  { clave: 'pendiente', etiqueta: 'Recibido' },
  { clave: 'confirmado', etiqueta: 'Confirmado' },
  { clave: 'preparando', etiqueta: 'En camino' },
  { clave: 'entregado', etiqueta: 'Entregado' },
];

// ============================================================================
//  FLUJO DE LA TIENDA (colaboradores)
//  La tienda avanza el pedido: Recibido → Confirmado → En camino → Entregado.
//  La base guarda `preparando` y `enviado` por separado; acá se usa
//  `preparando` para "En camino" y se acepta `enviado` por si viene de antes.
// ============================================================================

/** Siguiente paso del pedido, con el texto del botón que ve la tienda. */
export const SIGUIENTE_ESTADO: Partial<
  Record<EstadoPedido, { estado: EstadoPedido; etiqueta: string; icono: string }>
> = {
  pendiente: {
    estado: 'confirmado',
    etiqueta: 'Confirmar pedido',
    icono: 'check-circle-outline',
  },
  confirmado: {
    estado: 'preparando',
    etiqueta: 'Marcar en camino',
    icono: 'truck-fast-outline',
  },
  preparando: {
    estado: 'entregado',
    etiqueta: 'Marcar entregado',
    icono: 'package-variant-closed',
  },
  enviado: {
    estado: 'entregado',
    etiqueta: 'Marcar entregado',
    icono: 'package-variant-closed',
  },
};

/** Estados en los que la tienda todavía puede cancelar el pedido. */
export const ESTADOS_CANCELABLES: EstadoPedido[] = [
  'pendiente',
  'confirmado',
  'preparando',
  'enviado',
];

// ============================================================================
//  ENTREGA Y PAGO
// ============================================================================

export const FORMAS_ENTREGA = [
  { clave: 'delivery', etiqueta: 'Delivery', icono: 'truck-fast-outline' },
  { clave: 'retiro', etiqueta: 'Retiro en tienda', icono: 'storefront-outline' },
] as const;

/** Solo efectivo y transferencia, como se pidió. La tabla acepta también `tarjeta`. */
export const FORMAS_PAGO = [
  { clave: 'efectivo', etiqueta: 'Efectivo', icono: 'cash' },
  { clave: 'transferencia', etiqueta: 'Transferencia', icono: 'bank-transfer' },
] as const;

// ============================================================================
//  PRODUCTO
// ============================================================================

export const CONDICIONES = [
  { clave: 'nuevo', etiqueta: 'Nuevo' },
  { clave: 'usado', etiqueta: 'Usado' },
  { clave: 'original', etiqueta: 'Original' },
  { clave: 'generico', etiqueta: 'Genérico' },
] as const;

export type Condicion = (typeof CONDICIONES)[number]['clave'];

export const etiquetaCondicion = (c: string): string =>
  CONDICIONES.find((x) => x.clave === c)?.etiqueta ?? c;

// ============================================================================
//  ROLES
// ============================================================================

export type Rol = 'cliente' | 'tienda' | 'admin';

export const ETIQUETA_ROL: Record<Rol, string> = {
  cliente: 'Comprador',
  tienda: 'Tienda',
  admin: 'Administrador',
};

// ============================================================================
//  SUSCRIPCIÓN DE LA TIENDA
//  Debe coincidir con el SQL (19_catalogo_y_suscripcion.sql):
//    prueba default   = now() + 30 días
//    gracia           = 5 días después de vencer
// ============================================================================

export const SUSCRIPCION = {
  /** Precio normal tras finalizar el precio de fundador o si no aplica. */
  precioNormal: 500,
  /** Precio de fundador (primeras 25 tiendas, 12 meses). */
  precioFundador: 100,
  /** Etiquetas listas para mostrar. */
  precioNormalTexto: 'RD$500/mes',
  precioFundadorTexto: 'RD$100/mes',
  /** Límite de tiendas fundadoras. */
  limiteFundadores: 25,
  /** Meses a precio de fundador. */
  mesesFundador: 12,
  /** Días gratis al aprobar la tienda. */
  diasPrueba: 30,
  /** Días de gracia antes de salir del catálogo (coincide con el SQL). */
  diasGracia: 5,
} as const;

