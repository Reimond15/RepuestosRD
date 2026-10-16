import { Linking, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { LegalDoc } from '@/components/LegalDoc';
import { ENLACE_ELIMINACION_EMAIL, NEGOCIO } from '@/lib/legal';
import { colors, radius, spacing } from '@/theme';

/**
 * ============================================================================
 *  ELIMINAR CUENTA Y DATOS — recurso WEB
 *
 *  Requisito de Google Play: un enlace web donde se pueda pedir la eliminación
 *  de la cuenta SIN instalar ni abrir la app. Esta página es pública y sale en
 *  el build web (`/legal/eliminar-cuenta`), así que sirve como ese enlace.
 *
 *  Cada paso es claro y el correo funciona como vía directa.
 * ============================================================================
 */
export default function PantallaEliminarCuentaWeb() {
  const abrirCorreo = () => {
    void Linking.openURL(ENLACE_ELIMINACION_EMAIL);
  };

  return (
    <LegalDoc
      titulo="Eliminar tu cuenta y tus datos"
      intro={`Acá podés pedir la eliminación de tu cuenta de ${NEGOCIO.nombreComercial} y de los datos personales asociados. No necesitás volver a instalar la aplicación: podés hacerlo desde esta página o por correo.`}
      secciones={[
        {
          titulo: 'Cómo pedirlo',
          vinetas: [
            `Escribinos desde el correo de tu cuenta a ${NEGOCIO.emailPrivacidad}, indicando "Eliminar mi cuenta".`,
            'El botón "Escribir el correo" de acá abajo ya te deja el mensaje listo.',
            'Si todavía tenés la app instalada, también podés hacerlo desde Cuenta → Eliminar mi cuenta.',
            'También podés usar el enlace "Eliminar cuenta y datos" del índice legal dentro de la app.',
          ],
        },
        {
          titulo: 'Qué se elimina',
          vinetas: [
            'Tu cuenta, tu correo y tu teléfono.',
            'Tus mensajes del chat y las calificaciones que hayas dejado.',
            'Tu tienda, sus productos y su ubicación exacta, si vendés.',
          ],
        },
        {
          titulo: 'Qué se conserva',
          parrafos: [
            'Los pedidos ya realizados se conservan de forma anonimizada (sin tus datos personales), porque hacen falta para comprobantes y por obligaciones legales. No se usan para contactarte ni para publicidad.',
          ],
        },
        {
          titulo: 'Cuánto tarda',
          parrafos: [
            'Procesamos la solicitud lo antes posible, normalmente dentro de pocos días hábiles. Te confirmamos por correo cuando esté completa.',
          ],
        },
        {
          titulo: 'Antes de pedirlo',
          parrafos: [
            'Si tenés pedidos en curso, lo mejor es esperar a que se entreguen o se cancelen: si tenés una tienda, al eliminar la cuenta se cierra y sus productos dejan de aparecer en el catálogo.',
          ],
          aviso: 'La eliminación es permanente y no se puede deshacer.',
        },
      ]}
    >
      <Pressable
        onPress={abrirCorreo}
        accessibilityRole="link"
        accessibilityLabel={`Escribir el correo a ${NEGOCIO.emailPrivacidad} para eliminar la cuenta`}
        style={({ pressed }) => [styles.boton, pressed && styles.presionado]}
      >
        <MaterialCommunityIcons name="email-outline" size={22} color={colors.black} />
        <Text style={styles.botonTexto} variant="titleSmall">
          Escribir el correo
        </Text>
      </Pressable>

      <Text style={styles.pie} variant="bodySmall">
        {NEGOCIO.emailPrivacidad} · {NEGOCIO.nombreComercial}
      </Text>
    </LegalDoc>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  botonTexto: { color: colors.black, fontWeight: '700' },
  presionado: { opacity: 0.75 },
  pie: { color: colors.textFaint, textAlign: 'center' },
});
