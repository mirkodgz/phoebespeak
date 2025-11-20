import {Session, User} from '@supabase/supabase-js';

import {supabase} from '../lib/supabaseClient';

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
    const {data, error} = await client.auth.signUp({
      email,
      password,
      options: {
        data: {full_name: fullName},
      },
    });

    if (error) {
      throw error;
    }

    const user = data.user;
    const session = data.session ?? null;

    if (!user) {
      throw new Error(
        'No se pudo completar el registro. Revisa la configuración de confirmación de correo en Supabase.',
      );
    }

    const requiresEmailConfirmation = !session;

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
  const {error} = await client.auth.signOut();
  if (error) {
    throw error;
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

