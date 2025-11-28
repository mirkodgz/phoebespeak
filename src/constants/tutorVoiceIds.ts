/**
 * Mapeo de tutores a sus IDs de voz de ElevenLabs
 * 
 * Para configurar:
 * 1. Obtén el voiceId de cada tutor desde ElevenLabs
 * 2. Agrega las variables de entorno en backend/.env:
 *    - ELEVENLABS_VOICE_ID_DAVIDE (Víctor - voz masculina)
 *    - ELEVENLABS_VOICE_ID_PHOEBE (Ace - voz femenina)
 * 3. O usa los valores por defecto si solo tienes una voz configurada
 */

// Estos valores deben configurarse en las variables de entorno del backend
// Por ahora, usamos el valor de ELEVENLABS_VOICE_ID como fallback
export const TUTOR_VOICE_IDS: Record<'davide' | 'phoebe', string | undefined> = {
  davide: undefined, // Se usará ELEVENLABS_VOICE_ID del backend si no está definido
  phoebe: undefined, // Se usará ELEVENLABS_VOICE_ID del backend si no está definido
};

/**
 * Obtiene el voiceId para un tutor específico
 * @param tutorId - ID del tutor ('davide' o 'phoebe')
 * @returns El voiceId del tutor o undefined si no está configurado
 */
export const getTutorVoiceId = (tutorId: 'davide' | 'phoebe'): string | undefined => {
  return TUTOR_VOICE_IDS[tutorId];
};

