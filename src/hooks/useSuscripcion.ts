import { useCallback, useEffect, useState } from 'react';

import { buscarMiSuscripcion, leerError } from '@/lib/queries';
import type { MiSuscripcion } from '@/types/database';

/**
 * Estado de la suscripción de la tienda del usuario.
 *
 * Solo se consulta cuando `activo` es true (es decir, cuando la sesión es de
 * tienda y ya se cargó su ficha). Mismo patrón que usePedidos: reintento por
 * contador y sin setState después de desmontar.
 */
export function useSuscripcion(activo: boolean) {
  const [suscripcion, setSuscripcion] = useState<MiSuscripcion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [intento, setIntento] = useState(0);
  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  useEffect(() => {
    if (!activo) return;

    let vigente = true;

    buscarMiSuscripcion()
      .then((fila) => {
        if (!vigente) return;
        setSuscripcion(fila);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setError(leerError(e));
      });

    return () => {
      vigente = false;
    };
  }, [activo, intento]);

  return { suscripcion, error, reintentar };
}
