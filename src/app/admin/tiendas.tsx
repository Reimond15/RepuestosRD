import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import { useTiendasAdmin } from '@/hooks/useTiendasAdmin';
import { aprobarTienda, leerError, marcarFundadora } from '@/lib/queries';
import { SUSCRIPCION } from '@/lib/constants';
import { fechaCorta } from '@/lib/format';
import type { TiendaAdmin } from '@/types/database';
import { colors, radius, spacing } from '@/theme';

/**
 * ============================================================================
 *  Panel de administración · Tiendas
 *
 *  Requisito de Google Play y de operación: nadie se auto-aprueba. Esta
 *  pantalla deja al admin aprobar/rechazar tiendas y marcarlas como fundadoras
 *  (RD$100/mes, 12 meses, tope 25) SIN entrar al SQL Editor de Supabase.
 *
 *  Solo para el rol `admin`. Las RPC `admin_*` validan `es_admin()` en la base,
 *  así que un no-admin no puede hacer nada aunque llegue a esta pantalla.
 * ============================================================================
 */
export default function PantallaAdminTiendas() {
  const insets = useSafeAreaInsets();
  const { esMovil } = useResponsive();
  const { usuario, cargando: cargandoSesion } = useSesion();
  const esAdmin = usuario?.rol === 'admin';

  const { tiendas, cargando, error, recargar } = useTiendasAdmin();

  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ tipo: 'error' | 'ok'; texto: string } | null>(null);
  const [confirmar, setConfirmar] = useState<
    { tienda: TiendaAdmin; accion: 'rechazar' } | null
  >(null);

  const pendientes = useMemo(() => tiendas.filter((t) => !t.aprobada), [tiendas]);
  const aprobadas = useMemo(() => tiendas.filter((t) => t.aprobada), [tiendas]);
  const fundadoras = useMemo(() => tiendas.filter((t) => t.es_fundador), [tiendas]);

  const correr = async (id: string, accion: () => Promise<void>, ok: string) => {
    setOcupado(id);
    setAviso(null);
    try {
      await accion();
      setAviso({ tipo: 'ok', texto: ok });
      recargar();
    } catch (e: unknown) {
      setAviso({ tipo: 'error', texto: leerError(e) });
    } finally {
      setOcupado(null);
    }
  };

  const alternarAprobacion = (t: TiendaAdmin) => {
    if (t.aprobada) {
      setConfirmar({ tienda: t, accion: 'rechazar' });
      return;
    }
    void correr(
      t.tienda_id,
      () => aprobarTienda(t.tienda_id, true),
      `Se aprobó "${t.tienda}". Ya aparece en el catálogo.`,
    );
  };

  const rechazar = (t: TiendaAdmin) => {
    setConfirmar(null);
    void correr(
      t.tienda_id,
      () => aprobarTienda(t.tienda_id, false),
      `Se rechazó "${t.tienda}". Salió del catálogo.`,
    );
  };

  const alternarFundadora = (t: TiendaAdmin) => {
    void correr(
      t.tienda_id,
      () => marcarFundadora(t.tienda_id, !t.es_fundador),
      t.es_fundador
        ? `Se quitó el precio de fundador a "${t.tienda}".`
        : `"${t.tienda}" ahora paga ${SUSCRIPCION.precioFundadorTexto} por 12 meses.`,
    );
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
              mensaje="Esta pantalla aprueba tiendas y maneja su suscripción."
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
            Tiendas
          </Text>
          <Text style={styles.subtitulo} variant="bodySmall">
            Aprobá las tiendas que se registran. Al aprobar, arrancan sus 30 días
            gratis. Las fundadoras (máx. 25) pagan {SUSCRIPCION.precioFundadorTexto}
            {' '}por 12 meses; el resto, {SUSCRIPCION.precioNormalTexto}.
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
              Cargando tiendas…
            </Text>
          ) : error ? (
            <EmptyState icono="alert-circle-outline" titulo="No pudimos cargar" mensaje={error} />
          ) : (
            <>
              {/* ---------------- pendientes ---------------- */}
              <View style={styles.grupo}>
                <Text style={styles.grupoTitulo} variant="titleSmall">
                  Pendientes de aprobación · {pendientes.length}
                </Text>
                {pendientes.length === 0 ? (
                  <Text style={styles.muted} variant="bodySmall">
                    No hay tiendas esperando aprobación.
                  </Text>
                ) : (
                  pendientes.map((t) => (
                    <TarjetaTienda
                      key={t.tienda_id}
                      tienda={t}
                      ocupado={ocupado === t.tienda_id}
                      onAprobar={() => alternarAprobacion(t)}
                      onFundadora={() => alternarFundadora(t)}
                      fundadoras={fundadoras.length}
                    />
                  ))
                )}
              </View>

              {/* ---------------- aprobadas ---------------- */}
              <View style={styles.grupo}>
                <Text style={styles.grupoTitulo} variant="titleSmall">
                  Aprobadas · {aprobadas.length}
                </Text>
                {aprobadas.length === 0 ? (
                  <Text style={styles.muted} variant="bodySmall">
                    Todavía no hay tiendas aprobadas.
                  </Text>
                ) : (
                  aprobadas.map((t) => (
                    <TarjetaTienda
                      key={t.tienda_id}
                      tienda={t}
                      ocupado={ocupado === t.tienda_id}
                      onAprobar={() => alternarAprobacion(t)}
                      onFundadora={() => alternarFundadora(t)}
                      fundadoras={fundadoras.length}
                    />
                  ))
                )}
              </View>

              <Text style={styles.nota} variant="bodySmall">
                Fundadoras marcadas: {fundadoras.length} de {SUSCRIPCION.limiteFundadores}.
              </Text>
            </>
          )}
        </ScrollView>
      </View>

      <Portal>
        <Dialog visible={confirmar !== null} onDismiss={() => setConfirmar(null)}>
          <Dialog.Title>Rechazar tienda</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              ¿Rechazar “{confirmar?.tienda.tienda}”? Deja de aparecer en el catálogo al
              instante. Podés volver a aprobarla después.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmar(null)}>Cancelar</Button>
            <Button
              textColor={colors.danger}
              onPress={() => {
                if (confirmar) rechazar(confirmar.tienda);
              }}
            >
              Rechazar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </WebShell>
  );
}

function TarjetaTienda({
  tienda,
  ocupado,
  onAprobar,
  onFundadora,
  fundadoras,
}: {
  tienda: TiendaAdmin;
  ocupado: boolean;
  onAprobar: () => void;
  onFundadora: () => void;
  fundadoras: number;
}) {
  const topeFundadoras = fundadoras >= SUSCRIPCION.limiteFundadores;

  return (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaCabecera}>
        <Text style={styles.tarjetaNombre} variant="titleMedium" numberOfLines={1}>
          {tienda.tienda}
        </Text>
        {tienda.es_fundador ? (
          <View style={styles.chipFundador}>
            <MaterialCommunityIcons name="star-circle" size={14} color={colors.star} />
            <Text style={styles.chipFundadorTexto} variant="labelSmall">
              Fundadora
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.dato} variant="bodySmall">
        Dueño: {tienda.dueno} · {tienda.correo_dueno}
      </Text>
      {tienda.telefono_dueno ? (
        <Text style={styles.dato} variant="bodySmall">
          Teléfono: {tienda.telefono_dueno}
        </Text>
      ) : null}
      {tienda.direccion ? (
        <Text style={styles.dato} variant="bodySmall" numberOfLines={2}>
          Dirección: {tienda.direccion}
        </Text>
      ) : null}

      <View style={styles.estados}>
        <Estado
          icono={tienda.aprobada ? 'check-circle-outline' : 'clock-outline'}
          color={tienda.aprobada ? colors.primaryLight : colors.warning}
          texto={tienda.aprobada ? 'Aprobada' : 'Pendiente'}
        />
        <Estado
          icono={tienda.vigente ? 'calendar-check-outline' : 'calendar-remove-outline'}
          color={tienda.vigente ? colors.primaryLight : colors.danger}
          texto={tienda.vigente ? 'En el catálogo' : 'Fuera del catálogo'}
        />
        {tienda.pago_hasta ? (
          <Estado
            icono="cash-check"
            color={colors.textMuted}
            texto={`Pago hasta ${fechaCorta(tienda.pago_hasta)}`}
          />
        ) : tienda.prueba_hasta ? (
          <Estado
            icono="gift-outline"
            color={colors.textMuted}
            texto={`Prueba hasta ${fechaCorta(tienda.prueba_hasta)}`}
          />
        ) : null}
        {tienda.es_fundador && tienda.fundador_hasta ? (
          <Estado
            icono="star-outline"
            color={colors.star}
            texto={`Fundador hasta ${fechaCorta(tienda.fundador_hasta)}`}
          />
        ) : null}
      </View>

      <View style={styles.acciones}>
        <Button
          mode={tienda.aprobada ? 'outlined' : 'contained'}
          compact
          icon={tienda.aprobada ? 'close-circle-outline' : 'check-circle-outline'}
          textColor={tienda.aprobada ? colors.danger : undefined}
          onPress={onAprobar}
          loading={ocupado}
          disabled={ocupado}
          style={styles.accionBoton}
        >
          {tienda.aprobada ? 'Rechazar' : 'Aprobar'}
        </Button>

        <Button
          mode="outlined"
          compact
          icon={tienda.es_fundador ? 'star-off-outline' : 'star-outline'}
          onPress={onFundadora}
          loading={ocupado}
          disabled={ocupado || (!tienda.es_fundador && topeFundadoras)}
          style={styles.accionBoton}
        >
          {tienda.es_fundador ? 'Quitar fundador' : 'Marcar fundadora'}
        </Button>
      </View>
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

  chipFundador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.star,
  },
  chipFundadorTexto: { color: colors.star },

  dato: { color: colors.textMuted },

  estados: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  estadoTexto: { color: colors.textFaint },

  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  accionBoton: { flexGrow: 1 },

  nota: { color: colors.textFaint, textAlign: 'center' },
});
