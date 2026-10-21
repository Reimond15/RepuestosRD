import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Stars } from '@/components/Stars';
import { colors, fontSize, radius, shadow } from '@/theme';
import { money, recortar } from '@/lib/format';
import { distanciaTexto } from '@/lib/geo';
import { CATEGORIAS } from '@/lib/constants';

/**
 * Lo mínimo que la tarjeta necesita.
 *
 * Acepta las 3 formas que devuelven las vistas, para que la misma tarjeta
 * sirva en el inicio, en la búsqueda y en el detalle:
 *   - catalogo_productos        → nombre, precio
 *   - productos_mas_vendidos   → producto, precio_actual
 *   - productos_mejor_calificados → producto, precio_actual
 */
export type ProductoResumen = {
  producto_id: string;
  tienda: string;
  promedio_estrellas: number | null;
  total_calificaciones: number;
  categoria_nombre: string;
  imagenes?: string[] | null;
  /** true si la tienda está verificada → muestra la insignia. */
  tienda_verificada?: boolean;
  /** undefined = no se sabe (vistas de ranking sin stock) → no se marca agotado */
  stock?: number;
  /** Distancia a la tienda, en km. Solo se muestra si la app tiene posición. */
  distancia_km?: number | null;

  // el nombre del producto, con cualquiera de los dos alias
  nombre?: string;
  producto?: string;

  // el precio, con cualquiera de los dos alias
  precio?: number | string;
  precio_actual?: number | string;
};

type Props = {
  producto: ProductoResumen;
  /** "vertical" = tarjeta grande · "horizontal" = fila compacta */
  variante?: 'vertical' | 'horizontal';
  /** Oculta el nombre de la tienda (en detalle no hace falta). */
  mostrarTienda?: boolean;
  onPress?: () => void;
};

/** Emoji que representa la categoría, usado de placeholder. */
function emojiDeCategoria(nombre: string): string {
  return CATEGORIAS.find((c) => c.nombre === nombre)?.icono ?? '🔧';
}

function ProductCardBase({
  producto,
  variante = 'vertical',
  mostrarTienda = true,
  onPress,
}: Props) {
  const [falloImagen, setFalloImagen] = useState(false);
  const horizontal = variante === 'horizontal';
  const imagen = producto.imagenes?.find((u) => !!u);
  const sinImagen = !imagen || falloImagen;
  // agotado solo cuando la vista trae stock y es 0; si es unknown no se marca
  const agotado = typeof producto.stock === 'number' && producto.stock <= 0;

  // las vistas usan `producto`/`precio_actual`; el catálogo usa `nombre`/`precio`
  const nombre = producto.nombre ?? producto.producto ?? 'Producto';
  const precio = producto.precio ?? producto.precio_actual ?? 0;

  const contenido = (
    <View
      style={[
        styles.card,
        horizontal && styles.cardHorizontal,
        shadow.card,
        agotado && styles.agotado,
      ]}
    >
      {/* ---------- imagen ---------- */}
      <View style={[styles.imagenBox, horizontal && styles.imagenBoxHorizontal]}>
        {sinImagen ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>{emojiDeCategoria(producto.categoria_nombre)}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: imagen }}
            style={styles.imagen}
            contentFit="cover"
            transition={200}
            onError={() => setFalloImagen(true)}
            accessibilityLabel={`Foto de ${nombre}`}
          />
        )}

        {agotado ? (
          <View style={styles.cintaAgotado}>
            <Text style={styles.cintaTexto}>Agotado</Text>
          </View>
        ) : null}
      </View>

      {/* ---------- datos ---------- */}
      <View style={styles.datos}>
        <Text style={styles.nombre} numberOfLines={2} variant="titleSmall">
          {recortar(nombre, 42)}
        </Text>

        <Stars
          promedio={producto.promedio_estrellas}
          total={producto.total_calificaciones}
          size={13}
        />

        <View style={styles.pie}>
          <Text style={styles.precio} variant="titleMedium">
            {money(precio)}
          </Text>
        </View>

        {mostrarTienda ? (
          <View style={styles.tienda}>
            <MaterialCommunityIcons
              name="storefront-outline"
              size={12}
              color={colors.textFaint}
            />
            <Text style={styles.tiendaTexto} numberOfLines={1} variant="bodySmall">
              {recortar(producto.tienda, 26)}
            </Text>
            {producto.tienda_verificada ? (
              <MaterialCommunityIcons
                name="check-decagram"
                size={13}
                color={colors.primaryLight}
              />
            ) : null}
          </View>
        ) : null}

        {typeof producto.distancia_km === 'number' ? (
          <View style={styles.distancia}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={12}
              color={colors.primaryLight}
            />
            <Text style={styles.distanciaTexto} variant="bodySmall">
              a {distanciaTexto(producto.distancia_km)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) return contenido;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.contenedor, pressed && styles.presionado]}
      accessibilityRole="button"
      accessibilityLabel={`${nombre}, ${money(precio)}, tienda ${producto.tienda}`}
    >
      {contenido}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedor: { borderRadius: radius.lg },
  presionado: { opacity: 0.75, transform: [{ scale: 0.98 }] },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHorizontal: { flexDirection: 'row' },

  // ---- imagen ----
  imagenBox: { width: '100%', height: 140, backgroundColor: colors.surfaceAlt },
  imagenBoxHorizontal: { width: 108, height: 108 },
  imagen: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  placeholderEmoji: { fontSize: 40 },

  cintaAgotado: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  cintaTexto: { color: colors.white, fontSize: fontSize.xs, fontWeight: '700' },

  agotado: { opacity: 0.6 },

  // ---- datos ----
  datos: { padding: 10, gap: 5, flex: 1 },
  nombre: { color: colors.text, fontSize: fontSize.sm },

  pie: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  precio: { color: colors.primaryLight, fontWeight: '700' },

  tienda: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tiendaTexto: { color: colors.textFaint, flexShrink: 1, fontSize: fontSize.xs },

  distancia: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanciaTexto: { color: colors.primaryLight, fontSize: fontSize.xs, fontWeight: '600' },
});

export const ProductCard = memo(ProductCardBase);
