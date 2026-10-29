import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

import { AppLogo } from '@/components/AppLogo';
import { useCarrito } from '@/store/carrito';
import { useResponsive } from '@/hooks/useResponsive';
import { colors, fontSize, radius, shadow, spacing } from '@/theme';

type Props = {
  children: ReactNode;
  conHeader?: boolean;
};

export function WebShell({ children, conHeader }: Props) {
  const { anchoContenido, navLateral } = useResponsive();
  const conBarra = conHeader ?? navLateral;

  return (
    <View style={styles.fondo}>
      <View style={[styles.columna, { maxWidth: anchoContenido }]}>
        {conBarra ? <HeaderEscritorio /> : null}
        {children}
      </View>
    </View>
  );
}

export function HeaderEscritorio() {
  const router = useRouter();
  const articulos = useCarrito((s) => s.lineas.reduce((acc, l) => acc + l.cantidad, 0));

  return (
    <View style={styles.header}>
      <AppLogo tamano={36} />

      <View style={styles.acciones}>
        <BotonIcono
          icono="magnify"
          texto="Buscar"
          onPress={() => router.push('/buscar')}
        />

        <Pressable
          onPress={() => router.push('/carrito')}
          style={({ pressed }) => [styles.carrito, pressed && styles.presionado]}
          accessibilityRole="button"
          accessibilityLabel="Carrito"
        >
          <MaterialCommunityIcons name="shopping-outline" size={20} color={colors.text} />
          {articulos > 0 ? <View style={styles.chincheta} /> : null}
          <Text style={styles.carritoTexto} variant="labelSmall">
            {articulos > 0 ? `${articulos} en el carrito` : 'Carrito'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function BotonIcono({
  icono,
  texto,
  onPress,
}: {
  icono: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  texto: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.boton, pressed && styles.presionado]}
      accessibilityRole="button"
    >
      <MaterialCommunityIcons name={icono} size={20} color={colors.text} />
      <Text style={styles.botonTexto} variant="labelMedium">
        {texto}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  columna: { flex: 1, width: '100%' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  acciones: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },

  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    minHeight: 40,
  },
  botonTexto: { color: colors.text, fontSize: fontSize.sm },

  carrito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    minHeight: 40,
    ...shadow.card,
  },
  carritoTexto: { color: colors.black, fontSize: fontSize.xs, fontWeight: '700' },

  chincheta: {
    position: 'absolute',
    top: 7,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.star,
  },

  presionado: { opacity: 0.7 },
});
