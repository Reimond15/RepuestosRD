import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AvisoDatos } from '@/components/AvisoDatos';
import { ChecklistCategorias } from '@/components/ChecklistCategorias';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { WebShell } from '@/components/WebShell';
import {
  MOCK_CATALOGO,
  textoBuscable,
  useBusqueda,
} from '@/hooks/useCatalogo';
import { anchoCelda, useResponsive } from '@/hooks/useResponsive';
import type { CategoriaSlug } from '@/lib/constants';
import type { ProductoCatalogo } from '@/types/database';
import { colors, fontSize, spacing } from '@/theme';

export default function PantallaBuscar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { esMovil, columnas, anchoContenido } = useResponsive();
  const [texto, setTexto] = useState('');
  const [seleccion, setSeleccion] = useState<CategoriaSlug[]>([]);

  const catalogo = useBusqueda();

  // sin Supabase se buscan los mocks, con la misma forma de datos
  const fuente = catalogo.enVivo || catalogo.cargando ? catalogo.datos : MOCK_CATALOGO;

  const resultados = useMemo(() => {
    const t = texto.trim().toLowerCase();
    const activas = new Set<CategoriaSlug>(seleccion);

    return fuente.filter((p) => {
      // varias categorías marcadas = todo lo que pertenezca a cualquiera
      if (activas.size > 0 && !activas.has(p.categoria_slug)) return false;
      if (!t) return true;
      return textoBuscable(p).includes(t);
    });
  }, [fuente, texto, seleccion]);

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <View
          style={[
            styles.cabecera,
            { paddingTop: esMovil ? insets.top + spacing.md : spacing.xl },
          ]}
        >
          <Text
            style={styles.titulo}
            variant={esMovil ? 'headlineMedium' : 'displaySmall'}
          >
            Buscar repuestos
          </Text>

          <Searchbar
            placeholder="Pastilla de freno, batería, filtro…"
            value={texto}
            onChangeText={setTexto}
            style={styles.buscador}
            inputStyle={styles.buscadorInput}
            iconColor={colors.textMuted}
            placeholderTextColor={colors.textFaint}
            elevation={0}
          />

          <View style={styles.filtros}>
            <ChecklistCategorias seleccion={seleccion} onChange={setSeleccion} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.lista, { paddingBottom: insets.bottom + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
        >
          <AvisoDatos
            modo={
              catalogo.error ? 'error' : catalogo.cargando ? 'cargando' : catalogo.enVivo ? 'ok' : 'demo'
            }
            error={catalogo.error}
            onReintentar={catalogo.reintentar}
          />

          {resultados.length === 0 ? (
            catalogo.cargando ? null : (
              <EmptyState
                icono="magnify-close"
                titulo="Sin resultados"
                mensaje={
                  texto
                    ? `No encontramos nada para "${texto}". Probá con otra palabra.`
                    : 'No hay productos en esta categoría todavía.'
                }
              />
            )
          ) : (
            <>
              <Text style={styles.conteo} variant="bodySmall">
                {resultados.length}{' '}
                {resultados.length === 1 ? 'resultado' : 'resultados'}
              </Text>

              <View style={styles.rejilla}>
                {resultados.map((p) => (
                  <View key={p.producto_id} style={{ width: anchoCelda(anchoContenido, columnas) }}>
                    <ProductCard
                      producto={aResumen(p)}
                      variante="vertical"
                      onPress={() =>
                        router.push({ pathname: '/producto/[id]', params: { id: p.producto_id } })
                      }
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </WebShell>
  );
}

/**
 * `catalogo_productos` llama `categoria` a la categoría; las vistas de
 * ranking la llaman `categoria_nombre`. Se normaliza una sola vez acá para
 * que ProductCard no tenga que conocer los dos nombres.
 */
function aResumen(p: ProductoCatalogo) {
  return {
    producto_id: p.producto_id,
    tienda: p.tienda,
    promedio_estrellas: p.promedio_estrellas,
    total_calificaciones: p.total_calificaciones ?? 0,
    categoria_nombre: p.categoria,
    imagenes: p.imagenes,
    nombre: p.nombre,
    precio: p.precio,
    stock: p.stock,
    distancia_km: p.distancia_km,
  };
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },

  cabecera: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titulo: { color: colors.text },

  buscador: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
    // en escritorio no crece a 4000px de ancho
    maxWidth: 520,
  },
  buscadorInput: { color: colors.text, fontSize: fontSize.md },

  filtros: { marginHorizontal: -spacing.lg },

  lista: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  conteo: { color: colors.textFaint, marginBottom: spacing.md, marginTop: spacing.md },

  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});