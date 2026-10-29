import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { SelectorEstrellas } from '@/components/SelectorEstrellas';
import { Stars } from '@/components/Stars';
import { WebShell } from '@/components/WebShell';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import {
  buscarCalificacionesDePedido,
  buscarPedidoPorId,
  crearCalificacion,
  leerError,
} from '@/lib/queries';
import { money } from '@/lib/format';
import type { Calificacion, PedidoConDetalle } from '@/types/database';
import { colors, radius, spacing } from '@/theme';

type Borrador = { estrellas: number; comentario: string };

export default function PantallaCalificar() {
  const { pedidoId } = useLocalSearchParams<{ pedidoId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { esMovil } = useResponsive();
  const { usuario, cargando: cargandoSesion } = useSesion();

  const [pedido, setPedido] = useState<PedidoConDetalle | null>(null);
  const [existentes, setExistentes] = useState<Record<string, Calificacion>>({});
  const [borradores, setBorradores] = useState<Record<string, Borrador>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'error' | 'ok'; texto: string } | null>(null);

  useEffect(() => {
    if (!pedidoId) return;

    let vigente = true;

    Promise.all([buscarPedidoPorId(pedidoId), buscarCalificacionesDePedido(pedidoId)])
      .then(([p, calificaciones]) => {
        if (!vigente) return;
        setPedido(p);
        setExistentes(
          Object.fromEntries(calificaciones.map((c) => [c.producto_id, c])),
        );
        if (!p) setError('No encontramos ese pedido.');
      })
      .catch((e: unknown) => {
        if (vigente) setError(leerError(e));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [pedidoId]);

  const setEstrellas = (productoId: string, estrellas: number) => {
    setBorradores((b) => ({
      ...b,
      [productoId]: { estrellas, comentario: b[productoId]?.comentario ?? '' },
    }));
  };

  const setComentario = (productoId: string, comentario: string) => {
    setBorradores((b) => ({
      ...b,
      [productoId]: { estrellas: b[productoId]?.estrellas ?? 0, comentario },
    }));
  };

  const guardar = async () => {
    if (!pedido || !usuario) return;

    const pendientes = Object.entries(borradores).filter(
      ([productoId, b]) => b.estrellas > 0 && !existentes[productoId],
    );

    if (pendientes.length === 0) {
      setAviso({ tipo: 'error', texto: 'Elegí al menos una calificación con estrellas.' });
      return;
    }

    setGuardando(true);
    setAviso(null);

    try {
      for (const [productoId, b] of pendientes) {
        await crearCalificacion({
          pedidoId: pedido.id,
          productoId,
          clienteId: usuario.id,
          estrellas: b.estrellas,
          comentario: b.comentario.trim() || null,
        });
      }

      const calificaciones = await buscarCalificacionesDePedido(pedido.id);
      setExistentes(Object.fromEntries(calificaciones.map((c) => [c.producto_id, c])));
      setBorradores({});
      setAviso({ tipo: 'ok', texto: '¡Gracias! Tu reseña quedó guardada.' });
    } catch (e: unknown) {
      setAviso({ tipo: 'error', texto: leerError(e) });
    } finally {
      setGuardando(false);
    }
  };

  const entregado = pedido?.estado === 'entregado';
  const hayPendientes = Object.entries(borradores).some(
    ([productoId, b]) => b.estrellas > 0 && !existentes[productoId],
  );

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.contenido,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
        >
          <Text style={styles.titulo} variant={esMovil ? 'headlineSmall' : 'headlineMedium'}>
            ¿Cómo te fue con este pedido?
          </Text>
          <Text style={styles.subtitulo} variant="bodySmall">
            Tu opinión ayuda a otros compradores a elegir mejor. Solo puedes
            calificar pedidos que ya te llegaron.
          </Text>

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

          {cargando || cargandoSesion ? (
            <Text style={styles.muted} variant="bodyMedium">
              Cargando…
            </Text>
          ) : error ? (
            <EmptyState icono="alert-circle-outline" titulo="No pudimos abrir el pedido" mensaje={error} />
          ) : !usuario ? (
            <EmptyState
              icono="account-lock-outline"
              titulo="Inicia sesión"
              mensaje="Necesitas tu cuenta para calificar una compra."
            />
          ) : !pedido ? (
            <EmptyState
              icono="receipt-text-outline"
              titulo="Pedido no encontrado"
              mensaje="No encontramos ese pedido entre tus compras."
            />
          ) : !entregado ? (
            <EmptyState
              icono="clock-outline"
              titulo="Todavía no puedes calificar"
              mensaje="Cuando la tienda marque el pedido como entregado, vas a poder dejar tu reseña."
            />
          ) : (
            <>
              {pedido.lineas.map((l) => {
                const ya = existentes[l.producto_id];
                const borrador = borradores[l.producto_id];
                const estrellas = ya?.estrellas ?? borrador?.estrellas ?? 0;

                return (
                  <View key={l.id} style={styles.tarjeta}>
                    <View style={styles.lineaCabecera}>
                      <Text style={styles.lineaNombre} variant="titleSmall">
                        {l.nombre}
                      </Text>
                      <Text style={styles.lineaPrecio} variant="bodySmall">
                        {l.cantidad} × {money(l.precio_unitario)}
                      </Text>
                    </View>

                    {ya ? (
                      <View style={styles.yaCalificado}>
                        <Stars promedio={ya.estrellas} mostrarNumero={false} size={18} />
                        <Text style={styles.yaTexto} variant="bodySmall">
                          Ya calificaste este repuesto
                        </Text>
                        {ya.comentario ? (
                          <Text style={styles.yaComentario} variant="bodyMedium">
                            “{ya.comentario}”
                          </Text>
                        ) : null}
                      </View>
                    ) : (
                      <>
                        <SelectorEstrellas
                          valor={estrellas}
                          onChange={(n) => setEstrellas(l.producto_id, n)}
                          deshabilitado={guardando}
                        />

                        <TextInput
                          label="Comentario (opcional)"
                          value={borrador?.comentario ?? ''}
                          onChangeText={(t) => setComentario(l.producto_id, t)}
                          mode="outlined"
                          multiline
                          numberOfLines={3}
                          placeholder="¿Llegó bien? ¿El repuesto era el correcto?"
                          style={styles.comentario}
                        />
                      </>
                    )}
                  </View>
                );
              })}

              <Button
                mode="contained"
                icon="star-check-outline"
                onPress={() => void guardar()}
                loading={guardando}
                disabled={guardando || !hayPendientes}
                contentStyle={styles.botonContenido}
              >
                Enviar reseña
              </Button>
              <Button
                mode="text"
                onPress={() => router.back()}
                disabled={guardando}
                icon="arrow-left"
              >
                Volver a mis pedidos
              </Button>
            </>
          )}
        </ScrollView>
      </View>
    </WebShell>
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

  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  lineaCabecera: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  lineaNombre: { color: colors.text, flex: 1 },
  lineaPrecio: { color: colors.textFaint },

  comentario: { marginTop: spacing.xs },

  yaCalificado: { gap: spacing.xs },
  yaTexto: { color: colors.primaryLight, fontWeight: '600' },
  yaComentario: { color: colors.textMuted, fontStyle: 'italic' },

  botonContenido: { minHeight: 48 },
});
