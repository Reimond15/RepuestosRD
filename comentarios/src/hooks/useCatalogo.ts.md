# src/hooks/useCatalogo.ts

<!-- 10 bloques · 50 líneas · original del commit 1310672 -->

10 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 21

> Ancla: `type Estado<T> = {`

```
/**
 * ============================================================================
 *  Hooks del catálogo
 *
 *  Los cuatro tienen los mismos estados (cargando / error / datos) y la
 *  misma regla: si Supabase no está configurado se usan los datos de
 *  prueba, para que la pantalla nunca quede rota ni muestre un error que
 *  el usuario no puede arreglar.
 *
 *  `catalogoDisponible` es una constante de módulo: nunca cambia en
 *  caliente. Por eso el caso "sin Supabase" se resuelve en el render y no
 *  dentro del efecto — si no, la app haría un render extra para pasar de
 *  los mocks a los mocks.
 * ============================================================================
 */
```

## Línea 41

> Ancla: `enVivo: boolean;`

```
/** true cuando vino de Supabase, false cuando son datos de prueba */
```

## Línea 52

> Ancla: `function filtrarPorSeleccion<T extends { categoria_nombre: string }>(`

```
/** Filtra las filas de ranking por la selección múltiple de slugs.
 *  Las vistas guardan el nombre con mayúscula ("Motocicletas"); el slug
 *  es ese mismo nombre en minúsculas, así que la comparación es directa. */
```

## Línea 64

> Ancla: `export function useMasVendidos(seleccion: CategoriaSlug[]) {`

```
// ============================================================================
//  products_mas_vendidos
// ============================================================================
```

## Línea 88

> Ancla: `setEstado({ datos: filas, cargando: false, error: null, enVivo: true });`

```
// Supabase respondió: se muestra el vacío real, no los mocks.
        // Si no, una base sin datos parecería un error de la app.
```

## Línea 107

> Ancla: `const datos = useMemo(() => {`

```
// las tiendas más cercanas primero (los mocks no tienen coordenadas, no cambia nada)
```

## Línea 128

> Ancla: `export function useMejorCalificados(seleccion: CategoriaSlug[]) {`

```
// ============================================================================
//  productos_mejor_calificados
//  La vista en SQL ya exige mínimo 3 calificaciones.
// ============================================================================
```

## Línea 190

> Ancla: `export function useBusqueda() {`

```
// ============================================================================
//  Búsqueda
//
//  El texto se filtra en el dispositivo porque `catalogo_productos` son
//  pocos cientos de filas: traerlas una vez es más rápido que una consulta
//  por cada tecla. Cuando el catálogo crezca a miles, esto pasa a ser
//  una consulta a Postgres con ilike sobre el índice trigram.
// ============================================================================
```

## Línea 241

> Ancla: `export function textoBuscable(p: ProductoCatalogo): string {`

```
/**
 * ============================================================================
 *  Texto que se usa para buscar dentro de un producto.
 *
 *  Incluye la compatibilidad: si el usuario escribe "XR150" o "Toyota",
 *  encuentra el repuesto aunque el nombre del producto no lo diga. Para un
 *  marketplace de repuestos eso vale más que cualquier otra cosa.
 * ============================================================================
 */
```

## Línea 264

> Ancla: `export const MOCK_CATALOGO: ProductoCatalogo[] = MOCK_MAS_VENDIDOS.map((m) => ({`

```
/**
 * Los mocks de "más vendidos" llevados a la forma de `catalogo_productos`,
 * para que la pantalla de buscar funcione sin Supabase con el mismo código.
 */
```
