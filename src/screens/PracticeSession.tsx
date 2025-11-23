import React, {useEffect, useState, useMemo, useRef, useCallback} from 'react';
import {ScrollView, View, PanResponder, Animated, Dimensions} from 'react-native';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import {
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
  type AVPlaybackStatus,
} from 'expo-av';

import {
  Block,
  type AssistantOrbState,
  BrandActionButton,
  BrandBackground,
  Button,
  Image,
  RolePlayAvatar,
  Text,
} from '../components';
import {useData, usePracticeAudio, useTheme} from '../hooks';
import {
  transcribePracticeAudio,
  requestPracticeFeedback,
  requestPracticeVoice,
  requestNextConversationTurn,
  requestTranslate,
} from '../services/practice';
import {
  ROLE_PLAY_SCENARIOS,
  type RolePlayScenarioConfig,
  type RolePlayScenarioId,
  type RolePlayLevelId,
} from '../roleplay';

type PracticeVerdict = 'correct' | 'needs_improvement';

type PracticeSessionRouteParams = {
  scenarioId?: RolePlayScenarioId;
  levelId?: RolePlayLevelId;
};

type ChatMessageType = 'tutor' | 'user' | 'feedback' | 'system';

type ChatMessage = {
  id: string;
  type: ChatMessageType;
  text: string;
  timestamp: Date;
  verdict?: PracticeVerdict;
  isPlaying?: boolean;
  questionLetter?: string;
};

const PracticeSession = () => {
  const {sizes, colors, gradients, assets} = useTheme();
  const {practice, user, preferences} = useData();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const {scenarioId: routeScenarioId, levelId: routeLevelId} =
    (route?.params as PracticeSessionRouteParams) ?? {};
  const scenarioId =
    (routeScenarioId as RolePlayScenarioId | undefined) ?? 'jobInterview';
  const [activeLevelId, setActiveLevelId] = useState<RolePlayLevelId>(
    (routeLevelId as RolePlayLevelId | undefined) ?? 'beginner',
  );
  const scenarioConfig = useMemo<RolePlayScenarioConfig>(() => {
    const fallback = ROLE_PLAY_SCENARIOS.jobInterview;
    return ROLE_PLAY_SCENARIOS[scenarioId] ?? fallback;
  }, [scenarioId]);
  const {
    isRecording,
    lastUri,
    error,
    startRecording,
    stopRecording,
    reset,
  } = usePracticeAudio();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);
  const [analysisVerdict, setAnalysisVerdict] =
    useState<PracticeVerdict | null>(null);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [shouldPlayGreeting, setShouldPlayGreeting] = useState(true);
  const [dynamicFeedback, setDynamicFeedback] = useState<string | null>(null);
  const [completedTurns, setCompletedTurns] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{role: 'tutor' | 'user' | 'feedback'; text: string}>
  >([]);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [currentTurn, setCurrentTurn] = useState(0);
  const currentLevel = useMemo(() => {
    const fallback = scenarioConfig.levels[0];
    return (
      scenarioConfig.levels.find((level) => level.id === activeLevelId) ??
      fallback
    );
  }, [scenarioConfig, activeLevelId]);
  const conversationPairs = currentLevel?.conversation ?? [];
  const isDynamicFlow = currentLevel?.flowConfig?.mode === 'dynamic';
  const [assistantState, setAssistantState] =
    useState<AssistantOrbState>('idle');
  const [micPermission, setMicPermission] = useState<
    'unknown' | 'granted' | 'denied'
  >('unknown');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const speakingTimeout = useRef<NodeJS.Timeout | null>(null);
  const voiceSoundRef = useRef<Audio.Sound | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatScrollViewRef = useRef<ScrollView>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingTranslations, setLoadingTranslations] = useState<Record<string, boolean>>({});
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const defaultAvatarX = 20;
  const defaultAvatarY = 120;
  const avatarPosition = useRef(new Animated.ValueXY({x: defaultAvatarX, y: defaultAvatarY})).current;
  const avatarSize = useRef(new Animated.Value(120)).current;
  const recordingPulse1 = useRef(new Animated.Value(0)).current;
  const recordingPulse2 = useRef(new Animated.Value(0)).current;

  const bottomButtonHeight = sizes.l * 1.1;

  const studentFullName = useMemo(() => {
    const rawName =
      (typeof user?.name === 'string' && user.name.trim().length > 0
        ? user.name.trim()
        : undefined) ?? 'Studente';
    return rawName;
  }, [user?.name]);

  const studentFirstName = useMemo(() => {
    const [first] = studentFullName.split(' ');
    return first ?? studentFullName;
  }, [studentFullName]);

  const currentPair = useMemo(() => {
    if (isDynamicFlow || !conversationPairs.length) {
      return undefined;
    }
    const safeIndex =
      ((interviewIndex % conversationPairs.length) + conversationPairs.length) %
      conversationPairs.length;
    return conversationPairs[safeIndex];
  }, [conversationPairs, interviewIndex, isDynamicFlow]);

  const currentTutorPrompt = useMemo(() => {
    if (isDynamicFlow) {
      // Para flujo dinámico, obtener el último mensaje del tutor del historial
      const lastTutorMessage = conversationHistory
        .slice()
        .reverse()
        .find((msg) => msg.role === 'tutor');
      return lastTutorMessage?.text ?? '';
    }
    return currentPair?.tutor(studentFirstName) ?? '';
  }, [currentPair, studentFirstName, isDynamicFlow, conversationHistory]);

  const expectedUserSample = useMemo(() => {
    if (isDynamicFlow) {
      // Para flujo dinámico, no hay respuesta esperada exacta
      return '';
    }
    return currentPair?.user(studentFirstName) ?? '';
  }, [currentPair, studentFirstName, isDynamicFlow]);

  // Extraer solo el nombre del tutor (sin "Tutor IA ·")
  const tutorNameOnly = useMemo(() => {
    const fullName = practice.tutorName || '';
    const parts = fullName.split('·');
    return parts.length > 1 ? parts[parts.length - 1].trim() : fullName;
  }, [practice.tutorName]);

  const sessionProgress = useMemo(() => {
    if (isDynamicFlow) {
      const total = currentLevel?.flowConfig?.maxTurns ?? 6;
      const completed = Math.min(currentTurn, total);
      const percentage = Math.round((completed / total) * 100);
      return {
        completed,
        total,
        percentage,
      };
    }
    const total = Math.max(conversationPairs.length, 1);
    const completed = Math.min(completedTurns, total);
    const percentage = Math.round((completed / total) * 100);
    return {
      completed,
      total,
      percentage,
    };
  }, [
    conversationPairs.length,
    completedTurns,
    isDynamicFlow,
    currentTurn,
    currentLevel?.flowConfig?.maxTurns,
  ]);

  const loadMicPermission = useCallback(async () => {
    try {
      const status = await getRecordingPermissionsAsync();
      setMicPermission(status.granted ? 'granted' : 'denied');
    } catch (permissionError) {
      setMicPermission('denied');
      if (__DEV__) {
        console.warn('Error checking microphone permission', permissionError);
      }
    }
  }, []);

  useEffect(() => {
    loadMicPermission();
  }, [loadMicPermission]);

  // Animación de pulso para cuando está grabando
  useEffect(() => {
    if (isRecording) {
      // Anillo exterior
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulse1, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingPulse1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Anillo interior
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulse2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(recordingPulse2, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      recordingPulse1.setValue(0);
      recordingPulse2.setValue(0);
    }
  }, [isRecording, recordingPulse1, recordingPulse2]);

  useEffect(() => {
    const configurePlayback = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        if (__DEV__) {
          console.warn('Playback audio mode setup failed', error);
        }
      }
    };

    configurePlayback();
  }, []);

  useEffect(() => {
    return () => {
      if (speakingTimeout.current) {
        clearTimeout(speakingTimeout.current);
      }
    };
  }, []);

  const stopVoicePlayback = useCallback(async () => {
    if (voiceSoundRef.current) {
      try {
        await voiceSoundRef.current.stopAsync();
      } catch (error) {
        if (__DEV__) {
          console.warn('Stop voice playback error', error);
        }
      }
      try {
        await voiceSoundRef.current.unloadAsync();
      } catch (error) {
        if (__DEV__) {
          console.warn('Unload voice playback error', error);
        }
      }
      voiceSoundRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopVoicePlayback();
    };
  }, [stopVoicePlayback]);

  // Detener audio y grabación cuando la pantalla pierde el foco (navegación a otra pantalla)
  useFocusEffect(
    useCallback(() => {
      // Cuando la pantalla gana el foco, no hacemos nada especial
      // (el audio puede continuar si estaba reproduciéndose)
      
      return () => {
        // Cuando la pantalla pierde el foco, detener todo el audio y grabación
        void stopVoicePlayback();
        setIsPlayingVoice(false);
        if (speakingTimeout.current) {
          clearTimeout(speakingTimeout.current);
          speakingTimeout.current = null;
        }
        setAssistantState('idle');
        
        // Si está grabando, detener la grabación
        if (isRecording) {
          void stopRecording().catch((error) => {
            if (__DEV__) {
              console.warn('Error stopping recording on blur:', error);
            }
          });
        }
      };
    }, [stopVoicePlayback, isRecording, stopRecording]),
  );

  const handleLevelSelect = useCallback(
    (levelId: RolePlayLevelId) => {
      if (levelId === activeLevelId) return;
      void stopVoicePlayback();
      setIsPlayingVoice(false);
      setActiveLevelId(levelId);
    },
    [activeLevelId, stopVoicePlayback],
  );

  useEffect(() => {
    setInterviewIndex(0);
    setCompletedTurns(0);
    setCurrentTurn(0);
    setConversationHistory([]);
    setIsConversationActive(true);
    setShouldPlayGreeting(true);
    setAnalysisSummary(null);
    setAnalysisVerdict(null);
    setDynamicFeedback(null);
    setProcessingError(null);
    setVoiceError(null);
    setIsPlayingVoice(false);
    void stopVoicePlayback();
  }, [currentLevel, stopVoicePlayback]);

  const requestMicPermission = useCallback(async () => {
    try {
      const result = await requestRecordingPermissionsAsync();
      const granted = result.granted ?? false;
      setMicPermission(granted ? 'granted' : 'denied');
      return granted;
    } catch (permissionError) {
      setMicPermission('denied');
      setProcessingError(
        'Non è stato possibile richiedere il permesso del microfono. Controlla le impostazioni del dispositivo.',
      );
      return false;
    }
  }, []);

  const handleStartRecording = async () => {
    if (micPermission !== 'granted') {
      const granted = await requestMicPermission();
      if (!granted) return;
    }

    setAssistantState('listening');
    setAnalysisSummary(null);
    setAnalysisVerdict(null);
    setProcessingError(null);
    setVoiceError(null);
    setIsPlayingVoice(false);
    await stopVoicePlayback();
    try {
      await startRecording();
    } catch (recordError) {
      setAssistantState('idle');
      throw recordError;
    }
  };

  const handleResetRecording = () => {
    reset();
    setAnalysisSummary(null);
    setAnalysisVerdict(null);
    setProcessingError(null);
    setVoiceError(null);
    setDynamicFeedback(null);
    stopVoicePlayback();
    setIsPlayingVoice(false);
    setShouldPlayGreeting(true);
    if (speakingTimeout.current) clearTimeout(speakingTimeout.current);
    setAssistantState('idle');
  };

  const playVoiceMessage = useCallback(
    async (text?: string) => {
      if (!text) return;

      try {
        setVoiceError(null);
        await stopVoicePlayback();
        
        if (__DEV__) {
          console.log('[PracticeSession] Requesting voice for text:', text.substring(0, 50) + '...');
        }
        
        const uri = await requestPracticeVoice(text);
        
        if (__DEV__) {
          console.log('[PracticeSession] Voice URI received, creating audio sound...');
        }
        
        const SYNC_THRESHOLD = 200;
        let finishResolve: (() => void) | null = null;
        
        const statusHandler = (status: AVPlaybackStatus) => {
          if (!status.isLoaded) {
            if ('error' in status && status.error && __DEV__) {
              console.warn('Voice playback status error', status.error);
            }
            return;
          }
          const shouldAnimate =
            Boolean(status.isPlaying) &&
            typeof status.positionMillis === 'number' &&
            status.positionMillis >= SYNC_THRESHOLD;
          setIsPlayingVoice(shouldAnimate);
          if (status.didJustFinish) {
            setIsPlayingVoice(false);
            if (finishResolve) {
              finishResolve();
              finishResolve = null;
            }
            voiceSoundRef.current?.setOnPlaybackStatusUpdate(null);
            voiceSoundRef.current?.unloadAsync().catch(() => {});
            voiceSoundRef.current = null;
          }
        };
        const {sound, status} = await Audio.Sound.createAsync(
          {uri},
          {shouldPlay: true},
          statusHandler,
        );
        voiceSoundRef.current = sound;
        const initialShouldAnimate =
          status.isLoaded &&
          status.isPlaying &&
          typeof status.positionMillis === 'number' &&
          status.positionMillis >= SYNC_THRESHOLD;
        setIsPlayingVoice(initialShouldAnimate);
        
        // Esperar a que termine el audio
        return new Promise<void>((resolve) => {
          finishResolve = resolve;
          
          // Timeout de seguridad por si el audio no termina correctamente (30 segundos)
          const timeoutId = setTimeout(() => {
            if (finishResolve) {
              finishResolve();
              finishResolve = null;
            }
          }, 30000);
          
          // Verificar si ya terminó
          sound.getStatusAsync().then((currentStatus) => {
            if (currentStatus.isLoaded && currentStatus.didJustFinish) {
              clearTimeout(timeoutId);
              if (finishResolve) {
                finishResolve();
                finishResolve = null;
              }
            }
          }).catch(() => {
            clearTimeout(timeoutId);
            if (finishResolve) {
              finishResolve();
              finishResolve = null;
            }
          });
        });
      } catch (voiceErrorInstance) {
        const message =
          voiceErrorInstance instanceof Error
            ? voiceErrorInstance.message
            : 'Impossibile riprodurre il feedback.';
        setVoiceError(message);
        if (__DEV__) {
          console.warn('playVoiceMessage error', voiceErrorInstance);
        }
        setIsPlayingVoice(false);
      }
    },
    [stopVoicePlayback],
  );

  // Agregar mensaje al chat
  const addChatMessage = useCallback(
    (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      const newMessage: ChatMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    },
    [],
  );

  const triggerSpeakingAnimation = useCallback(() => {
    if (speakingTimeout.current) {
      clearTimeout(speakingTimeout.current);
    }
    setAssistantState('speaking');
    speakingTimeout.current = setTimeout(() => {
      setAssistantState('idle');
    }, 2400);
  }, []);

  // Manejar saludo inicial y primera pregunta para flujo dinámico
  useEffect(() => {
    if (!shouldPlayGreeting || !isDynamicFlow || !currentLevel?.flowConfig) return;
    const flowConfig = currentLevel.flowConfig;

    const timeoutId = setTimeout(async () => {
      const greeting = flowConfig.initialGreeting(studentFirstName);
      const firstQuestionFull = flowConfig.firstQuestion(studentFirstName);
      
      // Separar la pregunta del ejemplo
      // Formato esperado: "Tell me about yourself. Here is a simple example answer: 'ejemplo...' Now please tell me about yourself."
      const exampleMatch = firstQuestionFull.match(/Here is (?:a simple )?example answer:\s*'([^']+)'/i);
      const beforeExample = firstQuestionFull.split(/Here is (?:a simple )?example answer:/i)[0].trim();
      const afterExample = firstQuestionFull.split(/'([^']+)'/).pop()?.trim() || '';
      const exampleText = exampleMatch ? exampleMatch[1] : '';
      
      // Construir la pregunta sin el texto final "Now please tell me..."
      const questionText = beforeExample + (exampleMatch ? " Here is a simple example answer:" : "");
      const exampleMessage = exampleText ? `'${exampleText}'` : '';
      
      // Eliminar el texto final "Now please tell me about yourself." o similar
      const cleanQuestionText = questionText.replace(/\s*Now please tell me.*$/i, '').trim();
      
      const fullMessage = `${greeting} ${firstQuestionFull}`;

      // Agregar al historial
      setConversationHistory([
        {role: 'tutor', text: greeting},
        {role: 'tutor', text: cleanQuestionText},
        {role: 'tutor', text: exampleMessage},
      ]);

      // Agregar al chat usando setChatMessages directamente
      const greetingMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        type: 'tutor',
        text: greeting,
        timestamp: new Date(),
      };
      const questionMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}-${Math.random()}`,
        type: 'tutor',
        text: cleanQuestionText,
        timestamp: new Date(),
        questionLetter: 'A',
      };
      const exampleMsg: ChatMessage = {
        id: `msg-${Date.now() + 2}-${Math.random()}`,
        type: 'tutor',
        text: exampleMessage,
        timestamp: new Date(),
        questionLetter: 'A',
      };
      setChatMessages((prev) => [...prev, greetingMsg, questionMsg, exampleMsg]);

      setShouldPlayGreeting(false);
      setCurrentTurn(1);

      triggerSpeakingAnimation();
      // Reproducir solo el saludo y la pregunta sin el ejemplo y sin el texto final
      const audioToPlay = `${greeting} ${cleanQuestionText}`;
      playVoiceMessage(audioToPlay).catch(() => {
        setShouldPlayGreeting(true);
      });
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [
    shouldPlayGreeting,
    isDynamicFlow,
    currentLevel?.flowConfig,
    studentFirstName,
    playVoiceMessage,
    triggerSpeakingAnimation,
  ]);

  // Manejar saludo para flujo estático (comportamiento original)
  useEffect(() => {
    if (!shouldPlayGreeting || isDynamicFlow || !currentTutorPrompt) return;

    const timeoutId = setTimeout(() => {
      const greetingMessage = currentTutorPrompt;
      setShouldPlayGreeting(false);

      triggerSpeakingAnimation();
      playVoiceMessage(greetingMessage).catch(() => {
        setShouldPlayGreeting(true);
      });
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [
    shouldPlayGreeting,
    currentTutorPrompt,
    playVoiceMessage,
    triggerSpeakingAnimation,
    isDynamicFlow,
  ]);

  const analyzeRecording = async (uri: string) => {
    setAssistantState('listening');
    setIsProcessing(true);
    setProcessingError(null);
    setAnalysisSummary(null);
    setAnalysisVerdict(null);
    setVoiceError(null);
    setIsPlayingVoice(false);
    await stopVoicePlayback();

    try {
      const transcription = await transcribePracticeAudio({uri});
      let transcriptText =
        transcription?.text ||
        transcription?.segments?.map((segment) => segment.text).join(' ') ||
        '';

      if (!transcriptText) {
        throw new Error(
          'Impossibile ottenere la trascrizione. Prova a registrare di nuovo.',
        );
      }

      // Validar que el idioma detectado sea inglés
      const detectedLanguage = transcription?.language?.toLowerCase();
      if (detectedLanguage && detectedLanguage !== 'en' && detectedLanguage !== 'english') {
        console.warn('Idioma detectado incorrecto:', detectedLanguage, 'Texto:', transcriptText);
        throw new Error(
          `La transcripción fue detectada en ${detectedLanguage} en lugar de inglés. Por favor, intenta grabar de nuevo hablando claramente en inglés.`,
        );
      }

      // Validar que el texto esté en inglés (detectar caracteres cirílicos u otros alfabetos)
      const hasCyrillic = /[\u0400-\u04FF]/.test(transcriptText);
      const hasNonLatinChars = /[А-Яа-яЁёЄєІіЇїҐґ]/.test(transcriptText);
      
      if (hasNonLatinChars || hasCyrillic) {
        console.warn('Transcripción contiene caracteres no latinos:', transcriptText);
        throw new Error(
          'La transcripción parece contener caracteres en un idioma incorrecto. Por favor, intenta grabar de nuevo hablando claramente en inglés.',
        );
      }

      // Limpiar el texto de espacios extra y caracteres especiales problemáticos
      transcriptText = transcriptText.trim().replace(/\s+/g, ' ');

      addChatMessage({
        type: 'user',
        text: transcriptText,
      });

      // Actualizar historial de conversación
      const updatedHistory = [
        ...conversationHistory,
        {role: 'user' as const, text: transcriptText},
      ];
      setConversationHistory(updatedHistory);

      // Para flujo dinámico: el tutor AI maneja todo, no necesitamos feedback separado
      if (isDynamicFlow && isConversationActive) {
        // Generar siguiente pregunta directamente (el tutor incluirá las correcciones y feedback)
        try {
          // Obtener preguntas predefinidas si existen
          const predefinedQuestions = currentLevel?.flowConfig?.followUpQuestions?.map(
            (q) => q(studentFirstName)
          );

          const nextTurn = await requestNextConversationTurn({
            scenarioId,
            levelId: activeLevelId,
            conversationHistory: updatedHistory,
            studentName: studentFirstName,
            turnNumber: currentTurn + 1,
            predefinedQuestions,
            // No pasamos lastFeedback porque el tutor genera todo
          });

          if (nextTurn.shouldEnd) {
            // Terminar conversación
            setIsConversationActive(false);
            const closingMessage =
              nextTurn.closingMessage ??
              `Thank you for the interview, ${studentFirstName}. You did great!`;
            addChatMessage({
              type: 'tutor',
              text: closingMessage,
            });
            setConversationHistory([
              ...updatedHistory,
              {role: 'tutor', text: closingMessage},
            ]);
            triggerSpeakingAnimation();
            await playVoiceMessage(closingMessage);
          } else {
            // Separar feedback y pregunta
            const feedback = nextTurn.feedback || "Good!";
            const questionFull = nextTurn.question || nextTurn.tutorMessage;
            
            // Separar la pregunta del ejemplo (igual que con la primera pregunta)
            const exampleMatch = questionFull.match(/Here is (?:a )?possible answer:\s*'([^']+)'/i);
            const beforeExample = questionFull.split(/Here is (?:a )?possible answer:/i)[0].trim();
            const exampleText = exampleMatch ? exampleMatch[1] : '';
            
            // Construir la pregunta sin el texto final "Now please tell me..."
            const questionText = beforeExample + (exampleMatch ? " Here is a possible answer:" : "");
            const exampleMessage = exampleText ? `'${exampleText}'` : '';
            
            // Eliminar el texto final "Now please tell me..." o similar
            const cleanQuestionText = questionText.replace(/\s*Now please tell me.*$/i, '').trim();
            
            // Primero mostrar y reproducir el feedback
            addChatMessage({
              type: 'feedback',
              text: feedback,
            });
            const historyWithFeedback = [
              ...updatedHistory,
              {role: 'feedback' as const, text: feedback},
            ];
            setConversationHistory(historyWithFeedback);
            triggerSpeakingAnimation();
            await playVoiceMessage(feedback);
            
            // Pequeña pausa entre feedback y pregunta
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Luego mostrar la pregunta (sin el ejemplo)
            // Determinar la letra de la pregunta basada en el turno actual
            const questionLetters = ['A', 'B', 'C', 'D', 'E'];
            const questionLetter = questionLetters[Math.min(currentTurn, questionLetters.length - 1)] || 'E';
            
            addChatMessage({
              type: 'tutor',
              text: cleanQuestionText,
              questionLetter: questionLetter,
            });
            const historyWithQuestion = [
              ...historyWithFeedback,
              {role: 'tutor' as const, text: cleanQuestionText},
            ];
            
            // Si hay ejemplo, mostrarlo en una burbuja separada
            if (exampleMessage) {
              addChatMessage({
                type: 'tutor',
                text: exampleMessage,
                questionLetter: questionLetter,
              });
              setConversationHistory([
                ...historyWithQuestion,
                {role: 'tutor' as const, text: exampleMessage},
              ]);
              // Reproducir solo la pregunta sin el ejemplo y sin el texto final
              setCurrentTurn((prev) => prev + 1);
              triggerSpeakingAnimation();
              await playVoiceMessage(cleanQuestionText);
            } else {
              setConversationHistory(historyWithQuestion);
              // Reproducir solo la pregunta sin el texto final
              setCurrentTurn((prev) => prev + 1);
              triggerSpeakingAnimation();
              await playVoiceMessage(cleanQuestionText);
            }
          }
        } catch (error) {
          console.error('Error generating next turn:', error);
          // Continuar sin siguiente pregunta si hay error
        }
      } else {
        // Para flujo estático, mantener feedback como antes
        const feedback = await requestPracticeFeedback({
          transcript: transcriptText,
          targetSentence: expectedUserSample,
          learnerProfile: {
            nativeLanguage: 'Italiano',
            proficiencyLevel: activeLevelId === 'beginner' ? 'Principiante' : activeLevelId === 'intermediate' ? 'Intermedio' : 'Avanzato',
            learnerName: studentFullName,
          },
          segments: transcription?.segments,
        });

        setAnalysisSummary(feedback.summary ?? null);
        setAnalysisVerdict(feedback.verdict ?? null);

        const feedbackText =
          feedback.summary ??
          `Analisi completata, ${studentFirstName}. Ottimo lavoro! Continua a praticare.`;

        addChatMessage({
          type: 'feedback',
          text: feedbackText,
          verdict: feedback.verdict ?? undefined,
        });
        
        triggerSpeakingAnimation();
        playVoiceMessage(feedbackText);
      }
    } catch (feedbackError) {
      setAssistantState('idle');
      setDynamicFeedback(null);
      const message =
        feedbackError instanceof Error
          ? feedbackError.message
          : 'La valutazione non è riuscita, riprova.';
      setProcessingError(message);

      addChatMessage({
        type: 'system',
        text: message,
      });

      if (__DEV__) {
        console.warn('Practice feedback error', feedbackError);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReanalyzeRecording = async () => {
    if (!lastUri) {
      setProcessingError('Registra una frase per avviare l’analisi.');
      return;
    }
    await analyzeRecording(lastUri);
  };

  const handleStopRecording = async () => {
    const uri = await stopRecording();
    if (!uri) {
      setAssistantState('idle');
      return;
    }

    await analyzeRecording(uri);
  };

  const handleToggleRecordingWrapper = async () => {
    if (micPermission !== 'granted') {
      await requestMicPermission();
      return;
    }

    if (isRecording) {
      await handleStopRecording();
    } else {
      await handleStartRecording();
    }
  };

  const avatarMode = (() => {
    if (isPlayingVoice || assistantState === 'speaking') {
      return 'speaking' as const;
    }
    if (isRecording || assistantState === 'listening') {
      return 'listening' as const;
    }
    return 'idle' as const;
  })();

  // PanResponder para hacer el avatar arrastrable
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAvatarExpanded,
      onMoveShouldSetPanResponder: () => !isAvatarExpanded,
      onPanResponderGrant: () => {
        avatarPosition.setOffset({
          x: (avatarPosition.x as any)._value,
          y: (avatarPosition.y as any)._value,
        });
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isAvatarExpanded) {
          avatarPosition.setValue({x: gestureState.dx, y: gestureState.dy});
        }
      },
      onPanResponderRelease: () => {
        avatarPosition.flattenOffset();
      },
    }),
  ).current;

  // Función para expandir/contraer el avatar
  const toggleAvatarSize = useCallback(() => {
    if (isAvatarExpanded) {
      // Contraer y volver a la posición original
      Animated.parallel([
        Animated.spring(avatarSize, {
          toValue: 120,
          useNativeDriver: false,
        }),
        Animated.spring(avatarPosition, {
          toValue: {x: defaultAvatarX, y: defaultAvatarY},
          useNativeDriver: false,
        }),
      ]).start();
      setIsAvatarExpanded(false);
    } else {
      // Expandir y mover a la posición central (como estaba antes)
      const expandedX = (screenWidth - 250) / 2;
      const expandedY = 100;
      Animated.parallel([
        Animated.spring(avatarSize, {
          toValue: 250,
          useNativeDriver: false,
        }),
        Animated.spring(avatarPosition, {
          toValue: {x: expandedX, y: expandedY},
          useNativeDriver: false,
        }),
      ]).start();
      setIsAvatarExpanded(true);
    }
  }, [isAvatarExpanded, avatarSize, avatarPosition, defaultAvatarX, defaultAvatarY, screenWidth]);

  const goToNextInterviewSentence = useCallback(async () => {
    await stopVoicePlayback();
    setIsPlayingVoice(false);
    
    // Para flujo dinámico, no hay "siguiente turno" manual, se genera automáticamente
    if (isDynamicFlow) {
      return;
    }

    if (conversationPairs.length > 0) {
      setInterviewIndex((prev) => (prev + 1) % conversationPairs.length);
      setCompletedTurns((prev) =>
        Math.min(prev + 1, conversationPairs.length),
      );
    }
    setShouldPlayGreeting(true);
    setAnalysisSummary(null);
    setAnalysisVerdict(null);
    setProcessingError(null);
    setDynamicFeedback(null);
    setVoiceError(null);
    setAssistantState('idle');
    setChatMessages([]);
  }, [conversationPairs.length, stopVoicePlayback, isDynamicFlow]);

  const handleTranslate = useCallback(
    async (messageId: string, text: string) => {
      if (translations[messageId] || loadingTranslations[messageId]) {
        return;
      }

      setLoadingTranslations((prev) => ({...prev, [messageId]: true}));
      try {
        const translation = await requestTranslate(text, 'italian');
        setTranslations((prev) => ({...prev, [messageId]: translation}));
        // Mostrar la traducción automáticamente cuando se obtiene
        setShowTranslations((prev) => ({...prev, [messageId]: true}));
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setLoadingTranslations((prev) => ({...prev, [messageId]: false}));
      }
    },
    [translations, loadingTranslations],
  );

  const handleReplayAudio = useCallback(
    async (text: string) => {
      try {
        await playVoiceMessage(text);
      } catch (error) {
        console.error('Replay audio error:', error);
      }
    },
    [playVoiceMessage],
  );

  const ChatMessageBubble = ({message}: {message: ChatMessage}) => {
    const isTutor = message.type === 'tutor';
    const isUser = message.type === 'user';
    const isFeedback = message.type === 'feedback';
    const isSystem = message.type === 'system';
    const hasTranslation = Boolean(translations[message.id]);
    const isLoadingTranslation = loadingTranslations[message.id] ?? false;
    const showTranslation = showTranslations[message.id] ?? false;

    if (isSystem) {
      return (
        <Block align="center" marginVertical={sizes.xs}>
          <Text size={sizes.p - 2} color="rgba(51,65,85,0.6)" center>
            {message.text}
          </Text>
        </Block>
      );
    }

    const alignLeft = isTutor || isFeedback;

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: alignLeft ? 'flex-start' : 'flex-end',
          marginBottom: sizes.md,
          paddingHorizontal: sizes.xs,
        }}>
        <View
          style={{
            paddingHorizontal: sizes.md,
            paddingVertical: sizes.sm,
            backgroundColor: alignLeft
              ? '#0b3d4d'
              : '#60CB58',
            borderRadius: sizes.md,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            maxWidth: '90%',
          }}>
          {/* Etiqueta de nombre */}
          {(isTutor || isUser || isFeedback) && (
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
              {(isTutor || isFeedback) && message.questionLetter && (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#17C1E8',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 6,
                  }}>
                  <Text
                    bold
                    size={sizes.p - 4}
                    color="#FFFFFF">
                    {message.questionLetter}
                  </Text>
                </View>
              )}
              <Text
                bold
                size={sizes.p - 3}
                color={
                  isTutor || isFeedback
                    ? '#17C1E8'
                    : '#FFFFFF'
                }>
                {isTutor || isFeedback
                  ? `${tutorNameOnly} dice:`
                  : `${studentFirstName} dice:`}
              </Text>
            </View>
          )}
          {/* Texto original en inglés - siempre visible */}
          <Text
            size={sizes.p}
            color="#FFFFFF"
            style={{
              lineHeight: sizes.p * 1.4,
            }}>
            {message.text}
          </Text>
          
          {/* Traducción en italiano - aparece debajo cuando está activa */}
          {showTranslation && hasTranslation && (
            <View
              style={{
                marginTop: sizes.xs,
                paddingHorizontal: sizes.xs,
                paddingVertical: sizes.xs / 2,
                backgroundColor: 'rgba(255, 193, 7, 0.15)', // Fondo amarillo suave
                borderRadius: sizes.xs,
                borderLeftWidth: 2,
                borderLeftColor: '#FFC107', // Borde izquierdo amarillo
                width: '100%',
              }}>
              <Text
                size={sizes.p - 3}
                style={{
                  lineHeight: sizes.p + 1,
                  color: '#856404', // Color marrón oscuro para el texto de traducción
                  fontStyle: 'italic',
                  flexShrink: 1,
                }}>
                {translations[message.id]}
              </Text>
            </View>
          )}
          
          {/* Iconos para mensajes del tutor y feedback */}
          {(isTutor || isFeedback) && (
            <View style={{flexDirection: 'row', marginTop: sizes.sm, gap: sizes.sm}}>
              {/* Icono de traducción */}
              <Button
                onPress={() => {
                  if (!hasTranslation && !isLoadingTranslation) {
                    handleTranslate(message.id, message.text);
                  } else if (hasTranslation) {
                    setShowTranslations((prev) => ({
                      ...prev,
                      [message.id]: !showTranslation,
                    }));
                  }
                }}
                style={{
                  width: 24,
                  height: 24,
                  padding: 0,
                  backgroundColor: 'transparent',
                }}
                disabled={isLoadingTranslation}>
                {isLoadingTranslation ? (
                  <Ionicons name="hourglass" size={18} color="rgba(255,255,255,0.7)" />
                ) : (
                  <Ionicons
                    name={showTranslation ? 'language' : 'language-outline'}
                    size={18}
                    color="rgba(255,255,255,0.7)"
                  />
                )}
              </Button>
              
              {/* Icono de audio/pausa */}
              <Button
                onPress={() => handleReplayAudio(message.text)}
                style={{
                  width: 24,
                  height: 24,
                  padding: 0,
                  backgroundColor: 'transparent',
                }}>
                <Ionicons name="pause" size={18} color="rgba(255,255,255,0.7)" />
              </Button>
              
              {/* Icono de replay */}
              <Button
                onPress={() => handleReplayAudio(message.text)}
                style={{
                  width: 24,
                  height: 24,
                  padding: 0,
                  backgroundColor: 'transparent',
                }}>
                <Ionicons name="reload" size={18} color="rgba(255,255,255,0.7)" />
              </Button>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f1f5f9'}}>
      {/* HEADER CON BARRA DE PROGRESO */}
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: sizes.padding,
          paddingBottom: sizes.sm,
          backgroundColor: '#f1f5f9',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: sizes.sm,
          }}>
          <Text size={sizes.p * 1.5} color="#334155" semibold>
            📊
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: sizes.xs}}>
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 2,
                marginRight: sizes.sm,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  height: '100%',
                  width: `${sessionProgress.percentage}%`,
                  backgroundColor: '#60CB58',
                  borderRadius: 2,
                }}
              />
            </View>
          </View>
          <Button
            onPress={() => {
              // Navegar de vuelta a RolePlayMain (el nombre en el stack anidado)
              navigation.navigate('RolePlayMain');
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}>
            <Ionicons name="close" size={24} color="#334155" />
          </Button>
        </View>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <View style={{flex: 1}}>
        {/* AVATAR FLOTANTE */}
        <Animated.View
          style={{
            position: 'absolute',
            width: avatarSize,
            height: avatarSize,
            zIndex: 10,
            transform: [
              {translateX: avatarPosition.x},
              {translateY: avatarPosition.y},
            ],
          }}
          {...panResponder.panHandlers}>
          <Animated.View
            style={{
              width: avatarSize,
              height: avatarSize.interpolate({
                inputRange: [120, 250],
                outputRange: [156, 325], // 120 * 1.3 = 156, 250 * 1.3 = 325
              }) as any,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: 'transparent',
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}>
            <View style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
              <RolePlayAvatar 
                mode={avatarMode} 
                size={isAvatarExpanded ? 250 : 120}
                tutor={preferences.selectedTutor || 'davide'}
              />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 6,
                left: 0,
                right: 0,
                alignItems: 'center',
              }}>
              <View
                style={{
                  backgroundColor: '#60CB58',
                  paddingHorizontal: sizes.xs * 0.7,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}>
                <Text white semibold size={sizes.p - 6}>
                  {tutorNameOnly}
                </Text>
              </View>
            </View>
            {/* Botón para expandir/contraer */}
            <Button
              onPress={toggleAvatarSize}
              style={{
                position: 'absolute',
                top: sizes.xs,
                right: sizes.xs,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: 'rgba(0,0,0,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons
                name={isAvatarExpanded ? 'contract' : 'expand'}
                size={16}
                color="#FFFFFF"
              />
            </Button>
          </Animated.View>
        </Animated.View>

        {/* CHAT AREA */}
        <ScrollView
          ref={chatScrollViewRef}
          style={{flex: 1}}
          contentContainerStyle={{
            paddingHorizontal: sizes.padding,
            paddingTop: 180,
            paddingBottom: (sizes.sm * 2 + 32) + 3,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            chatScrollViewRef.current?.scrollToEnd({animated: true});
          }}>
          {/* Mostrar prompt del tutor solo para flujo estático */}
          {!isDynamicFlow && currentTutorPrompt && (
            <View style={{marginBottom: sizes.md}}>
              <View
                style={{
                  backgroundColor: '#0b3d4d',
                  paddingHorizontal: sizes.md,
                  paddingVertical: sizes.sm,
                  borderRadius: sizes.md,
                  maxWidth: '90%',
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                <Text
                  bold
                  marginBottom={4}
                  size={sizes.p - 3}
                  color="#17C1E8">
                  {tutorNameOnly} dice:
                </Text>
                <Text
                  white
                  size={sizes.p}
                  style={{lineHeight: sizes.p * 1.4}}>
                  {currentTutorPrompt}
                </Text>
              </View>
            </View>
          )}

          {chatMessages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}

          {isProcessing && (
            <View style={{marginBottom: sizes.sm}}>
              <View
                style={{
                  backgroundColor: '#F1F5F9',
                  paddingHorizontal: sizes.sm,
                  paddingVertical: sizes.xs,
                  borderRadius: sizes.md,
                  maxWidth: '75%',
                }}>
                <Text size={sizes.p - 2} color="#64748B">
                  Analisi in corso...
                </Text>
              </View>
            </View>
          )}

          {/* Ejemplo dinámico - Solo visual, NO interactivo */}
          {expectedUserSample && !isRecording && !isProcessing && (
            <View style={{alignItems: 'center', marginTop: sizes.md, marginBottom: sizes.sm}}>
              <View
                style={{
                  paddingHorizontal: sizes.sm,
                  paddingVertical: sizes.xs,
                }}>
                <Text
                  bold
                  size={sizes.p - 3}
                  color="#0b3d4d"
                  center
                  style={{
                    marginBottom: 2,
                  }}>
                  💬 Devi rispondere:
                </Text>
                <Text
                  size={sizes.p - 2}
                  color="#334155"
                  center
                  style={{
                    lineHeight: (sizes.p - 2) * 1.3,
                  }}>
                  {expectedUserSample}
                </Text>
              </View>
            </View>
          )}

          {processingError && (
            <View style={{alignItems: 'center', marginTop: sizes.sm}}>
              <Text
                color="#DC2626"
                size={sizes.p - 2}
                center>
                {processingError}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* MICRÓFONO FLOTANTE */}
        <View
          style={{
            position: 'absolute',
            bottom: insets.bottom - 25,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 10,
          }}>
          {/* Anillos de pulso cuando está grabando */}
          {isRecording && (
            <>
              <Animated.View
                style={{
                  position: 'absolute',
                  width: sizes.sm * 2 + 32 + 40,
                  height: sizes.sm * 2 + 32 + 40,
                  borderRadius: (sizes.sm * 2 + 32 + 40) / 2,
                  borderWidth: 2,
                  borderColor: 'rgba(234, 6, 6, 0.3)',
                  opacity: recordingPulse1,
                  transform: [
                    {
                      scale: recordingPulse1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5],
                      }),
                    },
                  ],
                }}
              />
              <Animated.View
                style={{
                  position: 'absolute',
                  width: sizes.sm * 2 + 32 + 20,
                  height: sizes.sm * 2 + 32 + 20,
                  borderRadius: (sizes.sm * 2 + 32 + 20) / 2,
                  borderWidth: 2,
                  borderColor: 'rgba(234, 6, 6, 0.4)',
                  opacity: recordingPulse2,
                  transform: [
                    {
                      scale: recordingPulse2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3],
                      }),
                    },
                  ],
                }}
              />
            </>
          )}
          
          <View
            style={{
              width: sizes.sm * 2 + 32,
              height: sizes.sm * 2 + 32,
              borderRadius: (sizes.sm * 2 + 32) / 2,
              backgroundColor: isRecording ? '#EA0606' : '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
            <Button
              onPress={handleToggleRecordingWrapper}
              disabled={isProcessing || isPlayingVoice}
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
              }}>
              {isRecording ? (
                <View style={{flexDirection: 'row', gap: 4, alignItems: 'center'}}>
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </View>
              ) : (
                <Ionicons
                  name="mic"
                  size={sizes.sm * 2}
                  color="#000000"
                />
              )}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PracticeSession;
