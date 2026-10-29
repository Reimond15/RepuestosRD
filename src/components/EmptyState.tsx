import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors, spacing } from '@/theme';

type Props = {
  icono?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  titulo: string;
  mensaje?: string;
  accion?: ReactNode;
};

export function EmptyState({ icono = 'package-variant-closed', titulo, mensaje, accion }: Props) {
  return (
    <View style={styles.cont}>
      <View style={styles.circulo}>
        <MaterialCommunityIcons name={icono} size={40} color={colors.primaryLight} />
      </View>

      <Text style={styles.titulo} variant="titleMedium">
        {titulo}
      </Text>

      {mensaje ? (
        <Text style={styles.mensaje} variant="bodyMedium">
          {mensaje}
        </Text>
      ) : null}

      {accion ? <View style={styles.accion}>{accion}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cont: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  circulo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  titulo: { color: colors.text, textAlign: 'center' },
  mensaje: { color: colors.textMuted, textAlign: 'center', maxWidth: 300 },
  accion: { marginTop: spacing.md },
});
