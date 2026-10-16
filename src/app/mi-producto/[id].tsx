import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  Dialog,
  IconButton,
  Portal,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import { useTipos } from '@/hooks/useTipos';
import { CONDICIONES, type Condicion } from '@/lib/constants';
import {
  actualizarProducto,
  buscarCompatibilidadDeProducto,
  buscarProductoBase,
  crearProducto,
  eliminarProducto,
  leerError,
  reemplazarCompatibilidad,
  subirImagenProducto,
  type CompatibilidadEntrada,
  type ProductoEntrada,
} from '@/lib/queries';
import { colors, radius, spacing } from '@/theme';

/** Fila de compatibilidad mientras se edita (los años son texto hasta guardar). */
type FilaCompat = {
  marca: string;
  modelo: string;
  anio_desde: string;
  anio_hasta: string;
};

const filaVacia = (): FilaCompat => ({ marca: '', modelo: '', anio_desde: '', anio_hasta: '' });

/**
 * Alta y edición de un repuesto de la tienda.
 *
 * `id === 'nuevo'` es alta. Al guardar, la compatibilidad se reemplaza entera
 * (borrar + insertar), que es lo más simple para editar una lista.
 */
export default function PantallaMiProducto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const esNuevo = id === 'nuevo';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { esMovil } = useResponsive();
  const { usuario, tienda, cargando: cargandoSesion } = useSesion();
  const { categorias, tipos, cargando: cargandoTipos } = useTipos();

  // --- estado del formulario ---
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('0');
  const [condicion, setCondicion] = useState<Condicion>('nuevo');
  const [activo, setActivo] = useState(true);
  const [imagenes, setImagenes] = useState<string[]>([]);
  // fotos elegidas del teléfono, todavía sin subir (se suben al guardar)
  const [nuevas, setNuevas] = useState<{ uri: string; mimeType: string | null }[]>([]);
  const [compat, setCompat] = useState<FilaCompat[]>([]);

  const [cargando, setCargando] = useState(!esNuevo);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  const esTienda = usuario?.rol === 'tienda';

  // --- cargar el producto a editar ---
  useEffect(() => {
    if (esNuevo || !id) return;

    let vigente = true;

    Promise.all([buscarProductoBase(id), buscarCompatibilidadDeProducto(id)])
      .then(([p, comp]) => {
        if (!vigente) return;
        if (!p) {
          setError('No encontramos ese repuesto.');
          return;
        }
        setNombre(p.nombre);
        setDescripcion(p.descripcion ?? '');
        setCategoriaId(p.categoria_id);
        setTipoId(p.tipo_id);
        setPrecio(String(p.precio));
        setStock(String(p.stock));
        setCondicion(p.condicion);
        setActivo(p.activo);
        setImagenes(p.imagenes ?? []);
        setCompat(
          comp.map((c) => ({
            marca: c.marca,
            modelo: c.modelo,
            anio_desde: String(c.anio_desde),
            anio_hasta: String(c.anio_hasta),
          })),
        );
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
  }, [id, esNuevo]);

  const tiposDeCategoria = tipos.filter((t) => t.categoria_id === categoriaId);

  const elegirCategoria = (nuevoId: string) => {
    setCategoriaId(nuevoId);
    setTipoId('');
  };

  // --- compatibilidad ---
  const setFila = (indice: number, campo: keyof FilaCompat, valor: string) => {
    setCompat((filas) => filas.map((f, i) => (i === indice ? { ...f, [campo]: valor } : f)));
  };
  const agregarCompat = () => setCompat((filas) => [...filas, filaVacia()]);
  const quitarCompat = (indice: number) =>
    setCompat((filas) => filas.filter((_, i) => i !== indice));

  // --- imágenes ---
  const setImagen = (indice: number, valor: string) =>
    setImagenes((urls) => urls.map((u, i) => (i === indice ? valor : u)));
  const agregarImagen = () => setImagenes((urls) => [...urls, '']);
  const quitarImagen = (indice: number) =>
    setImagenes((urls) => urls.filter((_, i) => i !== indice));

  const quitarNueva = (indice: number) =>
    setNuevas((fotos) => fotos.filter((_, i) => i !== indice));

  /** Abre la galería y agrega las fotos elegidas a la lista de "por subir". */
  const elegirFotos = async () => {
    setAviso(null);
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        setAviso('Necesitamos permiso para ver tus fotos. Activalo en los ajustes del teléfono.');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
      });

      if (resultado.canceled) return;

      const elegidas = resultado.assets.map((a) => ({
        uri: a.uri,
        mimeType: a.mimeType ?? null,
      }));
      setNuevas((fotos) => [...fotos, ...elegidas]);
    } catch (e: unknown) {
      setAviso(leerError(e));
    }
  };

  // --- validación ---
  const validar = (): string | null => {
    if (nombre.trim().length < 3) return 'El nombre tiene que tener al menos 3 caracteres.';
    if (!categoriaId) return 'Elegí una categoría.';
    if (!tipoId) return 'Elegí un tipo de repuesto.';

    const precioNum = Number(precio.replace(',', '.'));
    if (!Number.isFinite(precioNum) || precioNum <= 0) return 'El precio tiene que ser mayor que 0.';

    const stockNum = Number.parseInt(stock, 10);
    if (!Number.isInteger(stockNum) || stockNum < 0) return 'El stock tiene que ser 0 o más.';

    for (const url of imagenes) {
      const limpia = url.trim();
      if (limpia && !/^https?:\/\//i.test(limpia)) {
        return 'Las imágenes tienen que ser una URL que empiece con http(s)://.';
      }
    }

    for (const f of compat) {
      if (!f.marca.trim() || !f.modelo.trim()) {
        return 'Cada compatibilidad necesita marca y modelo (o borrá la fila vacía).';
      }
      const d = Number.parseInt(f.anio_desde, 10);
      const h = Number.parseInt(f.anio_hasta, 10);
      if (!Number.isInteger(d) || !Number.isInteger(h) || d < 1900 || h > 2100 || h < d) {
        return `Años inválidos en "${f.marca} ${f.modelo}" (1900–2100 y hasta ≥ desde).`;
      }
    }

    return null;
  };

  const guardar = async () => {
    if (!tienda) return;

    const problema = validar();
    if (problema) {
      setAviso(problema);
      return;
    }

    setGuardando(true);
    setAviso(null);

    const entrada: ProductoEntrada = {
      categoria_id: categoriaId,
      tipo_id: tipoId,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      precio: Number(precio.replace(',', '.')),
      stock: Number.parseInt(stock, 10),
      condicion,
      imagenes: imagenes.map((u) => u.trim()).filter(Boolean),
      activo,
    };

    const filasCompat: CompatibilidadEntrada[] = compat.map((f) => ({
      marca: f.marca.trim(),
      modelo: f.modelo.trim(),
      anio_desde: Number.parseInt(f.anio_desde, 10),
      anio_hasta: Number.parseInt(f.anio_hasta, 10),
    }));

    try {
      let productoId = id;
      if (esNuevo) {
        const creado = await crearProducto(tienda.id, entrada);
        productoId = creado.id;
      } else {
        await actualizarProducto(id as string, entrada);
      }

      // Subimos las fotos del teléfono al bucket y las sumamos a las URLs.
      if (nuevas.length > 0) {
        const subidas = await Promise.all(
          nuevas.map((foto) => subirImagenProducto(productoId as string, foto)),
        );
        await actualizarProducto(productoId as string, {
          imagenes: [...entrada.imagenes, ...subidas],
        });
      }

      await reemplazarCompatibilidad(productoId as string, filasCompat);
      router.back();
    } catch (e: unknown) {
      setAviso(leerError(e));
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async () => {
    setConfirmarBorrar(false);
    setGuardando(true);
    setAviso(null);
    try {
      await eliminarProducto(id as string);
      router.back();
    } catch (e: unknown) {
      setAviso(
        `${leerError(e)} — Si el repuesto ya tiene pedidos no se puede borrar: pausalo en vez de eliminarlo.`,
      );
    } finally {
      setGuardando(false);
    }
  };

  const bloqueado = guardando || cargandoSesion || cargandoTipos;

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.contenido,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
        >
          <Text style={styles.titulo} variant={esMovil ? 'headlineSmall' : 'headlineMedium'}>
            {esNuevo ? 'Publicar repuesto' : 'Editar repuesto'}
          </Text>

          {aviso ? (
            <View style={styles.aviso}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.avisoTexto} variant="bodySmall">
                {aviso}
              </Text>
            </View>
          ) : null}

          {cargandoSesion || cargando ? (
            <Text style={styles.muted} variant="bodyMedium">
              Cargando…
            </Text>
          ) : error ? (
            <EmptyState icono="alert-circle-outline" titulo="No pudimos abrir el repuesto" mensaje={error} />
          ) : !usuario || !esTienda || !tienda ? (
            <EmptyState
              icono="storefront-outline"
              titulo="Solo para tiendas"
              mensaje="Necesitás una cuenta de tienda para publicar repuestos."
            />
          ) : (
            <>
              {!tienda.aprobada ? (
                <View style={styles.banner}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color={colors.warning} />
                  <Text style={styles.bannerTexto} variant="bodySmall">
                    Tu tienda todavía no está aprobada: no vas a poder publicar hasta que un
                    administrador la apruebe.
                  </Text>
                </View>
              ) : null}

              {/* ---------------- datos básicos ---------------- */}
              <Seccion titulo="Datos del repuesto">
                <TextInput
                  label="Nombre"
                  value={nombre}
                  onChangeText={setNombre}
                  mode="outlined"
                  placeholder="Ej: Pastillas de freno delanteras"
                />
                <TextInput
                  label="Descripción (opcional)"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                />
              </Seccion>

              {/* ---------------- categoría y tipo ---------------- */}
              <Seccion titulo="Vehículo">
                <Text style={styles.etiqueta} variant="labelMedium">
                  Categoría
                </Text>
                <View style={styles.chips}>
                  {categorias.map((c) => (
                    <Chip
                      key={c.id}
                      selected={categoriaId === c.id}
                      onPress={() => elegirCategoria(c.id)}
                      disabled={bloqueado}
                    >
                      {c.nombre}
                    </Chip>
                  ))}
                </View>

                <Text style={styles.etiqueta} variant="labelMedium">
                  Tipo de repuesto
                </Text>
                {!categoriaId ? (
                  <Text style={styles.muted} variant="bodySmall">
                    Elegí primero una categoría.
                  </Text>
                ) : tiposDeCategoria.length === 0 ? (
                  <Text style={styles.muted} variant="bodySmall">
                    Esa categoría no tiene tipos cargados.
                  </Text>
                ) : (
                  <View style={styles.chips}>
                    {tiposDeCategoria.map((t) => (
                      <Chip
                        key={t.id}
                        selected={tipoId === t.id}
                        onPress={() => setTipoId(t.id)}
                        disabled={bloqueado}
                      >
                        {t.nombre}
                      </Chip>
                    ))}
                  </View>
                )}
              </Seccion>

              {/* ---------------- precio, stock, condición ---------------- */}
              <Seccion titulo="Precio y stock">
                <View style={styles.dosColumnas}>
                  <TextInput
                    label="Precio (RD$)"
                    value={precio}
                    onChangeText={setPrecio}
                    mode="outlined"
                    keyboardType="decimal-pad"
                    style={styles.mitad}
                  />
                  <TextInput
                    label="Stock"
                    value={stock}
                    onChangeText={setStock}
                    mode="outlined"
                    keyboardType="number-pad"
                    style={styles.mitad}
                  />
                </View>

                <Text style={styles.etiqueta} variant="labelMedium">
                  Condición
                </Text>
                <View style={styles.chips}>
                  {CONDICIONES.map((c) => (
                    <Chip
                      key={c.clave}
                      selected={condicion === c.clave}
                      onPress={() => setCondicion(c.clave)}
                      disabled={bloqueado}
                    >
                      {c.etiqueta}
                    </Chip>
                  ))}
                </View>

                <View style={styles.switchFila}>
                  <View style={styles.switchTexto}>
                    <Text style={styles.nombreSwitch} variant="bodyMedium">
                      Publicado
                    </Text>
                    <Text style={styles.muted} variant="bodySmall">
                      {activo ? 'Aparece en el catálogo.' : 'Queda pausado, oculto al público.'}
                    </Text>
                  </View>
                  <Switch value={activo} onValueChange={setActivo} disabled={bloqueado} />
                </View>
              </Seccion>

              {/* ---------------- imágenes ---------------- */}
              <Seccion titulo="Imágenes">
                <Text style={styles.muted} variant="bodySmall">
                  Subí fotos desde el teléfono (hasta 5 por vez) o pegá el enlace de una imagen
                  (https://…). Las fotos del teléfono se suben cuando guardás.
                </Text>

                {nuevas.length > 0 || imagenes.some((u) => u.trim()) ? (
                  <View style={styles.miniaturas}>
                    {nuevas.map((foto, i) => (
                      <View key={`nueva-${foto.uri}-${i}`} style={styles.miniatura}>
                        <Image
                          source={{ uri: foto.uri }}
                          style={styles.miniaturaImagen}
                          contentFit="cover"
                        />
                        <IconButton
                          icon="close-circle"
                          size={18}
                          iconColor={colors.danger}
                          style={styles.miniaturaQuitar}
                          onPress={() => quitarNueva(i)}
                          disabled={bloqueado}
                        />
                      </View>
                    ))}

                    {imagenes.map((url, i) =>
                      url.trim() ? (
                        <View key={`remota-${i}`} style={styles.miniatura}>
                          <Image
                            source={{ uri: url.trim() }}
                            style={styles.miniaturaImagen}
                            contentFit="cover"
                          />
                          <IconButton
                            icon="close-circle"
                            size={18}
                            iconColor={colors.danger}
                            style={styles.miniaturaQuitar}
                            onPress={() => quitarImagen(i)}
                            disabled={bloqueado}
                          />
                        </View>
                      ) : null,
                    )}
                  </View>
                ) : null}

                <Button
                  mode="outlined"
                  compact
                  icon="image-plus"
                  onPress={() => void elegirFotos()}
                  disabled={bloqueado}
                >
                  Subir fotos del teléfono
                </Button>

                {imagenes.map((url, i) => (
                  <View key={i} style={styles.filaEditor}>
                    <TextInput
                      label={`Enlace ${i + 1}`}
                      value={url}
                      onChangeText={(t) => setImagen(i, t)}
                      mode="outlined"
                      autoCapitalize="none"
                      keyboardType="url"
                      style={styles.filaInput}
                    />
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => quitarImagen(i)}
                      disabled={bloqueado}
                    />
                  </View>
                ))}

                <Button mode="text" compact icon="link-plus" onPress={agregarImagen} disabled={bloqueado}>
                  Pegar enlace de imagen
                </Button>
              </Seccion>

              {/* ---------------- compatibilidad ---------------- */}
              <Seccion titulo="Compatibilidad">
                <Text style={styles.muted} variant="bodySmall">
                  Marcas y modelos con los que es compatible. Es lo que usa el buscador.
                </Text>

                {compat.map((f, i) => (
                  <View key={i} style={styles.compatFila}>
                    <View style={styles.dosColumnas}>
                      <TextInput
                        label="Marca"
                        value={f.marca}
                        onChangeText={(t) => setFila(i, 'marca', t)}
                        mode="outlined"
                        style={styles.mitad}
                      />
                      <TextInput
                        label="Modelo"
                        value={f.modelo}
                        onChangeText={(t) => setFila(i, 'modelo', t)}
                        mode="outlined"
                        style={styles.mitad}
                      />
                    </View>
                    <View style={styles.dosColumnas}>
                      <TextInput
                        label="Año desde"
                        value={f.anio_desde}
                        onChangeText={(t) => setFila(i, 'anio_desde', t)}
                        mode="outlined"
                        keyboardType="number-pad"
                        style={styles.mitad}
                      />
                      <TextInput
                        label="Año hasta"
                        value={f.anio_hasta}
                        onChangeText={(t) => setFila(i, 'anio_hasta', t)}
                        mode="outlined"
                        keyboardType="number-pad"
                        style={styles.mitad}
                      />
                    </View>
                    <Button
                      mode="text"
                      compact
                      icon="trash-can-outline"
                      textColor={colors.danger}
                      onPress={() => quitarCompat(i)}
                      disabled={bloqueado}
                    >
                      Quitar esta compatibilidad
                    </Button>
                  </View>
                ))}

                <Button mode="outlined" compact icon="plus" onPress={agregarCompat} disabled={bloqueado}>
                  Agregar compatibilidad
                </Button>
              </Seccion>

              {/* ---------------- acciones ---------------- */}
              <View style={styles.acciones}>
                <Button
                  mode="contained"
                  icon="content-save-outline"
                  onPress={() => void guardar()}
                  loading={guardando}
                  disabled={bloqueado}
                  contentStyle={styles.botonContenido}
                >
                  {esNuevo ? 'Publicar repuesto' : 'Guardar cambios'}
                </Button>

                {!esNuevo ? (
                  <Button
                    mode="outlined"
                    icon="trash-can-outline"
                    textColor={colors.danger}
                    onPress={() => setConfirmarBorrar(true)}
                    disabled={bloqueado}
                  >
                    Eliminar
                  </Button>
                ) : (
                  <Button mode="text" onPress={() => router.back()} disabled={guardando} icon="arrow-left">
                    Cancelar
                  </Button>
                )}
              </View>
            </>
          )}
        </ScrollView>

        <Portal>
          <Dialog visible={confirmarBorrar} onDismiss={() => setConfirmarBorrar(false)}>
            <Dialog.Title>¿Eliminar repuesto?</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">
                Se borra para siempre. Si ya tiene pedidos, la base no lo va a dejar; en ese caso
                pausalo (quitá “Publicado”).
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmarBorrar(false)}>Cancelar</Button>
              <Button textColor={colors.danger} onPress={() => void borrar()}>
                Eliminar
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </WebShell>
  );
}

/** Tarjeta con un título, para agrupar campos. */
function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo} variant="titleSmall">
        {titulo}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.lg, gap: spacing.lg },

  titulo: { color: colors.text },

  muted: { color: colors.textMuted },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  avisoTexto: { color: colors.text, flex: 1, lineHeight: 18 },

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

  seccion: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  seccionTitulo: { color: colors.text },

  etiqueta: { color: colors.textMuted, marginTop: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  dosColumnas: { flexDirection: 'row', gap: spacing.md },
  mitad: { flex: 1 },

  switchFila: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  switchTexto: { flex: 1, gap: 2 },
  nombreSwitch: { color: colors.text },

  filaEditor: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  filaInput: { flex: 1 },

  compatFila: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },

  miniaturas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  miniatura: { position: 'relative' },
  miniaturaImagen: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  miniaturaQuitar: { position: 'absolute', top: -10, right: -10, margin: 0 },

  acciones: { gap: spacing.sm, marginTop: spacing.xs },
  botonContenido: { minHeight: 48 },
});
