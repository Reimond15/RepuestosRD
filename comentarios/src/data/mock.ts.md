# src/data/mock.ts

<!-- 4 bloques · 29 líneas · original del commit 1310672 -->

4 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 6

> Ancla: `const ahora = Date.now();`

```
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
```

## Línea 28

> Ancla: `export const MOCK_MAS_VENDIDOS: ProductoMasVendido[] = [`

```
// ============================================================================
//  products_mas_vendidos
//  `categoria_nombre` es lo que usa el filtro de la pantalla.
// ============================================================================
```

## Línea 148

> Ancla: `export const MOCK_MEJOR_CALIFICADOS: ProductoMejorCalificado[] = [`

```
// ============================================================================
//  products_mejor_calificados
//  La vista real solo trae productos con mínimo 3 calificaciones.
// ============================================================================
```

## Línea 228

> Ancla: `export const CIUDADES = [`

```
// ============================================================================
//  TEXTO DE LA PANTALLA DE INICIO
// ============================================================================
```
