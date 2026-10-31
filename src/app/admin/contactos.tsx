import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { EmptyState } from '@/components/EmptyState';
import { WebShell } from '@/components/WebShell';
import { useContactosTiendas } from '@/hooks/useContactosTiendas';
import { useResponsive } from '@/hooks/useResponsive';
import { useSesion } from '@/hooks/useSesion';
import type { ContactoTienda } from '@/types/database';
import { colors, radius, spacing } from '@/theme';

function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

function telefonoVisible(valor: string | null): string {
  const digitos = soloDigitos(valor ?? '');
  if (digitos.length === 10) {
    return `${digitos.slice(0, 3)}-${digitos.slice(3, 6)}-${digitos.slice(6)}`;
  }
  if (digitos.length === 11 && digitos.startsWith('1')) {
    return `+1 ${digitos.slice(1, 4)}-${digitos.slice(4, 7)}-${digitos.slice(7)}`;
  }
  return (valor ?? '').trim();
}

function telefonoWhatsApp(valor: string): string {
  const digitos = soloDigitos(valor);
  return digitos.length === 10 ? `1${digitos}` : digitos;
}

export default function PantallaAdminContactos() {
  const insets = useSafeAreaInsets();
  const { esMovil } = useResponsive();
  const { usuario, cargando: cargandoSesion } = useSesion();
  const esAdmin = usuario?.rol === 'admin';

  const { contactos, cargando, error, recargar } = useContactosTiendas();

  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return contactos;

    return contactos.filter((c) => {
      const campos = [
        c.tienda,
        c.representante ?? '',
        c.telefono ?? '',
        c.correo,
      ]
        .join(' ')
        .toLowerCase();
      return campos.includes(texto);
    });
  }, [contactos, busqueda]);

  const abrir = (url: string) => {
    Linking.openURL(url).catch(() => {
    });
  };

  if (!esAdmin && !cargandoSesion) {
    return (
      <WebShell>
        <View style={styles.pantalla}>
          <EmptyState
            icono="lock-outline"
            titulo="Solo administradores"
            mensaje="Esta lista tiene los teléfonos de las tiendas y solo la puede ver el equipo de RepuGo."
          />
        </View>
      </WebShell>
    );
  }

  return (
    <WebShell>
      <View style={styles.pantalla}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contenido,
            { paddingTop: esMovil ? spacing.lg : spacing.xl },
          ]}
        >
          <View style={styles.cabecera}>
            <Text style={styles.titulo} variant={esMovil ? 'titleLarge' : 'headlineSmall'}>
              Contactos de tiendas
            </Text>
            <Text style={styles.subtitulo} variant="bodySmall">
              Nombre, representante y teléfono de cada tienda registrada. Tocá Llamar o WhatsApp
              para comunicarte.
            </Text>
            {!cargando && !error ? (
              <Text style={styles.cuenta} variant="labelSmall">
                {filtrados.length} de {contactos.length}{' '}
                {contactos.length === 1 ? 'tienda' : 'tiendas'}
              </Text>
            ) : null}
          </View>

          <TextInput
            mode="outlined"
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por tienda, representante o número"
            left={<TextInput.Icon icon="magnify" />}
            autoCapitalize="none"
          />

          {error ? (
            <View style={[styles.aviso, styles.avisoError]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.avisoTexto} variant="bodySmall">
                {error}
              </Text>
              <Button compact onPress={recargar}>
                Reintentar
              </Button>
            </View>
          ) : null}

          {cargando ? (
            <Text style={styles.muted} variant="bodySmall">
              Cargando contactos…
            </Text>
          ) : null}

          {!cargando && !error && contactos.length === 0 ? (
            <EmptyState
              icono="store-off-outline"
              titulo="Todavía no hay tiendas"
              mensaje="Cuando se registre la primera tienda, su contacto aparece acá."
            />
          ) : null}

          {!cargando && !error && contactos.length > 0 && filtrados.length === 0 ? (
            <Text style={styles.muted} variant="bodySmall">
              Ninguna tienda coincide con “{busqueda.trim()}”.
            </Text>
          ) : null}

          {filtrados.map((c) => (
            <FichaContacto key={c.tienda_id} contacto={c} onAbrir={abrir} />
          ))}

          <View style={{ height: insets.bottom + spacing.xl }} />
        </ScrollView>
      </View>
    </WebShell>
  );
}

function FichaContacto({
  contacto,
  onAbrir,
}: {
  contacto: ContactoTienda;
  onAbrir: (url: string) => void;
}) {
  const telefono = (contacto.telefono ?? '').trim();
  const tieneTelefono = soloDigitos(telefono).length >= 7;
  const representante = (contacto.representante ?? '').trim();

  return (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaCabecera}>
        <Text style={styles.nombre} variant="titleSmall" numberOfLines={2}>
          {contacto.tienda}
        </Text>
        <View
          style={[
            styles.chip,
            { borderColor: contacto.aprobada ? colors.primary : colors.star },
          ]}
        >
          <Text
            style={[
              styles.chipTexto,
              { color: contacto.aprobada ? colors.primaryLight : colors.star },
            ]}
            variant="labelSmall"
          >
            {contacto.aprobada ? 'Aprobada' : 'Pendiente'}
          </Text>
        </View>
      </View>

      <View style={styles.fila}>
        <MaterialCommunityIcons
          name="account-tie-outline"
          size={16}
          color={colors.textMuted}
        />
        <Text style={styles.dato} variant="bodySmall">
          {representante || 'Sin representante'}
        </Text>
      </View>

      <View style={styles.fila}>
        <MaterialCommunityIcons name="phone-outline" size={16} color={colors.textMuted} />
        <Text style={styles.telefono} variant="bodyMedium" selectable>
          {tieneTelefono ? telefonoVisible(telefono) : 'Sin teléfono'}
        </Text>
      </View>

      <View style={styles.fila}>
        <MaterialCommunityIcons name="email-outline" size={16} color={colors.textMuted} />
        <Text style={styles.dato} variant="bodySmall" selectable>
          {contacto.correo}
        </Text>
      </View>

      <View style={styles.acciones}>
        <Button
          mode="contained-tonal"
          icon="phone"
          disabled={!tieneTelefono}
          onPress={() => onAbrir(`tel:${soloDigitos(telefono)}`)}
          style={styles.accion}
          contentStyle={styles.accionContenido}
        >
          Llamar
        </Button>
        <Button
          mode="outlined"
          icon="whatsapp"
          disabled={!tieneTelefono}
          onPress={() => onAbrir(`https://wa.me/${telefonoWhatsApp(telefono)}`)}
          style={styles.accion}
          contentStyle={styles.accionContenido}
        >
          WhatsApp
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.lg, gap: spacing.md },

  cabecera: { gap: spacing.xs, marginBottom: spacing.xs },
  titulo: { color: colors.text },
  subtitulo: { color: colors.textMuted, lineHeight: 18 },
  cuenta: { color: colors.textFaint, marginTop: spacing.xs },

  muted: { color: colors.textMuted },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  avisoError: { borderColor: colors.danger, backgroundColor: colors.surface },
  avisoTexto: { color: colors.textMuted, flex: 1 },

  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  tarjetaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nombre: { color: colors.text, flex: 1 },

  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipTexto: {},

  fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dato: { color: colors.textMuted, flex: 1 },
  telefono: { color: colors.text, flex: 1, letterSpacing: 0.3 },

  acciones: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  accion: { flex: 1 },
  accionContenido: { minHeight: 40 },
});
