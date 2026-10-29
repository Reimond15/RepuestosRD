# src/app/admin/tipos.tsx

<!-- 4 bloques · 12 líneas · original del commit 1310672 -->

4 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 24

> Ancla: `export default function PantallaTiposRepuesto() {`

```
/**
 * Administración de los tipos de repuesto. Solo para el rol `admin`:
 * la RLS de `tipos_repuesto` (`tipos_write_admin`) rechaza el resto.
 *
 * Sirve para curar los datos: corregir nombres raros, borrar duplicados
 * (por ejemplo "Sistema de escape" junto a "Escape") y agregar los que
 * falten. Los tipos los usan los productos, así que no se puede borrar uno
 * que esté en uso (FK `on delete restrict`).
 */
```

## Línea 48

> Ancla: `const categoriaEfectiva = categoriaId || categorias[0]?.id || '';`

```
// La primera categoría es el valor por defecto mientras el usuario no elige.
```

## Línea 171

> Ancla: `<View style={styles.tarjeta}>`

```
{/* ---------------- formulario ---------------- */}
```

## Línea 220

> Ancla: `{cargando ? (`

```
{/* ---------------- lista ---------------- */}
```
