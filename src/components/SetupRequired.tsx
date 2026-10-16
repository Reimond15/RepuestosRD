import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, radius, spacing } from '@/theme';

/**
 * ============================================================================
 *  Pantalla de guarda.
 *  Se muestra cuando falta el archivo `.env`.
 *
 *  ¿Por qué existe? Porque `@supabase/supabase-js` LANZA una excepción si
 *  la URL no es válida, y eso produce una pantalla blanca sin explicación.
 *  Con esta pantalla el problema se ve claro y te dice qué hacer.
 * ============================================================================
 */

const PASOS = [
  {
    n: 1,
    titulo: 'Creá tu proyecto en Supabase',
    detalle: 'supabase.com/dashboard → New project. Te va a tomar 2 minutos.',
  },
  {
    n: 2,
    titulo: 'Copiá las 2 claves',
    detalle: 'Project Settings → API → Project URL y anon public.',
  },
  {
    n: 3,
    titulo: 'Pegalas en el archivo .env',
    detalle:
      'EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\nEXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...',
  },
  {
    n: 4,
    titulo: 'Reiniciá con la cache limpia',
    detalle: 'npx expo start -c   ← la -c es obligatoria',
  },
];

export function SetupRequired() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.contenido,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.icono}>
        <MaterialCommunityIcons name="database-alert-outline" size={40} color={colors.warning} />
      </View>

      <Text style={styles.titulo} variant="headlineMedium">
        Falta conectar Supabase
      </Text>

      <Text style={styles.subtitulo} variant="bodyMedium">
        La app todavía no tiene tus claves del proyecto. Hacé esto y volvés a cargar:
      </Text>

      {PASOS.map((p) => (
        <View key={p.n} style={styles.paso}>
          <View style={styles.numero}>
            <Text style={styles.numeroTexto} variant="labelMedium">
              {p.n}
            </Text>
          </View>

          <View style={styles.pasoTexto}>
            <Text style={styles.pasoTitulo} variant="titleSmall">
              {p.titulo}
            </Text>
            <Text style={styles.pasoDetalle} variant="bodySmall">
              {p.detalle}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.nota}>
        <MaterialCommunityIcons name="information-outline" size={16} color={colors.textMuted} />
        <Text style={styles.notaTexto} variant="bodySmall">
          El archivo de ejemplo está en <Text style={styles.mono}>.env.example</Text>. Copialo
          como <Text style={styles.mono}>.env</Text> y pegale los valores.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  contenido: { paddingHorizontal: spacing.xl, gap: spacing.md },

  icono: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulo: { color: colors.text, marginTop: spacing.xs },
  subtitulo: { color: colors.textMuted, marginBottom: spacing.sm },

  paso: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  numero: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: { color: colors.black, fontWeight: '700' },
  pasoTexto: { flex: 1, gap: 3 },
  pasoTitulo: { color: colors.text },
  pasoDetalle: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 17 },

  nota: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  notaTexto: { flex: 1, color: colors.textMuted, lineHeight: 17 },
  mono: { color: colors.primaryLight, fontFamily: 'monospace' },
});
