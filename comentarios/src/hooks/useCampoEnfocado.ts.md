# src/hooks/useCampoEnfocado.ts

<!-- 3 bloques · 19 líneas · original del commit 1310672 -->

3 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 4

> Ancla: `export function useCampoEnfocado() {`

```
/**
 * Auto-desplaza un ScrollView para que el campo enfocado quede visible
 * cuando se abre el teclado. Es para los formularios (registro y checkout).
 *
 * Con `measureLayout` se pregunta la posición del campo dentro del contenido
 * del ScrollView y se baja/arriba hasta dejarlo con aire. En la web no hace
 * falta (no hay teclado virtual) y `nativeEvent.target` no es un número, así
 * que ahí se ignora.
 *
 * El parámetro se recibe como `unknown` (no como el evento de RN) porque el
 * `onFocus` de `react-native-paper` usa su propio tipo de evento.
 *
 * Uso:
 *   const { scrollRef, alEnfocar } = useCampoEnfocado();
 *   <ScrollView ref={scrollRef} ...>
 *     <TextInput onFocus={alEnfocar} />
 */
```

## Línea 31

> Ancla: `requestAnimationFrame(() => {`

```
// Aplazamos un frame para que el layout esté estable
```

## Línea 45

> Ancla: `}`

```
// Ignoramos errores de medición (unmount/ref inválido)
```
