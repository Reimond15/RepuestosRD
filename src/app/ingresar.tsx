import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

import { ConsentimientoLegal } from '@/components/ConsentimientoLegal';
import { WebShell } from '@/components/WebShell';
import { useCampoEnfocado } from '@/hooks/useCampoEnfocado';
import { leerError } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { colors, radius, spacing } from '@/theme';

/**
 * Ingreso (email + contraseña) y registro con datos mínimos.
 *
 * El registro le manda el rol y los datos en `options.data`; el trigger
 * `manejar_nuevo_usuario` de la base crea la fila de `usuarios` y, si el
 * rol es `tienda`, también la tienda (pendiente de aprobación).
 */
export default function PantallaIngresar() {
  const router = useRouter();
  const { despues } = useLocalSearchParams<{ despues?: string }>();
  const { scrollRef, alEnfocar } = useCampoEnfocado();

  const [modo, setModo] = useState<'ingresar' | 'crear'>('ingresar');

  // campos comunes
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // campos del registro
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<'cliente' | 'tienda'>('cliente');
  const [nombreTienda, setNombreTienda] = useState('');
  const [direccionTienda, setDireccionTienda] = useState('');

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acepta, setAcepta] = useState(false);

  const destino: Href = despues === 'checkout' ? '/checkout' : '/(tabs)';

  const validar = (): string | null => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) return 'Escribí un email válido.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (modo === 'crear') {
      if (!nombre.trim()) return 'Escribí tu nombre.';
      if (rol === 'tienda' && !nombreTienda.trim())
        return 'Escribí el nombre de tu tienda.';
      if (!acepta)
        return 'Tenés que aceptar los Términos y la Política de Privacidad para crear tu cuenta.';
    }
    return null;
  };

  const enviar = async () => {
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      if (modo === 'ingresar') {
        const { error: err } = await supabase!.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase!.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              rol,
              nombre: nombre.trim(),
              telefono: telefono.trim() || null,
              // Constancia del consentimiento legal dado al registrarse.
              acepta_terminos: new Date().toISOString(),
              ...(rol === 'tienda'
                ? {
                    nombre_tienda: nombreTienda.trim(),
                    direccion: direccionTienda.trim() || null,
                  }
                : {}),
            },
          },
        });
        if (err) throw err;

        // si el proyecto exige confirmar el email, no hay sesión todavía
        if (!data.session) {
          setModo('ingresar');
          setError(
            'Te enviamos un email de confirmación. Confirmalo y después entrá acá.',
          );
          return;
        }
      }

      router.replace(destino);
    } catch (e) {
      const mensaje = leerError(e).toLowerCase();
      if (mensaje.includes('already registered') || mensaje.includes('ya registrado')) {
        setError('Ese email ya tiene cuenta. Entrá con tu contraseña.');
      } else if (mensaje.includes('invalid login')) {
        setError('Email o contraseña incorrectos.');
      } else {
        setError(leerError(e));
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <WebShell>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.tarjeta}>
            <Text style={styles.titulo} variant="headlineSmall">
              {modo === 'ingresar' ? 'Bienvenido de nuevo' : 'Creá tu cuenta'}
            </Text>
            <Text style={styles.subtitulo} variant="bodyMedium">
              {modo === 'ingresar'
                ? 'Ingresá para comprar y ver tus pedidos.'
                : 'Comprar o vender repuestos en República Dominicana.'}
            </Text>

            <SegmentedButtons
              value={modo}
              onValueChange={(v) => {
                setModo(v as 'ingresar' | 'crear');
                setError(null);
              }}
              buttons={[
                { value: 'ingresar', label: 'Ingresar' },
                { value: 'crear', label: 'Crear cuenta' },
              ]}
              style={styles.segmentos}
            />

            {modo === 'crear' ? (
              <>
                <TextInput
                  label="Nombre"
                  value={nombre}
                  onChangeText={setNombre}
                  mode="outlined"
                  autoComplete="name"
                  onFocus={alEnfocar}
                />
                <TextInput
                  label="Teléfono (opcional)"
                  value={telefono}
                  onChangeText={setTelefono}
                  mode="outlined"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  onFocus={alEnfocar}
                />

                <Text style={styles.etiqueta} variant="labelMedium">
                  ¿Qué vas a hacer?
                </Text>
                <SegmentedButtons
                  value={rol}
                  onValueChange={(v) => setRol(v as 'cliente' | 'tienda')}
                  buttons={[
                    { value: 'cliente', label: 'Comprar' },
                    { value: 'tienda', label: 'Vender' },
                  ]}
                />

                {rol === 'tienda' ? (
                  <>
                    <TextInput
                      label="Nombre de la tienda"
                      value={nombreTienda}
                      onChangeText={setNombreTienda}
                      mode="outlined"
                      onFocus={alEnfocar}
                    />
                    <TextInput
                      label="Dirección de la tienda"
                      value={direccionTienda}
                      onChangeText={setDireccionTienda}
                      mode="outlined"
                      onFocus={alEnfocar}
                    />
                    <Text style={styles.avisoTienda} variant="bodySmall">
                      Tu tienda queda pendiente de aprobación por un administrador
                      antes de poder publicar.
                    </Text>
                  </>
                ) : null}
              </>
            ) : null}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onFocus={alEnfocar}
            />
            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              onFocus={alEnfocar}
            />

            {modo === 'crear' ? (
              <ConsentimientoLegal valor={acepta} onCambiar={setAcepta} />
            ) : null}

            {error ? (
              <Text style={styles.error} variant="bodySmall">
                {error}
              </Text>
            ) : null}

            <Button
              mode="contained"
              onPress={enviar}
              loading={cargando}
              disabled={cargando}
              contentStyle={styles.botonContenido}
              icon={modo === 'ingresar' ? 'login' : 'account-plus-outline'}
            >
              {modo === 'ingresar' ? 'Entrar' : 'Crear cuenta'}
            </Button>

            <Text style={styles.nota} variant="bodySmall">
              {modo === 'ingresar'
                ? '¿No tenés cuenta? Pasate a "Crear cuenta" arriba.'
                : 'Ya tenés una cuenta en otra tienda olvidada de tu contraseña: escribile a un administrador.'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  contenido: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  tarjeta: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },

  titulo: { color: colors.text },
  subtitulo: { color: colors.textMuted, marginBottom: spacing.xs },

  segmentos: { marginBottom: spacing.xs },

  etiqueta: { color: colors.textMuted, marginTop: spacing.xs },

  avisoTienda: { color: colors.textFaint, lineHeight: 17 },

  error: { color: colors.danger },
  nota: { color: colors.textFaint, textAlign: 'center', lineHeight: 17 },

  botonContenido: { minHeight: 48 },
});