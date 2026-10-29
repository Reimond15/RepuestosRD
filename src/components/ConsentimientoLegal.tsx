import { StyleSheet, View } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { colors } from '@/theme';

type Props = {
  valor: boolean;
  onCambiar: (v: boolean) => void;
  prefijo?: string;
};

export function ConsentimientoLegal({ valor, onCambiar, prefijo }: Props) {
  const router = useRouter();

  return (
    <View style={styles.cont}>
      <Checkbox
        status={valor ? 'checked' : 'unchecked'}
        onPress={() => onCambiar(!valor)}
        color={colors.primary}
        uncheckedColor={colors.textMuted}
      />

      <Text style={styles.texto} variant="bodySmall">
        {prefijo ?? 'Acepto los '}
        <Text
          style={styles.enlace}
          onPress={() => router.push('/legal/terminos')}
          accessibilityRole="link"
        >
          Términos y Condiciones
        </Text>
        {' y la '}
        <Text
          style={styles.enlace}
          onPress={() => router.push('/legal/privacidad')}
          accessibilityRole="link"
        >
          Política de Privacidad
        </Text>
        .
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cont: { flexDirection: 'row', alignItems: 'flex-start', gap: 2 },
  texto: { color: colors.textMuted, flex: 1, lineHeight: 18, paddingTop: 8 },
  enlace: { color: colors.primaryLight, textDecorationLine: 'underline' },
});
