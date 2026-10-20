import { useCallback, useEffect, useState } from 'react';

import { leerError, listarTiendasAdmin } from '@/lib/queries';
import { useSesion } from '@/hooks/useSesion';
import type { TiendaAdmin } from '@/types/database';

type Estado = {
  tiendas: TiendaAdmin[];
  cargando: boolean;
  error: string | null;
};

/**
 * Todas las tiendas para el panel de administración (RPC `admin_listar_tiendas`).
 *
 * Solo dispara la consulta si el usuario es admin: un usuario normal nunca la
 * pide, y la base igual la rechazaría. Mismo patrón que el resto de hooks
 * (setState solo dentro de la promesa, nunca sincrónico dentro del efecto).
 */
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
    // Esperamos a que la sesión termine de cargar antes de decidir.
    // Si no es admin, no disparamos nada: el estado queda vacío y sin cargar.
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

  // Un no-admin nunca ve datos ni errores del panel, y no se queda "cargando".
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
