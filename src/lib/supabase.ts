import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Database } from '@/types/database.generated';

// ============================================================================
//  VARIABLES DE ENTORNO
//  Vienen de `.env` (expo las inyecta con el prefijo EXPO_PUBLIC_).
//  Si el archivo no existe, estas dos valen undefined y la app NO crashea:
//  se muestra la pantalla SetupRequired.
// ============================================================================

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * ¿Tenemos un proyecto de Supabase real?
 * - la URL tiene que ser https://...supabase.co
 * - la anon key siempre empieza con "eyJ" (es un JWT en base64)
 */
export const isConfigured: boolean =
  typeof url === 'string' &&
  url.startsWith('https://') &&
  url.includes('supabase.co') &&
  typeof anonKey === 'string' &&
  anonKey.length > 20 &&
  anonKey.startsWith('eyJ');

/**
 * Cliente de Supabase.
 *
 * IMPORTANTE: se crea de forma perezosa. Si las keys no están puestas,
 * `createClient` lanza una excepción y la app se cae en pantalla blanca.
 * Por eso acá solo se construye cuando `isConfigured` es true.
 */
let cliente: SupabaseClient<Database> | null = null;

function construirCliente(): SupabaseClient<Database> {
  if (cliente) return cliente;

  cliente = createClient<Database>(url as string, anonKey as string, {
    auth: {
      // dejar la sesión en el dispositivo: el usuario no tiene que
      // iniciar sesión cada vez que abre la app. Sin `storage`,
      // supabase-js en React Native usa memoria y la sesión se pierde
      // cada vez que se cierra la app (o recarga Metro en desarrollo).
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: AsyncStorage,
    },
    global: {
      headers: { 'x-application-name': 'repuestos-rd' },
    },
  });

  return cliente;
}

/**
 * Acceso al cliente. Lanza un error claro si faltan las keys,
 * en vez del error críptico de supabase-js.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!isConfigured) {
    throw new Error(
      'Supabase no está configurado. Pegá EXPO_PUBLIC_SUPABASE_URL y ' +
        'EXPO_PUBLIC_SUPABASE_ANON_KEY en el archivo .env y reiniciá con ' +
        'npx expo start -c',
    );
  }
  return construirCliente();
}

/** Cliente o null, para los hooks que quieren manejar el caso "sin config". */
export const supabase: SupabaseClient<Database> | null = isConfigured
  ? construirCliente()
  : null;

/** Buckets de Storage del proyecto. */
export const BUCKETS = {
  productos: 'productos',
  logos: 'logos',
  /** Privado: fotos de verificación de la tienda. Solo dueño + admin. */
  verificacion: 'verificacion',
} as const;
