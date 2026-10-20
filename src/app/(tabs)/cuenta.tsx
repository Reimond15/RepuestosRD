import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import { ETIQUETA_ROL } from '@/lib/constants';
import { PAGINAS_LEGALES } from '@/lib/legal';
import { isConfigured, supabase } from '@/lib/supabase';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import { useCarrito } from '@/store/carrito';
import { useUbicacion } from '@/store/ubicacion';
import { colors, spacing } from '@/theme';

type NombreIcono = ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function PantallaCuenta() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { esMovil } = useResponsive();
  const { usuario, tienda, cargando } = useSesion();
  const articulos = useCarrito((s) => s.lineas.reduce((acc, l) => acc + l.cantidad, 0));

  const { zona, lat, lng, localizar } = useUbicacion();
  const ubicado = lat !== null && lng !== null;
  const esTienda = usuario?.rol === 'tienda';

  const salir = () => {
    void supabase?.auth.signOut();
  };

  return (
    <WebShell>
      <View style={styles.pantalla}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contenido,
          {
            paddingTop: esMovil ? insets.top + spacing.md : spacing.xl,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
      >
        <Text style={styles.titulo} variant={esMovil ? 'headlineMedium' : 'displaySmall'}>
          Cuenta
        </Text>

        {/* ---------------- perfil ---------------- */}
        <View style={styles.tarjeta}>
          {cargando ? (
            <Text style={styles.muted} variant="bodyMedium">
              Cargando…
            </Text>
          ) : usuario ? (
            <>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto} variant="titleMedium">
                  {usuario.nombre.slice(0, 1).toUpperCase()}
                </Text>
              </View>

              <View style={styles.datos}>
                <Text style={styles.nombre} variant="titleMedium">
                  {usuario.nombre}
                </Text>
                <Text style={styles.muted} variant="bodySmall">
                  {usuario.email}
                </Text>
                <Text style={styles.rol} variant="labelSmall">
                  {esTienda ? `${ETIQUETA_ROL[usuario.rol]} · colaborador` : ETIQUETA_ROL[usuario.rol]}
                </Text>
              </View>

              <Button
                mode="outlined"
                compact
                icon="logout"
                onPress={salir}
                style={styles.botonSalir}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <View style={styles.fila}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto} variant="titleMedium">
                  ?
                </Text>
              </View>
              <View style={styles.datos}>
                <Text style={styles.nombre} variant="titleMedium">
                  No has iniciado sesión
                </Text>
                <Text style={styles.muted} variant="bodySmall">
                  Entrá para comprar, vender y ver tus pedidos
                </Text>
              </View>
            </View>
          )}

          {!cargando && !usuario ? (
            <Button
              mode="contained"
              icon="account-plus-outline"
              onPress={() => router.push('/ingresar')}
              style={styles.botonIngresar}
            >
              Ingresar / Crear cuenta
            </Button>
          ) : null}
        </View>

        {/* ---------------- estado de la tienda ---------------- */}
        {usuario?.rol === 'tienda' && tienda ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitulo} variant="titleSmall">
              {tienda.aprobada ? 'Tienda aprobada' : 'Cuenta pendiente de aprobación'}
            </Text>
            <Text style={styles.bannerTexto} variant="bodySmall">
              {tienda.aprobada
                ? 'Ya podés subir productos y recibir pedidos.'
                : 'Un administrador tiene que aprobar tu tienda antes de que puedas publicar productos.'}
            </Text>
          </View>
        ) : null}

        {/* ---------------- panel de la tienda ---------------- */}
        {esTienda && tienda ? (
          <Button
            mode="contained"
            icon="package-variant-closed"
            onPress={() => router.push('/mis-productos')}
          >
            Mis repuestos
          </Button>
        ) : null}

        {/* ---------------- acceso rápido ---------------- */}
        <View style={styles.tarjeta}>
          <Fila icono="shopping-outline" texto="Carrito" valor={`${articulos} artículos`} />
          <Fila
            icono="map-marker-outline"
            texto="Zona de entrega"
            valor={zona ?? (ubicado ? 'Sin datos' : 'Tocá en Inicio')}
          />
          <Fila icono="cash" texto="Formas de pago" valor="Efectivo, transferencia" />
        </View>

        {zona ? null : (
          <Button
            mode="text"
            compact
            icon="crosshairs-gps"
            onPress={() => {
              void localizar();
            }}
          >
            Usar mi ubicación actual
          </Button>
        )}

        {/* ---------------- legal ---------------- */}
        <View style={styles.tarjeta}>
          <Text style={styles.legalTitulo} variant="titleSmall">
            Legal
          </Text>
          {PAGINAS_LEGALES.map((p) => (
            <Pressable
              key={p.ruta}
              onPress={() => router.push(p.ruta)}
              accessibilityRole="link"
              accessibilityLabel={p.titulo}
              style={({ pressed }) => [styles.legalFila, pressed && styles.legalPresionado]}
            >
              <MaterialCommunityIcons
                name={p.icono as NombreIcono}
                size={20}
                color={colors.primaryLight}
              />
              <Text style={styles.legalTexto} variant="bodyMedium">
                {p.titulo}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.textFaint}
              />
            </Pressable>
          ))}
        </View>

        {/* ---------------- eliminar cuenta (requisito de Google Play) ---------------- */}
        {usuario ? (
          <Button
            mode="text"
            textColor={colors.danger}
            icon="account-remove-outline"
            onPress={() => router.push('/eliminar-cuenta')}
            accessibilityLabel="Eliminar mi cuenta y mis datos"
          >
            Eliminar mi cuenta
          </Button>
        ) : null}

        {/* ---------------- administración (solo admin) ---------------- */}
        {usuario?.rol === 'admin' ? (
          <View style={styles.adminContenedor}>
            <Button
              mode="outlined"
              icon="store-check-outline"
              onPress={() => router.push('/admin/tiendas')}
            >
              Administrar tiendas
            </Button>
            <Button
              mode="outlined"
              icon="shape-outline"
              onPress={() => router.push('/admin/tipos')}
            >
              Administrar tipos de repuesto
            </Button>
          </View>
        ) : null}

        {/* ---------------- placeholder etapas ---------------- */}
        {!usuario ? (
          <EmptyState
            icono="account-plus-outline"
            titulo="Entrá o creá tu cuenta"
            mensaje="Podés ver el catálogo sin cuenta, pero para comprar, vender y ver pedidos necesitás una."
          />
        ) : null}

        {!isConfigured ? (
          <Text style={styles.aviso} variant="bodySmall">
            Aviso: faltan las claves de Supabase, así que la sesión siempre va a aparecer
            cerrada. Ver SUPABASE-PASO-A-PASO.md.
          </Text>
        ) : null}
      </ScrollView>
      </View>
    </WebShell>
  );
}

function Fila({ icono, texto, valor }: { icono: NombreIcono; texto: string; valor: string }) {
  return (
    <View style={styles.filaSimple}>
      <MaterialCommunityIcons name={icono} size={20} color={colors.textMuted} />
      <Text style={styles.filaTexto} variant="bodyMedium">
        {texto}
      </Text>
      <Text style={styles.filaValor} variant="bodySmall">
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: { paddingHorizontal: spacing.lg, gap: spacing.md },

  titulo: { color: colors.text, marginBottom: spacing.xs },

  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },

  fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  filaSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 40,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: colors.black, fontWeight: '700' },

  datos: { flex: 1, gap: 2 },
  nombre: { color: colors.text },
  muted: { color: colors.textMuted },
  rol: {
    color: colors.primaryLight,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  botonIngresar: { marginTop: spacing.xs },
  botonSalir: { alignSelf: 'flex-start' },

  adminContenedor: { gap: spacing.sm },

  banner: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
    gap: 4,
  },
  bannerTitulo: { color: colors.warning },
  bannerTexto: { color: colors.textMuted, lineHeight: 18 },

  filaTexto: { color: colors.text, flex: 1 },
  filaValor: { color: colors.textFaint, textAlign: 'right' },

  legalTitulo: { color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  legalFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 40,
    borderRadius: 8,
  },
  legalPresionado: { opacity: 0.6 },
  legalTexto: { color: colors.text, flex: 1 },

  aviso: {
    color: colors.textFaint,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
