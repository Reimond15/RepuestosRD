import { StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors, spacing } from '@/theme';

export default function NoEncontrado() {
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrado' }} />

      <View style={styles.cont}>
        <MaterialCommunityIcons name="map-marker-question-outline" size={56} color={colors.textFaint} />

        <Text style={styles.titulo}>Esta pantalla no existe</Text>
        <Text style={styles.texto}>Puede que el enlace esté viejo o que escribiste mal la ruta.</Text>

        <Link href="/" style={styles.link} dismissTo>
          <Text style={styles.linkTexto}>Volver al inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cont: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  titulo: { color: colors.text, fontSize: 20, fontWeight: '700' },
  texto: { color: colors.textMuted, textAlign: 'center' },
  link: { marginTop: spacing.md, paddingVertical: 12 },
  linkTexto: { color: colors.primaryLight, fontWeight: '700', fontSize: 16 },
});
