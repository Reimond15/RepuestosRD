import { useCallback, useRef } from 'react';
import { Platform, type ScrollView } from 'react-native';

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
export function useCampoEnfocado() {
  const scrollRef = useRef<ScrollView>(null);

  const alEnfocar = useCallback((evento: unknown) => {
    if (Platform.OS === 'web') return;

    const sv = scrollRef.current;
    const nodo = (evento as { nativeEvent?: { target?: unknown } } | null)?.nativeEvent?.target;
    if (!sv || typeof nodo !== 'number') return;

    // Aplazamos un frame para que el layout esté estable
    requestAnimationFrame(() => {
      try {
        const contenido = sv.getInnerViewNode?.();
        if (!contenido) return;

        contenido.measureLayout(
          nodo,
          (_x: number, y: number) => {
            sv.scrollTo({ y: Math.max(0, y - 110), animated: true });
          },
          () => undefined,
        );
      } catch {
        // Ignoramos errores de medición (unmount/ref inválido)
      }
    });
  }, []);

  return { scrollRef, alEnfocar };
}