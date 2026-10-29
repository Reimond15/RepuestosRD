import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import { useMisProductos } from '@/hooks/useMisProductos';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import { useTipos } from '@/hooks/useTipos';
import { money } from '@/lib/format';
import { etiquetaCondicion } from '@/lib/constants';
import type { Producto } from '@/types/database';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function PantallaMisProductos() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { esMovil } = useResponsive();
  const { usuario, tienda, cargando: cargandoSesion } = useSesion();

  const { productos, cargando, error, recargar } = useMisProductos(tienda?.id ?? null);
  const { tipos } = useTipos();

  useFocusEffect(
    useCallback(() => {
      if (tienda?.id) recargar();
    }, [tienda?.id, recargar]),
  );

  const nombreTipo = (tipoId: string) => tipos.find((t) => t.id === tipoId)?.nombre ?? 'Repuesto';

  const abrirNuevo = () => {
    router.push({ pathname: '/mi-producto/[id]', params: { id: 'nuevo' } });
  };

  const abrirEditar = (p: Producto) => {
    router.push({ pathname: '/mi-producto/[id]', params: { id: p.id } });
  };

  const esTienda = usuario?.rol === 'tienda';

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contenido,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
        >
          <View style={styles.cabecera}>
            <View style={styles.cabeceraTexto}>
              <Text style={styles.titulo} variant={esMovil ? 'headlineSmall' : 'headlineMedium'}>
                Mis repuestos
              </Text>
              <Text style={styles.subtitulo} variant="bodySmall">
                Publicá, editá y pausá los repuestos de tu tienda.
              </Text>
            </View>

            {esTienda && tienda ? (
              <Button
                mode="contained"
                icon="plus"
                onPress={abrirNuevo}
                disabled={!tienda.aprobada}
              >
                Publicar
              </Button>
            ) : null}
          </View>

          {esTienda && tienda && !tienda.aprobada ? (
            <View style={styles.banner}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.warning} />
              <Text style={styles.bannerTexto} variant="bodySmall">
                Tu tienda todavía no está aprobada. Podés preparar tus repuestos, pero no se
                publicarán hasta que un administrador apruebe tu tienda.
              </Text>
            </View>
          ) : null}

          {cargandoSesion || (!!tienda?.id && cargando && productos.length === 0) ? (
            <Text style={styles.muted} variant="bodyMedium">
              Cargando…
            </Text>
          ) : !usuario ? (
            <EmptyState
              icono="account-lock-outline"
              titulo="Inicia sesión"
              mensaje="Entrá con tu cuenta de tienda para administrar tus repuestos."
            />
          ) : !esTienda ? (
            <EmptyState
              icono="storefront-outline"
              titulo="Esta sección es para tiendas"
              mensaje="Tu cuenta es de comprador. Si querés vender, creá una cuenta de tienda."
            />
          ) : error ? (
            <EmptyState
              icono="alert-circle-outline"
              titulo="No pudimos cargar tus repuestos"
              mensaje={error}
              accion={
                <Button mode="outlined" onPress={recargar}>
                  Reintentar
                </Button>
              }
            />
          ) : productos.length === 0 ? (
            <EmptyState
              icono="package-variant-closed"
              titulo="Todavía no publicaste repuestos"
              mensaje="Publicá tu primer repuesto para que aparezca en el catálogo."
              accion={
                <Button mode="contained" icon="plus" onPress={abrirNuevo}>
                  Publicar repuesto
                </Button>
              }
            />
          ) : (
            <View style={styles.lista}>
              {productos.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => abrirEditar(p)}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${p.nombre}`}
                  style={({ pressed }) => [styles.tarjeta, pressed && styles.tarjetaPresionada]}
                >
                  <View style={styles.miniatura}>
                    {p.imagenes[0] ? (
                      <Image
                        source={{ uri: p.imagenes[0] }}
                        style={styles.imagen}
                        contentFit="cover"
                        transition={150}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="image-off-outline"
                        size={22}
                        color={colors.textFaint}
                      />
                    )}
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.nombre} variant="titleSmall" numberOfLines={1}>
                      {p.nombre}
                    </Text>
                    <Text style={styles.meta} variant="bodySmall" numberOfLines={1}>
                      {nombreTipo(p.tipo_id)} · {etiquetaCondicion(p.condicion)}
                    </Text>
                    <View style={styles.precioFila}>
                      <Text style={styles.precio} variant="titleSmall">
                        {money(p.precio)}
                      </Text>
                      <Text
                        style={[styles.stock, p.stock === 0 && styles.stockAgotado]}
                        variant="bodySmall"
                      >
                        {p.stock === 0 ? 'Agotado' : `${p.stock} en stock`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.estado}>
                    <View style={[styles.pastilla, p.activo ? styles.pastillaActiva : styles.pastillaInactiva]}>
                      <Text style={styles.pastillaTexto} variant="labelSmall">
                        {p.activo ? 'Activo' : 'Pausado'}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={colors.textFaint}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.lg, gap: spacing.lg },

  cabecera: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cabeceraTexto: { flex: 1, gap: 2 },
  titulo: { color: colors.text },
  subtitulo: { color: colors.textMuted },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerTexto: { color: colors.textMuted, flex: 1, lineHeight: 18 },

  muted: { color: colors.textMuted },

  lista: { gap: spacing.md },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  tarjetaPresionada: { borderColor: colors.primary },

  miniatura: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagen: { width: '100%', height: '100%' },

  info: { flex: 1, gap: 2 },
  nombre: { color: colors.text },
  meta: { color: colors.textFaint },
  precioFila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  precio: { color: colors.primaryLight },
  stock: { color: colors.textMuted },
  stockAgotado: { color: colors.danger },

  estado: { alignItems: 'flex-end', gap: spacing.xs },
  pastilla: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
  },
  pastillaActiva: { borderColor: colors.primary, backgroundColor: colors.surface },
  pastillaInactiva: { borderColor: colors.border, backgroundColor: colors.surface },
  pastillaTexto: { color: colors.textMuted, fontSize: fontSize.xs, textTransform: 'uppercase' },
});
