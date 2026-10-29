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
import { useTiendasCount } from '@/hooks/useTiendasCount';
import { numero } from '@/lib/format';
import type { CategoriaSlug } from '@/lib/constants';
import { useUbicacion } from '@/store/ubicacion';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function PantallaInicio() {
  const insets = useSafeAreaInsets();
  const { esMovil } = useResponsive();
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<CategoriaSlug[]>([]);

  const masVendidos = useMasVendidos(seleccion);
  const mejorCalificados = useMejorCalificados(seleccion);
  const tiendas = useTiendasCount();

  const { estado: estadoUbicacion, lat, lng, zona, localizar } = useUbicacion();
  const ubicado = lat !== null && lng !== null;
  const tituloZona =
    zona ?? (estadoUbicacion === 'preguntando' ? 'Buscando tu zona…' : 'Tu zona');

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
            { paddingTop: esMovil ? insets.top + spacing.md : 0 },
          ]}
        >
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

            <View style={styles.filaSubtitulo}>
              <Text style={styles.subtitulo} variant="bodySmall">
                Motocicletas · Carros · Guaguas
              </Text>

              <ContadorTiendas
                cantidad={tiendas.cantidad}
                cargando={tiendas.cargando}
                esMovil={esMovil}
              />
            </View>

            {!ubicado ? (
              <Text style={styles.hintUbicacion} variant="bodySmall">
                {estadoUbicacion === 'denegado'
                  ? 'Ubicación desactivada. Tocá el título o habilitá el permiso para ver tiendas cerca.'
                  : 'Tocá para ver las tiendas más cerca de ti.'}
              </Text>
            ) : null}
          </View>

          <View style={styles.filtros}>
            <ChecklistCategorias seleccion={seleccion} onChange={setSeleccion} />
          </View>

          {aviso ? (
            <AvisoDatos
              modo={aviso.modo}
              error={aviso.modo === 'error' ? aviso.error : null}
              onReintentar={masVendidos.reintentar}
            />
          ) : null}

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

function ContadorTiendas({
  cantidad,
  cargando,
  esMovil,
}: {
  cantidad: number | null;
  cargando: boolean;
  esMovil: boolean;
}) {
  if (cantidad === null && !cargando) return null;

  const texto =
    cantidad === null
      ? '— tiendas'
      : `${numero(cantidad)} ${cantidad === 1 ? 'tienda' : 'tiendas'}`;

  return (
    <View
      style={styles.contador}
      accessible
      accessibilityLabel={
        cantidad === null ? 'Cargando tiendas registradas' : `${numero(cantidad)} tiendas registradas`
      }
    >
      <MaterialCommunityIcons
        name="store-outline"
        size={esMovil ? 14 : 16}
        color={colors.primaryLight}
      />
      <Text style={styles.contadorTexto} variant="labelSmall">
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: { paddingBottom: spacing.xl },

  cabecera: { paddingHorizontal: spacing.lg, gap: 2 },
  saludo: { color: colors.textMuted },
  tituloFila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titulo: { color: colors.text, flexShrink: 1 },
  filaSubtitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: 2,
  },
  subtitulo: { color: colors.primaryLight, fontSize: fontSize.sm, flexShrink: 1 },
  hintUbicacion: { color: colors.textFaint, marginTop: 2, lineHeight: 17 },

  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    flexShrink: 0,
  },
  contadorTexto: { color: colors.primaryLight, fontSize: fontSize.xs },

  filtros: { marginTop: spacing.lg },
});