import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import { useVerificacionTienda } from '@/hooks/useVerificacionTienda';
import { enviarVerificacion, leerError, subirFotoVerificacion } from '@/lib/queries';
import { colors, fontSize, radius, spacing } from '@/theme';

/** Una foto elegida pero todavía sin subir. */
type Foto = { uri: string; mimeType?: string | null };

/**
 * ============================================================================
 *  Verificación de la tienda con fotos (fachada + interior)
 *
 *  Es OPCIONAL: no bloquea la aprobación de la tienda. Solo busca la insignia
 *  "Tienda verificada" en el catálogo. Las fotos se suben a un bucket PRIVADO
 *  (`verificacion`), visible solo para el dueño y el admin.
 * ============================================================================
 */
export default function PantallaVerificarTienda() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { esMovil } = useResponsive();
  const { usuario, tienda, cargando: cargandoSesion } = useSesion();
  const { verificacion, urlFachada, urlInterior, cargando, error, recargar } =
    useVerificacionTienda();

  const esTienda = usuario?.rol === 'tienda';

  const [fachada, setFachada] = useState<Foto | null>(null);
  const [interior, setInterior] = useState<Foto | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const estado = verificacion?.estado ?? 'sin_enviar';
  const verificada = estado === 'verificada';

  const elegirFoto = async (cual: 'fachada' | 'interior') => {
    setAviso(null);
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        setAviso('Necesitamos permiso para ver tus fotos. Activalo en los ajustes del teléfono.');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (resultado.canceled) return;

      const a = resultado.assets[0];
      const foto: Foto = { uri: a.uri, mimeType: a.mimeType ?? null };
      if (cual === 'fachada') setFachada(foto);
      else setInterior(foto);
    } catch (e: unknown) {
      setAviso(leerError(e));
    }
  };

  const enviar = async () => {
    if (!usuario || !fachada || !interior) return;
    setEnviando(true);
    setAviso(null);
    try {
      const rutaFachada = await subirFotoVerificacion(usuario.id, fachada);
      const rutaInterior = await subirFotoVerificacion(usuario.id, interior);
      await enviarVerificacion(rutaFachada, rutaInterior);
      setFachada(null);
      setInterior(null);
      setAviso('¡Listo! Mandamos tus fotos a revisión.');
      recargar();
    } catch (e: unknown) {
      setAviso(leerError(e));
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoSesion) {
    return (
      <WebShell>
        <View style={styles.pantalla}>
          <Text style={styles.muted} variant="bodyMedium">
            Cargando…
          </Text>
        </View>
      </WebShell>
    );
  }

  if (!esTienda || !tienda) {
    return (
      <WebShell>
        <View style={styles.pantallaCentrada}>
          <EmptyState
            icono="storefront-outline"
            titulo="Solo para tiendas"
            mensaje="Esta sección verifica tu tienda con fotos del local."
          />
        </View>
      </WebShell>
    );
  }

  // Previsualización: lo recién elegido o, si no hay nada nuevo, lo ya enviado.
  const previaFachada = fachada?.uri ?? urlFachada;
  const previaInterior = interior?.uri ?? urlInterior;

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
          <Text style={styles.titulo} variant={esMovil ? 'headlineMedium' : 'displaySmall'}>
            Verificar mi tienda
          </Text>
          <Text style={styles.subtitulo} variant="bodySmall">
            Subí una foto de la fachada y otra del interior (o de tu mercancía). Un
            administrador las revisa y le pone la insignia “Tienda verificada” a tu tienda.
          </Text>

          <Text style={styles.nota} variant="bodySmall">
            Es opcional: no hace falta para vender. Tus fotos son privadas; solo las ve el
            administrador.
          </Text>

          {/* ---------------- estado actual ---------------- */}
          {cargando ? (
            <Text style={styles.muted} variant="bodyMedium">
              Cargando estado…
            </Text>
          ) : error ? (
            <EmptyState
              icono="alert-circle-outline"
              titulo="No pudimos cargar el estado"
              mensaje={error}
              accion={
                <Button mode="outlined" onPress={recargar}>
                  Reintentar
                </Button>
              }
            />
          ) : (
            <TarjetaEstado estado={estado} notaRechazo={verificacion?.nota_rechazo ?? null} />
          )}

          {/* ---------------- fotos ---------------- */}
          {!verificada && !cargando ? (
            <View style={styles.grupo}>
              <Text style={styles.grupoTitulo} variant="titleSmall">
                Tus fotos
              </Text>

              <BotonFoto
                etiqueta="Foto de la fachada"
                icono="storefront-outline"
                previa={previaFachada}
                onPress={() => void elegirFoto('fachada')}
                disabled={enviando}
              />
              <BotonFoto
                etiqueta="Foto del interior"
                icono="image-multiple-outline"
                previa={previaInterior}
                onPress={() => void elegirFoto('interior')}
                disabled={enviando}
              />

              <Button
                mode="contained"
                icon="send-check-outline"
                onPress={() => void enviar()}
                loading={enviando}
                disabled={enviando || !fachada || !interior}
              >
                Enviar para verificación
              </Button>

              {!fachada || !interior ? (
                <Text style={styles.muted} variant="bodySmall">
                  Elegí las dos fotos para poder enviarlas.
                </Text>
              ) : null}
            </View>
          ) : null}

          {verificada ? (
            <View style={styles.grupo}>
              <Text style={styles.grupoTitulo} variant="titleSmall">
                Tus fotos enviadas
              </Text>
              <BotonFoto
                etiqueta="Fachada"
                icono="storefront-outline"
                previa={previaFachada}
                onPress={() => undefined}
                disabled
              />
              <BotonFoto
                etiqueta="Interior"
                icono="image-multiple-outline"
                previa={previaInterior}
                onPress={() => undefined}
                disabled
              />
              <Button mode="outlined" icon="arrow-left" onPress={() => router.back()}>
                Volver
              </Button>
            </View>
          ) : null}
        </ScrollView>
      </View>

      <Snackbar visible={aviso !== null} onDismiss={() => setAviso(null)} duration={4000}>
        {aviso ?? ''}
      </Snackbar>
    </WebShell>
  );
}

/** Cartel con el estado de la verificación. */
function TarjetaEstado({
  estado,
  notaRechazo,
}: {
  estado: string;
  notaRechazo: string | null;
}) {
  const config: Record<
    string,
    { icono: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string; titulo: string; texto: string }
  > = {
    sin_enviar: {
      icono: 'shield-outline',
      color: colors.textMuted,
      titulo: 'Todavía sin verificar',
      texto: 'Subí las fotos y mandalas a revisión cuando quieras.',
    },
    enviada: {
      icono: 'clock-outline',
      color: colors.warning,
      titulo: 'En revisión',
      texto: 'Recibimos tus fotos. Un administrador las va a revisar pronto.',
    },
    verificada: {
      icono: 'check-decagram',
      color: colors.primaryLight,
      titulo: 'Tienda verificada',
      texto: 'Tu tienda ya tiene la insignia “Verificada” en el catálogo. ¡Gracias!',
    },
    rechazada: {
      icono: 'close-circle-outline',
      color: colors.danger,
      titulo: 'Verificación rechazada',
      texto: notaRechazo
        ? `Motivo: ${notaRechazo}`
        : 'No pudimos verificar tus fotos. Subilas de nuevo, más claras.',
    },
  };

  const c = config[estado] ?? config.sin_enviar;

  return (
    <View style={[styles.tarjetaEstado, { borderColor: c.color }]}>
      <MaterialCommunityIcons name={c.icono} size={22} color={c.color} />
      <View style={styles.tarjetaEstadoTexto}>
        <Text style={styles.estadoTitulo} variant="titleSmall">
          {c.titulo}
        </Text>
        <Text style={styles.muted} variant="bodySmall">
          {c.texto}
        </Text>
      </View>
    </View>
  );
}

/** Botón grande con previsualización de la foto elegida. */
function BotonFoto({
  etiqueta,
  icono,
  previa,
  onPress,
  disabled,
}: {
  etiqueta: string;
  icono: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  previa: string | null;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.fotoContenedor}>
      <View style={styles.fotoPrevia}>
        {previa ? (
          <Image source={{ uri: previa }} style={styles.foto} contentFit="cover" />
        ) : (
          <MaterialCommunityIcons name={icono} size={30} color={colors.textFaint} />
        )}
      </View>
      <View style={styles.fotoLado}>
        <Text style={styles.fotoEtiqueta} variant="bodyMedium">
          {etiqueta}
        </Text>
        <Button
          mode="outlined"
          compact
          icon={previa ? 'camera-retake-outline' : 'camera-outline'}
          onPress={onPress}
          disabled={disabled}
        >
          {previa ? 'Cambiar' : 'Elegir'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  pantallaCentrada: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  contenido: { padding: spacing.lg, gap: spacing.md },

  titulo: { color: colors.text },
  subtitulo: { color: colors.textMuted, lineHeight: 18 },
  nota: { color: colors.textFaint, lineHeight: 16 },
  muted: { color: colors.textMuted },

  grupo: { gap: spacing.sm, marginTop: spacing.sm },
  grupoTitulo: { color: colors.text },

  tarjetaEstado: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  tarjetaEstadoTexto: { flex: 1, gap: 2 },
  estadoTitulo: { color: colors.text },

  fotoContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  fotoPrevia: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  foto: { width: '100%', height: '100%' },
  fotoLado: { flex: 1, gap: spacing.xs, alignItems: 'flex-start' },
  fotoEtiqueta: { color: colors.text, fontSize: fontSize.md },
});
