import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors, radius, spacing } from '@/theme';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary atrapó un error:', error, info?.componentStack);
  }

  reintentar = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contenido}
      >
        <View style={styles.icono}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={40}
            color={colors.danger}
          />
        </View>

        <Text style={styles.titulo} variant="headlineMedium">
          Algo salió mal
        </Text>

        <Text style={styles.subtitulo} variant="bodyMedium">
          La app tuvo un problema al mostrar esta pantalla. Podés reintentar; si sigue pasando,
          volvé al inicio y probá de nuevo.
        </Text>

        {__DEV__ ? (
          <View style={styles.detalle}>
            <Text style={styles.detalleTexto} variant="bodySmall">
              {error.message}
            </Text>
          </View>
        ) : null}

        <Button mode="contained" icon="refresh" onPress={this.reintentar}>
          Reintentar
        </Button>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },

  icono: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulo: { color: colors.text },
  subtitulo: { color: colors.textMuted, marginBottom: spacing.sm },

  detalle: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  detalleTexto: { color: colors.textMuted, fontFamily: 'monospace' },
});
