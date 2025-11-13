import {
  AudioModule,
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from 'expo-audio';
import type {AudioRecorder} from 'expo-audio';

export interface RecordingHandle {
  start: () => Promise<void>;
  stop: () => Promise<string | null>;
  reset: () => void;
}

const ensurePermissionsAsync = async () => {
  const current = await getRecordingPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await requestRecordingPermissionsAsync();
  if (!requested.granted) {
    throw new Error('Recording permission not granted');
  }
  return true;
};

const recordingAudioMode = {
  playsInSilentMode: true,
  allowsRecording: true,
  interruptionMode: 'mixWithOthers' as const,
  interruptionModeAndroid: 'duckOthers' as const,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
};

const idleAudioMode = {
  playsInSilentMode: true,
  allowsRecording: false,
  interruptionMode: 'mixWithOthers' as const,
  interruptionModeAndroid: 'duckOthers' as const,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
};

export const createRecordingHandle = (): RecordingHandle => {
  let recorder: AudioRecorder | null = null;

  const createRecorder = () =>
    new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);

  const start = async () => {
    try {
      await ensurePermissionsAsync();

      await setIsAudioActiveAsync(true);
      await setAudioModeAsync(recordingAudioMode);

      recorder = createRecorder();
      await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      recorder.record();
    } catch (error) {
      recorder = null;
      await setIsAudioActiveAsync(false);
      await setAudioModeAsync(idleAudioMode);
      if (__DEV__) {
        console.warn('Recording start failed', error);
      }
      throw error instanceof Error
        ? error
        : new Error('No se pudo iniciar la grabación');
    }
  };

  const stop = async () => {
    if (!recorder) {
      return null;
    }

    try {
      await recorder.stop();
      const uri = recorder.uri;
      recorder.remove?.();
      recorder = null;
      await setAudioModeAsync(idleAudioMode);
      await setIsAudioActiveAsync(false);
      return uri ?? null;
    } catch (error) {
      recorder = null;
      await setIsAudioActiveAsync(false);
      await setAudioModeAsync(idleAudioMode);
      if (__DEV__) {
        console.warn('Recording stop failed', error);
      }
      throw error;
    }
  };

  const reset = () => {
    recorder = null;
  };

  return {start, stop, reset};
};

