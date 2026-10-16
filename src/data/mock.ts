import type {
  ProductoMasVendido,
  ProductoMejorCalificado,
} from '@/types/database';

/**
 * ============================================================================
 *  DATOS DE PRUEBA — Etapa 1
 * ============================================================================
 *  La app todavía no lee de Supabase. Estos mocks tienen EXACTAMENTE la misma
 *  forma que traen las vistas `productos_mas_vendidos` y
 *  `productos_mejor_calificados`, así que en la Etapa 3 se cambia
 *
 *      MOCK_MAS_VENDIDOS
 *  por
 *      supabase.from('productos_mas_vendidos').select('*')
 *
 *  y las pantallas siguen funcionando sin tocarlas.
 *
 *  Las imágenes van vacías a propósito: la tarjeta dibuja su propio
 *  placeholder, así no dependemos de ninguna URL externa.
 * ============================================================================
 */

const ahora = Date.now();
const hace = (dias: number) => new Date(ahora - dias * 86_400_000).toISOString();

// ============================================================================
//  products_mas_vendidos
//  `categoria_nombre` es lo que usa el filtro de la pantalla.
// ============================================================================

export const MOCK_MAS_VENDIDOS: ProductoMasVendido[] = [
  {
    producto_id: 'a1',
    producto: 'Pastilla de freno delantera',
    tienda_id: 't1',
    tienda: 'Repuestos El Che',
    categoria_id: 'c1',
    categoria_nombre: 'Motocicletas',
    precio_actual: 850,
    stock: 64,
    unidades_vendidas: 312,
    pedidos: 287,
    total_calificaciones: 124,
    promedio_estrellas: 4.6,
  },
  {
    producto_id: 'a2',
    producto: 'Filtro de aceite Honda XR150',
    tienda_id: 't1',
    tienda: 'Repuestos El Che',
    categoria_id: 'c1',
    categoria_nombre: 'Motocicletas',
    precio_actual: 350,
    stock: 120,
    unidades_vendidas: 268,
    pedidos: 251,
    total_calificaciones: 98,
    promedio_estrellas: 4.4,
  },
  {
    producto_id: 'a3',
    producto: 'Batería 12V 35Ah',
    tienda_id: 't2',
    tienda: 'Auto Repuestos RD',
    categoria_id: 'c2',
    categoria_nombre: 'Carros',
    precio_actual: 6200,
    stock: 28,
    unidades_vendidas: 241,
    pedidos: 233,
    total_calificaciones: 176,
    promedio_estrellas: 4.8,
  },
  {
    producto_id: 'a4',
    producto: 'Amortiguador trasero (par)',
    tienda_id: 't3',
    tienda: 'Parts & Service RD',
    categoria_id: 'c3',
    categoria_nombre: 'Guaguas',
    precio_actual: 4750,
    stock: 45,
    unidades_vendidas: 197,
    pedidos: 102,
    total_calificaciones: 64,
    promedio_estrellas: 4.3,
  },
  {
    producto_id: 'a5',
    producto: 'Disco de freno ventilado 260mm',
    tienda_id: 't2',
    tienda: 'Auto Repuestos RD',
    categoria_id: 'c2',
    categoria_nombre: 'Carros',
    precio_actual: 2850,
    stock: 52,
    unidades_vendidas: 184,
    pedidos: 176,
    total_calificaciones: 71,
    promedio_estrellas: 4.5,
  },
  {
    producto_id: 'a6',
    producto: 'Cable de accelerator Honda',
    tienda_id: 't4',
    tienda: 'Moto Repuestos Dominicana',
    categoria_id: 'c1',
    categoria_nombre: 'Motocicletas',
    precio_actual: 1200,
    stock: 18,
    unidades_vendidas: 156,
    pedidos: 149,
    total_calificaciones: 52,
    promedio_estrellas: 4.1,
  },
  {
    producto_id: 'a7',
    producto: 'Bujía de encendido (pack 4)',
    tienda_id: 't3',
    tienda: 'Parts & Service RD',
    categoria_id: 'c2',
    categoria_nombre: 'Carros',
    precio_actual: 980,
    stock: 210,
    unidades_vendidas: 143,
    pedidos: 140,
    total_calificaciones: 43,
    promedio_estrellas: 4.2,
  },
  {
    producto_id: 'a8',
    producto: 'Filtro de aire de motor Roots GAC',
    tienda_id: 't3',
    tienda: 'Parts & Service RD',
    categoria_id: 'c3',
    categoria_nombre: 'Guaguas',
    precio_actual: 1650,
    stock: 34,
    unidades_vendidas: 128,
    pedidos: 121,
    total_calificaciones: 57,
    promedio_estrellas: 4.7,
  },
];

// ============================================================================
//  products_mejor_calificados
//  La vista real solo trae productos con mínimo 3 calificaciones.
// ============================================================================

export const MOCK_MEJOR_CALIFICADOS: ProductoMejorCalificado[] = [
  {
    producto_id: 'a3',
    producto: 'Batería 12V 35Ah',
    tienda_id: 't2',
    tienda: 'Auto Repuestos RD',
    categoria_id: 'c2',
    categoria_nombre: 'Carros',
    precio_actual: 6200,
    total_calificaciones: 176,
    promedio_estrellas: 4.8,
    unidades_vendidas: 241,
  },
  {
    producto_id: 'a8',
    producto: 'Filtro de aire de Roots GAC',
    tienda_id: 't3',
    tienda: 'Parts & Service RD',
    categoria_id: 'c3',
    categoria_nombre: 'Guaguas',
    precio_actual: 1650,
    total_calificaciones: 57,
    promedio_estrellas: 4.7,
    unidades_vendidas: 128,
  },
  {
    producto_id: 'a1',
    producto: 'Pastilla de freno delantera',
    tienda_id: 't1',
    tienda: 'Repuestos El Che',
    categoria_id: 'c1',
    categoria_nombre: 'Motocicletas',
    precio_actual: 850,
    total_calificaciones: 124,
    promedio_estrellas: 4.6,
    unidades_vendidas: 312,
  },
  {
    producto_id: 'a5',
    producto: 'Disco de freno ventilado 260mm',
    tienda_id: 't2',
    tienda: 'Auto Repuestos RD',
    categoria_id: 'c2',
    categoria_nombre: 'Carros',
    precio_actual: 2850,
    total_calificaciones: 71,
    promedio_estrellas: 4.5,
    unidades_vendidas: 184,
  },
  {
    producto_id: 'a2',
    producto: 'Filtro de aceite Honda XR150',
    tienda_id: 't1',
    tienda: 'Repuestos El Che',
    categoria_id: 'c1',
    categoria_nombre: 'Motocicletas',
    precio_actual: 350,
    total_calificaciones: 98,
    promedio_estrellas: 4.4,
    unidades_vendidas: 268,
  },
  {
    producto_id: 'a4',
    producto: 'Amortiguador trasero (par)',
    tienda_id: 't3',
    tienda: 'Parts & Service RD',
    categoria_id: 'c3',
    categoria_nombre: 'Guaguas',
    precio_actual: 4750,
    total_calificaciones: 64,
    promedio_estrellas: 4.3,
    unidades_vendidas: 197,
  },
];

// ============================================================================
//  TEXTO DE LA PANTALLA DE INICIO
// ============================================================================

export const CIUDADES = [
  'Santo Domingo Oeste',
  'Santo Domingo Este',
  'Distrito Nacional',
  'Santiago',
  'La Vega',
];

export const createdDemo = hace(2);
