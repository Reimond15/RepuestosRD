import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';

import { colors } from '@/theme';

type Props = {
  tamano?: number;
  conNombre?: boolean;
};

export function AppLogo({ tamano = 34, conNombre = true }: Props) {
  return (
    <View style={styles.cont}>
      <View style={[styles.circulo, { width: tamano, height: tamano, borderRadius: tamano / 2 }]}>
        <Image
          source={require('@/assets/images/logo-app.png')}
          style={{ width: tamano * 0.62, height: tamano * 0.62 }}
          contentFit="contain"
          accessibilityLabel="RepuGo"
        />
      </View>

      {conNombre ? (
        <View style={styles.textos}>
          <Text style={[styles.nombre, { fontSize: tamano * 0.52 }]}>RepuGo</Text>
          <Text style={[styles.lema, { fontSize: Math.max(9, tamano * 0.26) }]}>
            Santo Domingo Oeste
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cont: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  circulo: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textos: { justifyContent: 'center' },
  nombre: {
    color: colors.text,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: undefined,
  },
  lema: {
    color: colors.primaryLight,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
