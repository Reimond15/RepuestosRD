import { useCallback, useRef } from 'react';
import { Platform, type ScrollView } from 'react-native';

export function useCampoEnfocado() {
  const scrollRef = useRef<ScrollView>(null);

  const alEnfocar = useCallback((evento: unknown) => {
    if (Platform.OS === 'web') return;

    const sv = scrollRef.current;
    const nodo = (evento as { nativeEvent?: { target?: unknown } } | null)?.nativeEvent?.target;
    if (!sv || typeof nodo !== 'number') return;

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
      }
    });
  }, []);

  return { scrollRef, alEnfocar };
}