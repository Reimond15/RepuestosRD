import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProveedorSesion } from '@/hooks/useSesion';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SetupRequired } from '@/components/SetupRequired';
import { isConfigured } from '@/lib/supabase';
import { colors, theme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // en web puede fallar y no pasa nada
});

export default function LayoutRaiz() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ProveedorSesion>
          <StatusBar style="light" />

          <ErrorBoundary>
            {/*
              SIN claves de Supabase -> pantalla de guarda.
              Se monta el tema igual, para que se vea el diseño.
            */}
            {!isConfigured ? (
              <SetupRequired />
            ) : (
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: colors.surface },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                  contentStyle: { backgroundColor: colors.background },
                }}
              >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="producto/[id]"
                options={{ title: 'Producto', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="checkout"
                options={{ title: 'Tramitar pedido', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="ingresar"
                options={{ title: 'Tu cuenta', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="admin/tipos"
                options={{ title: 'Tipos de repuesto', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="admin/tiendas"
                options={{ title: 'Tiendas', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="calificar/[pedidoId]"
                options={{ title: 'Calificar pedido', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="chat/[pedidoId]"
                options={{ title: 'Chat', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="mis-productos"
                options={{ title: 'Mis repuestos', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="mi-producto/[id]"
                options={{ title: 'Repuesto', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="legal/index"
                options={{ title: 'Legal', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="legal/privacidad"
                options={{ title: 'Privacidad', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="legal/terminos"
                options={{ title: 'Términos', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="legal/cookies"
                options={{ title: 'Cookies', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="legal/reembolsos"
                options={{ title: 'Reembolsos', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="legal/aviso-legal"
                options={{ title: 'Aviso legal', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="legal/eliminar-cuenta"
                options={{ title: 'Eliminar cuenta', headerBackTitle: 'Volver' }}
              />
              <Stack.Screen
                name="eliminar-cuenta"
                options={{ title: 'Eliminar mi cuenta', headerBackTitle: 'Volver' }}
              />
            </Stack>
            )}
          </ErrorBoundary>
        </ProveedorSesion>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
