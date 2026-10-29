# src/app/(tabs)/index.tsx

<!-- 9 bloques · 17 líneas · original del commit 1310672 -->

9 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 31

> Ancla: `const { estado: estadoUbicacion, lat, lng, zona, localizar } = useUbicacion();`

```
// ubicación del cliente: define la zona del título y el orden por cercanía
```

## Línea 37

> Ancla: `const aviso = (() => {`

```
/**
   * El estado del aviso de arriba. Solo aparece cuando hay algo que
   * decir: si todo salió bien, no ocupa espacio.
   */
```

## Línea 60

> Ancla: `{ paddingTop: esMovil ? insets.top + spacing.md : 0 },`

```
// en escritorio el header ya da el alto, no hace falta el safe area
```

## Línea 64

> Ancla: `<View style={styles.cabecera}>`

```
{/* ---------------- cabecera ---------------- */}
```

## Línea 115

> Ancla: `<View style={styles.filtros}>`

```
{/* ---------------- filtro de categoría (checklist) ---------------- */}
```

## Línea 120

> Ancla: `{aviso ? (`

```
{/* ---------------- estado de los datos ---------------- */}
```

## Línea 129

> Ancla: `<SectionProductos`

```
{/* ---------------- Lo más vendido ---------------- */}
```

## Línea 144

> Ancla: `<SectionProductos`

```
{/* ---------------- Mejor calificados ---------------- */}
```

## Línea 162

> Ancla: `function ContadorTiendas({`

```
/**
 * Contador de tiendas aprobadas, alineado a la derecha del subtítulo.
 *
 * Si la consulta falla no se dibuja nada: un "0 tiendas" sería mentira. Mientras
 * carga muestra un guion para reservar el espacio y que no salte el diseño.
 */
```
