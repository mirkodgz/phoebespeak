import {EventEmitter} from 'events';
import {Platform} from 'react-native';

import {
  PRACTICE_SESSION_DATA,
  PRACTICE_HISTORY,
} from '../constants/mocks';
import {
  IPracticeHistoryItem,
  IPracticeSessionData,
  IPhonemeHint,
} from '../constants/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

// Debug: Log para verificar que la variable se carga
if (__DEV__) {
  console.log('[Practice Service] API_BASE_URL:', API_BASE_URL || 'NOT SET');
}

type TranscriptionSegment = {
  text: string;
  confidence?: number;
  start?: number;
  end?: number;
};

type TranscriptionResponse = {
  text?: string;
  segments?: TranscriptionSegment[];
  language?: string;
};

type PracticeFeedbackResponse = {
  summary?: string;
  score?: number;
  verdict?: 'correct' | 'needs_improvement';
};

const practiceEmitter = new EventEmitter();

const getApiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL is not defined. Configure it in your Expo .env file.',
    );
  }
  const fullUrl = `${API_BASE_URL}${path}`;
  if (__DEV__) {
    console.log('[Practice Service] Requesting URL:', fullUrl);
  }
  return fullUrl;
};

const convertFeedbackToHints = (): IPhonemeHint[] => [];

export const fetchPracticeSession = async (): Promise<IPracticeSessionData> => {
  return Promise.resolve(PRACTICE_SESSION_DATA);
};

export const fetchPracticeHistory = async (): Promise<
  IPracticeHistoryItem[]
> => Promise.resolve(PRACTICE_HISTORY);

export const subscribePracticeFeedback = (
  listener: (hint: IPhonemeHint) => void,
): (() => void) => {
  practiceEmitter.on('feedback', listener);
  return () => {
    practiceEmitter.removeListener('feedback', listener);
  };
};

export const emitFeedback = (hint: IPhonemeHint) => {
  practiceEmitter.emit('feedback', hint);
};

export const emitFeedbackBatch = (hints: IPhonemeHint[]) => {
  hints.forEach(emitFeedback);
};

export const emitMockFeedback = (hint: IPhonemeHint) => {
  emitFeedback(hint);
};

type UploadAudioOptions = {
  uri: string;
  mimeType?: string;
  fileName?: string;
};

const buildAudioFormData = ({uri, mimeType, fileName}: UploadAudioOptions) => {
  const extension = uri.split('.').pop();
  const finalName = fileName ?? `practice-${Date.now()}.${extension ?? 'm4a'}`;
  const finalMimeType =
    mimeType ??
    (extension === 'wav'
      ? 'audio/wav'
      : extension === 'mp3'
      ? 'audio/mpeg'
      : 'audio/m4a');

  if (Platform.OS === 'web') {
    throw new Error('La práctica de audio no está disponible en la web todavía.');
  }

  const audioFile: any = {
    uri,
    type: finalMimeType,
    name: finalName,
  };

  const formData = new FormData();
  formData.append('audio', audioFile);
  return formData;
};

const safeFetch = async (
  path: string,
  options?: RequestInit,
): Promise<Response> => {
  try {
    const url = getApiUrl(path);
    const response = await fetch(url, options);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Request failed (${response.status}): ${message || response.statusText}`,
      );
    }
    return response;
  } catch (error: any) {
    // Mejorar mensajes de error de red
    if (error?.message?.includes('Network request failed') || 
        error?.message?.includes('fetch') ||
        error?.name === 'TypeError') {
      throw new Error(
        'Error de conexión con el servidor. Verifica que el backend esté ejecutándose y que EXPO_PUBLIC_API_BASE_URL esté configurado correctamente en el archivo .env',
      );
    }
    if (error?.message?.includes('EXPO_PUBLIC_API_BASE_URL is not defined')) {
      throw error;
    }
    throw error;
  }
};

export const transcribePracticeAudio = async (
  options: UploadAudioOptions,
): Promise<TranscriptionResponse> => {
  const formData = buildAudioFormData(options);
  const response = await safeFetch('/practice/transcribe', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.json();
};

export const requestPracticeFeedback = async ({
  transcript,
  targetSentence,
  learnerProfile,
  segments,
  conversationContext,
}: {
  transcript: string;
  targetSentence?: string; // Opcional para flujos dinámicos
  learnerProfile?: {
    nativeLanguage?: string;
    proficiencyLevel?: string;
    learnerName?: string;
  };
  segments?: TranscriptionSegment[];
  conversationContext?: {
    scenarioId?: string;
    levelId?: string;
    currentTopic?: string;
  };
}): Promise<PracticeFeedbackResponse> => {
  const response = await safeFetch('/practice/feedback', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      transcript,
      targetSentence,
      learnerProfile,
      transcriptionSegments: segments,
      conversationContext,
    }),
  });

  const feedback = (await response.json()) as PracticeFeedbackResponse;
  const hints = convertFeedbackToHints();
  if (hints.length) {
    emitFeedbackBatch(hints);
  }
  return feedback;
};

export const requestNextConversationTurn = async ({
  scenarioId,
  levelId,
  conversationHistory,
  studentName,
  turnNumber,
  predefinedQuestions,
}: {
  scenarioId: string;
  levelId: string;
  conversationHistory: Array<{
    role: 'tutor' | 'user' | 'feedback';
    text: string;
  }>;
  studentName: string;
  turnNumber: number;
  predefinedQuestions?: string[]; // Preguntas predefinidas para usar en orden
}): Promise<{
  feedback?: string;
  question?: string;
  tutorMessage: string;
  shouldEnd: boolean;
  closingMessage?: string;
}> => {
  const response = await safeFetch('/practice/generate-next-turn', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      scenarioId,
      levelId,
      conversationHistory,
      studentName,
      turnNumber,
      predefinedQuestions,
    }),
  });

  return response.json();
};

export const requestPracticeVoice = async (text: string): Promise<string> => {
  try {
    const response = await safeFetch('/practice/voice', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text}),
    });

    const contentType = response.headers.get('content-type');
    
    if (__DEV__) {
      console.log('[Practice Service] Voice response status:', response.status);
      console.log('[Practice Service] Voice response content-type:', contentType);
    }

    // Verificar si la respuesta es JSON (error) en lugar de audio
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || 'Error al generar el audio. Verifica la configuración de ElevenLabs.'
      );
    }

    const buffer = await response.arrayBuffer();
    
    if (__DEV__) {
      console.log('[Practice Service] Audio buffer size:', buffer.byteLength);
    }

    if (buffer.byteLength === 0) {
      throw new Error('El servidor devolvió un buffer de audio vacío. Verifica la configuración de ElevenLabs.');
    }

    const base64 = arrayBufferToBase64(buffer);
    const dataUri = `data:audio/mpeg;base64,${base64}`;
    
    if (__DEV__) {
      console.log('[Practice Service] Audio data URI created, length:', dataUri.length);
    }

    return dataUri;
  } catch (error) {
    if (__DEV__) {
      console.error('[Practice Service] requestPracticeVoice error:', error);
    }
    throw error;
  }
};

export const requestTranslate = async (
  text: string,
  targetLanguage: string = 'italian',
): Promise<string> => {
  const response = await safeFetch('/practice/translate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text, targetLanguage}),
  });

  const data = (await response.json()) as {translation: string};
  return data.translation;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  let base64 = '';

  for (let i = 0; i < len; i += 3) {
    const a = bytes[i];
    const b = i + 1 < len ? bytes[i + 1] : 0;
    const c = i + 2 < len ? bytes[i + 2] : 0;

    const triplet = (a << 16) | (b << 8) | c;

    base64 +=
      chars[(triplet >> 18) & 0x3f] +
      chars[(triplet >> 12) & 0x3f] +
      (i + 1 < len ? chars[(triplet >> 6) & 0x3f] : '=') +
      (i + 2 < len ? chars[triplet & 0x3f] : '=');
  }

  return base64;
};

