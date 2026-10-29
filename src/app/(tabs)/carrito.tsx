import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import { useSesion } from '@/hooks/useSesion';
import { useResponsive } from '@/hooks/useResponsive';
import { money } from '@/lib/format';
import { useCarrito, type LineaCarrito } from '@/store/carrito';
import { colors, radius, spacing } from '@/theme';

export default function PantallaCarrito() {
  const insets = useSafeAreaInsets();
  const { esMovil } = useResponsive();
  const router = useRouter();
  const { usuario } = useSesion();

  const lineas = useCarrito((s) => s.lineas);
  const cambiarCantidad = useCarrito((s) => s.cambiarCantidad);
  const quitar = useCarrito((s) => s.quitar);

  const porTienda = useMemo(() => {
    const grupos = new Map<string, LineaCarrito[]>();
    for (const l of lineas) {
      const arr = grupos.get(l.tienda_id) ?? [];
      arr.push(l);
      grupos.set(l.tienda_id, arr);
    }
    return [...grupos.entries()];
  }, [lineas]);

  const totalGeneral = useMemo(
    () => lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0),
    [lineas],
  );

  const tramitar = () => {
    if (!usuario) {
      router.push('/ingresar?despues=checkout');
      return;
    }
    router.push('/checkout');
  };

  return (
    <WebShell conHeader={false}>
      <View style={styles.pantalla}>
        <View
          style={[
            styles.cabecera,
            { paddingTop: esMovil ? insets.top + spacing.md : spacing.xl },
          ]}
        >
          <Text variant={esMovil ? 'headlineMedium' : 'displaySmall'} style={styles.titulo}>
            Carrito
          </Text>
          {lineas.length > 0 ? (
            <Text style={styles.subtitulo} variant="bodySmall">
              {lineas.reduce((acc, l) => acc + l.cantidad, 0)} artículo
              {lineas.reduce((acc, l) => acc + l.cantidad, 0) === 1 ? '' : 's'} ·{' '}
              {porTienda.length} tienda{porTienda.length === 1 ? '' : 's'}
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
          {lineas.length === 0 ? (
            <EmptyState
              icono="cart-outline"
              titulo="Tu carrito está vacío"
              mensaje="Andá a Buscar e elegí los repuestos para tu moto, carro o guagua."
            />
          ) : (
            porTienda.map(([tiendaId, items]) => (
              <View key={tiendaId} style={styles.grupo}>
                <View style={styles.grupoCabecera}>
                  <MaterialCommunityIcons
                    name="storefront-outline"
                    size={16}
                    color={colors.primaryLight}
                  />
                  <Text variant="titleSmall" style={styles.grupoTienda}>
                    {items[0]!.tienda}
                  </Text>
                </View>

                {items.map((l) => (
                  <View key={l.producto_id} style={styles.linea}>
                    <View style={styles.lineaDatos}>
                      <Text style={styles.lineaNombre} variant="bodyMedium" numberOfLines={2}>
                        {l.nombre}
                      </Text>
                      <Text style={styles.lineaPrecio} variant="bodySmall">
                        {money(l.precio)}
                      </Text>
                    </View>

                    <View style={styles.lineaAcciones}>
                      <View style={styles.stepper}>
                        <Button
                          mode="outlined"
                          compact
                          onPress={() => cambiarCantidad(l.producto_id, l.cantidad - 1)}
                          accessibilityLabel="Quitar uno"
                        >
                          −
                        </Button>
                        <Text variant="titleSmall" style={styles.cantidad}>
                          {l.cantidad}
                        </Text>
                        <Button
                          mode="outlined"
                          compact
                          onPress={() => cambiarCantidad(l.producto_id, l.cantidad + 1)}
                          accessibilityLabel="Agregar uno"
                        >
                          +
                        </Button>
                      </View>

                      <Button
                        mode="text"
                        compact
                        textColor={colors.danger}
                        onPress={() => quitar(l.producto_id)}
                        icon="trash-can-outline"
                      >
                        Quitar
                      </Button>
                    </View>
                  </View>
                ))}

                <Text style={styles.subtotal} variant="labelSmall">
                  Subtotal · {money(items.reduce((a, l) => a + l.precio * l.cantidad, 0))}
                </Text>
              </View>
            ))
          )}

          {lineas.length > 0 ? (
            <View style={styles.resumen}>
              <View style={styles.resumenFila}>
                <Text style={styles.resumenTexto} variant="bodyMedium">
                  Total (sin delivery)
                </Text>
                <Text variant="titleMedium" style={styles.resumenTotal}>
                  {money(totalGeneral)}
                </Text>
              </View>
              <Text style={styles.nota} variant="bodySmall">
                Se genera un pedido por tienda. El delivery se coordina con cada
                tienda y se paga aparte.
              </Text>
              <Button
                mode="contained"
                icon="cart-check"
                onPress={tramitar}
                contentStyle={styles.ctaContenido}
              >
                {usuario ? 'Tramitar pedido' : 'Iniciá sesión para comprar'}
              </Button>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </WebShell>
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

  grupo: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  grupoCabecera: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grupoTienda: { color: colors.text, flex: 1 },

  linea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lineaDatos: { flex: 1, gap: 2 },
  lineaNombre: { color: colors.text },
  lineaPrecio: { color: colors.textMuted },

  lineaAcciones: { alignItems: 'flex-end', gap: spacing.xs },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cantidad: { color: colors.text, minWidth: 24, textAlign: 'center' },

  subtotal: {
    color: colors.primaryLight,
    textAlign: 'right',
    fontWeight: '700',
  },

  resumen: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  resumenFila: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  resumenTexto: { color: colors.textMuted },
  resumenTotal: { color: colors.text, fontWeight: '700' },

  nota: { color: colors.textFaint, lineHeight: 17 },

  ctaContenido: { minHeight: 48 },
});