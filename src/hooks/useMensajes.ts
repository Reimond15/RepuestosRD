import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { buscarMensajes, enviarMensaje, leerError, marcarMensajesLeidos } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import type { Mensaje } from '@/types/database';

type Hilo = {
  pedidoId: string | null;
  mensajes: Mensaje[];
  error: string | null;
};

export function useMensajes(pedidoId: string | null, autorId: string | null) {
  const [hilo, setHilo] = useState<Hilo>({ pedidoId: null, mensajes: [], error: null });
  const [enviando, setEnviando] = useState(false);

  const idsVistos = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pedidoId) return;

    let vigente = true;

    buscarMensajes(pedidoId)
      .then((filas) => {
        if (!vigente) return;
        idsVistos.current = new Set(filas.map((m) => m.id));
        setHilo({ pedidoId, mensajes: filas, error: null });
        void marcarMensajesLeidos(pedidoId).catch(() => {});
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setHilo({ pedidoId, mensajes: [], error: leerError(e) });
      });

    let canal: RealtimeChannel | null = null;

    if (supabase) {
      canal = supabase
        .channel(`mensajes-${pedidoId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensajes',
            filter: `pedido_id=eq.${pedidoId}`,
          },
          (payload) => {
            const nuevo = payload.new as Mensaje;
            if (idsVistos.current.has(nuevo.id)) return;

            idsVistos.current.add(nuevo.id);
            setHilo((prev) => ({ ...prev, mensajes: [...prev.mensajes, nuevo] }));

            if (autorId && nuevo.autor_id !== autorId) {
              void marcarMensajesLeidos(pedidoId).catch(() => {});
            }
          },
        )
        .subscribe();
    }

    return () => {
      vigente = false;
      if (canal) void supabase?.removeChannel(canal);
    };
  }, [pedidoId, autorId]);

  const enviar = useCallback(
    async (contenido: string): Promise<boolean> => {
      const texto = contenido.trim();
      if (!pedidoId || !autorId || texto.length === 0) return false;

      setEnviando(true);

      try {
        const nuevo = await enviarMensaje({ pedidoId, autorId, contenido: texto });
        idsVistos.current.add(nuevo.id);
        setHilo((prev) => ({ ...prev, mensajes: [...prev.mensajes, nuevo], error: null }));
        return true;
      } catch (e: unknown) {
        setHilo((prev) => ({ ...prev, error: leerError(e) }));
        return false;
      } finally {
        setEnviando(false);
      }
    },
    [pedidoId, autorId],
  );

  const cargando = pedidoId !== null && hilo.pedidoId !== pedidoId;

  return { mensajes: hilo.mensajes, cargando, error: hilo.error, enviando, enviar };
}
