import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';

import { WebShell } from '@/components/WebShell';
import { NEGOCIO, PAGINAS_LEGALES } from '@/lib/legal';
import { colors, spacing } from '@/theme';

type NombreIcono = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Índice de los documentos legales. Podés verlo sin iniciar sesión. */
export default function PantallaLegal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contenido,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <Text style={styles.titulo} variant="headlineMedium" accessibilityRole="header">
            Legal
          </Text>
          <Text style={styles.sub} variant="bodyMedium">
            Documentos de {NEGOCIO.nombreComercial}. Podés consultarlos sin iniciar sesión.
          </Text>

          <View style={styles.tarjeta}>
            {PAGINAS_LEGALES.map((p, i) => (
              <Pressable
                key={p.ruta}
                onPress={() => router.push(p.ruta)}
                accessibilityRole="link"
                accessibilityLabel={p.titulo}
                style={({ pressed }) => [
                  styles.fila,
                  i > 0 && styles.filaBorde,
                  pressed && styles.presionado,
                ]}
              >
                <MaterialCommunityIcons
                  name={p.icono as NombreIcono}
                  size={20}
                  color={colors.primaryLight}
                />
                <Text style={styles.filaTexto} variant="bodyMedium">
                  {p.titulo}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textFaint}
                />
              </Pressable>
            ))}
          </View>

          <Text style={styles.pie} variant="bodySmall">
            Contacto: {NEGOCIO.email}
          </Text>
        </ScrollView>
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: {
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  titulo: { color: colors.text },
  sub: { color: colors.textMuted },

  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filaBorde: { borderTopWidth: 1, borderTopColor: colors.border },
  filaTexto: { color: colors.text, flex: 1 },

  presionado: { opacity: 0.6 },
  pie: { color: colors.textFaint, textAlign: 'center' },
});
