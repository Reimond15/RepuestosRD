import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { SUSCRIPCION } from '@/lib/constants';
import { NEGOCIO } from '@/lib/legal';
import type { MiSuscripcion } from '@/types/database';
import { colors, radius, spacing } from '@/theme';

const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

type Estilo = {
  icono: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  titulo: string;
  mensaje: string;
  /** true cuando hay que mostrar "escríbenos para pagar". */
  pedirPago: boolean;
};

function armarInfo(s: MiSuscripcion): Estilo {
  const esFundadorVigente = s.precio_fundador_vigente === true;
  const precioActual = esFundadorVigente
    ? SUSCRIPCION.precioFundadorTexto
    : SUSCRIPCION.precioNormalTexto;

  switch (s.estado) {
    case 'activa':
      return {
        icono: 'check-decagram-outline',
        color: colors.success,
        titulo: 'Suscripción activa',
        mensaje: `Tu tienda está al día hasta el ${fechaCorta(s.vence_en)}. ${esFundadorVigente && s.fundador_hasta ? `Precio de fundador (${precioActual}) vigente hasta el ${fechaCorta(s.fundador_hasta)}.` : `Precio: ${precioActual}.`}`,
        pedirPago: false,
      };
    case 'gracia':
      return {
        icono: 'alert-outline',
        color: colors.warning,
        titulo: 'Tu suscripción venció',
        mensaje: `Te quedan ${s.dias_gracia} ${
          s.dias_gracia === 1 ? 'día' : 'días'
        } antes de que tu tienda deje de aparecer en el catálogo. Para reactivar: ${precioActual}${esFundadorVigente && s.fundador_hasta ? ` (fundador, hasta el ${fechaCorta(s.fundador_hasta)})` : ''}.`,
        pedirPago: true,
      };
    case 'vencida':
      return {
        icono: 'store-alert-outline',
        color: colors.danger,
        titulo: 'Tu tienda está oculta',
        mensaje: `Tu tienda no aparece en el catálogo. Reactivala pagando ${precioActual}${esFundadorVigente && s.fundador_hasta ? ` (precio de fundador vigente hasta el ${fechaCorta(s.fundador_hasta)})` : ` (después pasa a ${SUSCRIPCION.precioNormalTexto})`}.`,
        pedirPago: true,
      };
    default:
      return {
        icono: 'gift-outline',
        color: colors.primaryLight,
        titulo: 'Período de prueba gratis',
        mensaje: `Estás en los ${SUSCRIPCION.diasPrueba} días gratis. Te ${
          s.dias_restantes === 1 ? 'queda' : 'quedan'
        } ${s.dias_restantes} ${s.dias_restantes === 1 ? 'día' : 'días'}. Después de la prueba: ${precioActual}${esFundadorVigente && s.fundador_hasta ? ` (fundador, hasta el ${fechaCorta(s.fundador_hasta)})` : ''}.`,
        pedirPago: true,
      };
  }
}

/**
 * Aviso del estado de la suscripción para el panel de la tienda.
 * No es un error: informa cuánto le queda y, si hace falta, cómo pagar.
 */
export function BannerSuscripcion({ suscripcion }: { suscripcion: MiSuscripcion }) {
  const info = armarInfo(suscripcion);

  return (
    <View
      style={[styles.contenedor, { borderColor: info.color }]}
      accessibilityRole="text"
      accessibilityLabel={`${info.titulo}. ${info.mensaje}`}
    >
      <View style={styles.fila}>
        <MaterialCommunityIcons name={info.icono} size={22} color={info.color} />
        <Text style={[styles.titulo, { color: info.color }]} variant="titleSmall">
          {info.titulo}
        </Text>
      </View>

      <Text style={styles.mensaje} variant="bodyMedium">
        {info.mensaje}
      </Text>

      {info.pedirPago ? (
        <Text style={styles.pago} variant="bodySmall">
          Para pagar, escríbenos a {NEGOCIO.email} y te indicamos cómo.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderWidth: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titulo: { fontWeight: '700' },
  mensaje: { color: colors.textMuted },
  pago: { color: colors.textFaint },
});
