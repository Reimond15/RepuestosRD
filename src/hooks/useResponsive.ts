import { useWindowDimensions } from 'react-native';

/**
 * ============================================================================
 *  Breakpoints
 *  La app se ve como teléfono, tablet o escritorio según el ancho.
 *  Mismo código en las tres: no hay dos versiones que mantener.
 * ============================================================================
 */

export const BREAKPOINTS = {
  movil: 768, // hasta acá, barra inferior + carruseles
  escritorio: 1200, // desde acá, contenido más ancho
} as const;

export type Responsive = {
  ancho: number;
  alto: number;
  /** < 768px — barra inferior, carruseles, 2 columnas */
  esMovil: boolean;
  /** 768 – 1199px */
  esTablet: boolean;
  /** >= 1200px */
  esEscritorio: boolean;
  /** Cantidad de columnas para las rejillas de productos */
  columnas: number;
  /** Ancho máximo del contenido, para que no se estire en pantallas grandes */
  anchoContenido: number;
  /** true si hay espacio para poner la navegación a la izquierda */
  navLateral: boolean;
};

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();

  const esMovil = width < BREAKPOINTS.movil;
  const esEscritorio = width >= BREAKPOINTS.escritorio;

  const columnas = esMovil ? 2 : esEscritorio ? 4 : 3;

  return {
    ancho: width,
    alto: height,
    esMovil,
    esTablet: !esMovil && !esEscritorio,
    esEscritorio,
    columnas,
    anchoContenido: esMovil ? width : esEscritorio ? 1400 : 1000,
    navLateral: !esMovil,
  };
}

/** Ancho de cada celda de la rejilla, ya con el gap restado. */
export function anchoCelda(anchoContenido: number, columnas: number, gap = 16): number {
  const padding = 16 * 2;
  return (anchoContenido - padding - gap * (columnas - 1)) / columnas;
}
