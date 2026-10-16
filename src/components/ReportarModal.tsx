import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors, radius, spacing } from '@/theme';
import type { MotivoReporte } from '@/types/database';

/** Motivos de reporte, en el orden en que se muestran. */
export const MOTIVOS_REPORTE: { valor: MotivoReporte; etiqueta: string }[] = [
  { valor: 'estafa', etiqueta: 'Estafa o fraude' },
  { valor: 'producto_prohibido', etiqueta: 'Producto prohibido o ilegal' },
  { valor: 'acoso', etiqueta: 'Acoso o amenazas' },
  { valor: 'contacto_fuera_de_la_app', etiqueta: 'Pide pagar o hablar por fuera de la app' },
  { valor: 'spam', etiqueta: 'Spam o publicidad' },
  { valor: 'otro', etiqueta: 'Otro motivo' },
];

type Props = {
  visible: boolean;
  onDismiss: () => void;
  /** Envía el reporte. La pantalla lo arma con el contexto (producto, pedido…). */
  onEnviar: (motivo: MotivoReporte, detalle: string) => Promise<void>;
  titulo?: string;
  descripcion?: string;
};

/**
 * ============================================================================
 *  Reportar contenido o usuario.
 *
 *  Google Play (política de contenido de usuarios) exige que la app tenga un
 *  sistema DENTRO de la app para reportar. Este es el formulario compartido:
 *  lo usa el detalle de un producto y el chat del pedido.
 * ============================================================================
 */
export function ReportarModal({
  visible,
  onDismiss,
  onEnviar,
  titulo = 'Reportar',
  descripcion,
}: Props) {
  const [motivo, setMotivo] = useState<MotivoReporte | null>(null);
  const [detalle, setDetalle] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    if (enviando) return;
    setMotivo(null);
    setDetalle('');
    setError(null);
    onDismiss();
  };

  const mandar = async () => {
    if (!motivo || enviando) return;

    setEnviando(true);
    setError(null);

    try {
      await onEnviar(motivo, detalle.trim());
      setMotivo(null);
      setDetalle('');
      onDismiss();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No pudimos enviar el reporte.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={cerrar} style={styles.dialogo}>
        <Dialog.Title>{titulo}</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContenido}>
            {descripcion ? (
              <Text variant="bodySmall" style={styles.descripcion}>
                {descripcion}
              </Text>
            ) : null}

            <Text variant="labelLarge" style={styles.etiqueta}>
              ¿Qué pasó? (obligatorio)
            </Text>

            {MOTIVOS_REPORTE.map((m) => {
              const activo = motivo === m.valor;
              return (
                <Pressable
                  key={m.valor}
                  onPress={() => setMotivo(m.valor)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: activo }}
                  accessibilityLabel={m.etiqueta}
                  style={({ pressed }) => [
                    styles.opcion,
                    activo && styles.opcionActiva,
                    pressed && styles.opcionPresionada,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={activo ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={activo ? colors.primaryLight : colors.textMuted}
                  />
                  <Text
                    style={[styles.opcionTexto, activo && styles.opcionTextoActivo]}
                    variant="bodyMedium"
                  >
                    {m.etiqueta}
                  </Text>
                </Pressable>
              );
            })}

            <Text variant="labelLarge" style={styles.etiqueta}>
              Detalles (opcional)
            </Text>
            <TextInput
              value={detalle}
              onChangeText={setDetalle}
              mode="outlined"
              multiline
              maxLength={1000}
              placeholder="Contá qué pasó con más detalle…"
              style={styles.campo}
              accessibilityLabel="Detalles del reporte"
            />

            {error ? (
              <Text style={styles.error} variant="bodySmall">
                {error}
              </Text>
            ) : null}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={cerrar} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            onPress={() => void mandar()}
            loading={enviando}
            disabled={!motivo || enviando}
            textColor={colors.danger}
          >
            Enviar reporte
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialogo: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  scroll: { maxHeight: 380 },
  scrollContenido: { gap: spacing.sm, paddingBottom: spacing.xs },
  descripcion: { color: colors.textMuted },
  etiqueta: { color: colors.text, marginTop: spacing.sm },

  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    minHeight: 48,
  },
  opcionActiva: { borderColor: colors.primaryLight, backgroundColor: colors.surfaceRaised },
  opcionPresionada: { opacity: 0.85 },
  opcionTexto: { color: colors.text, flex: 1 },
  opcionTextoActivo: { color: colors.primaryLight },

  campo: { backgroundColor: colors.surface },
  error: { color: colors.danger, marginTop: spacing.xs },
});
