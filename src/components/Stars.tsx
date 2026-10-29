import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors, fontSize } from '@/theme';

type Props = {
  promedio: number | null | undefined;
  total?: number | null;
  size?: number;
  mostrarNumero?: boolean;
};

function StarsBase({
  promedio,
  total,
  size = 14,
  mostrarNumero = true,
}: Props) {
  const valor = promedio ?? 0;
  const sinDatos = valor <= 0;

  return (
    <View style={styles.row} accessibilityRole="text">
      <View style={styles.iconos}>
        {[1, 2, 3, 4, 5].map((i) => (
          <MaterialCommunityIcons
            key={i}
            name={i <= Math.round(valor) ? 'star' : 'star-outline'}
            size={size}
            color={sinDatos ? colors.textFaint : colors.star}
          />
        ))}
      </View>

      {mostrarNumero && !sinDatos ? (
        <Text style={styles.numero} variant="bodySmall">
          {valor.toFixed(1)}
          {total != null && total > 0 ? ` (${total})` : ''}
        </Text>
      ) : sinDatos ? (
        <Text style={styles.sinDatos} variant="bodySmall">
          Sin calificar
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconos: { flexDirection: 'row', gap: 2 },
  numero: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
  sinDatos: { color: colors.textFaint, fontSize: fontSize.xs },
});

export const Stars = memo(StarsBase);
