# src/app/verificar-tienda.tsx

<!-- 7 bloques · 15 líneas · original del commit 1310672 -->

7 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 18

> Ancla: `type Foto = { uri: string; mimeType?: string | null };`

```
/** Una foto elegida pero todavía sin subir. */
```

## Línea 21

> Ancla: `export default function PantallaVerificarTienda() {`

```
/**
 * ============================================================================
 *  Verificación de la tienda con fotos (fachada + interior)
 *
 *  Es OPCIONAL: no bloquea la aprobación de la tienda. Solo busca la insignia
 *  "Tienda verificada" en el catálogo. Las fotos se suben a un bucket PRIVADO
 *  (`verificacion`), visible solo para el dueño y el admin.
 * ============================================================================
 */
```

## Línea 119

> Ancla: `const previaFachada = fachada?.uri ?? urlFachada;`

```
// Previsualización: lo recién elegido o, si no hay nada nuevo, lo ya enviado.
```

## Línea 146

> Ancla: `{cargando ? (`

```
{/* ---------------- estado actual ---------------- */}
```

## Línea 166

> Ancla: `{!verificada && !cargando ? (`

```
{/* ---------------- fotos ---------------- */}
```

## Línea 240

> Ancla: `function TarjetaEstado({`

```
/** Cartel con el estado de la verificación. */
```

## Línea 297

> Ancla: `function BotonFoto({`

```
/** Botón grande con previsualización de la foto elegida. */
```
