import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import { useTipos } from '@/hooks/useTipos';
import { actualizarTipo, crearTipo, eliminarTipo, leerError } from '@/lib/queries';
import type { TipoConCategoria } from '@/types/database';
import { colors, radius, spacing } from '@/theme';

/**
 * Administración de los tipos de repuesto. Solo para el rol `admin`:
 * la RLS de `tipos_repuesto` (`tipos_write_admin`) rechaza el resto.
 *
 * Sirve para curar los datos: corregir nombres raros, borrar duplicados
 * (por ejemplo "Sistema de escape" junto a "Escape") y agregar los que
 * falten. Los tipos los usan los productos, así que no se puede borrar uno
 * que esté en uso (FK `on delete restrict`).
 */
export default function PantallaTiposRepuesto() {
  const insets = useSafeAreaInsets();
  const { esMovil } = useResponsive();
  const { usuario, cargando: cargandoSesion } = useSesion();
  const esAdmin = usuario?.rol === 'admin';

  const { tipos, categorias, cargando, error, recargar } = useTipos();

  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'error' | 'ok'; texto: string } | null>(null);
  const [borrando, setBorrando] = useState<TipoConCategoria | null>(null);

  // La primera categoría es el valor por defecto mientras el usuario no elige.
  const categoriaEfectiva = categoriaId || categorias[0]?.id || '';

  const limpiarFormulario = () => {
    setNombre('');
    setEditandoId(null);
  };

  const guardar = async () => {
    const limpio = nombre.trim();

    if (!limpio) {
      setAviso({ tipo: 'error', texto: 'Escribí el nombre del tipo.' });
      return;
    }
    if (!categoriaEfectiva) {
      setAviso({ tipo: 'error', texto: 'Elegí una categoría.' });
      return;
    }

    setGuardando(true);
    setAviso(null);

    try {
      if (editandoId) {
        await actualizarTipo(editandoId, categoriaEfectiva, limpio);
      } else {
        await crearTipo(categoriaEfectiva, limpio);
      }
      setAviso({
        tipo: 'ok',
        texto: editandoId ? `Se actualizó "${limpio}".` : `Se agregó "${limpio}".`,
      });
      limpiarFormulario();
      recargar();
    } catch (e: unknown) {
      setAviso({ tipo: 'error', texto: leerError(e) });
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (t: TipoConCategoria) => {
    setBorrando(null);
    setGuardando(true);
    setAviso(null);

    try {
      await eliminarTipo(t.id);
      setAviso({ tipo: 'ok', texto: `Se borró "${t.nombre}".` });
      if (editandoId === t.id) limpiarFormulario();
      recargar();
    } catch (e: unknown) {
      setAviso({ tipo: 'error', texto: leerError(e) });
    } finally {
      setGuardando(false);
    }
  };

  const empezarEdicion = (t: TipoConCategoria) => {
    setNombre(t.nombre);
    setCategoriaId(t.categoria_id);
    setEditandoId(t.id);
    setAviso(null);
  };

  if (!esAdmin) {
    return (
      <WebShell>
        <View style={styles.pantalla}>
          {cargandoSesion ? (
            <Text style={styles.muted} variant="bodyMedium">
              Cargando…
            </Text>
          ) : (
            <EmptyState
              icono="shield-account-outline"
              titulo="Solo administradores"
              mensaje="Esta pantalla administra los tipos de repuesto de toda la app."
            />
          )}
        </View>
      </WebShell>
    );
  }

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contenido,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.titulo} variant={esMovil ? 'headlineMedium' : 'displaySmall'}>
            Tipos de repuesto
          </Text>
          <Text style={styles.subtitulo} variant="bodySmall">
            Los tipos son las categorías finas con las que la tienda clasifica
            cada repuesto (Frenos, Baterías, Filtro de aceite…).
          </Text>

          {aviso ? (
            <View
              style={[
                styles.aviso,
                aviso.tipo === 'error' ? styles.avisoError : styles.avisoOk,
              ]}
            >
              <MaterialCommunityIcons
                name={aviso.tipo === 'error' ? 'alert-circle-outline' : 'check-circle-outline'}
                size={16}
                color={aviso.tipo === 'error' ? colors.danger : colors.primaryLight}
              />
              <Text style={styles.avisoTexto} variant="bodySmall">
                {aviso.texto}
              </Text>
            </View>
          ) : null}

          {/* ---------------- formulario ---------------- */}
          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaTitulo} variant="titleSmall">
              {editandoId ? 'Editar tipo' : 'Nuevo tipo'}
            </Text>

            <TextInput
              label="Nombre del tipo"
              value={nombre}
              onChangeText={setNombre}
              mode="outlined"
              placeholder="Ej.: Pastillas de freno"
            />

            <Text style={styles.etiqueta} variant="labelMedium">
              Categoría
            </Text>
            <View style={styles.chips}>
              {categorias.map((c) => (
                <Chip
                  key={c.id}
                  selected={c.id === categoriaEfectiva}
                  showSelectedCheck
                  onPress={() => setCategoriaId(c.id)}
                >
                  {c.nombre}
                </Chip>
              ))}
            </View>

            <View style={styles.botonesForm}>
              <Button
                mode="contained"
                icon={editandoId ? 'content-save-outline' : 'plus'}
                onPress={() => void guardar()}
                loading={guardando}
                disabled={guardando}
                style={styles.botonFlex}
              >
                {editandoId ? 'Guardar cambios' : 'Agregar'}
              </Button>
              {editandoId ? (
                <Button mode="outlined" onPress={limpiarFormulario} disabled={guardando}>
                  Cancelar
                </Button>
              ) : null}
            </View>
          </View>

          {/* ---------------- lista ---------------- */}
          {cargando ? (
            <Text style={styles.muted} variant="bodyMedium">
              Cargando tipos…
            </Text>
          ) : error ? (
            <EmptyState icono="alert-circle-outline" titulo="No pudimos cargar" mensaje={error} />
          ) : (
            categorias.map((c) => {
              const items = tipos.filter((t) => t.categoria_id === c.id);
              return (
                <View key={c.id} style={styles.grupo}>
                  <Text style={styles.grupoTitulo} variant="titleSmall">
                    {c.nombre} · {items.length}
                  </Text>
                  <View style={styles.lista}>
                    {items.length === 0 ? (
                      <Text style={styles.muted} variant="bodySmall">
                        Todavía no hay tipos en esta categoría.
                      </Text>
                    ) : (
                      items.map((t) => (
                        <View
                          key={t.id}
                          style={[styles.fila, editandoId === t.id && styles.filaEditando]}
                        >
                          <Text style={styles.filaNombre} variant="bodyMedium" numberOfLines={1}>
                            {t.nombre}
                          </Text>
                          <IconButton
                            icon="pencil-outline"
                            size={18}
                            onPress={() => empezarEdicion(t)}
                            accessibilityLabel={`Editar ${t.nombre}`}
                          />
                          <IconButton
                            icon="trash-can-outline"
                            size={18}
                            iconColor={colors.danger}
                            onPress={() => setBorrando(t)}
                            accessibilityLabel={`Borrar ${t.nombre}`}
                          />
                        </View>
                      ))
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      <Portal>
        <Dialog visible={borrando !== null} onDismiss={() => setBorrando(null)}>
          <Dialog.Title>Borrar tipo</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              ¿Seguro que querés borrar “{borrando?.nombre}”? No se puede si algún
              producto todavía lo usa.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setBorrando(null)}>Cancelar</Button>
            <Button
              textColor={colors.danger}
              onPress={() => {
                if (borrando) void borrar(borrando);
              }}
            >
              Borrar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.lg, gap: spacing.lg },

  titulo: { color: colors.text },
  subtitulo: { color: colors.textMuted, lineHeight: 18 },
  muted: { color: colors.textMuted },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  avisoError: { borderColor: colors.danger, backgroundColor: colors.surface },
  avisoOk: { borderColor: colors.primary, backgroundColor: colors.surface },
  avisoTexto: { color: colors.textMuted, flex: 1 },

  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tarjetaTitulo: { color: colors.text },
  etiqueta: { color: colors.textMuted },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  botonesForm: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  botonFlex: { flexGrow: 1 },

  grupo: { gap: spacing.sm },
  grupoTitulo: { color: colors.text, marginLeft: spacing.xs },
  lista: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    padding: spacing.xs,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingLeft: spacing.md,
    borderRadius: radius.md,
  },
  filaEditando: { backgroundColor: colors.surfaceAlt },
  filaNombre: { color: colors.text, flex: 1 },
});
