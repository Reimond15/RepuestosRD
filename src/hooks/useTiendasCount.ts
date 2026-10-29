import { useEffect, useState } from 'react';

import { catalogoDisponible, contarTiendas, leerError } from '@/lib/queries';

type Estado = {
  cantidad: number | null;
  cargando: boolean;
  error: string | null;
};

export function useTiendasCount(): Estado {
  const [estado, setEstado] = useState<Estado>({
    cantidad: null,
    cargando: catalogoDisponible,
    error: null,
  });

  useEffect(() => {
    if (!catalogoDisponible) return;

    let vigente = true;

    contarTiendas()
      .then((cantidad) => {
        if (!vigente) return;
        setEstado({ cantidad, cargando: false, error: null });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setEstado({ cantidad: null, cargando: false, error: leerError(e) });
      });

    return () => {
      vigente = false;
    };
  }, []);

  return estado;
}
