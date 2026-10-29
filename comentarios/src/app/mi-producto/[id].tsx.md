# src/app/mi-producto/[id].tsx

<!-- 17 bloques · 22 líneas · original del commit 1310672 -->

17 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 39

> Ancla: `type FilaCompat = {`

```
/** Fila de compatibilidad mientras se edita (los años son texto hasta guardar). */
```

## Línea 49

> Ancla: `export default function PantallaMiProducto() {`

```
/**
 * Alta y edición de un repuesto de la tienda.
 *
 * `id === 'nuevo'` es alta. Al guardar, la compatibilidad se reemplaza entera
 * (borrar + insertar), que es lo más simple para editar una lista.
 */
```

## Línea 64

> Ancla: `const [nombre, setNombre] = useState('');`

```
// --- estado del formulario ---
```

## Línea 74

> Ancla: `const [nuevas, setNuevas] = useState<{ uri: string; mimeType: string | null }[]>([]);`

```
// fotos elegidas del teléfono, todavía sin subir (se suben al guardar)
```

## Línea 86

> Ancla: `useEffect(() => {`

```
// --- cargar el producto a editar ---
```

## Línea 136

> Ancla: `const setFila = (indice: number, campo: keyof FilaCompat, valor: string) => {`

```
// --- compatibilidad ---
```

## Línea 144

> Ancla: `const setImagen = (indice: number, valor: string) =>`

```
// --- imágenes ---
```

## Línea 154

> Ancla: `const elegirFotos = async () => {`

```
/** Abre la galería y agrega las fotos elegidas a la lista de "por subir". */
```

## Línea 183

> Ancla: `const validar = (): string | null => {`

```
// --- validación ---
```

## Línea 256

> Ancla: `if (nuevas.length > 0) {`

```
// Subimos las fotos del teléfono al bucket y las sumamos a las URLs.
```

## Línea 341

> Ancla: `<Seccion titulo="Datos del repuesto">`

```
{/* ---------------- datos básicos ---------------- */}
```

## Línea 360

> Ancla: `<Seccion titulo="Vehículo">`

```
{/* ---------------- categoría y tipo ---------------- */}
```

## Línea 405

> Ancla: `<Seccion titulo="Precio y stock">`

```
{/* ---------------- precio, stock, condición ---------------- */}
```

## Línea 455

> Ancla: `<Seccion titulo="Imágenes">`

```
{/* ---------------- imágenes ---------------- */}
```

## Línea 539

> Ancla: `<Seccion titulo="Compatibilidad">`

```
{/* ---------------- compatibilidad ---------------- */}
```

## Línea 599

> Ancla: `<View style={styles.acciones}>`

```
{/* ---------------- acciones ---------------- */}
```

## Línea 654

> Ancla: `function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {`

```
/** Tarjeta con un título, para agrupar campos. */
```
