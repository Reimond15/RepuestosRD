import { useCallback, useEffect, useState } from 'react';

import { buscarPedidosTienda, leerError } from '@/lib/queries';
import type { PedidoTiendaConDetalle } from '@/types/database';

type Estado = {
  pedidos: PedidoTiendaConDetalle[];
  cargando: boolean;
  error: string | null;
};

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
