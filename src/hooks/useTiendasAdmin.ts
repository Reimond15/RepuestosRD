import { useCallback, useEffect, useState } from 'react';

import { leerError, listarTiendasAdmin } from '@/lib/queries';
import { useSesion } from '@/hooks/useSesion';
import type { TiendaAdmin } from '@/types/database';

type Estado = {
  tiendas: TiendaAdmin[];
  cargando: boolean;
  error: string | null;
};

export function useTiendasAdmin() {
  const { usuario, cargando: cargandoSesion } = useSesion();
  const esAdmin = usuario?.rol === 'admin';

  const [estado, setEstado] = useState<Estado>({
    tiendas: [],
    cargando: true,
    error: null,
  });

  const [intento, setIntento] = useState(0);
  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  useEffect(() => {
    if (cargandoSesion || !esAdmin) return;

    let vigente = true;

    listarTiendasAdmin()
      .then((tiendas) => {
        if (!vigente) return;
        setEstado({ tiendas, cargando: false, error: null });
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
      tiendas: [] as TiendaAdmin[],
      cargando: cargandoSesion,
      error: null,
      recargar,
    };
  }

  return { ...estado, recargar };
}
