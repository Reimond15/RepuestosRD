import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LineaCarrito = {
  producto_id: string;
  nombre: string;
  precio: number;
  imagen: string | null;
  tienda_id: string;
  tienda: string;
  cantidad: number;
  stock: number;
};

/** Precio y stock actualizados desde la base, para revalidar en el checkout. */
export type PrecioStockActual = {
  producto_id: string;
  precio: number;
  stock: number;
};

type EstadoCarrito = {
  lineas: LineaCarrito[];

  /**
   * Agrega (o suma) una línea. Devuelve `null` si salió bien, o un mensaje
   * para mostrar si no (agotado). Con `stock = 0` NO agrega nada.
   */
  agregar: (p: Omit<LineaCarrito, 'cantidad'>, cantidad?: number) => string | null;
  quitar: (productoId: string) => void;
  cambiarCantidad: (productoId: string, cantidad: number) => void;
  vaciar: () => void;
  /** Limpia solo las líneas de una tienda (después de crear su pedido). */
  vaciarTienda: (tiendaId: string) => void;
  /** Revalida el carrito contra la base (precios/stock que pueden haber cambiado). */
  revalidar: (actuales: PrecioStockActual[]) => void;

  total: () => number;
  cantidadTotal: () => number;
  hayArticulos: () => boolean;
  /** Un pedido es de UNA sola tienda: el carrito se agrupa por tienda. */
  tiendasDistintas: () => string[];
};

const MAX_POR_LINEA = 99;

export const useCarrito = create<EstadoCarrito>()(
  persist(
    (set, get) => ({
      lineas: [],

      agregar: (p, cantidad = 1) => {
        if (p.stock <= 0) return 'Este producto está agotado.';
        if (cantidad <= 0) cantidad = 1;

        const tope = Math.max(1, Math.min(MAX_POR_LINEA, p.stock));
        const aSumar = Math.min(cantidad, tope);

        set((s) => {
          const existe = s.lineas.find((l) => l.producto_id === p.producto_id);

          if (!existe) {
            return {
              lineas: [...s.lineas, { ...p, cantidad: aSumar }],
            };
          }

          return {
            lineas: s.lineas.map((l) =>
              l.producto_id === p.producto_id
                ? { ...l, cantidad: Math.min(l.cantidad + aSumar, tope) }
                : l,
            ),
          };
        });

        return null;
      },

      quitar: (productoId) =>
        set((s) => ({ lineas: s.lineas.filter((l) => l.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((s) => ({
          lineas:
            cantidad <= 0
              ? s.lineas.filter((l) => l.producto_id !== productoId)
              : s.lineas.map((l) =>
                  l.producto_id === productoId
                    ? {
                        ...l,
                        cantidad: Math.min(cantidad, MAX_POR_LINEA, Math.max(l.stock, 1)),
                      }
                    : l,
                ),
        })),

      vaciar: () => set({ lineas: [] }),

      vaciarTienda: (tiendaId) =>
        set((s) => ({ lineas: s.lineas.filter((l) => l.tienda_id !== tiendaId) })),

      revalidar: (actuales) =>
        set((s) => {
          const porId = new Map(actuales.map((a) => [a.producto_id, a]));
          return {
            lineas: s.lineas
              .map((l) => {
                const actual = porId.get(l.producto_id);
                if (!actual) return l;
                return { ...l, precio: actual.precio, stock: actual.stock };
              })
              // se saca lo que ya no existe (desactivado, tienda sin aprobar)
              // o lo que quedó sin stock
              .filter((l) => porId.has(l.producto_id) && l.stock > 0),
          };
        }),

      total: () => get().lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0),

      cantidadTotal: () => get().lineas.reduce((acc, l) => acc + l.cantidad, 0),

      hayArticulos: () => get().lineas.length > 0,

      tiendasDistintas: () => [...new Set(get().lineas.map((l) => l.tienda_id))],
    }),
    {
      name: 'repuestos-rd:carrito',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);