import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Database } from '@/types/database.generated';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isConfigured: boolean =
  typeof url === 'string' &&
  url.startsWith('https://') &&
  url.includes('supabase.co') &&
  typeof anonKey === 'string' &&
  anonKey.length > 20 &&
  anonKey.startsWith('eyJ');

let cliente: SupabaseClient<Database> | null = null;

function construirCliente(): SupabaseClient<Database> {
  if (cliente) return cliente;

  cliente = createClient<Database>(url as string, anonKey as string, {
    auth: {
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

export const supabase: SupabaseClient<Database> | null = isConfigured
  ? construirCliente()
  : null;

export const BUCKETS = {
  productos: 'productos',
  logos: 'logos',
  verificacion: 'verificacion',
} as const;
