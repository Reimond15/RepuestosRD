import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import { useEliminacionesAdmin } from '@/hooks/useEliminacionesAdmin';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import { eliminarCuentaAdmin, leerError } from '@/lib/queries';
import { fechaCorta } from '@/lib/format';
import type { EliminacionAdmin } from '@/types/database';
import { colors, radius, spacing } from '@/theme';

/**
 * ============================================================================
 *  Panel de administración · Eliminaciones de cuenta
 *
 *  Requisito de Google Play: cuando un usuario pide borrar su cuenta, el
 *  borrado tiene que ocurrir DE VERDAD. Antes esto era un procedimiento de 5
 *  pasos a mano en el SQL Editor, fácil de olvidar (y de incumplir la política
 *  de privacidad publicada).
 *
 *  Acá el admin cierra una solicitud con UN toque. El borrado real corre en la
 *  Edge Function `eliminar-cuenta` de Supabase, porque borrar `auth.users` pide
 *  la clave `service_role`, que NUNCA puede viajar al celular.
 *
 *  Solo para el rol `admin`. Las RPC de la base validan `es_admin()` igual, así
 *  que un no-admin no puede hacer nada aunque llegue a esta pantalla.
 * ============================================================================
 */
export default function PantallaAdminEliminaciones() {
  const insets = useSafeAreaInsets();
  const { esMovil } = useResponsive();
  const { usuario, cargando: cargandoSesion } = useSesion();
  const esAdmin = usuario?.rol === 'admin';

  const { solicitudes, cargando, error, recargar } = useEliminacionesAdmin();

  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ tipo: 'error' | 'ok'; texto: string } | null>(null);
  const [confirmar, setConfirmar] = useState<EliminacionAdmin | null>(null);

  const pendientes = solicitudes.filter((s) => s.estado !== 'completada');
  const cerradas = solicitudes.filter((s) => s.estado === 'completada');

  const eliminar = async (solicitud: EliminacionAdmin) => {
    if (!solicitud.usuario_id) {
      setAviso({
        tipo: 'error',
        texto: 'Esta solicitud no tiene usuario asociado (la cuenta ya no existe).',
      });
      setConfirmar(null);
      return;
    }

    setOcupado(solicitud.id);
    setAviso(null);
    setConfirmar(null);

    try {
      const resultado = await eliminarCuentaAdmin({
        usuarioId: solicitud.usuario_id,
        solicitudId: solicitud.id,
      });

      const partes: string[] = ['Cuenta eliminada y solicitud cerrada.'];
      if (resultado.tienda_anonimizada) partes.push('Tienda anonimizada.');
      if (resultado.productos_reasignados > 0) {
        partes.push(`${resultado.productos_reasignados} producto(s) conservado(s).`);
      }
      if (resultado.pedidos_reasignados > 0) {
        partes.push(`${resultado.pedidos_reasignados} pedido(s) conservado(s).`);
      }

      setAviso({ tipo: 'ok', texto: partes.join(' ') });
      recargar();
    } catch (e: unknown) {
      setAviso({ tipo: 'error', texto: leerError(e) });
    } finally {
      setOcupado(null);
    }
  };

  if (!esAdmin) {
    return (
      <WebShell>
        <View style={styles.pantalla}>
          {cargandoSesion ? (
            <Text style={styles.muted} variant="bodyMedium">
              Cargando…
            </Text>
          ) : (
            <EmptyState
              icono="shield-account-outline"
              titulo="Solo administradores"
              mensaje="Esta pantalla cierra las solicitudes de eliminación de cuenta."
            />
          )}
        </View>
      </WebShell>
    );
  }

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.contenido, { paddingBottom: insets.bottom + spacing.xxl }]}
        >
          <Text style={styles.titulo} variant={esMovil ? 'headlineMedium' : 'displaySmall'}>
            Eliminaciones de cuenta
          </Text>
          <Text style={styles.subtitulo} variant="bodySmall">
            Cuando un usuario pide borrar su cuenta, cerrá la solicitud acá. Se borran su
            cuenta, su correo y sus datos; los pedidos se conservan sin datos personales,
            por comprobantes.
          </Text>

          {aviso ? (
            <View
              style={[styles.aviso, aviso.tipo === 'error' ? styles.avisoError : styles.avisoOk]}
            >
              <MaterialCommunityIcons
                name={aviso.tipo === 'error' ? 'alert-circle-outline' : 'check-circle-outline'}
                size={16}
                color={aviso.tipo === 'error' ? colors.danger : colors.primaryLight}
              />
              <Text style={styles.avisoTexto} variant="bodySmall">
                {aviso.texto}
              </Text>
            </View>
          ) : null}

          {cargando ? (
            <Text style={styles.muted} variant="bodyMedium">
              Cargando solicitudes…
            </Text>
          ) : error ? (
            <EmptyState icono="alert-circle-outline" titulo="No pudimos cargar" mensaje={error} />
          ) : (
            <>
              {/* ---------------- pendientes ---------------- */}
              <View style={styles.grupo}>
                <Text style={styles.grupoTitulo} variant="titleSmall">
                  Pendientes · {pendientes.length}
                </Text>
                {pendientes.length === 0 ? (
                  <Text style={styles.muted} variant="bodySmall">
                    No hay solicitudes de eliminación esperando.
                  </Text>
                ) : (
                  pendientes.map((s) => (
                    <TarjetaSolicitud
                      key={s.id}
                      solicitud={s}
                      ocupado={ocupado === s.id}
                      onEliminar={() => setConfirmar(s)}
                    />
                  ))
                )}
              </View>

              {/* ---------------- cerradas ---------------- */}
              {cerradas.length > 0 ? (
                <View style={styles.grupo}>
                  <Text style={styles.grupoTitulo} variant="titleSmall">
                    Cerradas · {cerradas.length}
                  </Text>
                  {cerradas.map((s) => (
                    <TarjetaSolicitud key={s.id} solicitud={s} ocupado={false} cerrada />
                  ))}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </View>

      <Portal>
        <Dialog visible={confirmar !== null} onDismiss={() => setConfirmar(null)}>
          <Dialog.Title>Eliminar cuenta</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogSubtitulo}>
              {confirmar?.email}
            </Text>
            <Text variant="bodyMedium">
              Esto borra la cuenta para siempre: su correo, su teléfono y su tienda (si
              vendía). No se puede deshacer.
            </Text>
            {confirmar && confirmar.pedidos > 0 ? (
              <Text variant="bodySmall" style={styles.dialogNota}>
                Sus {confirmar.pedidos} pedido(s) se conservan sin datos personales, por
                comprobantes.
              </Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmar(null)}>Cancelar</Button>
            <Button
              textColor={colors.danger}
              loading={ocupado !== null}
              disabled={ocupado !== null}
              onPress={() => {
                if (confirmar) void eliminar(confirmar);
              }}
            >
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </WebShell>
  );
}

function TarjetaSolicitud({
  solicitud,
  ocupado,
  cerrada = false,
  onEliminar,
}: {
  solicitud: EliminacionAdmin;
  ocupado: boolean;
  cerrada?: boolean;
  onEliminar?: () => void;
}) {
  const sinUsuario = !solicitud.usuario_id;

  return (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaCabecera}>
        <Text style={styles.tarjetaNombre} variant="titleSmall">
          {solicitud.email}
        </Text>
        {solicitud.estado === 'completada' ? (
          <Estado icono="check-circle-outline" color={colors.primaryLight} texto="Cerrada" />
        ) : (
          <Estado icono="clock-outline" color={colors.warning} texto="Pendiente" />
        )}
      </View>

      <Text style={styles.dato} variant="bodySmall">
        Pedida el {fechaCorta(solicitud.created_at)}
        {solicitud.resuelto_en ? ` · cerrada el ${fechaCorta(solicitud.resuelto_en)}` : ''}
      </Text>

      {solicitud.motivo ? (
        <Text style={styles.dato} variant="bodySmall">
          Motivo: {solicitud.motivo}
        </Text>
      ) : null}

      <View style={styles.estados}>
        <Estado
          icono={solicitud.es_tienda ? 'store-outline' : 'account-outline'}
          color={colors.textMuted}
          texto={solicitud.es_tienda ? `Tienda: ${solicitud.tienda ?? '—'}` : 'Comprador'}
        />
        <Estado
          icono="package-variant-closed"
          color={colors.textMuted}
          texto={`${solicitud.pedidos} pedido(s)`}
        />
      </View>

      {cerrada ? null : (
        <View style={styles.acciones}>
          <Button
            mode="contained"
            compact
            icon="account-remove-outline"
            textColor={colors.white}
            buttonColor={colors.danger}
            onPress={onEliminar}
            loading={ocupado}
            disabled={ocupado || sinUsuario}
            style={styles.accionBoton}
          >
            {sinUsuario ? 'Cuenta ya eliminada' : 'Eliminar cuenta'}
          </Button>
        </View>
      )}
    </View>
  );
}

function Estado({
  icono,
  color,
  texto,
}: {
  icono: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  texto: string;
}) {
  return (
    <View style={styles.estado}>
      <MaterialCommunityIcons name={icono} size={14} color={color} />
      <Text style={styles.estadoTexto} variant="bodySmall">
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.lg, gap: spacing.lg },

  titulo: { color: colors.text },
  subtitulo: { color: colors.textMuted, lineHeight: 18 },
  muted: { color: colors.textMuted },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  avisoError: { borderColor: colors.danger, backgroundColor: colors.surface },
  avisoOk: { borderColor: colors.primary, backgroundColor: colors.surface },
  avisoTexto: { color: colors.textMuted, flex: 1 },

  grupo: { gap: spacing.sm },
  grupoTitulo: { color: colors.text, marginLeft: spacing.xs },

  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  tarjetaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tarjetaNombre: { color: colors.text, flex: 1 },

  dato: { color: colors.textMuted },

  estados: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  estadoTexto: { color: colors.textMuted },

  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  accionBoton: { borderRadius: radius.md },

  dialogSubtitulo: { color: colors.primaryLight, marginBottom: spacing.sm },
  dialogNota: { color: colors.textMuted, marginTop: spacing.sm },
});
