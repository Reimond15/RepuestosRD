# src/lib/geo.ts

<!-- 10 bloques · 27 líneas · original del commit 1310672 -->

10 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 1

> Ancla: `import type { LocationGeocodedAddress } from 'expo-location';`

```
/**
 * Utilidades de geolocalización: distancia entre dos puntos (haversine),
 * formato legible en kilómetros, ordenamiento por cercanía para el catálogo
 * y nombre legible de la zona actual.
 */
```

## Línea 13

> Ancla: `export const RADIO_CERCANIA_KM = 60;`

```
/** Radio (km) dentro del que se consideran tiendas "cerca de ti". */
```

## Línea 16

> Ancla: `export function aCoordenadas(lat: number | null, lng: number | null): Coordenadas | null {`

```
/** Construye un objeto de coordenadas solo si hay números válidos. */
```

## Línea 21

> Ancla: `export function distanciaKm(a: Coordenadas, b: Coordenadas): number {`

```
/** Distancia en km entre dos puntos (fórmula del haversine). */
```

## Línea 32

> Ancla: `export function distanciaTexto(km: number): string {`

```
/** 3.421 → "3.4 km" · 12.8 → "13 km" · 0.6 → "600 m" */
```

## Línea 39

> Ancla: `export function distanciaDeFila(`

```
/** Distancia en km de una fila del catálogo/ranking a la posición actual. */
```

## Línea 52

> Ancla: `export function ordenarPorCercania<T extends { tienda_lat?: number | null; tienda_lng?: number | null }>(`

```
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
```

## Línea 70

> Ancla: `if (!conDist.some((x) => x.km !== null)) {`

```
// nadie cargó ubicación todavía: no hay nada que ordenar
```

## Línea 90

> Ancla: `export function etiquetaZona(dir: LocationGeocodedAddress): string | null {`

```
/**
 * Nombre humano de una zona desde la dirección inversa.
 * Prefiere el distrito (puede ser "Santo Domingo Este"), sino la ciudad,
 * la subregión o la región.
 */
```

## Línea 102

> Ancla: `export function urlMapa(lat: number | null, lng: number | null, direccion: string | null): string | null {`

```
/** URL de Google Maps para abrir una ubicación (función también en navegador). */
```
