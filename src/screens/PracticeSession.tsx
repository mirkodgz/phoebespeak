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
  RoundCompleteModal,
  RolePlayCompleteModal,
  Text,
} from '../components';
import {useData, usePracticeAudio, useTheme} from '../hooks';
import {
  transcribePracticeAudio,
  requestPracticeFeedback,
  requestPracticeVoice,
  requestNextConversationTurn,
  requestTranslate,
  requestFreeInterviewTurn,
} from '../services/practice';
import {
  createSession,
  createTurn,
  createRound,
  completeRound,
  completeSession,
  type CreateTurnPayload,
} from '../services/progressService';
import {
  shouldShowPlansScreen,
  getFeatureAccess,
} from '../services/subscription';
import {getCurrentAuthUser} from '../services/supabaseAuth';
import {fetchProfileById} from '../services/supabaseAuth';
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
  mode?: 'guided' | 'free';
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
  const {scenarioId: routeScenarioId, levelId: routeLevelId, mode: routeMode} =
    (route?.params as PracticeSessionRouteParams) ?? {};
  const scenarioId =
    (routeScenarioId as RolePlayScenarioId | undefined) ?? 'jobInterview';
  
  // Obtener el nivel del usuario como fallback
  const userLevel = useMemo<RolePlayLevelId>(() => {
    const level = (user?.department || 'beginner') as RolePlayLevelId;
    // Validar que el nivel sea uno de los permitidos
    if (['beginner', 'intermediate', 'advanced'].includes(level)) {
      return level;
    }
    return 'beginner';
  }, [user?.department]);
  
  const [activeLevelId, setActiveLevelId] = useState<RolePlayLevelId>(
    (routeLevelId as RolePlayLevelId | undefined) ?? userLevel,
  );
  
  // Actualizar activeLevelId si el nivel del usuario cambia y no hay un nivel específico en la ruta
  useEffect(() => {
    if (!routeLevelId && activeLevelId !== userLevel) {
      setActiveLevelId(userLevel);
    }
  }, [userLevel, routeLevelId, activeLevelId]);
  const sessionMode = routeMode || 'guided'; // 'guided' o 'free'
  const isFreeMode = sessionMode === 'free';
  const FREE_MODE_MAX_TURNS = 8; // Máximo de turnos para modo libre
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
  const [currentRound, setCurrentRound] = useState(0); // Índice del round actual (0-based)
  const [currentQuestionInRound, setCurrentQuestionInRound] = useState(0); // Índice de la pregunta dentro del round (0-based)
  const [showRoundCompleteModal, setShowRoundCompleteModal] = useState(false);
  const [showRolePlayCompleteModal, setShowRolePlayCompleteModal] = useState(false);
  // Estados para modo libre
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  const [positionName, setPositionName] = useState<string | undefined>(undefined);
  // Estados para tracking de progreso
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const sessionStartTime = useRef<number | null>(null);
  const turnsScores = useRef<number[]>([]);
  const currentLevel = useMemo(() => {
    const fallback = scenarioConfig.levels[0];
    return (
      scenarioConfig.levels.find((level) => level.id === activeLevelId) ??
      fallback
    );
  }, [scenarioConfig, activeLevelId]);
  const conversationPairs = currentLevel?.conversation ?? [];
  const isDynamicFlow = currentLevel?.flowConfig?.mode === 'dynamic';
  const rounds = currentLevel?.flowConfig?.rounds ?? [];
  const hasRounds = rounds.length > 0;
  const currentRoundData = hasRounds && rounds[currentRound] ? rounds[currentRound] : null;
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

  // Obtener el nombre del tutor seleccionado (Ace o Víctor)
  const tutorNameOnly = useMemo(() => {
    const selectedTutor = preferences.selectedTutor || 'davide';
    return selectedTutor === 'phoebe' ? 'Ace' : 'Víctor';
  }, [preferences.selectedTutor]);

  const sessionProgress = useMemo(() => {
    // Modo libre: usar el máximo de turnos definido (debe evaluarse PRIMERO)
    // La bienvenida (turn 1) no cuenta para el progreso
    if (isFreeMode) {
      const total = FREE_MODE_MAX_TURNS; // 8 turnos totales
      // En modo libre, currentTurn representa el último turno del tutor
      // Turn 1 = saludo (no cuenta, 0 preguntas completadas = 0/8)
      // Turn 2 = primera pregunta (1 pregunta completada = 1/8)
      // Turn 3 = segunda pregunta (2 preguntas completadas = 2/8)
      // ...
      // Turn 8 = última pregunta (7 preguntas completadas = 7/8)
      // Cuando termina (shouldEnd), está al 100% (8/8)
      // El progreso se basa en las preguntas, no en los turnos
      // Si currentTurn es 0 o 1, completed = 0 (aún no hay preguntas)
      // Si currentTurn es 2, completed = 1 (primera pregunta)
      // Si currentTurn es 3, completed = 2 (segunda pregunta)
      // etc.
      const completed = currentTurn <= 1 ? 0 : Math.min(currentTurn - 1, total);
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      if (__DEV__) {
        console.log('[PracticeSession] Modo libre - Progreso:', {
          currentTurn,
          completed,
          total,
          percentage: `${percentage}%`,
        });
      }
      
      return {
        completed,
        total,
        percentage,
      };
    }
    
    // Si hay rounds (solo para modo guiado), calcular el progreso del round actual
    if (hasRounds && currentRoundData) {
      const total = currentRoundData.questions.length;
      // currentQuestionInRound es el índice de la pregunta actual que se está mostrando
      // Cuando se muestra la pregunta A (índice 0), completed = 0 (aún no se ha respondido)
      // Cuando se muestra la pregunta B (índice 1), completed = 1 (ya se respondió la A)
      // Entonces completed = currentQuestionInRound (cuántas preguntas se han respondido)
      // Pero cuando se muestra la primera pregunta, queremos mostrar 0/5, no 1/5
      const completed = currentQuestionInRound;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        completed,
        total,
        percentage,
        roundNumber: currentRound + 1,
        roundTitle: currentRoundData.title,
      };
    }
    
    // Sin rounds, usar la lógica anterior para modo guiado
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
    isFreeMode, // Mover isFreeMode al principio para que tenga prioridad
    currentTurn,
    conversationPairs.length,
    completedTurns,
    isDynamicFlow,
    currentLevel?.flowConfig?.maxTurns,
    hasRounds,
    currentRoundData,
    currentQuestionInRound,
    currentRound,
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
    // Reset estados del modo libre
    setCompanyName(undefined);
    setPositionName(undefined);
    void stopVoicePlayback();
  }, [currentLevel, stopVoicePlayback, isFreeMode]);

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
        
        const selectedTutor = preferences.selectedTutor || 'davide';
        
        if (__DEV__) {
          console.log('[PracticeSession] Requesting voice:', {
            textLength: text.length,
            tutor: selectedTutor === 'phoebe' ? 'Ace' : 'Víctor',
            tutorId: selectedTutor,
          });
        }
        
        const uri = await requestPracticeVoice(text, undefined, selectedTutor);
        
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
    [stopVoicePlayback, preferences.selectedTutor],
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

  // Helper para guardar turno en la base de datos
  const saveTurn = useCallback(async (
    questionText: string,
    userResponseText: string,
    feedbackText: string | null,
    verdict: 'correct' | 'needs_improvement' | null,
    score: number | null,
    questionLetter?: string | null,
  ) => {
    if (!sessionId) return; // No guardar si no hay sesión creada

    try {
      const turnNumber = conversationHistory.filter(m => m.role === 'tutor').length;
      
      await createTurn({
        session_id: sessionId,
        round_id: currentRoundId,
        turn_number: turnNumber,
        question_letter: questionLetter || null,
        question_text: questionText,
        user_response_text: userResponseText,
        feedback_text: feedbackText,
        verdict: verdict,
        score: score,
      });

      // Guardar score para calcular promedio
      if (score !== null) {
        turnsScores.current.push(score);
      }

      if (__DEV__) {
        console.log('[PracticeSession] Turno guardado:', turnNumber);
      }
    } catch (error) {
      // No romper la funcionalidad si falla el guardado
      console.error('[PracticeSession] Error al guardar turno:', error);
    }
  }, [sessionId, currentRoundId, conversationHistory]);

  // Helper para completar sesión
  const finalizeSession = useCallback(async () => {
    if (!sessionId || !sessionStartTime.current) return;

    try {
      const durationSeconds = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      const totalTurns = conversationHistory.filter(m => m.role === 'tutor').length;
      const totalQuestions = conversationHistory.filter(m => m.role === 'user').length;
      const averageScore = turnsScores.current.length > 0
        ? turnsScores.current.reduce((sum, s) => sum + s, 0) / turnsScores.current.length
        : null;

      await completeSession(sessionId, {
        total_turns: totalTurns,
        total_questions: totalQuestions,
        total_rounds: hasRounds ? currentRound + 1 : 0,
        duration_seconds: durationSeconds,
        average_score: averageScore || undefined,
      });

      if (__DEV__) {
        console.log('[PracticeSession] Sesión completada:', sessionId);
      }
    } catch (error) {
      console.error('[PracticeSession] Error al completar sesión:', error);
    }
  }, [sessionId, sessionStartTime, conversationHistory, hasRounds, currentRound]);

  // Manejar continuación después de completar un round
  const handleContinueToNextRound = useCallback(async () => {
    setShowRoundCompleteModal(false);
    
    if (!hasRounds || !rounds.length) return;
    
    const nextRoundIndex = currentRound + 1;
    
    // Si se completó el round 1 y se intenta continuar al round 2, verificar acceso
    if (currentRound === 0 && nextRoundIndex < rounds.length) {
      try {
        const authUser = await getCurrentAuthUser();
        if (!authUser) {
          console.error('[PracticeSession] Usuario no autenticado');
          return; // No continuar si no está autenticado
        }
        
        const profile = await fetchProfileById(authUser.id);
        if (!profile) {
          console.error('[PracticeSession] No se pudo obtener el perfil del usuario');
          return; // No continuar si no se puede obtener el perfil
        }
        
        const shouldShow = await shouldShowPlansScreen(profile, authUser.id, 'guided_round2');
        
        if (shouldShow) {
          // No tiene acceso al round 2, mostrar pantalla de planes
          navigation.navigate('ProPlans', {
            fromRoundComplete: true,
            roundNumber: nextRoundIndex + 1,
            scenarioId,
            levelId: activeLevelId,
          });
          return; // Salir temprano, no continuar al siguiente round
        }
      } catch (error) {
        console.error('[PracticeSession] Error verificando acceso:', error);
        // En caso de error, NO permitir acceso por seguridad
        // Mostrar pantalla de planes para que el usuario pueda suscribirse
        navigation.navigate('ProPlans', {
          fromRoundComplete: true,
          roundNumber: nextRoundIndex + 1,
          scenarioId,
          levelId: activeLevelId,
        });
        return;
      }
    }
    
    // Si hay más rounds, avanzar al siguiente
    if (nextRoundIndex < rounds.length) {
      setCurrentRound(nextRoundIndex);
      setCurrentQuestionInRound(0);
      
      // Obtener la primera pregunta del siguiente round
      const nextRound = rounds[nextRoundIndex];
      if (nextRound.questions.length > 0) {
        const firstQuestion = nextRound.questions[0];
        const questionFull = firstQuestion.question(studentFirstName);
        
        // Separar la pregunta del ejemplo
        // IMPORTANTE: Cuando hay exampleAnswer del objeto, SIEMPRE usarlo
        // y NUNCA intentar extraer el ejemplo del texto de la pregunta
        let exampleText = '';
        let beforeExample = '';
        
        if (firstQuestion.exampleAnswer) {
          // Usar exampleAnswer del objeto - NUNCA extraer del texto
          exampleText = firstQuestion.exampleAnswer;
          // Extraer SOLO la parte antes de "Here is..."
          const hereIsIndex = questionFull.search(/Here is (?:a simple )?(?:example|possible) answer:/i);
          if (hereIsIndex > 0) {
            beforeExample = questionFull.substring(0, hereIsIndex).trim();
          } else {
            // Si no se encuentra "Here is", usar split como fallback
            const parts = questionFull.split(/Here is (?:a simple )?(?:example|possible) answer:/i);
            beforeExample = parts[0] ? parts[0].trim() : questionFull.trim();
            // Si el split no funcionó, tomar todo hasta "Now please tell me" como último recurso
            if (beforeExample === questionFull.trim()) {
              const nowIndex = questionFull.search(/Now please tell me/i);
              if (nowIndex > 0) {
                beforeExample = questionFull.substring(0, nowIndex).trim();
                // Eliminar cualquier rastro del ejemplo que pueda quedar
                beforeExample = beforeExample.replace(/Here is.*answer:.*$/i, '').trim();
              }
            }
          }
        } else {
          // Fallback: solo si NO hay exampleAnswer del objeto, intentar extraer del texto
          const exampleMatch = questionFull.match(/Here is (?:a simple )?(?:example|possible) answer:\s*'([^']+)'/i);
          const parts = questionFull.split(/Here is (?:a simple )?(?:example|possible) answer:/i);
          beforeExample = parts[0] ? parts[0].trim() : questionFull.trim();
          exampleText = exampleMatch ? exampleMatch[1] : '';
        }
        
        // Detectar qué tipo de texto de ejemplo se usó
        const exampleTypeMatch = questionFull.match(/Here is (?:a simple )?(example|possible) answer:/i);
        const exampleType = exampleTypeMatch ? exampleTypeMatch[1] : 'possible';
        const exampleLabel = exampleType === 'example' ? 'Here is a simple example answer:' : 'Here is a possible answer:';
        
        const questionText = beforeExample + (exampleText ? ` ${exampleLabel}` : "");
        const exampleMessage = exampleText ? `'${exampleText}'` : '';
        const cleanQuestionText = questionText.replace(/\s*Now please tell me.*$/i, '').trim();
        
        // Agregar mensaje de transición
        addChatMessage({
          type: 'system',
          text: `Starting Round ${nextRoundIndex + 1}: ${nextRound.title}`,
        });
        
        // Agregar la pregunta
        addChatMessage({
          type: 'tutor',
          text: cleanQuestionText,
          questionLetter: firstQuestion.letter,
        });
        
        if (exampleMessage) {
          addChatMessage({
            type: 'tutor',
            text: exampleMessage,
            questionLetter: firstQuestion.letter,
          });
        }
        
        setConversationHistory((prev) => [
          ...prev,
          {role: 'tutor', text: cleanQuestionText},
          ...(exampleMessage ? [{role: 'tutor' as const, text: exampleMessage}] : []),
        ]);
        
        triggerSpeakingAnimation();
        await playVoiceMessage(cleanQuestionText);
      }
    } else {
      // No hay más rounds, terminar la entrevista
      setIsConversationActive(false);
      const closingMessage = `Thank you for completing all rounds of the interview, ${studentFirstName}. You did great!`;
      addChatMessage({
        type: 'tutor',
        text: closingMessage,
      });
      setConversationHistory((prev) => [
        ...prev,
        {role: 'tutor', text: closingMessage},
      ]);
      
      // Completar sesión en la base de datos
      await finalizeSession();
      
      triggerSpeakingAnimation();
      await playVoiceMessage(closingMessage);
      
      // Mostrar modal de role play completado después de un delay
      setTimeout(() => {
        setShowRolePlayCompleteModal(true);
      }, 1500);
    }
  }, [hasRounds, rounds, currentRound, studentFirstName, addChatMessage, triggerSpeakingAnimation, playVoiceMessage, finalizeSession, navigation, scenarioId, activeLevelId]);

  // Crear sesión de progreso al iniciar
  useEffect(() => {
    let mounted = true;
    
    const initializeSession = async () => {
      try {
        const newSessionId = await createSession({
          scenario_id: scenarioId,
          level_id: activeLevelId,
          mode: sessionMode,
          tutor_id: preferences.selectedTutor || 'davide',
        });
        
        if (mounted) {
          setSessionId(newSessionId);
          sessionStartTime.current = Date.now();
          
          // Si hay rounds, crear el primer round
          if (hasRounds && rounds.length > 0) {
            try {
              const firstRound = rounds[0];
              const firstRoundId = await createRound({
                session_id: newSessionId,
                round_number: 1,
                round_title: firstRound.title,
                total_questions: firstRound.questions.length,
              });
              setCurrentRoundId(firstRoundId);
              if (__DEV__) {
                console.log('[PracticeSession] Primer round creado:', firstRoundId);
              }
            } catch (error) {
              console.error('[PracticeSession] Error al crear primer round:', error);
            }
          }
          
          if (__DEV__) {
            console.log('[PracticeSession] Sesión de progreso creada:', newSessionId);
          }
        }
      } catch (error) {
        // No romper la funcionalidad si falla el guardado de progreso
        console.error('[PracticeSession] Error al crear sesión de progreso:', error);
        // Continuar sin guardar progreso
      }
    };
    
    initializeSession();
    
    return () => {
      mounted = false;
    };
  }, []); // Solo ejecutar una vez al montar

  // Manejar saludo inicial y primera pregunta para flujo dinámico o modo libre
  useEffect(() => {
    // Para modo libre, siempre ejecutar el saludo inicial y primera pregunta
    if (isFreeMode && shouldPlayGreeting) {
      if (__DEV__) {
        console.log('[PracticeSession] Modo libre: Iniciando saludo y primera pregunta');
      }
      
      const timeoutId = setTimeout(async () => {
        try {
          // Saludo inicial (turn 1)
          if (__DEV__) {
            console.log('[PracticeSession] Modo libre: Generando saludo (turn 1)');
          }
          
          const greetingTurn = await requestFreeInterviewTurn({
            conversationHistory: [],
            studentName: studentFirstName,
            turnNumber: 1, // Saludo inicial
          });

          const greeting = greetingTurn.tutorMessage || greetingTurn.question || `Hello, ${studentFirstName}! Welcome to the interview practice.`;

          if (__DEV__) {
            console.log('[PracticeSession] Modo libre: Saludo recibido:', greeting);
          }

          setConversationHistory([{role: 'tutor', text: greeting}]);
          addChatMessage({
            type: 'tutor',
            text: greeting,
          });

          triggerSpeakingAnimation();
          await playVoiceMessage(greeting);
          
          // Pequeña pausa antes de la primera pregunta
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Primera pregunta (turn 2): "What company are you going to apply to?"
          if (__DEV__) {
            console.log('[PracticeSession] Modo libre: Generando primera pregunta (turn 2)');
          }
          
          const firstQuestionTurn = await requestFreeInterviewTurn({
            conversationHistory: [{role: 'tutor', text: greeting}],
            studentName: studentFirstName,
            turnNumber: 2, // Primera pregunta
          });

          const firstQuestion = firstQuestionTurn.tutorMessage || firstQuestionTurn.question || "What company are you going to apply to?";

          if (__DEV__) {
            console.log('[PracticeSession] Modo libre: Primera pregunta recibida:', firstQuestion);
          }

          setConversationHistory((prev) => [
            ...prev,
            {role: 'tutor', text: firstQuestion},
          ]);
          addChatMessage({
            type: 'tutor',
            text: firstQuestion,
          });

          setShouldPlayGreeting(false);
          setCurrentTurn(2); // Turn 2 = primera pregunta (1/8 completado)

          triggerSpeakingAnimation();
          await playVoiceMessage(firstQuestion);
        } catch (error) {
          console.error('[PracticeSession] Error en modo libre - saludo inicial:', error);
          setProcessingError('Error al iniciar la sesión. Por favor, intenta de nuevo.');
          setShouldPlayGreeting(true); // Permitir reintentar
        }
      }, 350);

      return () => clearTimeout(timeoutId);
    }

    // Para modo guiado (flujo dinámico normal)
    if (!shouldPlayGreeting || !isDynamicFlow || !currentLevel?.flowConfig || isFreeMode) return;
    const flowConfig = currentLevel.flowConfig;

    const timeoutId = setTimeout(async () => {
      const greeting = flowConfig.initialGreeting(studentFirstName);
      
      // Si hay rounds, usar la primera pregunta del primer round
      let firstQuestionFull: string;
      let questionLetter = 'A';
      let exampleAnswerFromObject: string | undefined;
      
      if (hasRounds && currentRoundData && currentRoundData.questions.length > 0) {
        const firstQuestion = currentRoundData.questions[0];
        firstQuestionFull = firstQuestion.question(studentFirstName);
        questionLetter = firstQuestion.letter;
        exampleAnswerFromObject = firstQuestion.exampleAnswer;
      } else {
        firstQuestionFull = flowConfig.firstQuestion(studentFirstName);
      }
      
      // Separar la pregunta del ejemplo
      // IMPORTANTE: Cuando hay exampleAnswer del objeto, SIEMPRE usarlo
      // y NUNCA intentar extraer el ejemplo del texto de la pregunta
      let exampleText = '';
      let beforeExample = '';
      
      if (exampleAnswerFromObject) {
        // Usar exampleAnswer del objeto - NUNCA extraer del texto
        exampleText = exampleAnswerFromObject;
        // Extraer SOLO la parte antes de "Here is..."
        const hereIsIndex = firstQuestionFull.search(/Here is (?:a simple )?(?:example|possible) answer:/i);
        if (hereIsIndex > 0) {
          beforeExample = firstQuestionFull.substring(0, hereIsIndex).trim();
        } else {
          // Si no se encuentra "Here is", usar split como fallback
          const parts = firstQuestionFull.split(/Here is (?:a simple )?(?:example|possible) answer:/i);
          beforeExample = parts[0] ? parts[0].trim() : firstQuestionFull.trim();
          // Si el split no funcionó, tomar todo hasta "Now please tell me" como último recurso
          if (beforeExample === firstQuestionFull.trim()) {
            const nowIndex = firstQuestionFull.search(/Now please tell me/i);
            if (nowIndex > 0) {
              beforeExample = firstQuestionFull.substring(0, nowIndex).trim();
              // Eliminar cualquier rastro del ejemplo que pueda quedar
              beforeExample = beforeExample.replace(/Here is.*answer:.*$/i, '').trim();
            }
          }
        }
      } else {
        // Fallback: solo si NO hay exampleAnswer del objeto, intentar extraer del texto
        const exampleMatch = firstQuestionFull.match(/Here is (?:a simple )?(?:example|possible) answer:\s*'([^']+)'/i);
        const parts = firstQuestionFull.split(/Here is (?:a simple )?(?:example|possible) answer:/i);
        beforeExample = parts[0] ? parts[0].trim() : firstQuestionFull.trim();
        exampleText = exampleMatch ? exampleMatch[1] : '';
      }
      
      // Detectar qué tipo de texto de ejemplo se usó
      const exampleTypeMatch = firstQuestionFull.match(/Here is (?:a simple )?(example|possible) answer:/i);
      const exampleType = exampleTypeMatch ? exampleTypeMatch[1] : 'example';
      const exampleLabel = exampleType === 'example' ? 'Here is a simple example answer:' : 'Here is a possible answer:';
      
      // Construir la pregunta con el label del ejemplo pero sin el ejemplo y sin "Now please tell me..."
      const questionText = beforeExample + (exampleText ? ` ${exampleLabel}` : "");
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
        questionLetter: questionLetter,
      };
      const exampleMsg: ChatMessage = {
        id: `msg-${Date.now() + 2}-${Math.random()}`,
        type: 'tutor',
        text: exampleMessage,
        timestamp: new Date(),
        questionLetter: questionLetter,
      };
      setChatMessages((prev) => [...prev, greetingMsg, questionMsg, exampleMsg]);

      setShouldPlayGreeting(false);
      setCurrentTurn(1);
      if (hasRounds) {
        setCurrentQuestionInRound(0);
      }

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
    isFreeMode,
    currentLevel?.flowConfig,
    studentFirstName,
    playVoiceMessage,
    triggerSpeakingAnimation,
    addChatMessage,
    hasRounds,
    currentRoundData,
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

      // Para modo libre: usar el servicio específico
      if (isFreeMode && isConversationActive) {
        try {
          // El currentTurn representa el último turno del tutor
          // Si currentTurn es 2, significa que el tutor hizo la pregunta 2 (primera pregunta)
          // Entonces la respuesta del usuario es para el turn 2, y el siguiente turno es 3
          const nextTurnNumber = currentTurn + 1;
          
          if (__DEV__) {
            console.log('[PracticeSession] Modo libre: Procesando respuesta. currentTurn:', currentTurn, 'nextTurnNumber:', nextTurnNumber);
          }
          
          // Guardar companyName y positionName cuando el usuario responda
          if (nextTurnNumber === 3) {
            // El usuario respondió a la primera pregunta (turn 2): "What company are you going to apply to?"
            setCompanyName(transcriptText);
            if (__DEV__) {
              console.log('[PracticeSession] Modo libre: Company guardada:', transcriptText);
            }
          } else if (nextTurnNumber === 4) {
            // El usuario respondió a la segunda pregunta (turn 3): "What position are you going to apply for?"
            setPositionName(transcriptText);
            if (__DEV__) {
              console.log('[PracticeSession] Modo libre: Position guardada:', transcriptText);
            }
          }

          // Obtener companyName y positionName actualizados del estado
          const currentCompany = nextTurnNumber === 3 ? transcriptText : companyName;
          const currentPosition = nextTurnNumber === 4 ? transcriptText : positionName;

          if (__DEV__) {
            console.log('[PracticeSession] Modo libre: Llamando a requestFreeInterviewTurn con turnNumber:', nextTurnNumber, 'company:', currentCompany, 'position:', currentPosition);
          }

          const nextTurn = await requestFreeInterviewTurn({
            conversationHistory: updatedHistory,
            studentName: studentFirstName,
            turnNumber: nextTurnNumber,
            companyName: currentCompany,
            positionName: currentPosition,
          });
          
          if (__DEV__) {
            console.log('[PracticeSession] Modo libre: Respuesta recibida:', nextTurn);
          }

          // Verificar si se alcanzó el máximo de turnos o si la IA decide terminar
          if (nextTurn.shouldEnd || nextTurnNumber >= FREE_MODE_MAX_TURNS) {
            setIsConversationActive(false);
            const closingMessage =
              nextTurn.closingMessage ??
              `Thank you for the interview practice, ${studentFirstName}. You did great! Keep practicing.`;
            addChatMessage({
              type: 'tutor',
              text: closingMessage,
            });
            setConversationHistory([
              ...updatedHistory,
              {role: 'tutor', text: closingMessage},
            ]);
            // Actualizar el turno al máximo + 1 para mostrar 100% en la barra de progreso
            // (FREE_MODE_MAX_TURNS + 1 porque el turno 1 es la bienvenida que no cuenta)
            setCurrentTurn(FREE_MODE_MAX_TURNS + 1);
            
            // Completar sesión en la base de datos
            await finalizeSession();
            
            triggerSpeakingAnimation();
            await playVoiceMessage(closingMessage);
            
            // Mostrar modal de role play completado después de un delay
            setTimeout(() => {
              setShowRolePlayCompleteModal(true);
            }, 1500);
          } else {
            // Separar feedback y pregunta si existen
            const feedback = nextTurn.feedback;
            const question = nextTurn.question || nextTurn.tutorMessage;

            // Si hay feedback, mostrarlo primero
            if (feedback) {
              addChatMessage({
                type: 'feedback',
                text: feedback,
              });
              const historyWithFeedback = [
                ...updatedHistory,
                {role: 'feedback' as const, text: feedback},
              ];
              setConversationHistory(historyWithFeedback);
              
              // Guardar turno en la base de datos (modo libre)
              const previousTutorMessage = conversationHistory
                .filter(m => m.role === 'tutor')
                .slice(-1)[0]?.text || '';
              await saveTurn(
                previousTutorMessage,
                transcriptText,
                feedback,
                null, // Verdict no disponible en modo libre
                null, // Score no disponible en modo libre
                null,
              );
              
              triggerSpeakingAnimation();
              await playVoiceMessage(feedback);
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Mostrar la pregunta
            if (question) {
              addChatMessage({
                type: 'tutor',
                text: question,
              });
              setConversationHistory((prev) => [
                ...prev,
                {role: 'tutor' as const, text: question},
              ]);
              // Verificar si se alcanzó el máximo de turnos antes de continuar
              if (nextTurnNumber >= FREE_MODE_MAX_TURNS) {
                // Si alcanzamos el máximo, terminar la conversación
                setIsConversationActive(false);
                const closingMessage = `Thank you for the interview practice, ${studentFirstName}. You've completed all ${FREE_MODE_MAX_TURNS} turns. Great job!`;
                addChatMessage({
                  type: 'tutor',
                  text: closingMessage,
                });
                setConversationHistory((prev) => [
                  ...prev,
                  {role: 'tutor' as const, text: closingMessage},
                ]);
                setCurrentTurn(FREE_MODE_MAX_TURNS + 1);
                triggerSpeakingAnimation();
                await playVoiceMessage(closingMessage);
              } else {
                setCurrentTurn(nextTurnNumber);
                triggerSpeakingAnimation();
                await playVoiceMessage(question);
              }
            }
          }
        } catch (error) {
          console.error('[PracticeSession] Error generating free interview turn:', error);
          setProcessingError('Error generating next question. Please try again.');
          setAssistantState('idle');
        }
      }
      // Para flujo dinámico: el tutor AI maneja todo, no necesitamos feedback separado
      else if (isDynamicFlow && isConversationActive) {
        // Generar siguiente pregunta directamente (el tutor incluirá las correcciones y feedback)
        try {
          // Obtener preguntas predefinidas si existen (para rounds o preguntas normales)
          let predefinedQuestions: string[] | undefined;
          
          if (hasRounds && currentRoundData) {
            // Usar solo la siguiente pregunta del round actual
            const nextQuestionIndex = currentQuestionInRound + 1;
            if (nextQuestionIndex < currentRoundData.questions.length) {
              // Pasar solo la siguiente pregunta, no todas las restantes
              const nextQuestion = currentRoundData.questions[nextQuestionIndex];
              predefinedQuestions = [nextQuestion.question(studentFirstName)];
            }
            // Si no hay más preguntas en el round, no pasar preguntas predefinidas
            // El frontend manejará la detección de fin de round
          } else {
            // Usar preguntas predefinidas normales
            predefinedQuestions = currentLevel?.flowConfig?.followUpQuestions?.map(
              (q) => q(studentFirstName)
            );
          }

          // Calcular el turnNumber para el backend
          // El backend usa turnNumber - 2 para calcular el índice en predefinedQuestions
          // Si pasamos solo la siguiente pregunta, siempre será índice 0
          // Entonces turnNumber debe ser 2 para que questionIndex = 0
          let adjustedTurnNumber = currentTurn + 1;
          if (hasRounds && currentRoundData) {
            // Siempre usar turnNumber = 2 cuando hay rounds y pasamos solo la siguiente pregunta
            // Esto hace que questionIndex = 2 - 2 = 0, que es correcto para el primer elemento del array
            adjustedTurnNumber = 2;
          }

          const nextTurn = await requestNextConversationTurn({
            scenarioId,
            levelId: activeLevelId,
            conversationHistory: updatedHistory,
            studentName: studentFirstName,
            turnNumber: adjustedTurnNumber,
            predefinedQuestions,
            // No pasamos lastFeedback porque el tutor genera todo
          });

          // Si hay rounds, verificar primero si se completó el round antes de terminar
          if (hasRounds && currentRoundData) {
            const nextQuestionIndex = currentQuestionInRound + 1;
            // Si se completó el round actual, mostrar popup en lugar de terminar
            if (nextQuestionIndex >= currentRoundData.questions.length) {
              // Mostrar feedback si existe (en inglés, hablado por el avatar)
              if (nextTurn.feedback) {
                addChatMessage({
                  type: 'feedback',
                  text: nextTurn.feedback,
                });
                setConversationHistory([
                  ...updatedHistory,
                  {role: 'feedback' as const, text: nextTurn.feedback},
                ]);
                
                // Guardar turno con feedback
                const previousTutorMessage = conversationHistory
                  .filter(m => m.role === 'tutor')
                  .slice(-1)[0]?.text || '';
                await saveTurn(
                  previousTutorMessage,
                  transcriptText,
                  nextTurn.feedback,
                  null,
                  null,
                  currentRoundData?.questions[currentQuestionInRound]?.letter || null,
                );
                
                // Reproducir el feedback en inglés
                triggerSpeakingAnimation();
                await playVoiceMessage(nextTurn.feedback);
              }
              
              // Completar round en la base de datos
              if (currentRoundId) {
                try {
                  await completeRound(
                    currentRoundId,
                    currentQuestionInRound + 1,
                    undefined, // Average score no disponible
                  );
                  if (__DEV__) {
                    console.log('[PracticeSession] Round completado:', currentRoundId);
                  }
                } catch (error) {
                  console.error('[PracticeSession] Error al completar round:', error);
                }
              }
              
              // Mostrar popup de round completado
              setTimeout(() => {
                setShowRoundCompleteModal(true);
              }, 1000);
              return; // Salir temprano, el popup manejará la continuación
            }
          }
          
          if (nextTurn.shouldEnd && !hasRounds) {
            // Terminar conversación solo si NO hay rounds
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
            
            // Guardar turno con feedback si existe
            if (nextTurn.feedback) {
              const previousTutorMessage = conversationHistory
                .filter(m => m.role === 'tutor')
                .slice(-1)[0]?.text || '';
              await saveTurn(
                previousTutorMessage,
                transcriptText,
                nextTurn.feedback,
                null,
                null,
                hasRounds && currentRoundData ? currentRoundData.questions[currentQuestionInRound]?.letter : null,
              );
            }
            
            // Completar sesión en la base de datos
            await finalizeSession();
            
            triggerSpeakingAnimation();
            await playVoiceMessage(closingMessage);
            
            // Mostrar modal de role play completado después de un delay
            setTimeout(() => {
              setShowRolePlayCompleteModal(true);
            }, 1500);
          } else {
            // Separar feedback y pregunta
            const feedback = nextTurn.feedback || "Good!";
            const questionFull = nextTurn.question || nextTurn.tutorMessage;
            
            // Guardar turno con feedback (modo dinámico)
            if (feedback && feedback !== "Good!") {
              const previousTutorMessage = conversationHistory
                .filter(m => m.role === 'tutor')
                .slice(-1)[0]?.text || '';
              await saveTurn(
                previousTutorMessage,
                transcriptText,
                feedback,
                null,
                null,
                hasRounds && currentRoundData ? currentRoundData.questions[currentQuestionInRound]?.letter : null,
              );
            }
            
            // Separar la pregunta del ejemplo (igual que con la primera pregunta)
            let nextQuestionIndex = currentQuestionInRound + 1;
            let currentQuestionObj = null;
            
            // Obtener el objeto de pregunta actual si hay rounds
            if (hasRounds && currentRoundData && nextQuestionIndex < currentRoundData.questions.length) {
              currentQuestionObj = currentRoundData.questions[nextQuestionIndex];
            }
            
            // PRIORIDAD: Usar exampleAnswer del objeto si está disponible (más confiable)
            let exampleText = '';
            let beforeExample = '';
            let cleanQuestionText = '';
            
            if (currentQuestionObj && currentQuestionObj.exampleAnswer) {
              // IMPORTANTE: Cuando hay exampleAnswer del objeto, SIEMPRE usarlo
              // y NUNCA intentar extraer el ejemplo del texto de la pregunta
              exampleText = currentQuestionObj.exampleAnswer;
              
              // Extraer SOLO la parte antes de "Here is..." - esto es crítico
              // Buscar el índice de "Here is" y tomar todo antes
              const hereIsIndex = questionFull.search(/Here is (?:a simple )?(?:example|possible) answer:/i);
              if (hereIsIndex > 0) {
                beforeExample = questionFull.substring(0, hereIsIndex).trim();
              } else {
                // Si no se encuentra "Here is", usar split como fallback
                const parts = questionFull.split(/Here is (?:a simple )?(?:example|possible) answer:/i);
                beforeExample = parts[0] ? parts[0].trim() : questionFull.trim();
                // Si el split no funcionó, tomar todo hasta "Now please tell me" como último recurso
                if (beforeExample === questionFull.trim()) {
                  const nowIndex = questionFull.search(/Now please tell me/i);
                  if (nowIndex > 0) {
                    beforeExample = questionFull.substring(0, nowIndex).trim();
                    // Eliminar cualquier rastro del ejemplo que pueda quedar
                    beforeExample = beforeExample.replace(/Here is.*answer:.*$/i, '').trim();
                  }
                }
              }
              
              // Detectar qué tipo de texto de ejemplo se usó
              const exampleTypeMatch = questionFull.match(/Here is (?:a simple )?(example|possible) answer:/i);
              const exampleType = exampleTypeMatch ? exampleTypeMatch[1] : 'possible';
              const exampleLabel = exampleType === 'example' ? 'Here is a simple example answer:' : 'Here is a possible answer:';
            
              // Construir la pregunta con el label del ejemplo pero sin el ejemplo y sin "Now please tell me..."
              const questionText = beforeExample + (exampleText ? ` ${exampleLabel}` : "");
              cleanQuestionText = questionText.replace(/\s*Now please tell me.*$/i, '').trim();
            } else {
              // Fallback: intentar extraer del texto usando regex
              // Primero intentar split para obtener la parte antes del ejemplo
              const parts = questionFull.split(/Here is (?:a simple )?(?:example|possible) answer:/i);
              beforeExample = parts[0] ? parts[0].trim() : '';
              
              // Si el split funcionó, intentar extraer el ejemplo con regex
              if (beforeExample && beforeExample !== questionFull.trim()) {
                const exampleMatch = questionFull.match(/Here is (?:a simple )?(?:example|possible) answer:\s*'([^']+)'/i);
                exampleText = exampleMatch ? exampleMatch[1] : '';
            
                // Detectar qué tipo de texto de ejemplo se usó
                const exampleTypeMatch = questionFull.match(/Here is (?:a simple )?(example|possible) answer:/i);
                const exampleType = exampleTypeMatch ? exampleTypeMatch[1] : 'possible';
                const exampleLabel = exampleType === 'example' ? 'Here is a simple example answer:' : 'Here is a possible answer:';
                
                // Construir la pregunta con el label del ejemplo pero sin el ejemplo y sin "Now please tell me..."
                const questionText = beforeExample + (exampleText ? ` ${exampleLabel}` : "");
                cleanQuestionText = questionText.replace(/\s*Now please tell me.*$/i, '').trim();
              } else {
                // Si el split no funcionó, usar todo el texto pero eliminar "Now please tell me..."
                // Esto es un fallback de seguridad
                cleanQuestionText = questionFull.replace(/\s*Now please tell me.*$/i, '').trim();
                // Intentar extraer el ejemplo aunque sea parcialmente
                const exampleMatch = questionFull.match(/Here is (?:a simple )?(?:example|possible) answer:\s*'([^']+)'/i);
                exampleText = exampleMatch ? exampleMatch[1] : '';
              }
            }
            
            const exampleMessage = exampleText ? `'${exampleText}'` : '';
            
            // Primero mostrar y reproducir el feedback (en inglés, hablado por el avatar)
            addChatMessage({
              type: 'feedback',
              text: feedback,
            });
            const historyWithFeedback = [
              ...updatedHistory,
              {role: 'feedback' as const, text: feedback},
            ];
            setConversationHistory(historyWithFeedback);
            // Reproducir el feedback en inglés
            triggerSpeakingAnimation();
            await playVoiceMessage(feedback);
            // Pequeña pausa antes de mostrar la pregunta
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Luego mostrar la pregunta (sin el ejemplo)
            // Determinar la letra de la pregunta
            let questionLetter = 'A';
            if (hasRounds && currentRoundData) {
              if (nextQuestionIndex < currentRoundData.questions.length) {
                questionLetter = currentRoundData.questions[nextQuestionIndex].letter;
              }
            } else {
              const questionLetters = ['A', 'B', 'C', 'D', 'E'];
              questionLetter = questionLetters[Math.min(currentTurn, questionLetters.length - 1)] || 'E';
            }
            
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
              if (hasRounds) {
                setCurrentQuestionInRound(nextQuestionIndex);
                
                // Verificar si se completó el round después de avanzar
                if (currentRoundData && nextQuestionIndex >= currentRoundData.questions.length) {
                  // Mostrar popup de round completado después de un pequeño delay
                  setTimeout(() => {
                    setShowRoundCompleteModal(true);
                  }, 1000);
                  return; // Salir temprano, el popup manejará la continuación
                }
              }
              triggerSpeakingAnimation();
              await playVoiceMessage(cleanQuestionText);
            } else {
              setConversationHistory(historyWithQuestion);
              // Reproducir solo la pregunta sin el texto final
              setCurrentTurn((prev) => prev + 1);
              if (hasRounds) {
                setCurrentQuestionInRound(nextQuestionIndex);
                
                // Verificar si se completó el round después de avanzar
                if (currentRoundData && nextQuestionIndex >= currentRoundData.questions.length) {
                  // Mostrar popup de round completado después de un pequeño delay
                  setTimeout(() => {
                    setShowRoundCompleteModal(true);
                  }, 1000);
                  return; // Salir temprano, el popup manejará la continuación
                }
              }
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
          `Analysis completed, ${studentFirstName}. Great work! Keep practicing.`;

        addChatMessage({
          type: 'feedback',
          text: feedbackText,
          verdict: feedback.verdict ?? undefined,
        });
        
        // Guardar turno en la base de datos
        const currentQuestion = currentTutorPrompt || '';
        await saveTurn(
          currentQuestion,
          transcriptText,
          feedbackText,
          feedback.verdict ?? null,
          null, // Score no disponible en modo estático
          hasRounds && currentRoundData ? currentRoundData.questions[currentQuestionInRound]?.letter : null,
        );
        
        // Reproducir el feedback en inglés
        triggerSpeakingAnimation();
        await playVoiceMessage(feedbackText);
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
          marginBottom: sizes.sm,
          paddingHorizontal: sizes.sm,
        }}>
        <View
          style={{
            paddingHorizontal: sizes.sm,
            paddingTop: sizes.sm,
            paddingBottom: sizes.sm,
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
                  ? tutorNameOnly
                  : studentFirstName}
              </Text>
            </View>
          )}
          {/* Texto original en inglés - siempre visible */}
          <Text
            size={sizes.p}
            color="#FFFFFF"
            style={{
              lineHeight: sizes.p * 1.4,
              includeFontPadding: false,
              marginBottom: -4,
              paddingBottom: 0,
            }}>
            {message.text}
          </Text>
          
          {/* Traducción en italiano - aparece debajo cuando está activa */}
          {showTranslation && hasTranslation && (
            <View
              style={{
                marginTop: sizes.xs,
                marginBottom: -2,
                paddingHorizontal: sizes.xs,
                paddingVertical: sizes.xs / 2,
                width: '100%',
              }}>
              <Text
                size={sizes.p - 3}
                color="#FFFFFF"
                bold
                style={{
                  lineHeight: sizes.p + 1,
                  fontWeight: 'bold',
                  flexShrink: 1,
                }}>
                {translations[message.id]}
              </Text>
            </View>
          )}
          
          {/* Iconos para mensajes del tutor y feedback */}
          {(isTutor || isFeedback) && (
            <View style={{flexDirection: 'row', marginTop: sizes.xs, gap: sizes.sm, marginBottom: 0}}>
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
          paddingBottom: sizes.xs,
          backgroundColor: '#f1f5f9',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: sizes.xs / 2,
          }}>
          <Text size={sizes.p * 1.5} color="#334155" semibold>
            📊
          </Text>
          {isFreeMode && (
            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: sizes.xs / 2}}>
              <Text size={sizes.p - 2} color="#334155" semibold>
                Modo Libero
              </Text>
              <Text size={sizes.p - 3} color="#334155" opacity={0.6} style={{marginLeft: sizes.xs / 2}}>
                ({sessionProgress.completed}/{sessionProgress.total})
              </Text>
            </View>
          )}
          {hasRounds && sessionProgress.roundNumber && !isFreeMode && (
            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: sizes.xs / 2}}>
              <Text size={sizes.p - 2} color="#334155">
                Round {sessionProgress.roundNumber}
              </Text>
              <Text size={sizes.p - 3} color="#334155" opacity={0.6} style={{marginLeft: sizes.xs / 2}}>
                ({sessionProgress.completed}/{sessionProgress.total})
              </Text>
            </View>
          )}
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: sizes.xs / 2}}>
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 2,
                marginRight: sizes.xs,
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
                  {tutorNameOnly}
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
      
      {/* Modal de round completado */}
      {hasRounds && (
        <RoundCompleteModal
          visible={showRoundCompleteModal}
          roundNumber={currentRound + 1}
          roundTitle={currentRoundData?.title || ''}
          onContinue={handleContinueToNextRound}
          isLastRound={currentRound + 1 >= rounds.length}
        />
      )}

      {/* Modal de role play completado */}
      <RolePlayCompleteModal
        visible={showRolePlayCompleteModal}
        scenarioName={scenarioConfig?.title}
        onClose={() => {
          setShowRolePlayCompleteModal(false);
          // Navegar de vuelta después de cerrar
          setTimeout(() => {
            navigation.navigate('RolePlayMain');
          }, 500);
        }}
        autoCloseDelay={4000}
      />
    </View>
  );
};

export default PracticeSession;
