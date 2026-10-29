# src/app/(tabs)/buscar.tsx

<!-- 4 bloques · 8 líneas · original del commit 1310672 -->

4 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 31

> Ancla: `const fuente = catalogo.enVivo || catalogo.cargando ? catalogo.datos : MOCK_CATALOGO;`

```
// sin Supabase se buscan los mocks, con la misma forma de datos
```

## Línea 39

> Ancla: `if (activas.size > 0 && !activas.has(p.categoria_slug)) return false;`

```
// varias categorías marcadas = todo lo que pertenezca a cualquiera
```

## Línea 131

> Ancla: `function aResumen(p: ProductoCatalogo) {`

```
/**
 * `catalogo_productos` llama `categoria` a la categoría; las vistas de
 * ranking la llaman `categoria_nombre`. Se normaliza una sola vez acá para
 * que ProductCard no tenga que conocer los dos nombres.
 */
```

## Línea 169

> Ancla: `maxWidth: 520,`

```
// en escritorio no crece a 4000px de ancho
```
