import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { ProductCard, type ProductoResumen } from '@/components/ProductCard';
import { anchoCelda, useResponsive } from '@/hooks/useResponsive';
import { colors, fontSize, spacing } from '@/theme';

type Props = {
  titulo: string;
  subtitulo?: string;
  productos: ProductoResumen[];
  onProducto?: (producto: ProductoResumen) => void;
  onVerTodo?: () => void;
  cargando?: boolean;
};

export function SectionProductos({
  titulo,
  subtitulo,
  productos,
  onProducto,
  onVerTodo,
  cargando = false,
}: Props) {
  const { esMovil, columnas, anchoContenido } = useResponsive();
  const anchoTarjeta = esMovil ? 176 : anchoCelda(anchoContenido, columnas);

  return (
    <View style={styles.seccion}>
      <View style={styles.cabecera}>
        <View style={styles.titulos}>
          <Text style={styles.titulo} variant="titleLarge">
            {titulo}
          </Text>
          {subtitulo ? (
            <Text style={styles.subtitulo} variant="bodySmall">
              {subtitulo}
            </Text>
          ) : null}
        </View>

        {onVerTodo && esMovil && productos.length > 0 ? (
          <Text
            variant="labelMedium"
            style={styles.verTodo}
            onPress={onVerTodo}
            accessibilityRole="button"
          >
            Ver todo
          </Text>
        ) : null}
      </View>

      {productos.length === 0 ? (
        <View style={styles.vacio}>
          <MaterialCommunityIcons
            name={cargando ? 'timer-sand' : 'package-variant-closed'}
            size={20}
            color={colors.textFaint}
          />
          <Text style={styles.vacioTexto} variant="bodySmall">
            {cargando ? 'Cargando…' : 'No hay nada acá todavía'}
          </Text>
        </View>
      ) : esMovil ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carrusel}
        >
          {productos.map((p) => (
            <View key={p.producto_id} style={{ width: anchoTarjeta }}>
              <ProductCard
                producto={p}
                variante="vertical"
                onPress={onProducto ? () => onProducto(p) : undefined}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.rejilla}>
          {productos.map((p) => (
            <View key={p.producto_id} style={{ width: anchoTarjeta }}>
              <ProductCard
                producto={p}
                variante="vertical"
                onPress={onProducto ? () => onProducto(p) : undefined}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: { marginTop: spacing.xl },

  cabecera: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  titulos: { flex: 1, gap: 2 },
  titulo: { color: colors.text },
  subtitulo: { color: colors.textMuted, fontSize: fontSize.xs },
  verTodo: { color: colors.primaryLight, fontWeight: '700' },

  carrusel: { paddingHorizontal: spacing.lg, gap: spacing.md },
  rejilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  vacio: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
  },
  vacioTexto: { color: colors.textFaint },
});
