import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Sesion, Tienda, Usuario } from '@/types/database';

const Contexto = createContext<Sesion>({
  usuario: null,
  tienda: null,
  cargando: true,
});

/**
 * Sesión del usuario + su fila en `usuarios`.
 *
 * El trigger de la base crea la fila de `usuarios` en el mismo instante del
 * registro, así que acá solo hay que leerla. Si por alguna razón no existe
 * todavía (registro a medias, email sin confirmar), devolvemos null.
 *
 * En la Etapa 2 se le agrega el login con email y contraseña.
 */
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);

  // Sin Supabase configurado no hay nada que esperar: arrancamos ya "cargado"
  // y la sesión queda cerrada. Evita un setState sincrónico dentro del efecto.
  const [cargando, setCargando] = useState(supabase !== null);

  useEffect(() => {
    if (!supabase) return;

    let vigente = true;

    async function cargarPerfil(userId: string) {
      const { data } = await supabase!
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const fila = data as Usuario | null;
      if (!vigente) return;
      setUsuario(fila);

      // si es tienda, cargamos su ficha (para ver si está aprobada)
      if (fila?.rol === 'tienda') {
        const { data: t } = await supabase!
          .from('tiendas')
          .select('*')
          .eq('dueno_id', userId)
          .maybeSingle();

        if (vigente) setTienda((t as Tienda | null) ?? null);
      } else {
        setTienda(null);
      }
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const userId = data.session?.user.id;
        if (userId) return cargarPerfil(userId);
        return null;
      })
      .catch(() => null)
      .finally(() => {
        if (vigente) setCargando(false);
      });

    // reacciona a login y logout
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, sesion: Session | null) => {
      if (!sesion?.user) {
        setUsuario(null);
        setTienda(null);
        setCargando(false);
        return;
      }
      setCargando(true);
      void cargarPerfil(sesion.user.id);
    });

    return () => {
      vigente = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const valor = useMemo<Sesion>(
    () => ({ usuario, tienda, cargando }),
    [usuario, tienda, cargando],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): Sesion {
  return useContext(Contexto);
}
