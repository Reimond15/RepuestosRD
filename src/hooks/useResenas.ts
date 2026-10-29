import { useEffect, useState } from 'react';

import { buscarResenasProducto, catalogoDisponible, leerError } from '@/lib/queries';
import type { ResenaProducto } from '@/types/database';

type Estado = {
  resenas: ResenaProducto[];
  cargando: boolean;
  error: string | null;
};

export function useResenas(productoId: string | null) {
  const [estado, setEstado] = useState<Estado>({
    resenas: [],
    cargando: true,
    error: null,
  });

  useEffect(() => {
    if (!productoId || !catalogoDisponible) return;

    let vigente = true;

    buscarResenasProducto(productoId)
      .then((filas) => {
        if (vigente) setEstado({ resenas: filas, cargando: false, error: null });
      })
      .catch((e: unknown) => {
        if (vigente) setEstado({ resenas: [], cargando: false, error: leerError(e) });
      });

    return () => {
      vigente = false;
    };
  }, [productoId]);

  if (!catalogoDisponible || !productoId) {
    return { resenas: [], cargando: false, error: null };
  }

  return estado;
}
