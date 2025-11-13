import React, {useEffect, useState, useMemo, useRef, useCallback} from 'react';
import {ScrollView} from 'react-native';
import {DrawerActions, useNavigation, useRoute} from '@react-navigation/native';
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import {Audio, InterruptionModeAndroid, InterruptionModeIOS} from 'expo-av';

import {
  Block,
  AssistantOrb,
  type AssistantOrbState,
  BrandActionButton,
  BrandBackground,
  BrandChip,
  BrandProgressBar,
  BrandSectionHeader,
  BrandSurface,
  Button,
  Image,
  Text,
} from '../components';
import {useData, usePracticeAudio, useTheme} from '../hooks';
import {
  transcribePracticeAudio,
  requestPracticeFeedback,
  requestPracticeVoice,
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

const PracticeSession = () => {
  const {sizes, icons, colors, gradients, assets} = useTheme();
  const {practice, user} = useData();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
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
  const currentLevel = useMemo(() => {
    const fallback = scenarioConfig.levels[0];
    return (
      scenarioConfig.levels.find((level) => level.id === activeLevelId) ??
      fallback
    );
  }, [scenarioConfig, activeLevelId]);
  const conversationPairs = currentLevel?.conversation ?? [];
  const [assistantState, setAssistantState] =
    useState<AssistantOrbState>('idle');
  const [micPermission, setMicPermission] = useState<
    'unknown' | 'granted' | 'denied'
  >('unknown');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const speakingTimeout = useRef<NodeJS.Timeout | null>(null);
  const voiceSoundRef = useRef<Audio.Sound | null>(null);

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
    if (!conversationPairs.length) {
      return undefined;
    }
    const safeIndex =
      ((interviewIndex % conversationPairs.length) + conversationPairs.length) %
      conversationPairs.length;
    return conversationPairs[safeIndex];
  }, [conversationPairs, interviewIndex]);

  const currentTutorPrompt = useMemo(
    () => currentPair?.tutor(studentFirstName) ?? '',
    [currentPair, studentFirstName],
  );

  const expectedUserSample = useMemo(
    () => currentPair?.user(studentFirstName) ?? '',
    [currentPair, studentFirstName],
  );

  const currentLevelLabel = currentLevel?.label ?? 'Beginner';
  const totalTurns = conversationPairs.length;
  const currentTurnNumber =
    totalTurns > 0 ? Math.min(interviewIndex + 1, totalTurns) : 0;
  const totalTurnsDisplay = Math.max(totalTurns, 1);

  const triggerSpeakingAnimation = useCallback(() => {
    if (speakingTimeout.current) {
      clearTimeout(speakingTimeout.current);
    }
    setAssistantState('speaking');
    speakingTimeout.current = setTimeout(() => {
      setAssistantState('idle');
    }, 2400);
  }, []);

  const sessionProgress = useMemo(() => {
    const total = Math.max(conversationPairs.length, 1);
    const completed = Math.min(completedTurns, total);
    const percentage = Math.round((completed / total) * 100);
    return {
      completed,
      total,
      percentage,
    };
  }, [conversationPairs.length, completedTurns]);

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
        setIsPlayingVoice(true);
        await stopVoicePlayback();
        const uri = await requestPracticeVoice(text);
        const {sound} = await Audio.Sound.createAsync(
          {uri},
          {shouldPlay: true},
        );
        voiceSoundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) {
            if (status.error && __DEV__) {
              console.warn('Voice playback status error', status.error);
            }
            return;
          }
          if (status.didJustFinish) {
            setIsPlayingVoice(false);
            sound.setOnPlaybackStatusUpdate(null);
            voiceSoundRef.current?.unloadAsync().catch(() => {});
            voiceSoundRef.current = null;
          }
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

  useEffect(() => {
    if (!shouldPlayGreeting || !currentTutorPrompt) return;

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
    studentFirstName,
    playVoiceMessage,
    triggerSpeakingAnimation,
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
      const transcriptText =
        transcription?.text ||
        transcription?.segments?.map((segment) => segment.text).join(' ') ||
        '';

      if (!transcriptText) {
        throw new Error(
          'Impossibile ottenere la trascrizione. Prova a registrare di nuovo.',
        );
      }

      const feedback = await requestPracticeFeedback({
        transcript: transcriptText,
        targetSentence: expectedUserSample,
        learnerProfile: {
          nativeLanguage: 'Italiano',
          proficiencyLevel: 'Intermedio',
          learnerName: studentFullName,
        },
        segments: transcription?.segments,
      });

      setAnalysisSummary(feedback.summary ?? null);
      setAnalysisVerdict(feedback.verdict ?? null);
      const suggestionPool =
        feedback.verdict === 'correct'
          ? ['Good! You used the past tense correctly.']
          : [
              'Try to use a more formal tone.',
              'Next time, add one more detail about your experience.',
            ];
      const randomSuggestion =
        suggestionPool[Math.floor(Math.random() * suggestionPool.length)];
      setDynamicFeedback(randomSuggestion);
      triggerSpeakingAnimation();
      playVoiceMessage(
        feedback.summary ??
          `Analisi completata, ${studentFirstName}. Ottimo lavoro! Continua a praticare.`,
      );
    } catch (feedbackError) {
      setAssistantState('idle');
      setDynamicFeedback(null);
      const message =
        feedbackError instanceof Error
          ? feedbackError.message
          : 'La valutazione non è riuscita, riprova.';
      setProcessingError(message);
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

  const micStatusLabel =
    micPermission !== 'granted'
      ? 'Autorizzazione microfono in attesa'
      : isRecording
      ? 'Registrazione in corso…'
      : isProcessing
      ? 'Analisi in corso…'
      : isPlayingVoice
      ? 'Riproduzione del feedback…'
      : 'Pronto per praticare';
  const coachMessage = `${scenarioConfig.title}: ${studentFirstName}, rispondi in inglese con sicurezza (${currentLevelLabel}).`;

  const goToNextInterviewSentence = useCallback(async () => {
    await stopVoicePlayback();
    setIsPlayingVoice(false);
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
  }, [conversationPairs.length, stopVoicePlayback]);

  return (
    <BrandBackground>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sizes.padding,
          paddingTop: sizes.l,
          paddingBottom: sizes.xl,
        }}
        showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <Block
          row
          justify="space-between"
          align="center"
          marginBottom={sizes.sm}>
          <Button
            color="rgba(255,255,255,0.12)"
            radius={sizes.sm}
            width={sizes.md}
            height={sizes.md}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
            <Image
              radius={0}
              width={18}
              height={18}
              color={colors.white}
              source={assets.menu}
            />
          </Button>
          <BrandChip
            label="Progressi"
            tone="neutral"
            onPress={() => navigation.navigate('ProgressOverview')}
          />
        </Block>

        {/* INTRO */}
        <Text
          size={sizes.p - 2}
          color="rgba(255,255,255,0.7)"
          marginBottom={sizes.xs}>
          🎭 Role Play
        </Text>
        <BrandSectionHeader
          title={scenarioConfig.title}
          subtitle={scenarioConfig.introEn}
        />

        <BrandSurface tone="glass" style={{marginBottom: sizes.l}}>
          <Text color="rgba(255,255,255,0.82)" semibold>
            English
          </Text>
          <Text color="rgba(255,255,255,0.76)" marginBottom={sizes.sm}>
            {scenarioConfig.introEn}
          </Text>
          <Text color="rgba(255,255,255,0.82)" semibold>
            Italiano
          </Text>
          <Text color="rgba(255,255,255,0.76)">
            {scenarioConfig.introIt}
          </Text>
        </BrandSurface>

        {/* SELECTOR DE NIVELES – reemplaza BrandChip para evitar texto partido/bordes dobles */}
        <Block
          row
          wrap="wrap"
          justify="flex-start"
          marginBottom={sizes.m}>
          {scenarioConfig.levels.map((level) => {
            const isActive = activeLevelId === level.id;
            return (
              <Button
                key={level.id}
                onPress={() => handleLevelSelect(level.id)}
                radius={sizes.cardRadius}
                color={
                  isActive
                    ? 'rgba(61, 214, 152, 0.22)'
                    : 'rgba(255,255,255,0.08)'
                }
                style={{
                  minWidth: 110,
                  paddingHorizontal: sizes.sm,
                  height: sizes.l * 1.4,
                  justifyContent: 'center',
                  marginRight: sizes.xs,
                  marginBottom: sizes.xs,
                }}>
                <Text
                  center
                  semibold={isActive}
                  color={colors.white}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {level.label}
                </Text>
              </Button>
            );
          })}
        </Block>

        {/* ÁREA PRINCIPAL */}
        <BrandSurface tone="glass" style={{marginBottom: sizes.l}}>
          <Block align="center" marginBottom={sizes.m}>
            <AssistantOrb state={assistantState} size={180} />
            <Text white semibold size={sizes.h5} marginTop={sizes.sm}>
              {practice.tutorName}
            </Text>
            <Text center color="rgba(255,255,255,0.76)" size={sizes.p - 1}>
              {coachMessage}
            </Text>
            <BrandActionButton
              label={
                micPermission !== 'granted'
                  ? 'Consenti microfono'
                  : isRecording
                  ? 'Ferma registrazione'
                  : isProcessing
                  ? 'Analisi in corso...'
                  : isPlayingVoice
                  ? 'Riproduzione feedback...'
                  : 'Inizia la pratica'
              }
              onPress={handleToggleRecordingWrapper}
              disabled={isProcessing || isPlayingVoice}
              style={{
                marginTop: sizes.sm,
                width: '70%',
              }}
            />
            <Text
              marginTop={sizes.xs}
              size={sizes.p - 2}
              color="rgba(255,255,255,0.72)">
              {micStatusLabel}
            </Text>
            {error ? (
              <Text
                marginTop={sizes.xs}
                size={sizes.p - 2}
                color={colors.danger ?? '#FF6B6B'}>
                {error}
              </Text>
            ) : null}
          </Block>

          <BrandSurface tone="neutral" style={{marginBottom: sizes.m}}>
            <Text color={colors.white} marginBottom={sizes.xs} semibold>
              Turno {currentTurnNumber > 0 ? currentTurnNumber : '—'} di{' '}
              {totalTurnsDisplay}
            </Text>
            <Text color="rgba(255,255,255,0.72)" size={sizes.p - 1}>
              Tutor AI
            </Text>
            <Text white semibold size={sizes.p} marginBottom={sizes.sm}>
              {currentTutorPrompt || 'Preparando il prossimo turno...'}
            </Text>
            <Text color="rgba(255,255,255,0.72)" size={sizes.p - 1}>
              Risposta di esempio
            </Text>
            <Text color="rgba(255,255,255,0.9)" size={sizes.p}>
              {expectedUserSample ||
                'Formula la tua miglior risposta in inglese per rinforzare la pratica.'}
            </Text>
            <BrandActionButton
              label="Prossimo turno"
              onPress={goToNextInterviewSentence}
              disabled={
                isRecording ||
                isProcessing ||
                isPlayingVoice ||
                conversationPairs.length === 0
              }
              style={{marginTop: sizes.sm}}
            />
          </BrandSurface>

          <BrandSurface tone="neutral" style={{marginBottom: sizes.m}}>
            <Text bold color={colors.white} marginBottom={sizes.xs}>
              Feedback
            </Text>
            <Text size={sizes.p - 1} color="rgba(255,255,255,0.85)">
              {dynamicFeedback ??
                'Registra la tua risposta per ricevere un feedback personalizzato.'}
            </Text>
            {analysisVerdict ? (
              <Text
                semibold
                marginTop={sizes.sm}
                marginBottom={sizes.xs}
                color={
                  analysisVerdict === 'correct'
                    ? 'rgba(111,255,200,0.9)'
                    : colors.danger ?? '#FF6B6B'
                }>
                {analysisVerdict === 'correct'
                  ? 'Pronuncia accettabile'
                  : 'Pronuncia da migliorare'}
              </Text>
            ) : null}
            {analysisSummary ? (
              <>
                <Text size={sizes.p - 1} color="rgba(255,255,255,0.76)">
                  {analysisSummary}
                </Text>
                <BrandActionButton
                  label={isPlayingVoice ? 'Riproduzione...' : 'Ascolta feedback'}
                  onPress={() => playVoiceMessage(analysisSummary)}
                  disabled={isPlayingVoice}
                  style={{marginTop: sizes.sm}}
                />
              </>
            ) : null}
            {voiceError ? (
              <Text
                marginTop={sizes.xs}
                size={sizes.p - 2}
                color={colors.danger ?? '#FF6B6B'}>
                {voiceError}
              </Text>
            ) : null}
          </BrandSurface>

          <BrandSectionHeader
            title="Progresso del role play"
            subtitle={`Turni completati ${sessionProgress.completed} di ${sessionProgress.total}`}
          />
          <BrandProgressBar value={sessionProgress.percentage} />

          {processingError ? (
            <Text
              color={colors.danger ?? '#FF6B6B'}
              size={sizes.p - 2}
              marginTop={sizes.sm}>
              {processingError}
            </Text>
          ) : null}

          <Block row justify="space-between" marginTop={sizes.l}>
            <Button
              flex={0}
              radius={sizes.cardRadius}
              color="rgba(255,255,255,0.12)"
              style={{
                width: sizes.xl * 2.2,
                height: sizes.xl * 2.2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleToggleRecordingWrapper}>
              <Block
                width={72}
                height={72}
                radius={36}
                gradient={isRecording ? gradients.warning : gradients.primary}
                align="center"
                justify="center">
                <Image
                  source={icons.chat}
                  width={28}
                  height={28}
                  color={colors.white}
                  radius={0}
                />
              </Block>
              <Text
                marginTop={sizes.xs}
                color="rgba(255,255,255,0.82)"
                semibold
                size={sizes.p - 2}>
                {isRecording ? 'Registrando…' : 'Inizia registrazione'}
              </Text>
            </Button>

            <BrandSurface
              tone="neutral"
              style={{
                flex: 1,
                marginLeft: sizes.sm,
                justifyContent: 'center',
              }}>
              <Text color="rgba(255,255,255,0.76)" size={sizes.p - 2}>
                Ultimo punteggio
              </Text>
              <Text h3 white semibold>
                {practice.lastScore}
              </Text>
              <Text size={sizes.p - 2} color="rgba(255,255,255,0.6)">
                Ottimo controllo dell’intonazione!
              </Text>
            </BrandSurface>
          </Block>

          {error ? (
            <BrandSurface tone="warning" style={{marginTop: sizes.sm}}>
              <Text white>{error}</Text>
            </BrandSurface>
          ) : null}

          {lastUri ? (
            <BrandSurface tone="glass" style={{marginTop: sizes.sm}}>
              <Text white semibold>Ultima registrazione salvata</Text>
              <Text size={sizes.p - 2} color="rgba(255,255,255,0.72)">
                {lastUri}
              </Text>
              <BrandActionButton
                label={isProcessing ? 'Analisi in corso...' : 'Ripeti analisi'}
                onPress={handleReanalyzeRecording}
                disabled={isProcessing}
                style={{marginTop: sizes.sm}}
              />
              <BrandActionButton
                label="Reset"
                onPress={handleResetRecording}
                style={{marginTop: sizes.xs}}
              />
            </BrandSurface>
          ) : null}
        </BrandSurface>
        <BrandActionButton
          label="Termina sessione"
          onPress={() => {}}
          style={{marginTop: sizes.l, marginBottom: sizes.xl}}
        />
      </ScrollView>
    </BrandBackground>
  );
};

export default PracticeSession;
