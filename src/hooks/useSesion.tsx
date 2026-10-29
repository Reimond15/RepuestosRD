import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Sesion, Tienda, Usuario } from '@/types/database';

const Contexto = createContext<Sesion>({
  usuario: null,
  tienda: null,
  cargando: true,
});

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);

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
