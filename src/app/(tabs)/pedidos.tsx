import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from 'expo-router';

import { BannerSuscripcion } from '@/components/BannerSuscripcion';
import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import {
  ESTADOS_CANCELABLES,
  ETAPAS_PEDIDO,
  PROGRESO_PEDIDO,
  SIGUIENTE_ESTADO,
  type EstadoPedido,
} from '@/lib/constants';
import { money } from '@/lib/format';
import { urlMapa } from '@/lib/geo';
import { actualizarEstadoPedido, buscarMensajesSinLeer, leerError } from '@/lib/queries';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import { usePedidos } from '@/hooks/usePedidos';
import { usePedidosTienda } from '@/hooks/usePedidosTienda';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import type { PedidoConDetalle, PedidoTiendaConDetalle, UbicacionRetiro } from '@/types/database';
import { colors, fontSize, radius, spacing } from '@/theme';

const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function PantallaPedidos() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { esMovil } = useResponsive();
  const { usuario, tienda, cargando: cargandoSesion } = useSesion();

  // Si el usuario es una tienda, esta pestaña es su panel de pedidos;
  // si es comprador, es su historial de compras.
  const esTienda = usuario?.rol === 'tienda';

  const {
    pedidos: pedidosCliente,
    tiendas,
    calificaciones,
    ubicaciones,
    cargando: cargandoCliente,
    error: errorCliente,
  } = usePedidos(esTienda ? null : usuario?.id ?? null);

  const {
    pedidos: pedidosTienda,
    cargando: cargandoTienda,
    error: errorTienda,
    reintentar: reintentarTienda,
  } = usePedidosTienda(esTienda ? tienda?.id ?? null : null);

  // Estado de la suscripción: solo para la tienda (el RPC filtra por rol).
  const { suscripcion } = useSuscripcion(esTienda && Boolean(tienda));

  const [accionando, setAccionando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ tipo: 'error' | 'ok'; texto: string } | null>(null);

  // Mensajes sin leer por pedido, para el globito del botón de chat.
  // Sirve igual para el comprador y para la tienda (la RPC filtra por rol).
  // Se refresca cada vez que la pestaña vuelve al frente.
  const [sinLeer, setSinLeer] = useState<Record<string, number>>({});

  const nombreTienda = (id: string) => tiendas.find((t) => t.id === id)?.nombre ?? 'Tienda';

  useFocusEffect(
    useCallback(() => {
      if (!usuario) return;

      let vigente = true;

      buscarMensajesSinLeer()
        .then((filas) => {
          if (!vigente) return;
          setSinLeer(Object.fromEntries(filas.map((f) => [f.pedido_id, Number(f.sin_leer)])));
        })
        .catch(() => {
          // el globito es un extra: si falla, el chat sigue andando
        });

      return () => {
        vigente = false;
      };
    }, [usuario]),
  );

  const abrirChat = (pedidoId: string, titulo: string) =>
    router.push({ pathname: '/chat/[pedidoId]', params: { pedidoId, titulo } });

  const cambiarEstado = async (pedidoId: string, estado: EstadoPedido) => {
    setAccionando(pedidoId);
    setAviso(null);

    try {
      await actualizarEstadoPedido(pedidoId, estado);
      setAviso({ tipo: 'ok', texto: `Pedido marcado como "${ETAPAS_PEDIDO[estado].etiqueta}".` });
      reintentarTienda();
    } catch (e: unknown) {
      setAviso({ tipo: 'error', texto: leerError(e) });
    } finally {
      setAccionando(null);
    }
  };

  const cargando = esTienda ? cargandoSesion || cargandoTienda : cargandoSesion || cargandoCliente;
  const error = esTienda ? errorTienda : errorCliente;

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <View
          style={[
            styles.cabecera,
            { paddingTop: esMovil ? insets.top + spacing.md : spacing.xl },
          ]}
        >
          <Text style={styles.titulo} variant={esMovil ? 'headlineMedium' : 'displaySmall'}>
            {esTienda ? 'Pedidos de la tienda' : 'Mis pedidos'}
          </Text>
          {usuario ? (
            <Text style={styles.subtitulo} variant="bodySmall">
              {esTienda
                ? `Colaborador de ${tienda?.nombre ?? 'tu tienda'}`
                : `Hola ${usuario.nombre.split(' ')[0]}, aquí están tus compras`}
            </Text>
          ) : null}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contenido,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
        >
          {aviso ? (
            <View
              style={[
                styles.aviso,
                aviso.tipo === 'error' ? styles.avisoError : styles.avisoOk,
              ]}
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

          {!usuario && !cargandoSesion ? (
            <EmptyState
              icono="account-lock-outline"
              titulo="Inicia sesión para ver tus pedidos"
              mensaje="Necesitas una cuenta para comprar y para ver el historial de pedidos."
            />
          ) : esTienda && !cargandoSesion && !tienda ? (
            <EmptyState
              icono="store-off-outline"
              titulo="Tu tienda todavía no está lista"
              mensaje="Tu cuenta es de tienda pero no encontramos su ficha. Cerrá sesión y entrá de nuevo; si sigue igual, avisanos."
            />
          ) : cargando ? (
            <View style={styles.cargando}>
              <Text style={styles.cargandoTexto} variant="bodySmall">
                Cargando…
              </Text>
            </View>
          ) : error ? (
            <EmptyState
              icono="alert-circle-outline"
              titulo={esTienda ? 'No pudimos cargar los pedidos' : 'No pudimos cargar tus pedidos'}
              mensaje={error}
            />
          ) : esTienda ? (
            <>
              {suscripcion && tienda?.aprobada ? (
                <BannerSuscripcion suscripcion={suscripcion} />
              ) : null}

              {tienda && !tienda.aprobada ? (
                <EmptyState
                  icono="store-clock-outline"
                  titulo="Tu tienda está pendiente de aprobación"
                  mensaje="Cuando un administrador la apruebe vas a empezar a ver acá los pedidos que te lleguen."
                />
              ) : pedidosTienda.length === 0 ? (
                <EmptyState
                  icono="receipt-text-outline"
                  titulo="Todavía no tenés pedidos"
                  mensaje="Cuando un cliente compre en tu tienda, el pedido aparece acá para confirmarlo y despacharlo."
                />
              ) : (
                pedidosTienda.map((p) => (
                  <TarjetaPedidoTienda
                    key={p.id}
                    pedido={p}
                    cambiando={accionando === p.id}
                    sinLeer={sinLeer[p.id] ?? 0}
                    onEstado={(estado) => void cambiarEstado(p.id, estado)}
                    onChatear={() => abrirChat(p.id, p.cliente_nombre)}
                  />
                ))
              )}
            </>
          ) : pedidosCliente.length === 0 ? (
            <EmptyState
              icono="receipt-text-outline"
              titulo="Todavía no tenés pedidos"
              mensaje="Cuando hagas tu primer pedido lo vas a ver acá con su estado y su entrega."
            />
          ) : (
            pedidosCliente.map((p) => (
              <TarjetaPedidoCliente
                key={p.id}
                pedido={p}
                tienda={nombreTienda(p.tienda_id)}
                calificados={
                  new Set(
                    calificaciones
                      .filter((c) => c.pedido_id === p.id)
                      .map((c) => c.producto_id),
                  )
                }
                onCalificar={() =>
                  router.push({ pathname: '/calificar/[pedidoId]', params: { pedidoId: p.id } })
                }
                sinLeer={sinLeer[p.id] ?? 0}
                retiro={ubicaciones.find((u) => u.pedido_id === p.id) ?? null}
                onChatear={() => abrirChat(p.id, nombreTienda(p.tienda_id))}
              />
            ))
          )}
        </ScrollView>
      </View>
    </WebShell>
  );
}

/** Tarjeta del comprador: solo lectura, con la barra de progreso y la calificación. */
function TarjetaPedidoCliente({
  pedido,
  tienda,
  calificados,
  sinLeer,
  retiro,
  onCalificar,
  onChatear,
}: {
  pedido: PedidoConDetalle;
  tienda: string;
  /** ids de producto de ESTE pedido que el cliente ya calificó */
  calificados: Set<string>;
  /** mensajes del chat que el cliente todavía no leyó */
  sinLeer: number;
  /**
   * Dirección exacta de la tienda para retirar. Viene null mientras la tienda
   * no confirme el pedido: hasta entonces solo se conoce la zona aproximada.
   */
  retiro: UbicacionRetiro | null;
  onCalificar: () => void;
  onChatear: () => void;
}) {
  const entregado = pedido.estado === 'entregado';
  const todoCalificado =
    pedido.lineas.length > 0 && pedido.lineas.every((l) => calificados.has(l.producto_id));

  return (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaCabecera}>
        <View style={styles.tarjetaTitulos}>
          <Text style={styles.tienda} variant="titleSmall">
            {tienda}
          </Text>
          <Text style={styles.fecha} variant="bodySmall">
            {fechaCorta(pedido.created_at)}
          </Text>
        </View>
        <ChipEstado estado={pedido.estado} />
      </View>

      <View style={styles.lineas}>
        {pedido.lineas.map((l) => (
          <View key={l.id} style={styles.linea}>
            <Text style={styles.lineaNombre} variant="bodyMedium" numberOfLines={1}>
              {l.nombre}
            </Text>
            <Text style={styles.lineaCantidad} variant="bodySmall">
              {l.cantidad} × {money(l.precio_unitario)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.tarjetaPie}>
        <Text style={styles.pieInfo} variant="bodySmall">
          {pedido.entrega === 'delivery' ? 'A domicilio' : 'Retiro en tienda'} ·{' '}
          {pedido.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
        </Text>
        <Text style={styles.pieTotal} variant="titleSmall">
          Total: {money(pedido.total)}
        </Text>
      </View>

      <BarraProgresoPedido estado={pedido.estado} />

      {pedido.entrega === 'retiro' ? (
        <View style={styles.contactos}>
          {retiro && (retiro.direccion || (retiro.latitude != null && retiro.longitude != null)) ? (
            <>
              <View style={styles.contacto}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.contactoTexto} variant="bodySmall" numberOfLines={3}>
                  Retirar en: {retiro.direccion ?? retiro.tienda_nombre}
                </Text>
              </View>
              {retiro.latitude != null && retiro.longitude != null ? (
                <Button
                  mode="text"
                  icon="google-maps"
                  compact
                  onPress={() => {
                    const url = urlMapa(retiro.latitude, retiro.longitude, retiro.direccion);
                    if (url) void Linking.openURL(url);
                  }}
                >
                  Ver en el mapa
                </Button>
              ) : null}
            </>
          ) : (
            <View style={styles.contacto}>
              <MaterialCommunityIcons name="lock-outline" size={14} color={colors.textFaint} />
              <Text style={styles.contactoTexto} variant="bodySmall">
                Retiro en tienda. La dirección exacta se muestra cuando la tienda
                confirma el pedido.
              </Text>
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.chatFila}>
        <BotonChat onPress={onChatear} sinLeer={sinLeer} etiqueta="Chatear con la tienda" />
      </View>

      {entregado ? (
        todoCalificado ? (
          <View style={styles.calificado}>
            <MaterialCommunityIcons
              name="star-check-outline"
              size={16}
              color={colors.primaryLight}
            />
            <Text style={styles.calificadoTexto} variant="bodySmall">
              Ya calificaste este pedido. ¡Gracias!
            </Text>
          </View>
        ) : (
          <View style={styles.acciones}>
            <Button
              mode="contained"
              icon="star-outline"
              onPress={onCalificar}
              style={styles.accion}
            >
              Calificar compra
            </Button>
          </View>
        )
      ) : null}
    </View>
  );
}

/** Tarjeta de la tienda: los datos del pedido y los botones de estado. */
function TarjetaPedidoTienda({
  pedido,
  cambiando,
  sinLeer,
  onEstado,
  onChatear,
}: {
  pedido: PedidoTiendaConDetalle;
  cambiando: boolean;
  /** mensajes del chat que la tienda todavía no leyó */
  sinLeer: number;
  onEstado: (estado: EstadoPedido) => void;
  onChatear: () => void;
}) {
  const siguiente = SIGUIENTE_ESTADO[pedido.estado];
  const puedeCancelar = ESTADOS_CANCELABLES.includes(pedido.estado);

  return (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaCabecera}>
        <View style={styles.tarjetaTitulos}>
          <Text style={styles.cliente} variant="titleSmall">
            {pedido.cliente_nombre}
          </Text>
          <Text style={styles.fecha} variant="bodySmall">
            {fechaCorta(pedido.created_at)}
          </Text>
        </View>
        <ChipEstado estado={pedido.estado} />
      </View>

      {pedido.entrega === 'delivery' ? (
        <View style={styles.contactos}>
          {pedido.direccion ? (
            <View style={styles.contacto}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text style={styles.contactoTexto} variant="bodySmall" numberOfLines={2}>
                {pedido.direccion}
              </Text>
            </View>
          ) : (
            <View style={styles.contacto}>
              <MaterialCommunityIcons name="lock-outline" size={14} color={colors.textFaint} />
              <Text style={styles.contactoTexto} variant="bodySmall">
                La dirección se muestra cuando confirmás el pedido.
              </Text>
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.chatFila}>
        <BotonChat
          onPress={onChatear}
          sinLeer={sinLeer}
          etiqueta={`Chatear con ${pedido.cliente_nombre.split(' ')[0]}`}
        />
      </View>

      <View style={styles.lineas}>
        {pedido.lineas.map((l) => (
          <View key={l.id} style={styles.linea}>
            <Text style={styles.lineaNombre} variant="bodyMedium" numberOfLines={1}>
              {l.cantidad} × {l.nombre}
            </Text>
            <Text style={styles.lineaCantidad} variant="bodySmall">
              {money(l.precio_unitario * l.cantidad)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.tarjetaPie}>
        <Text style={styles.pieInfo} variant="bodySmall">
          {pedido.entrega === 'delivery' ? 'A domicilio' : 'Retiro en tienda'} ·{' '}
          {pedido.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
        </Text>
        <Text style={styles.pieTotal} variant="titleSmall">
          Total: {money(pedido.total)}
        </Text>
      </View>

      <BarraProgresoPedido estado={pedido.estado} />

      {siguiente || puedeCancelar ? (
        <View style={styles.acciones}>
          {siguiente ? (
            <Button
              mode="contained"
              icon={siguiente.icono}
              onPress={() => onEstado(siguiente.estado)}
              loading={cambiando}
              disabled={cambiando}
              style={styles.accion}
            >
              {siguiente.etiqueta}
            </Button>
          ) : null}

          {puedeCancelar ? (
            <Button
              mode="outlined"
              textColor={colors.danger}
              icon="close-circle-outline"
              onPress={() => onEstado('cancelado')}
              disabled={cambiando}
              style={styles.accion}
            >
              Cancelar
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** Botón para abrir el chat del pedido, con globito si hay mensajes sin leer. */
function BotonChat({
  onPress,
  sinLeer,
  etiqueta,
}: {
  onPress: () => void;
  sinLeer: number;
  etiqueta: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={sinLeer > 0 ? `${etiqueta}, ${sinLeer} sin leer` : etiqueta}
      style={({ pressed }) => [styles.chatBoton, pressed && styles.chatBotonPresionado]}
    >
      <MaterialCommunityIcons name="message-text-outline" size={18} color={colors.primaryLight} />
      <Text style={styles.chatTexto} variant="labelLarge">
        {etiqueta}
      </Text>

      {sinLeer > 0 ? (
        <View style={styles.chatGlobito}>
          <Text style={styles.chatGlobitoTexto} variant="labelSmall">
            {sinLeer > 9 ? '9+' : sinLeer}
          </Text>
        </View>
      ) : null}

      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

function ChipEstado({ estado }: { estado: EstadoPedido }) {
  const info = ETAPAS_PEDIDO[estado];
  return (
    <View style={[styles.chip, { borderColor: info.color }]}>
      <Text style={[styles.chipTexto, { color: info.color }]} variant="labelSmall">
        {info.etiqueta}
      </Text>
    </View>
  );
}

/**
 * Los 4 estados que ve el cliente. Nota: la base guarda `preparando` y
 * `enviado` por separado, pero el usuario ve "En camino" para los dos.
 */
export function BarraProgresoPedido({ estado }: { estado: EstadoPedido }) {
  if (estado === 'cancelado') return null;

  const indice =
    estado === 'preparando' || estado === 'enviado'
      ? PROGRESO_PEDIDO.findIndex((e) => e.clave === 'preparando')
      : PROGRESO_PEDIDO.findIndex((e) => e.clave === estado);
  const actual = indice < 0 ? 0 : indice;

  return (
    <View style={barra.contenedor}>
      {PROGRESO_PEDIDO.map((etapa, i) => {
        const hecho = i <= actual;
        const actualPaso = i === actual;

        return (
          <View key={etapa.clave} style={barra.paso}>
            <View style={barra.linea}>
              <View style={[barra.lineaParte, i === 0 && barra.lineaOculta]} />
              <View
                style={[
                  barra.lineaParte,
                  i === PROGRESO_PEDIDO.length - 1 && barra.lineaOculta,
                  hecho && barra.lineaHecha,
                ]}
              />
            </View>

            <View style={[barra.circulo, hecho && barra.circuloHecho, actualPaso && barra.circuloActual]}>
              {hecho ? (
                <MaterialCommunityIcons name="check" size={13} color={colors.black} />
              ) : null}
            </View>

            <Text style={[barra.etiqueta, hecho && barra.etiquetaHecha]} variant="bodySmall">
              {etapa.etiqueta}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },

  cabecera: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titulo: { color: colors.text },
  subtitulo: { color: colors.textMuted },

  contenido: { padding: spacing.lg, gap: spacing.lg },

  cargando: { padding: spacing.xl, alignItems: 'center' },
  cargandoTexto: { color: colors.textMuted },

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

  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tarjetaCabecera: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  tarjetaTitulos: { flex: 1, gap: 2 },
  tienda: { color: colors.text },
  cliente: { color: colors.text },
  fecha: { color: colors.textFaint },

  contactos: {
    paddingHorizontal: spacing.lg,
    gap: 4,
    paddingBottom: spacing.md,
  },
  contacto: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactoTexto: { color: colors.textMuted, flex: 1 },

  chatFila: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  chatBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chatBotonPresionado: { opacity: 0.7 },
  chatTexto: { color: colors.text, flex: 1 },
  chatGlobito: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatGlobitoTexto: { color: colors.black, fontWeight: '700' },

  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipTexto: { fontWeight: '700' },

  lineas: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  linea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  lineaNombre: { color: colors.textMuted, flex: 1 },
  lineaCantidad: { color: colors.textMuted },

  tarjetaPie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  pieInfo: { color: colors.textFaint, flex: 1 },
  pieTotal: { color: colors.text, fontWeight: '700' },

  acciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  accion: { flexGrow: 1 },

  calificado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  calificadoTexto: { color: colors.primaryLight, flex: 1 },
});

const barra = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceAlt,
  },
  paso: { flex: 1, alignItems: 'center', gap: 6 },
  linea: { flexDirection: 'row', width: '100%', height: 2 },
  lineaParte: { flex: 1, backgroundColor: colors.border },
  lineaOculta: { backgroundColor: 'transparent' },
  lineaHecha: { backgroundColor: colors.primary },
  circulo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloHecho: { backgroundColor: colors.primary, borderColor: colors.primary },
  circuloActual: { borderWidth: 3 },
  etiqueta: { color: colors.textFaint, fontSize: fontSize.xs, textAlign: 'center' },
  etiquetaHecha: { color: colors.text, fontWeight: '600' },
});
