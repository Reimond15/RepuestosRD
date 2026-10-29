import { Tabs } from 'expo-router/js-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import { colors, fontSize, radius, spacing } from '@/theme';

type NombreIcono = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  name: NombreIcono;
  color: ComponentProps<typeof MaterialCommunityIcons>['color'];
  size: number;
};

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
              ...Platform.select({ web: { width: 210 }, default: {} }),
            }
          : {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              ...Platform.select({ android: { elevation: 0 } }),
            },

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

        tabBarActiveBackgroundColor: navLateral ? colors.surfaceAlt : undefined,

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

function TabIcon({ name, color, size }: Props) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}