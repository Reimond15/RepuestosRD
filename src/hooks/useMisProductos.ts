import { useCallback, useEffect, useState } from 'react';

import { buscarProductosDeTienda, leerError } from '@/lib/queries';
import type { Producto } from '@/types/database';

type Estado = {
  productos: Producto[];
  cargando: boolean;
  error: string | null;
};

export function useMisProductos(tiendaId: string | null) {
  const [estado, setEstado] = useState<Estado>({
    productos: [],
    cargando: true,
    error: null,
  });

  const [intento, setIntento] = useState(0);
  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  useEffect(() => {
    if (!tiendaId) return;

    let vigente = true;

    buscarProductosDeTienda(tiendaId)
      .then((productos) => {
        if (vigente) setEstado({ productos, cargando: false, error: null });
      })
      .catch((e: unknown) => {
        if (vigente) setEstado({ productos: [], cargando: false, error: leerError(e) });
      });

    return () => {
      vigente = false;
    };
  }, [tiendaId, intento]);

  return { ...estado, recargar };
}
