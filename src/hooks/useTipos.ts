import { useCallback, useEffect, useState } from 'react';

import { buscarCategorias, buscarTipos, leerError } from '@/lib/queries';
import type { Categoria, TipoConCategoria } from '@/types/database';

type Estado = {
  tipos: TipoConCategoria[];
  categorias: Categoria[];
  cargando: boolean;
  error: string | null;
};

export function useTipos() {
  const [estado, setEstado] = useState<Estado>({
    tipos: [],
    categorias: [],
    cargando: true,
    error: null,
  });

  const [intento, setIntento] = useState(0);
  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  useEffect(() => {
    let vigente = true;

    Promise.all([buscarTipos(), buscarCategorias()])
      .then(([tipos, categorias]) => {
        if (!vigente) return;
        setEstado({ tipos, categorias, cargando: false, error: null });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setEstado((s) => ({ ...s, cargando: false, error: leerError(e) }));
      });

    return () => {
      vigente = false;
    };
  }, [intento]);

  return { ...estado, recargar };
}
