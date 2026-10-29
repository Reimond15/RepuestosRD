import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  buscarMasVendidos,
  buscarMejorCalificados,
  buscarProductos,
  catalogoDisponible,
  compatibilidadATexto,
  leerError,
} from '@/lib/queries';
import { MOCK_MAS_VENDIDOS, MOCK_MEJOR_CALIFICADOS } from '@/data/mock';
import { nombresFiltro, type CategoriaSlug } from '@/lib/constants';
import { aCoordenadas, ordenarPorCercania } from '@/lib/geo';
import { useUbicacion } from '@/store/ubicacion';
import type {
  ProductoCatalogo,
  ProductoMasVendido,
  ProductoMejorCalificado,
} from '@/types/database';

type Estado<T> = {
  datos: T[];
  cargando: boolean;
  error: string | null;
  enVivo: boolean;
};

const SIN_DATOS: Estado<never> = {
  datos: [],
  cargando: false,
  error: null,
  enVivo: false,
};

function filtrarPorSeleccion<T extends { categoria_nombre: string }>(
  filas: T[],
  seleccion: CategoriaSlug[],
): T[] {
  if (seleccion.length === 0) return filas;
  const activas = new Set<CategoriaSlug>(seleccion);
  return filas.filter((f) => activas.has(f.categoria_nombre.toLowerCase() as CategoriaSlug));
}

export function useMasVendidos(seleccion: CategoriaSlug[]) {
  const [estado, setEstado] = useState<Estado<ProductoMasVendido>>({
    datos: [],
    cargando: true,
    error: null,
    enVivo: false,
  });

  const [intento, setIntento] = useState(0);
  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  const { lat, lng } = useUbicacion();

  useEffect(() => {
    if (!catalogoDisponible) return;

    let vigente = true;

    buscarMasVendidos(nombresFiltro(seleccion))
      .then((filas) => {
        if (!vigente) return;
        setEstado({ datos: filas, cargando: false, error: null, enVivo: true });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setEstado({
          datos: filtrarPorSeleccion(MOCK_MAS_VENDIDOS, seleccion),
          cargando: false,
          error: leerError(e),
          enVivo: false,
        });
      });

    return () => {
      vigente = false;
    };
  }, [seleccion, intento]);

  const datos = useMemo(() => {
    const base = catalogoDisponible
      ? estado.datos
      : filtrarPorSeleccion(MOCK_MAS_VENDIDOS, seleccion);
    return ordenarPorCercania(base, aCoordenadas(lat, lng));
  }, [estado.datos, seleccion, lat, lng]);

  if (!catalogoDisponible) {
    return {
      datos,
      cargando: false,
      error: null,
      enVivo: false,
      reintentar,
    };
  }

  return { ...estado, datos, reintentar };
}

export function useMejorCalificados(seleccion: CategoriaSlug[]) {
  const [estado, setEstado] = useState<Estado<ProductoMejorCalificado>>({
    datos: [],
    cargando: true,
    error: null,
    enVivo: false,
  });

  const [intento, setIntento] = useState(0);
  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  const { lat, lng } = useUbicacion();

  useEffect(() => {
    if (!catalogoDisponible) return;

    let vigente = true;

    buscarMejorCalificados(nombresFiltro(seleccion))
      .then((filas) => {
        if (!vigente) return;
        setEstado({ datos: filas, cargando: false, error: null, enVivo: true });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setEstado({
          datos: filtrarPorSeleccion(MOCK_MEJOR_CALIFICADOS, seleccion),
          cargando: false,
          error: leerError(e),
          enVivo: false,
        });
      });

    return () => {
      vigente = false;
    };
  }, [seleccion, intento]);

  const datos = useMemo(() => {
    const base = catalogoDisponible
      ? estado.datos
      : filtrarPorSeleccion(MOCK_MEJOR_CALIFICADOS, seleccion);
    return ordenarPorCercania(base, aCoordenadas(lat, lng));
  }, [estado.datos, seleccion, lat, lng]);

  if (!catalogoDisponible) {
    return {
      datos,
      cargando: false,
      error: null,
      enVivo: false,
      reintentar,
    };
  }

  return { ...estado, datos, reintentar };
}

export function useBusqueda() {
  const [estado, setEstado] = useState<Estado<ProductoCatalogo>>({
    datos: [],
    cargando: true,
    error: null,
    enVivo: false,
  });

  const [intento, setIntento] = useState(0);
  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  const { lat, lng } = useUbicacion();

  useEffect(() => {
    if (!catalogoDisponible) return;

    let vigente = true;

    buscarProductos()
      .then((filas) => {
        if (!vigente) return;
        setEstado({ datos: filas, cargando: false, error: null, enVivo: true });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setEstado({ datos: [], cargando: false, error: leerError(e), enVivo: false });
      });

    return () => {
      vigente = false;
    };
  }, [intento]);

  const datos = useMemo(
    () => ordenarPorCercania(catalogoDisponible ? estado.datos : [], aCoordenadas(lat, lng)),
    [estado.datos, lat, lng],
  );

  if (!catalogoDisponible) return { ...SIN_DATOS, reintentar };

  return { ...estado, datos, reintentar };
}

export function textoBuscable(p: ProductoCatalogo): string {
  return [
    p.nombre,
    p.tienda,
    p.categoria,
    p.tipo,
    p.descripcion,
    ...compatibilidadATexto(p.compatibilidad),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export const MOCK_CATALOGO: ProductoCatalogo[] = MOCK_MAS_VENDIDOS.map((m) => ({
  producto_id: m.producto_id,
  nombre: m.producto,
  descripcion: null,
  precio: m.precio_actual,
  stock: m.stock,
  imagenes: [],
  condicion: 'original' as const,
  categoria: m.categoria_nombre,
  categoria_slug: m.categoria_nombre.toLowerCase() as ProductoCatalogo['categoria_slug'],
  tipo: '',
  tienda_id: m.tienda_id,
  tienda: m.tienda,
  tienda_logo: null,
  ofrece_delivery: true,
  costo_delivery: 150,
  zonas: [],
  created_at: new Date().toISOString(),
  total_calificaciones: m.total_calificaciones,
  promedio_estrellas: m.promedio_estrellas,
  compatibilidad: null,
}));