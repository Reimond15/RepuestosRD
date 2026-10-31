import { useCallback, useEffect, useState } from 'react';

import { listarContactosTiendas, leerError } from '@/lib/queries';
import { useSesion } from '@/hooks/useSesion';
import type { ContactoTienda } from '@/types/database';

type Estado = {
  contactos: ContactoTienda[];
  cargando: boolean;
  error: string | null;
};

export function useContactosTiendas() {
  const { usuario, cargando: cargandoSesion } = useSesion();
  const esAdmin = usuario?.rol === 'admin';

  const [estado, setEstado] = useState<Estado>({
    contactos: [],
    cargando: true,
    error: null,
  });

  const [intento, setIntento] = useState(0);
  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  useEffect(() => {
    if (cargandoSesion || !esAdmin) return;

    let vigente = true;

    listarContactosTiendas()
      .then((contactos) => {
        if (!vigente) return;
        setEstado({ contactos, cargando: false, error: null });
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
      contactos: [] as ContactoTienda[],
      cargando: cargandoSesion,
      error: null,
      recargar,
    };
  }

  return { ...estado, recargar };
}
