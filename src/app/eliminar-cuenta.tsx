import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import { ENLACE_ELIMINACION_EMAIL, NEGOCIO } from '@/lib/legal';
import { leerError, solicitarEliminacionCuenta } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import { colors, radius, spacing } from '@/theme';

/** Palabra que hay que escribir para habilitar el borrado. */
const CONFIRMACION = 'ELIMINAR';

type Estado = 'inicio' | 'enviando' | 'listo' | 'error';

/**
 * ============================================================================
 *  ELIMINAR MI CUENTA
 *
 *  Requisito de Google Play: vía DENTRO de la app para pedir el borrado de la
 *  cuenta y sus datos (la web es `/legal/eliminar-cuenta`).
 *
 *  La app no puede borrar `auth.users` por su cuenta (eso pide la clave
 *  `service_role`, que nunca viaja al cliente). Acá se REGISTRA la solicitud y
 *  se borran de inmediato los datos personales que no rompen nada; el cierre
 *  definitivo lo hace la administración (ver 20_eliminar_cuenta.sql).
 * ============================================================================
 */
export default function PantallaEliminarCuenta() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { esMovil } = useResponsive();
  const { usuario, cargando } = useSesion();

  const [texto, setTexto] = useState('');
  const [motivo, setMotivo] = useState('');
  const [estado, setEstado] = useState<Estado>('inicio');
  const [error, setError] = useState<string | null>(null);

  const confirmado = texto.trim().toUpperCase() === CONFIRMACION;

  const enviar = useCallback(async () => {
    if (!confirmado) return;

    setEstado('enviando');
    setError(null);

    try {
      await solicitarEliminacionCuenta(motivo.trim() || null);
      setEstado('listo');
      // Cerramos la sesión: la cuenta ya no debe usarse.
      await supabase?.auth.signOut();
    } catch (e: unknown) {
      setError(leerError(e));
      setEstado('error');
    }
  }, [confirmado, motivo]);

  const abrirCorreo = useCallback(() => {
    void Linking.openURL(ENLACE_ELIMINACION_EMAIL);
  }, []);

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contenido,
            {
              paddingTop: esMovil ? insets.top + spacing.md : spacing.xl,
              paddingBottom: insets.bottom + spacing.xxl,
            },
          ]}
        >
          <Text style={styles.titulo} variant="headlineSmall" accessibilityRole="header">
            Eliminar mi cuenta
          </Text>

          {estado === 'listo' ? (
            <View style={styles.tarjeta}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={36}
                color={colors.success}
              />
              <Text style={styles.tituloTarjeta} variant="titleMedium">
                Solicitud registrada
              </Text>
              <Text style={styles.muted} variant="bodyMedium">
                Borramos ya tus mensajes, tus calificaciones y tu teléfono. Vamos a eliminar
                tu cuenta y los datos que quedan (incluido tu correo). Te avisamos a{' '}
                {usuario?.email ?? 'tu correo'} cuando el borrado esté completo.
              </Text>
              <Text style={styles.muted} variant="bodySmall">
                ¿Fue un error? Escribinos a {NEGOCIO.email} lo antes posible.
              </Text>
              <Button mode="outlined" onPress={() => router.replace('/')}>
                Volver al inicio
              </Button>
            </View>
          ) : (
            <>
              <View style={styles.aviso}>
                <MaterialCommunityIcons
                  name="alert-outline"
                  size={22}
                  color={colors.warning}
                />
                <Text style={styles.avisoTexto} variant="bodyMedium">
                  Esto es permanente y no se puede deshacer.
                </Text>
              </View>

              <View style={styles.tarjeta}>
                <Text style={styles.tituloTarjeta} variant="titleSmall">
                  Qué se elimina
                </Text>
                <Vineta texto="Tu cuenta, tu correo y tu teléfono." />
                <Vineta texto="Tus mensajes del chat y las calificaciones que dejaste." />
                <Vineta texto="Tu tienda, sus productos y su ubicación exacta, si vendés." />

                <Text style={[styles.tituloTarjeta, styles.espacio]} variant="titleSmall">
                  Qué se conserva
                </Text>
                <Vineta texto="Los pedidos ya hechos, sin tus datos personales, por comprobantes y obligaciones legales." />
              </View>

              {!cargando && !usuario ? (
                <EmptyState
                  icono="account-off-outline"
                  titulo="No has iniciado sesión"
                  mensaje="Para eliminar tu cuenta primero tenés que entrar."
                  accion={
                    <Button mode="contained" onPress={() => router.push('/ingresar')}>
                      Ingresar
                    </Button>
                  }
                />
              ) : (
                <View style={styles.tarjeta}>
                  <Text style={styles.muted} variant="bodyMedium">
                    Contanos el motivo (opcional) y escribí{' '}
                    <Text style={styles.fuerte}>{CONFIRMACION}</Text> para confirmar.
                  </Text>

                  <TextInput
                    label="Motivo (opcional)"
                    value={motivo}
                    onChangeText={setMotivo}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    disabled={estado === 'enviando'}
                  />

                  <TextInput
                    label={`Escribí ${CONFIRMACION} para confirmar`}
                    value={texto}
                    onChangeText={setTexto}
                    mode="outlined"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    disabled={estado === 'enviando'}
                  />

                  {error ? (
                    <Text style={styles.error} variant="bodySmall">
                      {error}
                    </Text>
                  ) : null}

                  <Button
                    mode="contained"
                    buttonColor={colors.danger}
                    textColor={colors.white}
                    icon="account-remove-outline"
                    loading={estado === 'enviando'}
                    disabled={!confirmado || estado === 'enviando'}
                    onPress={() => {
                      void enviar();
                    }}
                  >
                    Eliminar mi cuenta definitivamente
                  </Button>
                </View>
              )}

              <View style={styles.tarjeta}>
                <Text style={styles.tituloTarjeta} variant="titleSmall">
                  ¿No podés entrar o preferís pedirlo por correo?
                </Text>
                <Text style={styles.muted} variant="bodyMedium">
                  Escribinos desde el correo de tu cuenta a {NEGOCIO.emailPrivacidad} y lo
                  gestionamos igual.
                </Text>
                <Button mode="outlined" icon="email-outline" onPress={abrirCorreo}>
                  Escribir el correo
                </Button>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </WebShell>
  );
}

function Vineta({ texto }: { texto: string }) {
  return (
    <View style={styles.vinetaFila}>
      <Text style={styles.punto} variant="bodyMedium">
        •
      </Text>
      <Text style={styles.vinetaTexto} variant="bodyMedium">
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  titulo: { color: colors.text },

  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tituloTarjeta: { color: colors.text },
  espacio: { marginTop: spacing.sm },
  muted: { color: colors.textMuted, lineHeight: 20 },
  fuerte: { color: colors.text, fontWeight: '700' },
  error: { color: colors.danger },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  avisoTexto: { color: colors.text, flex: 1 },

  vinetaFila: { flexDirection: 'row', gap: spacing.sm },
  punto: { color: colors.primaryLight },
  vinetaTexto: { color: colors.text, flex: 1, lineHeight: 20 },
});
