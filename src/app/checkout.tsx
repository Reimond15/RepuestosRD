import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, RadioButton, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

import { ConsentimientoLegal } from '@/components/ConsentimientoLegal';
import { WebShell } from '@/components/WebShell';
import { useCampoEnfocado } from '@/hooks/useCampoEnfocado';
import { useSesion } from '@/hooks/useSesion';
import {
  buscarTiendasPorIds,
  crearPedidoYLineas,
  leerError,
  preciosYStock,
} from '@/lib/queries';
import { money } from '@/lib/format';
import { useCarrito, type LineaCarrito } from '@/store/carrito';
import type { Tienda } from '@/types/database';
import { colors, radius, spacing } from '@/theme';

type Formas = {
  entrega: 'delivery' | 'retiro';
  direccion: string;
  formaPago: 'efectivo' | 'transferencia';
  notas: string;
};

const formaInicial = (): Formas => ({
  entrega: 'delivery',
  direccion: '',
  formaPago: 'efectivo',
  notas: '',
});

export default function PantallaCheckout() {
  const router = useRouter();
  const { usuario, cargando } = useSesion();
  const { scrollRef, alEnfocar } = useCampoEnfocado();

  const lineas = useCarrito((s) => s.lineas);
  const revalidar = useCarrito((s) => s.revalidar);
  const vaciarTienda = useCarrito((s) => s.vaciarTienda);

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [formas, setFormas] = useState<Record<string, Formas>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hechos, setHechos] = useState<string[]>([]);
  const [acepta, setAcepta] = useState(false);

  const [modoDireccion, setModoDireccion] = useState<'unica' | 'por-tienda'>('unica');
  const [direccionUnica, setDireccionUnica] = useState('');

  const porTienda = useMemo(() => {
    const grupos = new Map<string, LineaCarrito[]>();
    for (const l of lineas) {
      const arr = grupos.get(l.tienda_id) ?? [];
      arr.push(l);
      grupos.set(l.tienda_id, arr);
    }
    return [...grupos.entries()].map(([tiendaId, lineasDeTienda]) => ({
      tiendaId,
      tienda: lineasDeTienda[0]!.tienda,
      lineas: lineasDeTienda,
    }));
  }, [lineas]);

  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace('/ingresar?despues=checkout');
    }
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (porTienda.length === 0) return;

    let vigente = true;
    buscarTiendasPorIds(porTienda.map((g) => g.tiendaId))
      .then((ts) => {
        if (vigente) setTiendas(ts);
      })
      .catch(() => null);

    return () => {
      vigente = false;
    };
  }, [porTienda]);

  const tiendaDe = (id: string): Tienda | undefined => tiendas.find((t) => t.id === id);

  const compartida = porTienda.length > 1 && modoDireccion === 'unica';

  const direccionPara = (tiendaId: string): string => {
    const f = formas[tiendaId] ?? formaInicial();
    if (f.entrega !== 'delivery') return '';
    return compartida ? direccionUnica : f.direccion;
  };

  const totales = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const l of lineas) {
      mapa.set(l.tienda_id, (mapa.get(l.tienda_id) ?? 0) + l.precio * l.cantidad);
    }
    return mapa;
  }, [lineas]);

  const confirmar = async () => {
    if (!usuario || porTienda.length === 0) return;

    setError(null);

    if (!acepta) {
      setError(
        'Tenés que aceptar los Términos, la Política de Privacidad y la Política de Reembolsos para confirmar el pedido.',
      );
      return;
    }

    for (const g of porTienda) {
      const f = formas[g.tiendaId] ?? formaInicial();
      if (f.entrega === 'delivery' && !direccionPara(g.tiendaId).trim()) {
        setError(
          compartida
            ? 'Escribí la dirección de entrega: se usa para todas las tiendas.'
            : `Para "Delivery" de ${g.tienda} necesitás escribir la dirección de entrega.`,
        );
        return;
      }
    }

    const ids = porTienda.flatMap((g) => g.lineas.map((l) => l.producto_id));

    let actuales: Awaited<ReturnType<typeof preciosYStock>>;
    try {
      actuales = await preciosYStock(ids);
    } catch (e) {
      setError(leerError(e));
      return;
    }

    const mapa = new Map(actuales.map((a) => [a.producto_id, a]));
    const avisos: string[] = [];

    for (const l of lineas) {
      const actual = mapa.get(l.producto_id);
      if (!actual) {
        avisos.push(`${l.nombre} ya no está disponible`);
      } else if (actual.precio !== l.precio) {
        avisos.push(`${l.nombre}: precio actualizado a ${money(actual.precio)}`);
      } else if (actual.stock < l.cantidad) {
        avisos.push(`De ${l.nombre} solo quedan ${actual.stock}`);
      }
    }

    revalidar(actuales);

    if (avisos.length > 0) {
      setError(
        `Revisá tu carrito antes de confirmar:\n• ${avisos.join('\n• ')}`,
      );
      return;
    }

    setEnviando(true);
    try {
      const estado = useCarrito.getState();

      const lineasPorTienda = new Map<string, LineaCarrito[]>();
      for (const l of estado.lineas) {
        const arr = lineasPorTienda.get(l.tienda_id) ?? [];
        arr.push(l);
        lineasPorTienda.set(l.tienda_id, arr);
      }

      const creados: string[] = [];

      for (const [tiendaId, grupo] of lineasPorTienda) {
        const f = formas[tiendaId] ?? formaInicial();
        await crearPedidoYLineas({
          clienteId: usuario.id,
          tiendaId,
          entrega: f.entrega,
          direccion: f.entrega === 'delivery' ? direccionPara(tiendaId).trim() : null,
          formaPago: f.formaPago,
          notas: f.notas.trim() || null,
          lineas: grupo.map((l) => ({ producto_id: l.producto_id, cantidad: l.cantidad })),
        });
        vaciarTienda(tiendaId);
        creados.push(grupo[0]!.tienda);
      }

      setHechos(creados);
    } catch (e) {
      setError(leerError(e));
    } finally {
      setEnviando(false);
    }
  };

  if (hechos.length > 0) {
    return (
      <WebShell>
        <View style={styles.pantalla}>
          <ScrollView contentContainerStyle={styles.exitoContenido}>
            <View style={styles.exito}>
              <View style={styles.exitoCirculo}>
                <MaterialCommunityIcons name="check-bold" size={40} color={colors.success} />
              </View>
              <Text variant="headlineSmall" style={styles.exitoTitulo}>
                ¡Pedido{hechos.length > 1 ? 's' : ''} en camino!
              </Text>
              <Text style={styles.exitoTexto} variant="bodyMedium">
                Se envió un pedido a cada tienda:
              </Text>
              <View style={styles.exitoTiendas}>
                {hechos.map((nombre) => (
                  <View key={nombre} style={styles.exitoChip}>
                    <Text style={styles.exitoChipTexto} variant="bodySmall">
                      {nombre}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.exitoNota} variant="bodySmall">
                Cada tienda te va a contactar para coordinar el delivery y el pago.
                El costo del delivery se paga aparte.
              </Text>
              <Button
                mode="contained"
                icon="receipt-text-outline"
                onPress={() => router.replace('/pedidos')}
              >
                Ver mis pedidos
              </Button>
            </View>
          </ScrollView>
        </View>
      </WebShell>
    );
  }

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <KeyboardAvoidingView
          style={styles.pantalla}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
          >
          {porTienda.length > 1 ? (
            <View style={styles.grupo}>
              <View style={styles.grupoCabecera}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={16}
                  color={colors.primaryLight}
                />
                <Text variant="titleMedium" style={styles.grupoTienda}>
                  Dirección de entrega
                </Text>
              </View>

              <Text style={styles.nota} variant="bodySmall">
                Tu carrito tiene repuestos de {porTienda.length} tiendas. ¿Todos van al
                mismo lugar?
              </Text>

              <View style={styles.radios}>
                <RadioFila
                  etiqueta="Sí, todo al mismo lugar"
                  seleccionado={modoDireccion === 'unica'}
                  onPress={() => setModoDireccion('unica')}
                />
                <RadioFila
                  etiqueta="No, una dirección por tienda"
                  seleccionado={modoDireccion === 'por-tienda'}
                  onPress={() => setModoDireccion('por-tienda')}
                />
              </View>

              {compartida ? (
                <TextInput
                  label="Dirección de entrega"
                  value={direccionUnica}
                  onChangeText={setDireccionUnica}
                  mode="outlined"
                  placeholder="Calle, sector, referencia"
                  multiline
                  onFocus={alEnfocar}
                />
              ) : null}
            </View>
          ) : null}

          {porTienda.length === 0 ? (
            <Text style={styles.vacio} variant="bodyMedium">
              Tu carrito está vacío.
            </Text>
          ) : (
            porTienda.map((g) => {
              const f = formas[g.tiendaId] ?? formaInicial();
              const tienda = tiendaDe(g.tiendaId);
              const ofrece = tienda?.ofrece_delivery ?? true;

              return (
                <View key={g.tiendaId} style={styles.grupo}>
                  <View style={styles.grupoCabecera}>
                    <MaterialCommunityIcons
                      name="storefront-outline"
                      size={16}
                      color={colors.primaryLight}
                    />
                    <Text variant="titleMedium" style={styles.grupoTienda}>
                      {g.tienda}
                    </Text>
                  </View>

                  <Text style={styles.grupoTotal} variant="bodySmall">
                    {g.lineas.reduce((acc, l) => acc + l.cantidad, 0)} artículo
                    {g.lineas.reduce((acc, l) => acc + l.cantidad, 0) === 1 ? '' : 's'} ·{' '}
                    {money(totales.get(g.tiendaId) ?? 0)}
                  </Text>

                  <Text style={styles.etiqueta} variant="labelMedium">
                    Entrega
                  </Text>
                  <SegmentedButtons
                    value={f.entrega}
                    onValueChange={(v) =>
                      setFormas((prev) => ({
                        ...prev,
                        [g.tiendaId]: {
                          ...(prev[g.tiendaId] ?? formaInicial()),
                          entrega: v as 'delivery' | 'retiro',
                        },
                      }))
                    }
                    buttons={[
                      { value: 'retiro', label: 'Retiro' },
                      { value: 'delivery', label: 'Delivery', disabled: !ofrece },
                    ]}
                  />

                  {ofrece ? (
                    <Text style={styles.nota} variant="bodySmall">
                      Delivery {tienda ? money(tienda.costo_delivery) : '…'} — se
                      coordina con la tienda y se paga aparte al recibir.
                    </Text>
                  ) : (
                    <Text style={styles.nota} variant="bodySmall">
                      Esta tienda no hace delivery: se coordina el retiro.
                    </Text>
                  )}

                  {f.entrega === 'delivery' && !compartida ? (
                    <TextInput
                      label="Dirección de entrega"
                      value={f.direccion}
                      onChangeText={(t) =>
                        setFormas((prev) => ({
                          ...prev,
                          [g.tiendaId]: { ...(prev[g.tiendaId] ?? formaInicial()), direccion: t },
                        }))
                      }
                      mode="outlined"
                      placeholder="Calle, sector, referencia"
                      multiline
                      onFocus={alEnfocar}
                    />
                  ) : null}

                  {compartida && f.entrega === 'delivery' && ofrece ? (
                    <Text style={styles.nota} variant="bodySmall">
                      Va a la dirección de entrega de arriba.
                    </Text>
                  ) : null}

                  <Text style={styles.etiqueta} variant="labelMedium">
                    Forma de pago
                  </Text>
                  <SegmentedButtons
                    value={f.formaPago}
                    onValueChange={(v) =>
                      setFormas((prev) => ({
                        ...prev,
                        [g.tiendaId]: {
                          ...(prev[g.tiendaId] ?? formaInicial()),
                          formaPago: v as 'efectivo' | 'transferencia',
                        },
                      }))
                    }
                    buttons={[
                      { value: 'efectivo', label: 'Efectivo' },
                      { value: 'transferencia', label: 'Transferencia' },
                    ]}
                  />

                  <TextInput
                    label="Notas para la tienda (opcional)"
                    value={f.notas}
                    onChangeText={(t) =>
                      setFormas((prev) => ({
                        ...prev,
                        [g.tiendaId]: { ...(prev[g.tiendaId] ?? formaInicial()), notas: t },
                      }))
                    }
                    mode="outlined"
                    multiline
                    onFocus={alEnfocar}
                  />
                </View>
              );
            })
          )}

          {error ? <Text style={styles.error} variant="bodySmall">{error}</Text> : null}

          {porTienda.length > 0 ? (
            <View style={styles.pie}>
              <ConsentimientoLegal valor={acepta} onCambiar={setAcepta} />
              <Text style={styles.pieTotal} variant="bodyMedium">
                Total a pagar:{' '}
                <Text style={styles.pieTotalNumero} variant="titleMedium">
                  {money([...totales.values()].reduce((a, b) => a + b, 0))}
                </Text>
              </Text>
              <Button
                mode="contained"
                icon="cart-check"
                onPress={confirmar}
                loading={enviando}
                disabled={enviando}
                contentStyle={styles.botonContenido}
              >
                Confirmar pedido{porTienda.length > 1 ? 's' : ''}
              </Button>
            </View>
          ) : null}
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </WebShell>
  );
}

function RadioFila({
  etiqueta,
  seleccionado,
  onPress,
}: {
  etiqueta: string;
  seleccionado: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.radioFila}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: seleccionado }}
    >
      <RadioButton
        value={etiqueta}
        status={seleccionado ? 'checked' : 'unchecked'}
        onPress={onPress}
      />
      <Text style={styles.radioTexto} variant="bodyMedium">
        {etiqueta}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },

  contenido: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },

  vacio: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },

  grupo: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  grupoCabecera: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grupoTienda: { color: colors.text, flex: 1 },
  grupoTotal: { color: colors.textMuted },

  etiqueta: { color: colors.textMuted, marginTop: spacing.xs },

  radios: { gap: spacing.xs },
  radioFila: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  radioTexto: { color: colors.text, flex: 1 },

  nota: { color: colors.textFaint, lineHeight: 17 },

  error: {
    color: colors.danger,
    lineHeight: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  pie: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pieTotal: { color: colors.textMuted },
  pieTotalNumero: { color: colors.text, fontWeight: '700' },
  botonContenido: { minHeight: 48 },

  exitoContenido: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  exito: {
    width: '100%',
    maxWidth: 460,
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.success,
    padding: spacing.xl,
  },
  exitoCirculo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitoTitulo: { color: colors.text, textAlign: 'center' },
  exitoTexto: { color: colors.textMuted, textAlign: 'center' },
  exitoTiendas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  exitoChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exitoChipTexto: { color: colors.primaryLight },
  exitoNota: { color: colors.textFaint, textAlign: 'center', lineHeight: 17 },
});