import { useCallback, useEffect, useState } from 'react';

import {
  buscarCalificacionesCliente,
  buscarPedidosCliente,
  buscarTiendasPorIds,
  buscarUbicacionesRetiro,
  leerError,
} from '@/lib/queries';
import type { Calificacion, PedidoConDetalle, Tienda, UbicacionRetiro } from '@/types/database';

type Estado = {
  pedidos: PedidoConDetalle[];
  tiendas: Tienda[];
  calificaciones: Calificacion[];
  /** Ubicación exacta de la tienda en los pedidos de retiro ya confirmados. */
  ubicaciones: UbicacionRetiro[];
  cargando: boolean;
  error: string | null;
};

/**
 * Pedidos del cliente con sus líneas, el nombre de cada tienda y las
 * calificaciones que ya dejó (para marcar los pedidos calificados).
 *
 * Mismo patrón que useCatalogo: sin usuario no consulta nada (y queda
 * `cargando` en true, pero la pantalla decide qué mostrar según la sesión);
 * el reintento re-dispara el efecto con un contador.
 */
export function usePedidos(usuarioId: string | null) {
  const [estado, setEstado] = useState<Estado>({
    pedidos: [],
    tiendas: [],
    calificaciones: [],
    ubicaciones: [],
    cargando: true,
    error: null,
  });

  const [intento, setIntento] = useState(0);
  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  useEffect(() => {
    if (!usuarioId) return;

    let vigente = true;

    Promise.all([
      buscarPedidosCliente(usuarioId),
      buscarCalificacionesCliente(usuarioId),
      buscarUbicacionesRetiro().catch(() => [] as UbicacionRetiro[]),
    ])
      .then(async ([filas, calificaciones, ubicaciones]) => {
        if (!vigente) return;

        let tiendas: Tienda[] = [];
        if (filas.length > 0) {
          const ids = [...new Set(filas.map((p) => p.tienda_id))];
          tiendas = await buscarTiendasPorIds(ids);
          if (!vigente) return;
        }

        setEstado({
          pedidos: filas,
          tiendas,
          calificaciones,
          ubicaciones,
          cargando: false,
          error: null,
        });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setEstado({
          pedidos: [],
          tiendas: [],
          calificaciones: [],
          ubicaciones: [],
          cargando: false,
          error: leerError(e),
        });
      });

    return () => {
      vigente = false;
    };
  }, [usuarioId, intento]);

  return { ...estado, reintentar };
}
