import axios from 'axios';

const elevenLabsClient = axios.create({
  baseURL: process.env.ELEVENLABS_BASE_URL ?? 'https://api.elevenlabs.io/v1',
  headers: {
    'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
    'Content-Type': 'application/json',
  },
  responseType: 'arraybuffer',
});

export const synthesizeSpeech = async (text: string) => {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is not set');
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!voiceId) {
    throw new Error('ELEVENLABS_VOICE_ID is not set');
  }

  const payload = {
    text,
    model_id: process.env.ELEVENLABS_MODEL_ID ?? 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.3,
      similarity_boost: 0.8,
      style: 0.2,
      use_speaker_boost: true,
    },
  };

  const {data} = await elevenLabsClient.post(
    `/text-to-speech/${voiceId}`,
    payload,
    {
      headers: {
        Accept: 'audio/mpeg',
      },
    },
  );

  return data;
};

