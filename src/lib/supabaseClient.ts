import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Validar que la URL tenga el formato correcto
const isValidUrl = supabaseUrl && (
  supabaseUrl.startsWith('https://') || 
  supabaseUrl.startsWith('http://')
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Supabase client will not be initialized.',
  );
} else if (!isValidUrl) {
  console.warn(
    '[Supabase] Invalid EXPO_PUBLIC_SUPABASE_URL format. URL must start with https:// or http://. Supabase client will not be initialized.',
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey && isValidUrl
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : undefined;

export type SupabaseClientType = NonNullable<typeof supabase>;


