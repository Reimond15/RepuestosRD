import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ReportarModal } from '@/components/ReportarModal';
import { WebShell } from '@/components/WebShell';
import { useMensajes } from '@/hooks/useMensajes';
import { useSesion } from '@/hooks/useSesion';
import {
  bloquearUsuario,
  buscarContraparteDelPedido,
  buscarMisBloqueos,
  crearReporte,
  desbloquearUsuario,
  leerError,
} from '@/lib/queries';
import { colors, radius, spacing } from '@/theme';
import type { MotivoReporte } from '@/types/database';

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

export default function PantallaChat() {
  const insets = useSafeAreaInsets();
  const { pedidoId, titulo } = useLocalSearchParams<{ pedidoId: string; titulo?: string }>();
  const { usuario } = useSesion();

  const { mensajes, cargando, error, enviando, enviar } = useMensajes(
    pedidoId ?? null,
    usuario?.id ?? null,
  );

  const [texto, setTexto] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const [contraparteId, setContraparteId] = useState<string | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [reportarAbierto, setReportarAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario || !pedidoId) return;

    let vigente = true;

    Promise.all([buscarContraparteDelPedido(pedidoId), buscarMisBloqueos(usuario.id)])
      .then(([contraparte, bloqueos]) => {
        if (!vigente) return;
        setContraparteId(contraparte);
        setBloqueado(contraparte ? bloqueos.some((b) => b.bloqueado_id === contraparte) : false);
      })
      .catch(() => {});

    return () => {
      vigente = false;
    };
  }, [usuario, pedidoId]);

  const visibles =
    bloqueado && usuario ? mensajes.filter((m) => m.autor_id === usuario.id) : mensajes;

  const mandar = async () => {
    const limpio = texto.trim();
    if (!limpio || enviando) return;

    setTexto('');
    const ok = await enviar(limpio);
    if (!ok) setTexto(limpio);

    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const alternarBloqueo = async () => {
    if (!usuario || !contraparteId || procesando) return;

    setProcesando(true);
    try {
      if (bloqueado) {
        await desbloquearUsuario(usuario.id, contraparteId);
        setBloqueado(false);
        setAviso('Desbloqueaste a esta persona.');
      } else {
        await bloquearUsuario(usuario.id, contraparteId);
        setBloqueado(true);
        setAviso('La bloqueaste. No verán sus mensajes y ninguno puede escribir en este hilo.');
      }
      setMenuAbierto(false);
    } catch (e: unknown) {
      setAviso(leerError(e));
    } finally {
      setProcesando(false);
    }
  };

  const enviarReporte = async (motivo: MotivoReporte, detalle: string) => {
    if (!usuario) return;

    await crearReporte({
      reportanteId: usuario.id,
      tipo: 'usuario',
      motivo,
      detalle,
      reportadoId: contraparteId,
      pedidoId: pedidoId ?? null,
    });

    setAviso('Gracias. Vamos a revisar el reporte.');
  };

  if (!usuario) {
    return (
      <>
        <Stack.Screen options={{ title: 'Chat' }} />
        <WebShell>
          <View style={styles.centrado}>
            <EmptyState
              icono="account-lock-outline"
              titulo="Inicia sesión para usar el chat"
              mensaje="El chat de un pedido es entre el comprador y la tienda."
            />
          </View>
        </WebShell>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: titulo ? `Chat · ${titulo}` : 'Chat',
          headerRight: () => (
            <Pressable
              onPress={() => setMenuAbierto(true)}
              accessibilityRole="button"
              accessibilityLabel="Opciones del chat"
              hitSlop={8}
              style={styles.headerBtn}
            >
              <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      <WebShell>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.aviso}>
            <MaterialCommunityIcons name="shield-lock-outline" size={14} color={colors.primaryLight} />
            <Text style={styles.avisoTexto} variant="bodySmall">
              Hablá por acá, sin teléfonos ni correos, y tu pedido queda protegido.
            </Text>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.mensajes}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            keyboardShouldPersistTaps="handled"
          >
            {cargando ? (
              <View style={styles.centrado}>
                <ActivityIndicator color={colors.primaryLight} />
              </View>
            ) : error && visibles.length === 0 ? (
              <EmptyState
                icono="alert-circle-outline"
                titulo="No pudimos cargar el chat"
                mensaje={error}
              />
            ) : visibles.length === 0 ? (
              <EmptyState
                icono="message-text-outline"
                titulo="Todavía no hay mensajes"
                mensaje="Escribí el primero para coordinar la entrega o preguntar por el pedido."
              />
            ) : (
              visibles.map((m) => {
                const mio = m.autor_id === usuario.id;
                return (
                  <View
                    key={m.id}
                    style={[styles.fila, mio ? styles.filaMia : styles.filaOtra]}
                  >
                    <View style={[styles.burbuja, mio ? styles.burbujaMia : styles.burbujaOtra]}>
                      <Text
                        style={mio ? styles.contenidoMio : styles.contenidoOtra}
                        variant="bodyMedium"
                      >
                        {m.contenido}
                      </Text>
                      <Text
                        style={[styles.hora, mio ? styles.horaMia : styles.horaOtra]}
                        variant="bodySmall"
                      >
                        {hora(m.created_at)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {error && visibles.length > 0 ? (
            <Text style={styles.errorEnvio} variant="bodySmall">
              {error}
            </Text>
          ) : null}

          {bloqueado ? (
            <View style={[styles.bloqueoEntrada, { paddingBottom: insets.bottom + spacing.sm }]}>
              <MaterialCommunityIcons name="account-cancel-outline" size={18} color={colors.danger} />
              <Text style={styles.bloqueoTexto} variant="bodySmall">
                Bloqueaste a esta persona. Abrí el menú de arriba para desbloquear.
              </Text>
            </View>
          ) : (
            <View style={[styles.entrada, { paddingBottom: insets.bottom + spacing.sm }]}>
              <TextInput
                value={texto}
                onChangeText={setTexto}
                placeholder="Escribí un mensaje…"
                mode="outlined"
                style={styles.campo}
                dense
                multiline
                maxLength={2000}
                accessibilityLabel="Escribir un mensaje"
                onSubmitEditing={() => void mandar()}
                blurOnSubmit={false}
                returnKeyType="send"
              />
              <Pressable
                onPress={() => void mandar()}
                disabled={enviando || texto.trim().length === 0}
                accessibilityRole="button"
                accessibilityLabel="Enviar mensaje"
                style={({ pressed }) => [
                  styles.enviar,
                  (enviando || texto.trim().length === 0) && styles.enviarApagado,
                  pressed && styles.enviarPresionado,
                ]}
              >
                {enviando ? (
                  <ActivityIndicator size={18} color={colors.black} />
                ) : (
                  <MaterialCommunityIcons name="send" size={20} color={colors.black} />
                )}
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>

        <Portal>
          <Dialog visible={menuAbierto} onDismiss={() => setMenuAbierto(false)}>
            <Dialog.Title>Opciones del chat</Dialog.Title>
            <Dialog.Content>
              <Button
                icon="flag-outline"
                onPress={() => {
                  setMenuAbierto(false);
                  setReportarAbierto(true);
                }}
                textColor={colors.text}
                style={styles.botonMenu}
              >
                Reportar a esta persona
              </Button>
              <Button
                icon={bloqueado ? 'account-check-outline' : 'account-cancel-outline'}
                onPress={() => void alternarBloqueo()}
                loading={procesando}
                disabled={procesando || !contraparteId}
                textColor={colors.danger}
                style={styles.botonMenu}
              >
                {bloqueado ? 'Desbloquear' : 'Bloquear'}
              </Button>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setMenuAbierto(false)}>Cerrar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <ReportarModal
          visible={reportarAbierto}
          onDismiss={() => setReportarAbierto(false)}
          onEnviar={enviarReporte}
          titulo="Reportar a esta persona"
          descripcion="Si alguien rompe las reglas (estafa, acoso, o te pide pagar por fuera), avisanos. El reporte llega solo al equipo de RepuGo."
        />

        <Snackbar
          visible={aviso !== null}
          onDismiss={() => setAviso(null)}
          duration={4500}
          style={styles.snackbar}
        >
          {aviso ?? ''}
        </Snackbar>
      </WebShell>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },

  headerBtn: { padding: spacing.xs },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  avisoTexto: { color: colors.textMuted, flex: 1 },

  errorEnvio: {
    color: colors.danger,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  mensajes: { padding: spacing.lg, gap: spacing.sm },
  fila: { flexDirection: 'row' },
  filaMia: { justifyContent: 'flex-end' },
  filaOtra: { justifyContent: 'flex-start' },

  burbuja: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  burbujaMia: { backgroundColor: colors.primaryLight, borderBottomRightRadius: 4 },
  burbujaOtra: { backgroundColor: colors.surfaceAlt, borderBottomLeftRadius: 4 },
  contenidoMio: { color: colors.black },
  contenidoOtra: { color: colors.text },
  hora: { textAlign: 'right' },
  horaMia: { color: colors.black },
  horaOtra: { color: colors.textMuted },

  entrada: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  campo: { flex: 1, maxHeight: 120 },
  enviar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviarApagado: { opacity: 0.4 },
  enviarPresionado: { opacity: 0.7 },

  bloqueoEntrada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  bloqueoTexto: { color: colors.textMuted, flex: 1 },

  botonMenu: { justifyContent: 'flex-start', marginVertical: spacing.xs },
  snackbar: { backgroundColor: colors.surfaceRaised },
});
