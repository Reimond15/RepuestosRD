import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppLogo } from '@/components/AppLogo';
import { AvisoDatos } from '@/components/AvisoDatos';
import { ChecklistCategorias } from '@/components/ChecklistCategorias';
import { SectionProductos } from '@/components/SectionProductos';
import { WebShell } from '@/components/WebShell';
import { useMasVendidos, useMejorCalificados } from '@/hooks/useCatalogo';
import { useResponsive } from '@/hooks/useResponsive';
import type { CategoriaSlug } from '@/lib/constants';
import { useUbicacion } from '@/store/ubicacion';
import { colors, fontSize, spacing } from '@/theme';

export default function PantallaInicio() {
  const insets = useSafeAreaInsets();
  const { esMovil } = useResponsive();
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<CategoriaSlug[]>([]);

  const masVendidos = useMasVendidos(seleccion);
  const mejorCalificados = useMejorCalificados(seleccion);

  // ubicación del cliente: define la zona del título y el orden por cercanía
  const { estado: estadoUbicacion, lat, lng, zona, localizar } = useUbicacion();
  const ubicado = lat !== null && lng !== null;
  const tituloZona =
    zona ?? (estadoUbicacion === 'preguntando' ? 'Buscando tu zona…' : 'Tu zona');

  /**
   * El estado del aviso de arriba. Solo aparece cuando hay algo que
   * decir: si todo salió bien, no ocupa espacio.
   */
  const aviso = (() => {
    if (masVendidos.error || mejorCalificados.error) {
      return {
        modo: 'error' as const,
        error: masVendidos.error ?? mejorCalificados.error,
      };
    }
    if (masVendidos.cargando || mejorCalificados.cargando) return { modo: 'cargando' as const };
    if (!masVendidos.enVivo) return { modo: 'demo' as const };
    return null;
  })();

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contenido,
            // en escritorio el header ya da el alto, no hace falta el safe area
            { paddingTop: esMovil ? insets.top + spacing.md : 0 },
          ]}
        >
          {/* ---------------- cabecera ---------------- */}
          <View style={styles.cabecera}>
            {esMovil ? <AppLogo tamano={30} conNombre={false} /> : null}

            <Text style={styles.saludo} variant="bodyMedium">
              Repuestos cerca de ti
            </Text>

            <Pressable
              onPress={() => {
                void localizar();
              }}
              style={styles.tituloFila}
              accessibilityRole="button"
              accessibilityLabel="Usar mi ubicación para ver tiendas cerca"
            >
              <Text
                style={styles.titulo}
                variant={esMovil ? 'headlineLarge' : 'displayMedium'}
                numberOfLines={1}
              >
                {tituloZona}
              </Text>
              <MaterialCommunityIcons
                name={ubicado ? 'crosshairs-gps' : 'map-marker-plus-outline'}
                size={esMovil ? 22 : 30}
                color={colors.primaryLight}
              />
            </Pressable>

            <Text style={styles.subtitulo} variant="bodySmall">
              Motocicletas · Carros · Guaguas
            </Text>

            {!ubicado ? (
              <Text style={styles.hintUbicacion} variant="bodySmall">
                {estadoUbicacion === 'denegado'
                  ? 'Ubicación desactivada. Tocá el título o habilitá el permiso para ver tiendas cerca.'
                  : 'Tocá para ver las tiendas más cerca de ti.'}
              </Text>
            ) : null}
          </View>

          {/* ---------------- filtro de categoría (checklist) ---------------- */}
          <View style={styles.filtros}>
            <ChecklistCategorias seleccion={seleccion} onChange={setSeleccion} />
          </View>

          {/* ---------------- estado de los datos ---------------- */}
          {aviso ? (
            <AvisoDatos
              modo={aviso.modo}
              error={aviso.modo === 'error' ? aviso.error : null}
              onReintentar={masVendidos.reintentar}
            />
          ) : null}

          {/* ---------------- Lo más vendido ---------------- */}
          <SectionProductos
            titulo="Lo más vendido"
            subtitulo={
              masVendidos.cargando
                ? 'Cargando…'
                : `${masVendidos.datos.length} producto${masVendidos.datos.length === 1 ? '' : 's'}`
            }
            productos={masVendidos.datos}
            cargando={masVendidos.cargando}
            onProducto={(p) =>
              router.push({ pathname: '/producto/[id]', params: { id: p.producto_id } })
            }
          />

          {/* ---------------- Mejor calificados ---------------- */}
          <SectionProductos
            titulo="Mejor calificados"
            subtitulo="Mínimo 3 calificaciones"
            productos={mejorCalificados.datos}
            cargando={mejorCalificados.cargando}
            onProducto={(p) =>
              router.push({ pathname: '/producto/[id]', params: { id: p.producto_id } })
            }
          />

          <View style={{ height: insets.bottom + spacing.xxl }} />
        </ScrollView>
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: { paddingBottom: spacing.xl },

  cabecera: { paddingHorizontal: spacing.lg, gap: 2 },
  saludo: { color: colors.textMuted },
  tituloFila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titulo: { color: colors.text, flexShrink: 1 },
  subtitulo: { color: colors.primaryLight, fontSize: fontSize.sm, marginTop: 2 },
  hintUbicacion: { color: colors.textFaint, marginTop: 2, lineHeight: 17 },

  filtros: { marginTop: spacing.lg },
});