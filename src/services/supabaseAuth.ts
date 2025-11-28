import {Session, User} from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import {Platform} from 'react-native';
import Constants from 'expo-constants';

import {supabase} from '../lib/supabaseClient';

// Necesario para que WebBrowser funcione correctamente
WebBrowser.maybeCompleteAuthSession();

type SignInPayload = {
  email: string;
  password: string;
};

type SignUpPayload = SignInPayload & {
  fullName: string;
};

export type ProfileRow = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  level?: string | null;
  has_premium?: boolean | null;
  trial_started_at?: string | null;
  has_onboarded?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ProfileUpsertPayload = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  level?: string | null;
  has_premium?: boolean | null;
  trial_started_at?: string | null;
  has_onboarded?: boolean | null;
};

const getClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Por favor, crea un archivo .env en la raíz del proyecto con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY. Revisa docs/supabase-setup.md para más información.',
    );
  }
  return supabase;
};

export const signInWithEmail = async ({
  email,
  password,
}: SignInPayload): Promise<User> => {
  const client = getClient();
  const {data, error} = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('No se pudo iniciar sesión. Verifica tus credenciales.');
  }

  return data.user;
};

type SignUpResult = {
  user: User;
  session: Session | null;
  requiresEmailConfirmation: boolean;
};

export const signUpWithEmail = async ({
  email,
  password,
  fullName,
}: SignUpPayload): Promise<SignUpResult> => {
  try {
    const client = getClient();
    console.log('[signUpWithEmail] Iniciando registro para:', email);
    
    const {data, error} = await client.auth.signUp({
      email,
      password,
      options: {
        data: {full_name: fullName},
        emailRedirectTo: undefined, // No necesitamos redirect en mobile
      },
    });

    if (error) {
      console.error('[signUpWithEmail] Error en signUp:', error);
      throw error;
    }

    const user = data.user;
    const session = data.session ?? null;

    if (!user) {
      console.error('[signUpWithEmail] No se recibió usuario del registro');
      throw new Error(
        'No se pudo completar el registro. Revisa la configuración de confirmación de correo en Supabase.',
      );
    }

    const requiresEmailConfirmation = !session;
    
    console.log('[signUpWithEmail] Registro exitoso:', {
      userId: user.id,
      email: user.email,
      requiresEmailConfirmation,
      hasSession: !!session,
    });

    if (requiresEmailConfirmation) {
      console.log('[signUpWithEmail] Se requiere confirmación de email. El correo debería haberse enviado.');
    }

    return {
      user,
      session,
      requiresEmailConfirmation,
    };
  } catch (error: any) {
    // Mejorar mensajes de error de red
    if (error?.message?.includes('Network request failed') || error?.message?.includes('fetch')) {
      throw new Error(
        'Error de conexión. Verifica tu conexión a internet y que Supabase esté configurado correctamente en el archivo .env',
      );
    }
    if (error?.message?.includes('Supabase no está configurado')) {
      throw error;
    }
    // Re-lanzar otros errores con mensaje más claro
    throw new Error(
      error?.message || 'No se pudo completar el registro. Por favor, intenta nuevamente.',
    );
  }
};

export const signOutFromSupabase = async () => {
  const client = getClient();
  
  try {
    // Intentar signOut con timeout
    const signOutPromise = client.auth.signOut();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Sign out timeout')), 5000);
    });
    
    const result = await Promise.race([signOutPromise, timeoutPromise]);
    const {error} = result as any;
    
    if (error) {
      throw error;
    }
  } catch (error: any) {
    // Si es timeout o cualquier error, no lanzamos porque el estado local ya está limpio
    if (error?.message === 'Sign out timeout') {
      console.warn('[supabaseAuth] Sign out timeout after 5s, but local state is already cleared');
      return;
    }
    // Para otros errores, solo logueamos pero no lanzamos
    console.warn('[supabaseAuth] Error during sign out (non-critical):', error);
  }
};

export const getCurrentAuthUser = async (): Promise<User | null> => {
  const client = getClient();
  const {data, error} = await client.auth.getUser();
  if (error) {
    throw error;
  }
  return data.user ?? null;
};

export const fetchProfileById = async (
  userId: string,
): Promise<ProfileRow | null> => {
  const client = getClient();
  const {data, error} = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};

export const upsertProfile = async (
  payload: ProfileUpsertPayload,
): Promise<ProfileRow> => {
  const client = getClient();
  const {data, error} = await client
    .from('profiles')
    .upsert(
      {
        ...payload,
        updated_at: new Date().toISOString(),
      },
      {onConflict: 'id'},
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const ensureProfile = async (
  userId: string,
  payload?: ProfileUpsertPayload,
): Promise<ProfileRow> => {
  const existing = await fetchProfileById(userId);

  if (existing) {
    return existing;
  }

  return upsertProfile({
    id: userId,
    ...payload,
  });
};

export const startTrialForUser = async (userId: string): Promise<void> => {
  const client = getClient();
  const {error} = await client
    .from('profiles')
    .update({
      has_premium: true,
      trial_started_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }
};

export const refreshAuthSession = async () => {
  const client = getClient();
  await client.auth.getSession();
};

export const resetPassword = async (email: string): Promise<void> => {
  // Usar el backend para enviar código OTP
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  
  if (!API_BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL no está configurado. Necesitas configurar el backend para enviar códigos OTP.',
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({error: response.statusText}));
      throw new Error(errorData.error || 'Impossibile inviare l\'email di recupero.');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Impossibile inviare l\'email di recupero.');
    }
  } catch (error: any) {
    if (error?.message?.includes('Network request failed') || error?.message?.includes('fetch')) {
      throw new Error(
        'Error de conexión con el servidor. Verifica que el backend esté ejecutándose y que EXPO_PUBLIC_API_BASE_URL esté configurado correctamente.',
      );
    }
    throw error;
  }
};

export const verifyPasswordResetCode = async (
  email: string,
  code: string,
): Promise<void> => {
  // Usar el backend para verificar código OTP
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  
  if (!API_BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL no está configurado. Necesitas configurar el backend para verificar códigos OTP.',
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, code}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({error: response.statusText}));
      throw new Error(errorData.error || 'Codice non valido o scaduto.');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Codice non valido o scaduto.');
    }

    // El código fue verificado correctamente
    // El frontend puede proceder a cambiar la contraseña usando el endpoint del backend
  } catch (error: any) {
    if (error?.message?.includes('Network request failed') || error?.message?.includes('fetch')) {
      throw new Error(
        'Error de conexión con el servidor. Verifica que el backend esté ejecutándose.',
      );
    }
    throw error;
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  const client = getClient();
  
  // Obtener la URL de Supabase de las variables de entorno
  // Usar Constants para asegurar que se lea correctamente
  const supabaseUrl = 
    Constants.expoConfig?.extra?.supabaseUrl ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    Constants.manifest?.extra?.supabaseUrl;
    
  if (!supabaseUrl) {
    console.error('[signInWithGoogle] EXPO_PUBLIC_SUPABASE_URL no está configurado');
    throw new Error('EXPO_PUBLIC_SUPABASE_URL no está configurado. Verifica tu archivo .env');
  }

  // Asegurarse de que la URL no tenga trailing slash
  const cleanSupabaseUrl = supabaseUrl.toString().replace(/\/$/, '');
  
  // URL de redirect para la app - debe ser el scheme de la app
  // IMPORTANTE: Supabase debe redirigir directamente a la app después de procesar el callback de Google
  // Esto requiere que 'phoebe://auth/callback' esté en las Redirect URLs de Supabase
  const appRedirectTo = 'phoebe://auth/callback';
  
  console.log('[signInWithGoogle] Supabase URL:', cleanSupabaseUrl);
  console.log('[signInWithGoogle] App Redirect To (para Supabase):', appRedirectTo);
  
  // Para React Native/Expo, necesitamos usar skipBrowserRedirect: true
  // y manejar el navegador manualmente
  // El redirectTo debe ser el scheme de la app para que Supabase redirija directamente a la app
  const {data, error} = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: appRedirectTo, // Supabase redirigirá a phoebe://auth/callback después de procesar el callback de Google
      skipBrowserRedirect: true, // Importante: debemos manejar el navegador manualmente
    },
  });

  if (error) {
    console.error('[signInWithGoogle] Error creating OAuth URL:', error);
    throw error;
  }

  // Si data.url existe, significa que necesitamos abrir el navegador manualmente
  if (data.url) {
    console.log('[signInWithGoogle] OAuth URL:', data.url);
    console.log('[signInWithGoogle] Opening browser, expecting redirect to:', appRedirectTo);

    // Verificar que la URL de OAuth no contenga localhost
    if (data.url.includes('localhost') || data.url.includes('127.0.0.1')) {
      console.error('[signInWithGoogle] OAuth URL contiene localhost:', data.url);
      throw new Error('La URL de autenticación contiene localhost. Verifica que EXPO_PUBLIC_SUPABASE_URL esté configurado correctamente.');
    }

    // Abrir el navegador para autenticación
    // El segundo parámetro es la URL que esperamos recibir cuando Supabase redirija de vuelta a la app
    // IMPORTANTE: Esta debe coincidir exactamente con el redirectTo que pasamos a signInWithOAuth
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      appRedirectTo, // Esperamos que Supabase redirija a phoebe://auth/callback
    );

    console.log('[signInWithGoogle] Browser result:', result);

    if (result.type !== 'success') {
      throw new Error('Autenticación con Google cancelada o fallida');
    }

    // Extraer parámetros de la URL de respuesta
    const responseUrl = result.url;
    
    console.log('[signInWithGoogle] Response URL recibida:', responseUrl);
    
    // La URL puede venir en diferentes formatos
    let code: string | null = null;
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    try {
      const url = new URL(responseUrl);
      console.log('[signInWithGoogle] URL parseada correctamente');
      console.log('[signInWithGoogle] URL search:', url.search);
      console.log('[signInWithGoogle] URL hash:', url.hash);
      
      // Buscar código en query params
      code = url.searchParams.get('code');
      
      // Buscar tokens en hash
      const hash = url.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      accessToken = hashParams.get('access_token');
      refreshToken = hashParams.get('refresh_token');
      
      console.log('[signInWithGoogle] Código extraído:', code ? 'Sí' : 'No');
      console.log('[signInWithGoogle] Access token extraído:', accessToken ? 'Sí' : 'No');
    } catch (e) {
      console.log('[signInWithGoogle] Error parseando URL, usando regex:', e);
      // Si la URL no es válida, intentar extraer de otra forma
      const codeMatch = responseUrl.match(/[?&]code=([^&]+)/);
      const tokenMatch = responseUrl.match(/access_token=([^&]+)/);
      const refreshMatch = responseUrl.match(/refresh_token=([^&]+)/);
      
      code = codeMatch?.[1] || null;
      accessToken = tokenMatch?.[1] || null;
      refreshToken = refreshMatch?.[1] || null;
      
      console.log('[signInWithGoogle] Código (regex):', code ? 'Sí' : 'No');
      console.log('[signInWithGoogle] Access token (regex):', accessToken ? 'Sí' : 'No');
    }
    
    // Si tenemos access_token directamente, usarlo
    if (accessToken) {
      const {data: sessionData, error: sessionError} = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      } as any);

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.user) {
        throw new Error('No se pudo obtener el usuario después de la autenticación');
      }

      // Obtener el usuario actualizado con todos los metadatos
      // Esto asegura que tenemos los metadatos más recientes de Google
      const {data: {user: updatedUser}, error: getUserError} = await client.auth.getUser();
      
      if (getUserError) {
        console.warn('[signInWithGoogle] Error obteniendo usuario actualizado, usando usuario de sesión:', getUserError);
        return sessionData.user;
      }

      if (updatedUser) {
        console.log('[signInWithGoogle] Usuario actualizado obtenido con metadatos:', {
          full_name: updatedUser.user_metadata?.full_name,
          name: updatedUser.user_metadata?.name,
        });
        return updatedUser;
      }

      return sessionData.user;
    }
    
    // Si tenemos código, intercambiarlo por una sesión
    if (code) {
      const {data: sessionData, error: sessionError} = await client.auth.exchangeCodeForSession(code);

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.user) {
        throw new Error('No se pudo obtener el usuario después de la autenticación');
      }

      return sessionData.user;
    }

    throw new Error('No se recibió el código o token de autenticación');
  }

  // Si no hay data.url, Supabase debería haber manejado el flujo automáticamente
  // Esperar a que la sesión se establezca
  const {data: {session}, error: sessionError} = await client.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('No se pudo obtener la sesión después de la autenticación');
  }

  if (!session.user) {
    throw new Error('No se pudo obtener el usuario después de la autenticación');
  }

  return session.user;
};

export const updatePassword = async (newPassword: string, email?: string): Promise<void> => {
  // Si tenemos email, usar el endpoint del backend que cambia la contraseña directamente
  if (email) {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
    
    if (API_BASE_URL) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, newPassword}),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({error: response.statusText}));
          throw new Error(errorData.error || 'Impossibile aggiornare la password.');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Impossibile aggiornare la password.');
        }
        return; // Éxito, salir
      } catch (error: any) {
        if (error?.message?.includes('Network request failed') || error?.message?.includes('fetch')) {
          throw new Error(
            'Error de conexión con el servidor. Verifica que el backend esté ejecutándose.',
          );
        }
        throw error;
      }
    }
  }

  // Fallback: intentar usar el método normal de Supabase (requiere sesión)
  const client = getClient();
  const {error} = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
};

