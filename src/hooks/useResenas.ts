import { useEffect, useState } from 'react';

import { buscarResenasProducto, catalogoDisponible, leerError } from '@/lib/queries';
import type { ResenaProducto } from '@/types/database';

type Estado = {
  resenas: ResenaProducto[];
  cargando: boolean;
  error: string | null;
};

/**
 * Las reseñas públicas de un producto, para el detalle.
 *
 * Mismo patrón que el resto de hooks del catálogo: si Supabase no está
 * configurado devuelve vacío sin error, y el reintento no hace falta porque
 * el detalle ya tiene su propio botón de reintentar (recarga todo).
 */
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
