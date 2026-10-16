import { Pressable, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text } from 'react-native-paper';

import { CATEGORIAS, type CategoriaSlug } from '@/lib/constants';
import { colors, fontSize, radius, spacing } from '@/theme';

type Props = {
  /** Slugs marcados. Vacío = "Todos" (ver todo). */
  seleccion: CategoriaSlug[];
  onChange: (seleccion: CategoriaSlug[]) => void;
};

type Opcion = { clave: CategoriaSlug | 'todos'; etiqueta: string };

/**
 * Checklist de categorías (multi-selección): "Todos" + las 3 categorías.
 *
 * El cliente marca varias a la vez —moto y carro, por ejemplo— y ve todo
 * lo relacionado sin volver a buscar. "Todos" limpia la selección.
 * Las opciones hacen wrap para que se vean bien en pantallas chicas.
 */
export function ChecklistCategorias({ seleccion, onChange }: Props) {
  const opciones: Opcion[] = [
    { clave: 'todos', etiqueta: 'Todos' },
    ...CATEGORIAS.map((c) => ({ clave: c.slug, etiqueta: c.nombre })),
  ];

  return (
    <View style={styles.lista}>
      {opciones.map((o) => {
        const marcado = o.clave === 'todos' ? seleccion.length === 0 : seleccion.includes(o.clave);

        const alTocar = () =>
          o.clave === 'todos'
            ? onChange([])
            : onChange(
                marcado
                  ? seleccion.filter((s) => s !== o.clave)
                  : [...seleccion, o.clave],
              );

        return (
          <Pressable
            key={o.clave}
            onPress={alTocar}
            style={({ pressed }) => [
              styles.item,
              marcado && styles.itemMarcado,
              pressed && styles.presionado,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: marcado }}
          >
            <View style={[styles.caja, marcado && styles.cajaMarcada]}>
              {marcado ? (
                <MaterialCommunityIcons name="check" size={14} color={colors.black} />
              ) : null}
            </View>
            <Text style={[styles.etiqueta, marcado && styles.etiquetaMarcada]}>
              {o.etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemMarcado: { backgroundColor: colors.primary, borderColor: colors.primary },
  presionado: { opacity: 0.7 },
  caja: {
    width: 18,
    height: 18,
    borderRadius: radius.sm - 2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaMarcada: { borderColor: colors.primary, backgroundColor: colors.black },
  etiqueta: { color: colors.textMuted, fontSize: fontSize.sm },
  etiquetaMarcada: { color: colors.black, fontWeight: '600' },
});