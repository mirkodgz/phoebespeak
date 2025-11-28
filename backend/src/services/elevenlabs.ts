import axios from 'axios';

const elevenLabsClient = axios.create({
  baseURL: process.env.ELEVENLABS_BASE_URL ?? 'https://api.elevenlabs.io/v1',
  headers: {
    'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
    'Content-Type': 'application/json',
  },
  responseType: 'arraybuffer',
});

export const synthesizeSpeech = async (text: string, voiceId?: string) => {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is not set');
  }

  // Si no se proporciona voiceId, usar el de la variable de entorno (compatibilidad hacia atrás)
  const finalVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID;

  if (!finalVoiceId) {
    throw new Error('ELEVENLABS_VOICE_ID is not set and no voiceId was provided');
  }

  const payload = {
    text,
    model_id: process.env.ELEVENLABS_MODEL_ID ?? 'eleven_flash_v2_5',
    voice_settings: {
      stability: 0.3,
      similarity_boost: 0.8,
      style: 0.2,
      use_speaker_boost: true,
    },
  };

  try {
    const {data} = await elevenLabsClient.post(
      `/text-to-speech/${finalVoiceId}`,
      payload,
      {
        headers: {
          Accept: 'audio/mpeg',
        },
      },
    );

    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error(
        'Error de autenticación con ElevenLabs. Verifica que ELEVENLABS_API_KEY sea válida y que tengas créditos disponibles.',
      );
    }
    if (error.response?.status === 429) {
      throw new Error(
        'Límite de solicitudes excedido en ElevenLabs. Es posible que te hayas quedado sin créditos.',
      );
    }
    if (error.response?.status === 402) {
      throw new Error(
        'Sin créditos disponibles en ElevenLabs. Por favor, recarga tu cuenta.',
      );
    }
    throw error;
  }
};

