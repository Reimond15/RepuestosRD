import { useCallback, useEffect, useState } from 'react';

import { leerError, miVerificacion, urlFotoVerificacion } from '@/lib/queries';
import { useSesion } from '@/hooks/useSesion';
import type { VerificacionTienda } from '@/types/database';

type Estado = {
  verificacion: VerificacionTienda | null;
  urlFachada: string | null;
  urlInterior: string | null;
  cargando: boolean;
  error: string | null;
};

export function useVerificacionTienda() {
  const { usuario, cargando: cargandoSesion } = useSesion();
  const esTienda = usuario?.rol === 'tienda';

  const [estado, setEstado] = useState<Estado>({
    verificacion: null,
    urlFachada: null,
    urlInterior: null,
    cargando: true,
    error: null,
  });

  const [intento, setIntento] = useState(0);
  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  useEffect(() => {
    if (cargandoSesion || !esTienda) return;

    let vigente = true;

    miVerificacion()
      .then(async (v) => {
        const [urlFachada, urlInterior] = await Promise.all([
          urlFotoVerificacion(v?.foto_fachada ?? null),
          urlFotoVerificacion(v?.foto_interior ?? null),
        ]);
        if (!vigente) return;
        setEstado({ verificacion: v, urlFachada, urlInterior, cargando: false, error: null });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setEstado((s) => ({ ...s, cargando: false, error: leerError(e) }));
      });

    return () => {
      vigente = false;
    };
  }, [esTienda, cargandoSesion, intento]);

  if (!esTienda) {
    return {
      verificacion: null as VerificacionTienda | null,
      urlFachada: null as string | null,
      urlInterior: null as string | null,
      cargando: cargandoSesion,
      error: null,
      recargar,
    };
  }

  return { ...estado, recargar };
}
