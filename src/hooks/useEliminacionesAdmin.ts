import { useCallback, useEffect, useState } from 'react';

import { leerError, listarEliminaciones } from '@/lib/queries';
import { useSesion } from '@/hooks/useSesion';
import type { EliminacionAdmin } from '@/types/database';

type Estado = {
  solicitudes: EliminacionAdmin[];
  cargando: boolean;
  error: string | null;
};

export function useEliminacionesAdmin() {
  const { usuario, cargando: cargandoSesion } = useSesion();
  const esAdmin = usuario?.rol === 'admin';

  const [estado, setEstado] = useState<Estado>({
    solicitudes: [],
    cargando: true,
    error: null,
  });

  const [intento, setIntento] = useState(0);
  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  useEffect(() => {
    if (cargandoSesion || !esAdmin) return;

    let vigente = true;

    listarEliminaciones()
      .then((solicitudes) => {
        if (!vigente) return;
        setEstado({ solicitudes, cargando: false, error: null });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setEstado((s) => ({ ...s, cargando: false, error: leerError(e) }));
      });

    return () => {
      vigente = false;
    };
  }, [esAdmin, cargandoSesion, intento]);

  if (!esAdmin) {
    return {
      solicitudes: [] as EliminacionAdmin[],
      cargando: cargandoSesion,
      error: null,
      recargar,
    };
  }

  return { ...estado, recargar };
}
