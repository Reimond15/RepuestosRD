/**
 * Utilidades de geolocalización: distancia entre dos puntos (haversine),
 * formato legible en kilómetros, ordenamiento por cercanía para el catálogo
 * y nombre legible de la zona actual.
 */

import type { LocationGeocodedAddress } from 'expo-location';

export type Coordenadas = { lat: number; lng: number };

const RADIO_TIERRA_KM = 6371;

/** Radio (km) dentro del que se consideran tiendas "cerca de ti". */
export const RADIO_CERCANIA_KM = 60;

/** Construye un objeto de coordenadas solo si hay números válidos. */
export function aCoordenadas(lat: number | null, lng: number | null): Coordenadas | null {
  return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null;
}

/** Distancia en km entre dos puntos (fórmula del haversine). */
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(s));
}

/** 3.421 → "3.4 km" · 12.8 → "13 km" · 0.6 → "600 m" */
export function distanciaTexto(km: number): string {
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Distancia en km de una fila del catálogo/ranking a la posición actual. */
export function distanciaDeFila(
  fila: { tienda_lat?: number | null; tienda_lng?: number | null },
  pos: Coordenadas | null,
): number | null {
  if (!pos || typeof fila.tienda_lat !== 'number' || typeof fila.tienda_lng !== 'number') {
    return null;
  }
  return distanciaKm(pos, { lat: fila.tienda_lat, lng: fila.tienda_lng });
}

export type FilaConDistancia<T> = T & { distancia_km: number | null };

/**
 * Ordena las filas por cercanía y les agrega `distancia_km`.
 *
 * Reglas:
 *  · sin posición → se devuelve el ranking tal cual, con distancia null
 *  · ninguna tienda tiene coordenadas → ranking tal cual
 *  · si hay tiendas dentro del radio → SOLO esas, las más cercanas primero
 *  · si nadie queda dentro del radio → las más cercanas primero, sin filtrar
 *    (así una zona lejana no deja el inicio vacío)
 */
export function ordenarPorCercania<T extends { tienda_lat?: number | null; tienda_lng?: number | null }>(
  filas: T[],
  pos: Coordenadas | null,
): FilaConDistancia<T>[] {
  if (!pos) return filas.map((f) => ({ ...f, distancia_km: null }));

  const conDist = filas.map((f) => ({ f, km: distanciaDeFila(f, pos) }));

  // nadie cargó ubicación todavía: no hay nada que ordenar
  if (!conDist.some((x) => x.km !== null)) {
    return filas.map((f) => ({ ...f, distancia_km: null }));
  }

  const dentro = conDist.filter((x) => x.km !== null && x.km <= RADIO_CERCANIA_KM);
  if (dentro.length > 0) {
    return dentro
      .sort((a, b) => (a.km as number) - (b.km as number))
      .map((x) => ({ ...x.f, distancia_km: x.km }));
  }

  const conKm = conDist
    .filter((x) => x.km !== null)
    .sort((a, b) => (a.km as number) - (b.km as number));
  const sinKm = conDist.filter((x) => x.km === null);

  return [...conKm, ...sinKm].map((x) => ({ ...x.f, distancia_km: x.km }));
}

/**
 * Nombre humano de una zona desde la dirección inversa.
 * Prefiere el distrito (puede ser "Santo Domingo Este"), sino la ciudad,
 * la subregión o la región.
 */
export function etiquetaZona(dir: LocationGeocodedAddress): string | null {
  const candidatos = [dir.district, dir.city, dir.subregion, dir.region]
    .map((c) => c?.trim())
    .filter((c): c is string => Boolean(c));
  return candidatos[0] ?? null;
}

/** URL de Google Maps para abrir una ubicación (función también en navegador). */
export function urlMapa(lat: number | null, lng: number | null, direccion: string | null): string | null {
  if (typeof lat === 'number' && typeof lng === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  if (direccion) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
  }
  return null;
}