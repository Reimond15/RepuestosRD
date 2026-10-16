import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors, fontSize, radius, spacing } from '@/theme';

type Modo = 'ok' | 'cargando' | 'error' | 'demo' | 'vacio';

type Props = {
  modo: Modo;
  /** Mensaje del error, cuando modo es "error". */
  error?: string | null;
  cargando?: boolean;
  onReintentar?: () => void;
  /** Texto cuando no hay nada que mostrar. */
  vacio?: string;
};

/**
 * ============================================================================
 *  Aviso pequeño de estado: carga, error o "estás viendo datos de prueba".
 *
 *  Vive en la parte de arriba de las pantallas. Es deliberadamente
 *  discreto: si la app funciona, no tiene que ocupar espacio.
 * ============================================================================
 */
export function AvisoDatos({ modo, error, cargando, onReintentar, vacio }: Props) {
  if (modo === 'cargando') {
    return (
      <View style={[styles.caja, styles.cajaCargando]}>
        <ActivityIndicator size="small" color={colors.primaryLight} />
        <Text style={styles.texto} variant="bodySmall">
          Consultando el catálogo…
        </Text>
      </View>
    );
  }

  if (modo === 'error') {
    return (
      <View style={[styles.caja, styles.cajaError]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
        <View style={styles.textoCol}>
          <Text style={styles.tituloError} variant="labelMedium">
            No pudimos leer el catálogo
          </Text>
          <Text style={styles.texto} variant="bodySmall" numberOfLines={2}>
            {error ?? 'Error desconocido.'} — mostrando datos de prueba.
          </Text>
        </View>

        {onReintentar ? (
          <Text
            variant="labelMedium"
            style={styles.reintentar}
            onPress={onReintentar}
            accessibilityRole="button"
          >
            Reintentar
          </Text>
        ) : null}
      </View>
    );
  }

  if (modo === 'demo') {
    return (
      <View style={styles.caja}>
        <MaterialCommunityIcons name="flask-outline" size={16} color={colors.primaryLight} />
        <Text style={styles.texto} variant="bodySmall">
          Datos de prueba · Conectá Supabase en <Text style={styles.mono}>.env</Text> para ver el
          catálogo real.
        </Text>
      </View>
    );
  }

  if (modo === 'vacio') {
    return (
      <View style={styles.caja}>
        <MaterialCommunityIcons name="package-variant-closed" size={16} color={colors.textFaint} />
        <Text style={styles.texto} variant="bodySmall">
          {vacio ?? 'No hay nada acá todavía.'}
        </Text>
        {cargando ? <ActivityIndicator size="small" color={colors.textFaint} /> : null}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cajaCargando: { opacity: 0.7 },
  cajaError: { borderColor: colors.danger },

  textoCol: { flex: 1 },
  texto: { color: colors.textMuted, flex: 1, fontSize: fontSize.xs, lineHeight: 16 },
  tituloError: { color: colors.danger, fontSize: fontSize.xs },
  mono: { color: colors.primaryLight, fontWeight: '700' },
  reintentar: { color: colors.primaryLight, fontWeight: '700' },
});