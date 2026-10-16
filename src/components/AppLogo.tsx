import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors } from '@/theme';

type Props = {
  /** Tamaño del ícono de la rueda. */
  tamano?: number;
  /** Muestra el nombre al lado. */
  conNombre?: boolean;
};

/** Logo de la app: rueda + nombre. El ícono va en `colores.primary`. */
export function AppLogo({ tamano = 34, conNombre = true }: Props) {
  return (
    <View style={styles.cont}>
      <View style={[styles.rueda, { width: tamano, height: tamano, borderRadius: tamano / 2 }]}>
        <MaterialCommunityIcons name="cog" size={tamano * 0.62} color={colors.black} />
      </View>

      {conNombre ? (
        <View style={styles.textos}>
          <Text style={[styles.nombre, { fontSize: tamano * 0.52 }]}>RepuestosRD</Text>
          <Text style={[styles.lema, { fontSize: Math.max(9, tamano * 0.26) }]}>
            Santo Domingo Oeste
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cont: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  rueda: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textos: { justifyContent: 'center' },
  nombre: {
    color: colors.text,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: undefined,
  },
  lema: {
    color: colors.primaryLight,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
