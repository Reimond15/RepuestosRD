import { Tabs } from 'expo-router/js-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import { colors, fontSize, radius, spacing } from '@/theme';

type NombreIcono = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * `color` lo da React Navigation como ColorValue, que puede ser un
 * OpaqueColorValue (no un string). Por eso el tipo es el del ícono.
 */
type Props = {
  name: NombreIcono;
  color: ComponentProps<typeof MaterialCommunityIcons>['color'];
  size: number;
};

/**
 * ============================================================================
 *  Navegación adaptable
 *
 *    teléfono   → barra abajo (lo de siempre)
 *    tablet/desktop → barra lateral con ícono + etiqueta al lado
 *
 *  Es el mismo `Tabs` de siempre: React Navigation ya resuelve el layout
 *  en fila cuando `tabBarPosition` es "left", así que no hay dos
 *  navegadores que mantener.
 * ============================================================================
 */
export default function LayoutTabs() {
  const { navLateral } = useResponsive();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: navLateral ? 'left' : 'bottom',

        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textFaint,

        tabBarStyle: navLateral
          ? {
              backgroundColor: colors.surface,
              borderRightWidth: 1,
              borderRightColor: colors.border,
              borderTopWidth: 0,
              // en web las barras laterales no necesitan altura fija
              ...Platform.select({ web: { width: 210 }, default: {} }),
            }
          : {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              // en Android el color del borde de la barra inferior viene de otro lado
              ...Platform.select({ android: { elevation: 0 } }),
            },

        // con la barra lateral, la etiqueta va AL LADO del ícono
        tabBarLabelPosition: navLateral ? 'beside-icon' : 'below-icon',

        tabBarLabelStyle: {
          fontSize: fontSize.sm,
          fontWeight: '600',
          marginTop: navLateral ? 0 : 2,
        },

        tabBarItemStyle: navLateral
          ? {
              paddingVertical: 6,
              paddingHorizontal: spacing.sm,
              borderRadius: radius.md,
              marginHorizontal: spacing.sm,
              marginVertical: 2,
            }
          : { paddingVertical: 6 },

        // el activo se destaca con un fondo, no solo con el color del ícono
        tabBarActiveBackgroundColor: navLateral ? colors.surfaceAlt : undefined,

        // quitar la "pill" de fondo que mete React Navigation por defecto
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home-variant" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="buscar"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="magnify" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="cart-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="receipt-text-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

/**
 * El ícono de la pestaña sigue el color activo/inactivo que da React Navigation,
 * para que no haya que duplicar la lógica de estado en cada pestaña.
 */
function TabIcon({ name, color, size }: Props) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}