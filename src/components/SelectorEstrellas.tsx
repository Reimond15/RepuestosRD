import { Pressable, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors } from '@/theme';

type Props = {
  valor: number;
  onChange: (estrellas: number) => void;
  size?: number;
  deshabilitado?: boolean;
};

export function SelectorEstrellas({
  valor,
  onChange,
  size = 34,
  deshabilitado = false,
}: Props) {
  return (
    <View style={styles.fila} accessibilityRole="radiogroup">
      {[1, 2, 3, 4, 5].map((i) => {
        const activa = i <= valor;
        return (
          <Pressable
            key={i}
            onPress={() => onChange(i)}
            disabled={deshabilitado}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${i} ${i === 1 ? 'estrella' : 'estrellas'}`}
            accessibilityState={{ selected: activa, disabled: deshabilitado }}
            style={({ pressed }) => [styles.estrella, pressed && styles.presionada]}
          >
            <MaterialCommunityIcons
              name={activa ? 'star' : 'star-outline'}
              size={size}
              color={activa ? colors.star : deshabilitado ? colors.border : colors.textFaint}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  estrella: { padding: 2 },
  presionada: { opacity: 0.7 },
});
