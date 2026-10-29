import { useEffect, useState } from 'react';

import { catalogoDisponible, contarTiendas, leerError } from '@/lib/queries';

type Estado = {
  /** `null` hasta que llega la respuesta (o si hubo error). */
  cantidad: number | null;
  cargando: boolean;
  error: string | null;
};

/**
 * ============================================================================
 *  Cantidad de tiendas aprobadas, para el contador de la pantalla de inicio.
 *
 *  A diferencia de los hooks del catálogo, este NO cae a datos de prueba: un
 *  número inventado en la portada sería una mentira al usuario. Mientras no
 *  haya respuesta (o si falla), `cantidad` queda en `null` y la pantalla
 *  simplemente no dibuja el contador.
 * ============================================================================
 */
export function useTiendasCount(): Estado {
  const [estado, setEstado] = useState<Estado>({
    cantidad: null,
    cargando: catalogoDisponible,
    error: null,
  });

  useEffect(() => {
    // Sin Supabase configurado no hay nada que contar.
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
