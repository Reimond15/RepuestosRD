import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  movil: 768,
  escritorio: 1200,
} as const;

export type Responsive = {
  ancho: number;
  alto: number;
  esMovil: boolean;
  esTablet: boolean;
  esEscritorio: boolean;
  columnas: number;
  anchoContenido: number;
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

export function anchoCelda(anchoContenido: number, columnas: number, gap = 16): number {
  const padding = 16 * 2;
  return (anchoContenido - padding - gap * (columnas - 1)) / columnas;
}
