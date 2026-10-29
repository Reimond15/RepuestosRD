import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WebShell } from '@/components/WebShell';
import { LEGAL_ACTUALIZADO, NEGOCIO } from '@/lib/legal';
import { colors, radius, spacing } from '@/theme';

export type Seccion = {
  titulo?: string;
  parrafos?: string[];
  vinetas?: string[];
  aviso?: string;
};

type Props = {
  titulo: string;
  intro?: string;
  secciones: Seccion[];
  children?: ReactNode;
};

export function LegalDoc({ titulo, intro, secciones, children }: Props) {
  const insets = useSafeAreaInsets();

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
          <View style={styles.hoja}>
            <Text style={styles.titulo} variant="headlineMedium" accessibilityRole="header">
              {titulo}
            </Text>

            <View style={styles.meta}>
              <Text style={styles.metaTexto} variant="bodySmall">
                Responsable: {NEGOCIO.responsable} · {NEGOCIO.nombreComercial}
              </Text>
              <Text style={styles.metaTexto} variant="bodySmall">
                Última actualización: {LEGAL_ACTUALIZADO}
              </Text>
            </View>

            {intro ? (
              <Text style={styles.intro} variant="bodyMedium">
                {intro}
              </Text>
            ) : null}

            {secciones.map((s, i) => (
              <View key={s.titulo ?? `sec-${i}`} style={styles.seccion}>
                {s.titulo ? (
                  <Text style={styles.seccionTitulo} variant="titleMedium" accessibilityRole="header">
                    {s.titulo}
                  </Text>
                ) : null}

                {s.parrafos?.map((p, j) => (
                  <Text key={`p-${j}`} style={styles.parrafo} variant="bodyMedium">
                    {p}
                  </Text>
                ))}

                {s.vinetas?.length ? (
                  <View style={styles.vinetas}>
                    {s.vinetas.map((v, j) => (
                      <View key={`v-${j}`} style={styles.vinetaFila}>
                        <Text style={styles.punto} variant="bodyMedium">
                          •
                        </Text>
                        <Text style={styles.vinetaTexto} variant="bodyMedium">
                          {v}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {s.aviso ? (
                  <View style={styles.aviso}>
                    <Text style={styles.avisoTexto} variant="bodyMedium">
                      {s.aviso}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}

            {children}
          </View>
        </ScrollView>
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.lg, alignItems: 'center' },
  hoja: {
    width: '100%',
    maxWidth: 760,
    gap: spacing.lg,
  },

  titulo: { color: colors.text },
  meta: { gap: 2, marginTop: -spacing.sm },
  metaTexto: { color: colors.textFaint },

  intro: { color: colors.text, lineHeight: 22 },

  seccion: { gap: spacing.sm },
  seccionTitulo: { color: colors.primaryLight },
  parrafo: { color: colors.text, lineHeight: 22 },

  vinetas: { gap: 6 },
  vinetaFila: { flexDirection: 'row', gap: spacing.sm },
  punto: { color: colors.primaryLight, lineHeight: 22 },
  vinetaTexto: { color: colors.text, lineHeight: 22, flex: 1 },

  aviso: {
    backgroundColor: colors.surfaceAlt,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  avisoTexto: { color: colors.text, lineHeight: 21 },
});
