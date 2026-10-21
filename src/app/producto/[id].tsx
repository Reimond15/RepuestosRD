import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ReportarModal } from '@/components/ReportarModal';
import { Stars } from '@/components/Stars';
import { WebShell } from '@/components/WebShell';
import { useResenas } from '@/hooks/useResenas';
import { useSesion } from '@/hooks/useSesion';
import { buscarProductoPorId, compatibilidadATexto, crearReporte, leerError } from '@/lib/queries';
import { CATEGORIAS, etiquetaCondicion } from '@/lib/constants';
import { money, recortar } from '@/lib/format';
import { aCoordenadas, distanciaDeFila, distanciaTexto, urlMapa } from '@/lib/geo';
import { useCarrito } from '@/store/carrito';
import { useUbicacion } from '@/store/ubicacion';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { MotivoReporte } from '@/types/database';

/**
 * Detalle de un producto del catálogo público + "Agregar al carrito".
 */
const fechaResena = (iso: string) =>
  new Date(iso).toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function PantallaProducto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { usuario } = useSesion();
  const agregar = useCarrito((s) => s.agregar);
  const { estado: estadoUbicacion, lat, lng, localizar } = useUbicacion();
  const { resenas, cargando: cargandoResenas } = useResenas(id ?? null);

  const [producto, setProducto] = useState<Awaited<ReturnType<typeof buscarProductoPorId>>>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [falloImagen, setFalloImagen] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [aviso, setAviso] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [reportarAbierto, setReportarAbierto] = useState(false);
  const [avisoReporte, setAvisoReporte] = useState<string | null>(null);

  const faltaId = !id;

  useEffect(() => {
    if (!id) return;

    let vigente = true;

    buscarProductoPorId(id)
      .then((p) => {
        if (!vigente) return;
        setProducto(p);
        setFalloImagen(false);
        if (!p) setError('No encontramos ese producto.');
      })
      .catch((e: unknown) => {
        if (vigente) setError(leerError(e));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [id, intento]);

  const reintentar = () => {
    setCargando(true);
    setError(null);
    setIntento((n) => n + 1);
  };

  const imagen = producto?.imagenes?.find((u) => !!u);
  const sinImagen = !imagen || falloImagen;
  const emoji =
    CATEGORIAS.find((c) => c.nombre === producto?.categoria)?.icono ?? '🔧';
  const agotado = typeof producto?.stock === 'number' && producto.stock <= 0;
  const compatibilidad = compatibilidadATexto(producto?.compatibilidad ?? null);

  const posElegida = aCoordenadas(lat, lng);
  const kmTienda =
    posElegida && producto ? distanciaDeFila(producto, posElegida) : null;
  const urlMapaTienda = producto
    ? urlMapa(
        producto.tienda_lat ?? null,
        producto.tienda_lng ?? null,
        producto.tienda_direccion ?? null,
      )
    : null;

  const alAgregar = () => {
    if (!producto) return;
    const mensaje = agregar(
      {
        producto_id: producto.producto_id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: imagen ?? null,
        tienda_id: producto.tienda_id,
        tienda: producto.tienda,
        stock: producto.stock,
      },
      cantidad,
    );
    // null = todo bien
    setAviso(mensaje ?? 'Agregado al carrito ✔');
  };

  const abrirReporte = () => {
    if (!usuario) {
      router.push('/ingresar');
      return;
    }
    setReportarAbierto(true);
  };

  const enviarReporte = async (motivo: MotivoReporte, detalle: string) => {
    if (!usuario || !producto) return;

    await crearReporte({
      reportanteId: usuario.id,
      tipo: 'producto',
      motivo,
      detalle,
      productoId: producto.producto_id,
      tiendaId: producto.tienda_id,
    });

    setAvisoReporte('Gracias. Vamos a revisar este producto.');
  };

  return (
    <WebShell>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenido}
      >
        {cargando ? (
          <View style={styles.centrado}>
            <Text style={styles.muted} variant="bodyMedium">
              Cargando…
            </Text>
          </View>
        ) : error || faltaId ? (
          <View style={styles.centrado}>
            <Text style={styles.error} variant="bodyMedium">
              {error ?? 'No encontramos ese producto.'}
            </Text>
            {error ? (
              <Button mode="outlined" onPress={reintentar} style={styles.botonReintentar}>
                Reintentar
              </Button>
            ) : null}
          </View>
        ) : producto ? (
          <>
            {/* ---------- imagen ---------- */}
            <View style={styles.imagenBox}>
              {sinImagen ? (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderEmoji}>{emoji}</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: imagen! }}
                  style={styles.imagen}
                  contentFit="cover"
                  transition={200}
                  onError={() => setFalloImagen(true)}
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
              <View style={styles.filaTienda}>
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={14}
                  color={colors.textFaint}
                />
                <Text style={styles.tienda} variant="bodySmall">
                  {producto.tienda}
                </Text>
                {producto.tienda_verificada ? (
                  <View style={styles.insigniaTienda}>
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={14}
                      color={colors.primaryLight}
                    />
                    <Text style={styles.insigniaTiendaTexto} variant="labelSmall">
                      Verificada
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text variant="headlineSmall" style={styles.nombre}>
                {producto.nombre}
              </Text>

              <View style={styles.filaEstrellas}>
                <Stars
                  promedio={producto.promedio_estrellas}
                  total={producto.total_calificaciones ?? 0}
                  size={15}
                />
              </View>

              <View style={styles.filaPrecio}>
                <Text variant="headlineMedium" style={styles.precio}>
                  {money(producto.precio)}
                </Text>
                <Text style={styles.stock} variant="bodySmall">
                  {agotado
                    ? 'Sin stock'
                    : typeof producto.stock === 'number'
                      ? `Quedan ${producto.stock}`
                      : 'Disponible'}
                </Text>
              </View>

              {producto.descripcion ? (
                <Text style={styles.descripcion} variant="bodyMedium">
                  {producto.descripcion}
                </Text>
              ) : null}

              <View style={styles.etiquetas}>
                <View style={styles.chip}>
                  <Text style={styles.chipTexto} variant="labelSmall">
                    {producto.tipo}
                  </Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipTexto} variant="labelSmall">
                    {etiquetaCondicion(producto.condicion)}
                  </Text>
                </View>
                {producto.ofrece_delivery ? (
                  <View style={styles.chip}>
                    <Text style={styles.chipTexto} variant="labelSmall">
                      Delivery {money(producto.costo_delivery)} aparte
                    </Text>
                  </View>
                ) : null}
              </View>

              {compatibilidad.length > 0 ? (
                <View style={styles.compatibilidad}>
                  <Text style={styles.compatTitulo} variant="labelMedium">
                    Compatible con
                  </Text>
                  <View style={styles.compatLista}>
                    {compatibilidad.slice(0, 6).map((c) => (
                      <View key={c} style={styles.compatChip}>
                        <MaterialCommunityIcons
                          name="car-info"
                          size={12}
                          color={colors.primaryLight}
                        />
                        <Text style={styles.compatTexto} variant="bodySmall">
                          {recortar(c, 34)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* ---------- ubicación de la tienda ---------- */}
              <View style={styles.ubicacion}>
                <View style={styles.ubicacionCabecera}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={16}
                    color={colors.primaryLight}
                  />
                  <Text style={styles.ubicacionTitulo} variant="titleSmall">
                    Ubicación de la tienda
                  </Text>
                </View>

                <Text style={styles.ubicacionDireccion} variant="bodyMedium">
                  {(producto.zonas ?? []).length > 0
                    ? producto.zonas.join(' · ')
                    : producto.tienda}
                </Text>

                <Text style={styles.ubicacionNota} variant="bodySmall">
                  Por seguridad mostramos solo la zona aproximada. La dirección exacta
                  la comparte la tienda cuando confirma tu pedido.
                </Text>

                {posElegida ? (
                  kmTienda === null ? (
                    <Text style={styles.ubicacionNota} variant="bodySmall">
                      Esta tienda todavía no cargó su ubicación en el mapa.
                    </Text>
                  ) : (
                    <Text style={styles.ubicacionKm} variant="bodySmall">
                      Está a aproximadamente {distanciaTexto(kmTienda)} de ti (ubicación
                      estimada)
                    </Text>
                  )
                ) : (
                  <Button
                    mode="outlined"
                    icon="crosshairs-gps"
                    onPress={() => {
                      void localizar();
                    }}
                    style={styles.ubicacionBoton}
                  >
                    {estadoUbicacion === 'denegado'
                      ? 'Habilitá la ubicación para ver la distancia'
                      : 'Usar mi ubicación para ver la distancia'}
                  </Button>
                )}

                {urlMapaTienda ? (
                  <Button
                    mode="outlined"
                    icon="google-maps"
                    onPress={() => {
                      if (urlMapaTienda) void Linking.openURL(urlMapaTienda);
                    }}
                    style={styles.ubicacionBoton}
                  >
                    Ver zona en el mapa
                  </Button>
                ) : null}
              </View>

              {/* ---------- reseñas ---------- */}
              <View style={styles.resenas}>
                <View style={styles.resenasCabecera}>
                  <MaterialCommunityIcons
                    name="star-outline"
                    size={16}
                    color={colors.primaryLight}
                  />
                  <Text style={styles.resenasTitulo} variant="titleSmall">
                    Reseñas de compradores
                  </Text>
                  {!cargandoResenas && resenas.length > 0 ? (
                    <Text style={styles.resenasTotal} variant="bodySmall">
                      {resenas.length}
                    </Text>
                  ) : null}
                </View>

                {cargandoResenas ? (
                  <Text style={styles.resenaVacia} variant="bodySmall">
                    Cargando…
                  </Text>
                ) : resenas.length === 0 ? (
                  <Text style={styles.resenaVacia} variant="bodySmall">
                    Todavía no hay reseñas. ¡Comprá y sé el primero en opinar!
                  </Text>
                ) : (
                  resenas.map((r, i) => (
                    <View key={`${r.created_at}-${i}`} style={styles.resena}>
                      <View style={styles.resenaCabecera}>
                        <Stars promedio={r.estrellas} mostrarNumero={false} size={13} />
                        <Text style={styles.resenaFecha} variant="bodySmall">
                          {fechaResena(r.created_at)}
                        </Text>
                      </View>
                      {r.comentario ? (
                        <Text style={styles.resenaComentario} variant="bodyMedium">
                          {r.comentario}
                        </Text>
                      ) : (
                        <Text style={styles.resenaVacia} variant="bodySmall">
                          Sin comentario.
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </View>

              {/* ---------- agregar al carrito ---------- */}
              <View style={styles.comprar}>
                <View style={styles.stepper}>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => setCantidad((c) => Math.max(1, c - 1))}
                    accessibilityLabel="Bajar cantidad"
                  >
                    −
                  </Button>
                  <Text variant="titleMedium" style={styles.cantidad}>
                    {cantidad}
                  </Text>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() =>
                      setCantidad((c) =>
                        Math.min(agotado ? 1 : 99, c + 1, producto.stock || 1),
                      )
                    }
                    accessibilityLabel="Subir cantidad"
                  >
                    +
                  </Button>
                </View>

                <Button
                  mode="contained"
                  disabled={agotado}
                  onPress={alAgregar}
                  style={styles.botonAgregar}
                  contentStyle={styles.botonAgregarContenido}
                  icon="cart-plus"
                >
                  {agotado ? 'Agotado' : 'Agregar al carrito'}
                </Button>

                {aviso ? (
                  <Text
                    style={[
                      styles.aviso,
                      aviso.startsWith('Agregado') && styles.avisoBien,
                    ]}
                    variant="bodySmall"
                  >
                    {aviso}
                  </Text>
                ) : null}

                {aviso?.startsWith('Agregado') ? (
                  <Button
                    mode="text"
                    onPress={() => router.push('/carrito')}
                    icon="cart-outline"
                  >
                    Ver carrito
                  </Button>
                ) : null}

                <Text style={styles.notaDelivery} variant="bodySmall">
                  El costo del delivery se coordina con la tienda y se paga aparte
                  al recibir.
                </Text>
              </View>

              <Button
                mode="text"
                icon="flag-outline"
                onPress={abrirReporte}
                textColor={colors.textFaint}
                style={styles.reportar}
              >
                Reportar este producto
              </Button>
            </View>
          </>
        ) : null}
      </ScrollView>

      <ReportarModal
        visible={reportarAbierto}
        onDismiss={() => setReportarAbierto(false)}
        onEnviar={enviarReporte}
        titulo="Reportar producto"
        descripcion="Si este producto rompe las reglas (estafa, producto prohibido, fotos que no corresponden), avisanos. El reporte llega solo al equipo de RepuestosRD."
      />

      <Snackbar
        visible={avisoReporte !== null}
        onDismiss={() => setAvisoReporte(null)}
        duration={4500}
        style={styles.snackbar}
      >
        {avisoReporte ?? ''}
      </Snackbar>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  contenido: { paddingBottom: spacing.xxl },

  centrado: { padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  muted: { color: colors.textMuted },
  error: { color: colors.danger },
  botonReintentar: { marginTop: spacing.sm },

  imagenBox: { width: '100%', height: 280, backgroundColor: colors.surfaceAlt },
  imagen: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 72 },

  cintaAgotado: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  cintaTexto: { color: colors.white, fontSize: fontSize.sm, fontWeight: '700' },

  datos: { padding: spacing.lg, gap: spacing.md },

  filaTienda: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tienda: { color: colors.textMuted },
  insigniaTienda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  insigniaTiendaTexto: { color: colors.primaryLight },

  nombre: { color: colors.text },

  filaEstrellas: { flexDirection: 'row' },

  filaPrecio: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md },
  precio: { color: colors.primaryLight, fontWeight: '700' },
  stock: { color: colors.textFaint },

  descripcion: { color: colors.textMuted, lineHeight: 21 },

  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipTexto: { color: colors.textMuted, textTransform: 'capitalize' },

  compatibilidad: { gap: spacing.sm, marginTop: spacing.xs },
  compatTitulo: { color: colors.textMuted },
  compatLista: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  compatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  compatTexto: { color: colors.text },

  ubicacion: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  ubicacionCabecera: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ubicacionTitulo: { color: colors.text },
  ubicacionDireccion: { color: colors.textMuted },
  ubicacionNota: { color: colors.textFaint },
  ubicacionKm: { color: colors.primaryLight, fontWeight: '600' },
  ubicacionBoton: { marginTop: spacing.xs, alignSelf: 'flex-start' },

  resenas: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  resenasCabecera: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resenasTitulo: { color: colors.text, flex: 1 },
  resenasTotal: { color: colors.textFaint },
  resena: {
    gap: 4,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resenaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  resenaFecha: { color: colors.textFaint },
  resenaComentario: { color: colors.textMuted, lineHeight: 20 },
  resenaVacia: { color: colors.textFaint },

  comprar: {
    marginTop: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cantidad: { color: colors.text, minWidth: 32, textAlign: 'center' },

  botonAgregar: { marginTop: spacing.xs },
  botonAgregarContenido: { minHeight: 48 },

  aviso: { color: colors.danger, textAlign: 'center' },
  avisoBien: { color: colors.success },

  notaDelivery: { color: colors.textFaint, textAlign: 'center' },

  reportar: { alignSelf: 'center', marginTop: spacing.sm },
  snackbar: { backgroundColor: colors.surfaceRaised },
});