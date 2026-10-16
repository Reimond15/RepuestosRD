import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { PROGRESO_PEDIDO } from '@/lib/constants';
import { colors, fontSize, spacing } from '@/theme';

type Props = {
  /** Índice (0-3) del estado actual dentro de PROGRESO_PEDIDO. */
  estadoActual: number;
};

/**
 * Los 4 estados que ve el cliente: Recibido → Confirmado → En camino → Entregado.
 *
 * La base guarda 6 estados (incluye preparando, enviado y cancelado).
 * El usuario solo ve estos 4: "En camino" corresponde a preparando y enviado.
 * Ver ETAPAS_PEDIDO en src/lib/constants.ts
 */
export function BarraProgresoPedido({ estadoActual }: Props) {
  return (
    <View style={styles.contenedor}>
      {PROGRESO_PEDIDO.map((etapa, i) => {
        const hecho = i <= estadoActual;

        return (
          <View key={etapa.clave} style={styles.paso}>
            <View style={styles.linea}>
              <View style={[styles.lineaParte, i === 0 && styles.oculto]} />
              <View
                style={[
                  styles.lineaParte,
                  i === PROGRESO_PEDIDO.length - 1 && styles.oculto,
                  hecho && styles.hecha,
                ]}
              />
            </View>

            <View style={[styles.circulo, hecho && styles.circuloHecho]}>
              {hecho ? (
                <MaterialCommunityIcons name="check" size={12} color={colors.black} />
              ) : null}
            </View>

            <Text style={[styles.etiqueta, hecho && styles.etiquetaHecha]} variant="bodySmall">
              {etapa.etiqueta}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  paso: { flex: 1, alignItems: 'center', gap: 6 },
  linea: { flexDirection: 'row', width: '100%', height: 2 },
  lineaParte: { flex: 1, backgroundColor: colors.border },
  oculto: { backgroundColor: 'transparent' },
  hecha: { backgroundColor: colors.primary },
  circulo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloHecho: { backgroundColor: colors.primary, borderColor: colors.primary },
  etiqueta: { color: colors.textFaint, fontSize: fontSize.xs, textAlign: 'center' },
  etiquetaHecha: { color: colors.text, fontWeight: '600' },
});
