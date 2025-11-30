import {supabase} from '../lib/supabaseClient';
import {ProfileRow} from './supabaseAuth';

// Función auxiliar para obtener el cliente de Supabase
const getClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Por favor, crea un archivo .env en la raíz del proyecto con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  return supabase;
};

export type SubscriptionStatus = 'trial_active' | 'trial_expired' | 'subscribed' | 'none';

export type FeatureAccess = {
  canAccessGuidedMode: boolean;
  canAccessFreeMode: boolean;
  canAccessAITutor: boolean;
  canAccessRound1: boolean;
  canAccessRound2Plus: boolean;
};

const TRIAL_DURATION_DAYS = 5;

/**
 * Calcula los días restantes de la prueba gratuita
 * @param createdAt Fecha de creación del usuario (ISO string)
 * @returns Número de días restantes (0 si expiró)
 */
export const calculateTrialDaysRemaining = (createdAt: string | null | undefined): number => {
  if (!createdAt) return 0;

  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = now.getTime() - createdDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const remaining = TRIAL_DURATION_DAYS - diffDays;

  return Math.max(0, remaining);
};

/**
 * Verifica si el usuario tiene prueba gratuita activa
 * @param profile Perfil del usuario
 * @returns true si tiene prueba activa (menos de 5 días desde created_at)
 */
export const hasActiveTrial = (profile: ProfileRow | null | undefined): boolean => {
  if (!profile?.created_at) return false;
  return calculateTrialDaysRemaining(profile.created_at) > 0;
};

/**
 * Verifica si el usuario tiene suscripción activa
 * @param profile Perfil del usuario
 * @returns true si tiene suscripción activa
 */
export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  try {
    const client = getClient();
    const {data, error} = await client
      .from('subscriptions')
      .select('id, status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle(); // Usar maybeSingle() en lugar de single() para evitar errores cuando no hay suscripción

    if (error) {
      console.error('[hasActiveSubscription] Error:', error);
      return false;
    }

    if (!data) return false;

    // Verificar que la suscripción no haya expirado
    if (data.current_period_end) {
      const expiryDate = new Date(data.current_period_end);
      return expiryDate > new Date();
    }

    return true;
  } catch (error) {
    console.error('[hasActiveSubscription] Error:', error);
    return false; // En caso de error, asumir que NO tiene suscripción (seguro por defecto)
  }
};

/**
 * Obtiene el estado de suscripción del usuario
 * @param profile Perfil del usuario
 * @param userId ID del usuario
 * @returns Estado de suscripción
 */
export const getSubscriptionStatus = async (
  profile: ProfileRow | null | undefined,
  userId: string,
): Promise<SubscriptionStatus> => {
  // Primero verificar si tiene suscripción activa
  const isSubscribed = await hasActiveSubscription(userId);
  if (isSubscribed) {
    return 'subscribed';
  }

  // Si no tiene suscripción, verificar prueba gratuita
  if (hasActiveTrial(profile)) {
    return 'trial_active';
  }

  // Si tiene created_at pero ya pasaron los 5 días
  if (profile?.created_at) {
    return 'trial_expired';
  }

  return 'none';
};

/**
 * Determina qué funcionalidades puede acceder el usuario
 * IMPORTANTE: Después de los 5 días, TODOS los rounds se bloquean, incluso el round 1
 * @param profile Perfil del usuario
 * @param userId ID del usuario
 * @returns Objeto con permisos de acceso
 */
export const getFeatureAccess = async (
  profile: ProfileRow | null | undefined,
  userId: string,
): Promise<FeatureAccess> => {
  const status = await getSubscriptionStatus(profile, userId);
  const trialDaysRemaining = calculateTrialDaysRemaining(profile?.created_at);

  const isSubscribed = status === 'subscribed';
  const hasTrial = status === 'trial_active';

  // IMPORTANTE: Si la prueba expiró y no tiene suscripción, NADA está disponible
  // Incluso el Round 1 se bloquea después de los 5 días si no hay suscripción
  if (status === 'trial_expired' && !isSubscribed) {
    return {
      canAccessRound1: false, // Bloqueado después de los 5 días sin suscripción
      canAccessRound2Plus: false,
      canAccessFreeMode: false,
      canAccessAITutor: false,
      canAccessGuidedMode: false, // Bloqueado completamente
    };
  }

  // Si tiene suscripción activa, todo está disponible
  if (isSubscribed) {
    return {
      canAccessRound1: true,
      canAccessRound2Plus: true,
      canAccessFreeMode: true,
      canAccessAITutor: true,
      canAccessGuidedMode: true,
    };
  }

  // Si tiene prueba activa (menos de 5 días desde created_at)
  if (hasTrial) {
    return {
      // Durante la prueba: Round 1 disponible, Round 2+ NO disponible
      canAccessRound1: true,
      canAccessRound2Plus: false, // Round 2+ requiere suscripción de pago
      canAccessFreeMode: false, // Modalità Libera siempre requiere suscripción de pago
      canAccessAITutor: true, // AI Tutor disponible durante prueba
      canAccessGuidedMode: true, // Al menos puede acceder al Round 1
    };
  }

  // Si no tiene created_at o estado desconocido, no tiene acceso
  return {
    canAccessRound1: false,
    canAccessRound2Plus: false,
    canAccessFreeMode: false,
    canAccessAITutor: false,
    canAccessGuidedMode: false,
  };
};

/**
 * Verifica si el usuario necesita mostrar la pantalla de planes
 * @param profile Perfil del usuario
 * @param userId ID del usuario
 * @param feature Feature que está intentando acceder
 * @returns true si debe mostrar la pantalla de planes
 */
export const shouldShowPlansScreen = async (
  profile: ProfileRow | null | undefined,
  userId: string,
  feature: 'guided_round2' | 'free_mode' | 'ai_tutor',
): Promise<boolean> => {
  const access = await getFeatureAccess(profile, userId);

  switch (feature) {
    case 'guided_round2':
      return !access.canAccessRound2Plus;
    case 'free_mode':
      return !access.canAccessFreeMode;
    case 'ai_tutor':
      return !access.canAccessAITutor;
    default:
      return false;
  }
};

/**
 * Obtiene información de la prueba gratuita del usuario
 */
export const getTrialInfo = (profile: ProfileRow | null | undefined) => {
  const daysRemaining = calculateTrialDaysRemaining(profile?.created_at);
  const isActive = daysRemaining > 0;
  const createdAt = profile?.created_at ? new Date(profile.created_at) : null;
  const trialEndDate = createdAt
    ? new Date(createdAt.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000)
    : null;

  return {
    daysRemaining,
    isActive,
    createdAt,
    trialEndDate,
    totalDays: TRIAL_DURATION_DAYS,
  };
};

/**
 * Verifica si el usuario puede elegir "prova gratuita" (solo si aún tiene días restantes)
 * IMPORTANTE: Si ya pasaron los 5 días, la prova gratuita NO otorga acceso
 * @param profile Perfil del usuario
 * @returns true si puede elegir prova gratuita (tiene días restantes)
 */
export const canChooseFreeTrial = (profile: ProfileRow | null | undefined): boolean => {
  return hasActiveTrial(profile);
};

/**
 * Determina qué debe pasar cuando el usuario elige "prova gratuita"
 * @param profile Perfil del usuario
 * @returns 'register_card' si puede registrar tarjeta y usar días restantes,
 *          'must_subscribe' si ya pasaron los 5 días y debe suscribirse
 */
export const handleFreeTrialChoice = (
  profile: ProfileRow | null | undefined,
): 'register_card' | 'must_subscribe' => {
  if (hasActiveTrial(profile)) {
    // Aún tiene días restantes: puede registrar tarjeta y usar días restantes
    return 'register_card';
  }
  // Ya pasaron los 5 días: debe suscribirse a un plan de pago
  return 'must_subscribe';
};

