# src/components/ChecklistCategorias.tsx

<!-- 2 bloques · 8 líneas · original del commit 1310672 -->

2 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 9

> Ancla: `seleccion: CategoriaSlug[];`

```
/** Slugs marcados. Vacío = "Todos" (ver todo). */
```

## Línea 16

> Ancla: `export function ChecklistCategorias({ seleccion, onChange }: Props) {`

```
/**
 * Checklist de categorías (multi-selección): "Todos" + las 3 categorías.
 *
 * El cliente marca varias a la vez —moto y carro, por ejemplo— y ve todo
 * lo relacionado sin volver a buscar. "Todos" limpia la selección.
 * Las opciones hacen wrap para que se vean bien en pantallas chicas.
 */
```
