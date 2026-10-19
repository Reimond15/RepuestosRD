import { create } from 'zustand';
import * as Location from 'expo-location';

import { etiquetaZona } from '@/lib/geo';

/**
 * Estado del permiso de ubicación.
 *  · sin-permiso → todavía no se preguntó (default, no molesta al abrir)
 *  · preguntando → pedido en curso
 *  · listo       → hay posición
 *  · denegado    → el usuario dijo que no
 *  · indisponible→ error técnico (web sin https, sensor apagado, etc.)
 */
export type EstadoUbicacion = 'sin-permiso' | 'preguntando' | 'listo' | 'denegado' | 'indisponible';

type StoreUbicacion = {
  estado: EstadoUbicacion;
  lat: number | null;
  lng: number | null;
  /** Nombre legible de la zona ("Santo Domingo Este"), si se pudo resolver. */
  zona: string | null;
  error: string | null;

  /** Pide el permiso y guarda la posición. Devuelve true si quedó lista. */
  localizar: () => Promise<boolean>;
  reiniciar: () => void;
};

export const useUbicacion = create<StoreUbicacion>((set, get) => ({
  estado: 'sin-permiso',
  lat: null,
  lng: null,
  zona: null,
  error: null,

  localizar: async () => {
    if (get().estado === 'preguntando') return false;

    set({ estado: 'preguntando', error: null });

    try {
      // El módulo nativo puede no estar en el binario (build viejo, Expo Go, web).
      // Importar/usar expo-location es opcional: si no está, no rompemos nada.
      if (typeof Location?.requestForegroundPermissionsAsync !== 'function') {
        set({
          estado: 'indisponible',
          error: 'La ubicación no está disponible en este dispositivo.',
        });
        return false;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({ estado: 'denegado' });
        return false;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      set({ estado: 'listo', lat, lng, error: null });

      // el nombre de la zona es un extra: no bloquea ni rompe si falla
      void Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
        .then((res) => {
          const zona = (res ?? []).map(etiquetaZona).find((z): z is string => Boolean(z));
          set({ zona: zona ?? null });
        })
        .catch(() => set({ zona: null }));

      return true;
    } catch (e) {
      set({
        estado: 'indisponible',
        error: e instanceof Error ? e.message : String(e),
      });
      return false;
    }
  },

  reiniciar: () =>
    set({ estado: 'sin-permiso', lat: null, lng: null, zona: null, error: null }),
}));