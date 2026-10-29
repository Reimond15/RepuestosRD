# src/app/checkout.tsx

<!-- 14 bloques · 28 líneas · original del commit 1310672 -->

14 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 43

> Ancla: `export default function PantallaCheckout() {`

```
/**
 * Tramitar pedido.
 *
 * Un pedido es de UNA tienda, así que el carrito (que puede juntar varias)
 * se parte en un pedido por tienda, cada uno con su entrega y dirección.
 *
 * Antes de crear, se revalidan precios y stock contra la base: un precio
 * que cambió después de agregar al carrito se actualiza y se le avisa al
 * cliente para que confirme el total nuevo.
 */
```

## Línea 69

> Ancla: `const [modoDireccion, setModoDireccion] = useState<'unica' | 'por-tienda'>('unica');`

```
// Cuando el carrito tiene repuestos de varias tiendas, el cliente puede
  // elegir entre una sola dirección de entrega o una distinta por tienda.
```

## Línea 74

> Ancla: `const porTienda = useMemo(() => {`

```
// ---------------- agrupar por tienda ----------------
```

## Línea 95

> Ancla: `useEffect(() => {`

```
// ---------------- datos de las tiendas (delivery/zonas) ----------------
```

## Línea 113

> Ancla: `const compartida = porTienda.length > 1 && modoDireccion === 'unica';`

```
// Solo tiene sentido compartir la dirección si hay más de una tienda; con
  // una sola, cada formulario usa su propio campo (aunque el modo sea "única").
```

## Línea 117

> Ancla: `const direccionPara = (tiendaId: string): string => {`

```
/** La dirección que le corresponde a una tienda (o '' si es retiro). */
```

## Línea 132

> Ancla: `const confirmar = async () => {`

```
// ---------------- confirmar ----------------
```

## Línea 145

> Ancla: `for (const g of porTienda) {`

```
// 1. validar formularios
```

## Línea 158

> Ancla: `const ids = porTienda.flatMap((g) => g.lineas.map((l) => l.producto_id));`

```
// 2. revalidar precios y stock contra la base
```

## Línea 183

> Ancla: `revalidar(actuales);`

```
// aplica los cambios al carrito (precios, y saca lo que ya no tiene stock)
```

## Línea 193

> Ancla: `setEnviando(true);`

```
// 3. crear un pedido por tienda (con el estado fresquito del carrito)
```

## Línea 230

> Ancla: `if (hechos.length > 0) {`

```
// ---------------- éxito ----------------
```

## Línea 287

> Ancla: `{porTienda.length > 1 ? (`

```
{/* Con varias tiendas, el cliente decide si todo va al mismo lugar */}
```

## Línea 484

> Ancla: `function RadioFila({`

```
/**
 * Fila con un botón de radio y su etiqueta. Se usa para elegir si todas las
 * tiendas del carrito entregan en la misma dirección.
 */
```
