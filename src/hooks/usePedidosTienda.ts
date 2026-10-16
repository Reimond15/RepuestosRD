import { useCallback, useEffect, useState } from 'react';

import { buscarPedidosTienda, leerError } from '@/lib/queries';
import type { PedidoTiendaConDetalle } from '@/types/database';

type Estado = {
  pedidos: PedidoTiendaConDetalle[];
  cargando: boolean;
  error: string | null;
};

/**
 * Pedidos que le llegaron a la tienda del usuario (panel de colaboradores).
 *
 * Mismo patrón que usePedidos: sin `tiendaId` no consulta (y queda
 * `cargando` en true, que la pantalla resuelve según la sesión); el
 * reintento re-dispara el efecto con un contador (se usa después de
 * cambiar un estado, para refrescar la lista).
 */
export function usePedidosTienda(tiendaId: string | null) {
  const [estado, setEstado] = useState<Estado>({
    pedidos: [],
    cargando: true,
    error: null,
  });

  const [intento, setIntento] = useState(0);
  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  useEffect(() => {
    if (!tiendaId) return;

    let vigente = true;

    buscarPedidosTienda()
      .then((filas) => {
        if (!vigente) return;
        setEstado({ pedidos: filas, cargando: false, error: null });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setEstado({ pedidos: [], cargando: false, error: leerError(e) });
      });

    return () => {
      vigente = false;
    };
  }, [tiendaId, intento]);

  return { ...estado, reintentar };
}
