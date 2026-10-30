export const CATEGORIAS = [
  { slug: 'motocicletas', nombre: 'Motocicletas', icono: '🏍️' },
  { slug: 'carros', nombre: 'Carros', icono: '🚗' },
  { slug: 'guaguas', nombre: 'Autobuses', icono: '🚐' },
] as const;

export type CategoriaSlug = (typeof CATEGORIAS)[number]['slug'];

export const CATEGORIA_TODOS = 'todos';
export type FiltroCategoria = CategoriaSlug | typeof CATEGORIA_TODOS;

export const nombreCategoria = (slug: string): string =>
  CATEGORIAS.find((c) => c.slug === slug)?.nombre ?? slug;

export const nombresFiltro = (seleccion: CategoriaSlug[]): string[] | null => {
  if (seleccion.length === 0) return null;
  return seleccion
    .map((slug) => CATEGORIAS.find((c) => c.slug === slug)?.nombre)
    .filter((n): n is NonNullable<typeof n> => Boolean(n));
};

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

export const PROGRESO_PEDIDO: { clave: EstadoPedido; etiqueta: string }[] = [
  { clave: 'pendiente', etiqueta: 'Recibido' },
  { clave: 'confirmado', etiqueta: 'Confirmado' },
  { clave: 'preparando', etiqueta: 'En camino' },
  { clave: 'entregado', etiqueta: 'Entregado' },
];

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

export const ESTADOS_CANCELABLES: EstadoPedido[] = [
  'pendiente',
  'confirmado',
  'preparando',
  'enviado',
];

export const FORMAS_ENTREGA = [
  { clave: 'delivery', etiqueta: 'Delivery', icono: 'truck-fast-outline' },
  { clave: 'retiro', etiqueta: 'Retiro en tienda', icono: 'storefront-outline' },
] as const;

export const FORMAS_PAGO = [
  { clave: 'efectivo', etiqueta: 'Efectivo', icono: 'cash' },
  { clave: 'transferencia', etiqueta: 'Transferencia', icono: 'bank-transfer' },
] as const;

export const CONDICIONES = [
  { clave: 'nuevo', etiqueta: 'Nuevo' },
  { clave: 'usado', etiqueta: 'Usado' },
  { clave: 'original', etiqueta: 'Original' },
  { clave: 'generico', etiqueta: 'Genérico' },
] as const;

export type Condicion = (typeof CONDICIONES)[number]['clave'];

export const etiquetaCondicion = (c: string): string =>
  CONDICIONES.find((x) => x.clave === c)?.etiqueta ?? c;

export type Rol = 'cliente' | 'tienda' | 'admin';

export const ETIQUETA_ROL: Record<Rol, string> = {
  cliente: 'Comprador',
  tienda: 'Tienda',
  admin: 'Administrador',
};

export const SUSCRIPCION = {
  precioNormal: 500,
  precioFundador: 100,
  precioNormalTexto: 'RD$500/mes',
  precioFundadorTexto: 'RD$100/mes',
  limiteFundadores: 25,
  mesesFundador: 12,
  diasPrueba: 30,
  diasGracia: 5,
} as const;
