import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
  type AVPlaybackStatus,
} from 'expo-av';
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from 'expo-audio';

import {Block, Text, RolePlayAvatar, Button} from '../components';
import {useData, usePracticeAudio, useTheme} from '../hooks';
import {
  requestTutorChat,
  requestPracticeVoice,
  requestTranslate,
  transcribePracticeAudio,
} from '../services/practice';

type ChatMessage = {
  id: string;
  role: 'tutor' | 'user';
  text: string;
  timestamp: Date;
};

const AITutor = () => {
  const {sizes, colors} = useTheme();
  const {user, preferences} = useData();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingTranslations, setLoadingTranslations] = useState<Record<string, boolean>>({});
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isRecording,
    lastUri,
    error,
    startRecording,
    stopRecording,
    reset,
  } = usePracticeAudio();

  const studentName = user?.name || 'Student';
  const studentFirstName = studentName.split(' ')[0] || studentName;
  const studentLevel = (user?.department || 'beginner') as 'beginner' | 'intermediate' | 'advanced';
  const tutorName = preferences.selectedTutor === 'phoebe' ? 'Ace' : 'Víctor';

  // Determinar el modo del avatar
  const avatarMode = isLoading || isRecording ? 'listening' : isPlayingVoice ? 'speaking' : 'idle';

  // Avatar flotante - posición y tamaño
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const defaultAvatarX = 20;
  const defaultAvatarY = insets.top + 20; // Posición inicial visible desde arriba
  const avatarPosition = useRef(new Animated.ValueXY({x: defaultAvatarX, y: defaultAvatarY})).current;
  const avatarSize = useRef(new Animated.Value(120)).current;
  const recordingPulse1 = useRef(new Animated.Value(0)).current;
  const recordingPulse2 = useRef(new Animated.Value(0)).current;

  // Cargar permisos del micrófono
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
            duration: 1000,
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
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingPulse2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      recordingPulse1.setValue(0);
      recordingPulse2.setValue(0);
    }
  }, [isRecording, recordingPulse1, recordingPulse2]);

  // Configurar modo de audio
  useEffect(() => {
    const configurePlayback = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        if (__DEV__) {
          console.warn('Error configuring audio mode', error);
        }
      }
    };
    configurePlayback();
  }, []);

  // Pan responder para arrastrar el avatar
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

  // Toggle avatar size
  const toggleAvatarSize = useCallback(() => {
    if (isAvatarExpanded) {
      // Contraer y volver a la posición original
      Animated.parallel([
        Animated.spring(avatarSize, {
          toValue: 120,
          useNativeDriver: false,
        }),
        Animated.spring(avatarPosition, {
          toValue: {x: defaultAvatarX, y: insets.top + 20},
          useNativeDriver: false,
        }),
      ]).start();
      setIsAvatarExpanded(false);
    } else {
      // Expandir y mover a la posición central
      const expandedX = (screenWidth - 250) / 2;
      const expandedY = insets.top + 80;
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
  }, [isAvatarExpanded, avatarSize, avatarPosition, screenWidth, insets.top, defaultAvatarX]);

  // Saludo inicial del tutor
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'tutor',
        text: `Hello ${studentFirstName}! I'm ${tutorName}, your AI English tutor. I'm here to help you with any questions about English learning - grammar, vocabulary, pronunciation, writing, or anything else you'd like to know. What would you like to learn today?`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
      playVoiceMessage(greeting.text);
    }
  }, []);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  // Función para detener la reproducción de voz
  const stopVoicePlayback = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (error) {
        if (__DEV__) {
          console.warn('[AITutor] Stop voice playback error', error);
        }
      }
      try {
        await soundRef.current.unloadAsync();
      } catch (error) {
        if (__DEV__) {
          console.warn('[AITutor] Unload voice playback error', error);
        }
      }
      soundRef.current = null;
    }
    setIsPlayingVoice(false);
  }, []);

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      stopVoicePlayback();
    };
  }, [stopVoicePlayback]);

  // Detener audio cuando la pantalla pierde el foco (navegación a otra pantalla)
  useFocusEffect(
    useCallback(() => {
      // Cuando la pantalla gana el foco, no hacemos nada especial
      
      return () => {
        // Cuando la pantalla pierde el foco, detener todo el audio
        void stopVoicePlayback();
        
        // Si está grabando, detener la grabación
        if (isRecording) {
          void stopRecording().catch((error) => {
            if (__DEV__) {
              console.warn('[AITutor] Error stopping recording on blur', error);
            }
          });
        }
      };
    }, [stopVoicePlayback, isRecording, stopRecording]),
  );

  const playVoiceMessage = useCallback(async (text: string) => {
    try {
      // Detener audio anterior si está reproduciéndose
      await stopVoicePlayback();

      setIsPlayingVoice(true);
      const selectedTutor = preferences.selectedTutor || 'davide';
      
      if (__DEV__) {
        console.log('[AITutor] Requesting voice:', {
          textLength: text.length,
          tutor: selectedTutor === 'phoebe' ? 'Ace' : 'Víctor',
          tutorId: selectedTutor,
        });
      }
      
      const audioUri = await requestPracticeVoice(text, undefined, selectedTutor);
      
      const {sound} = await Audio.Sound.createAsync(
        {uri: audioUri},
        {shouldPlay: true},
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsPlayingVoice(false);
            sound.unloadAsync();
            soundRef.current = null;
          }
        }
      });
    } catch (error) {
      console.error('[AITutor] Error playing voice:', error);
      setIsPlayingVoice(false);
    }
  }, [preferences.selectedTutor, stopVoicePlayback]);

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

  const requestMicPermission = useCallback(async () => {
    try {
      const result = await requestRecordingPermissionsAsync();
      const granted = result.granted ?? false;
      setMicPermission(granted ? 'granted' : 'denied');
      return granted;
    } catch (permissionError) {
      setMicPermission('denied');
      return false;
    }
  }, []);

  const handleStartRecording = async () => {
    if (micPermission !== 'granted') {
      const granted = await requestMicPermission();
      if (!granted) {
        return;
      }
    }

    try {
      await startRecording();
    } catch (recordError) {
      console.error('[AITutor] Error starting recording:', recordError);
    }
  };

  const handleStopRecording = async () => {
    const uri = await stopRecording();
    if (!uri) {
      return;
    }

    setIsProcessing(true);
    try {
      // Transcribir el audio
      const transcription = await transcribePracticeAudio({uri});
      let transcriptText =
        transcription?.text ||
        transcription?.segments?.map((segment) => segment.text).join(' ') ||
        '';

      if (!transcriptText) {
        throw new Error('Could not get transcription. Please try recording again.');
      }

      // Agregar mensaje del usuario
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: transcriptText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Obtener respuesta del tutor
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        text: msg.text,
      }));

      const response = await requestTutorChat({
        conversationHistory,
        studentName,
        studentLevel,
        message: userMessage.text,
      });

      const tutorMessage: ChatMessage = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        text: response.tutorMessage,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, tutorMessage]);
      playVoiceMessage(tutorMessage.text);
    } catch (error) {
      console.error('[AITutor] Error processing recording:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'tutor',
        text: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
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

  const ChatMessageBubble = ({message}: {message: ChatMessage}) => {
    const isTutor = message.role === 'tutor';
    const isUser = message.role === 'user';
    const hasTranslation = Boolean(translations[message.id]);
    const isLoadingTranslation = loadingTranslations[message.id] ?? false;
    const showTranslation = showTranslations[message.id] ?? false;

    const alignLeft = isTutor;

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
          {(isTutor || isUser) && (
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
              <Text
                bold
                size={sizes.p - 3}
                color={
                  isTutor
                    ? '#17C1E8'
                    : '#FFFFFF'
                }>
                {isTutor ? tutorName : studentFirstName}
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
          
          {/* Iconos para mensajes del tutor */}
          {isTutor && (
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
              
              {/* Icono de audio/replay */}
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
      {/* CONTENIDO PRINCIPAL */}
      <View style={{flex: 1}}>
        {/* AVATAR FLOTANTE */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: avatarSize,
            height: avatarSize,
            zIndex: 1000,
            elevation: 10,
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
                outputRange: [156, 325],
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
          ref={scrollViewRef}
          style={{flex: 1}}
          contentContainerStyle={{
            paddingHorizontal: sizes.padding,
            paddingTop: Math.max(insets.top + 160, 180),
            paddingBottom: (sizes.sm * 2 + 32) + 3,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({animated: true});
          }}>
          {messages.map((message) => (
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
                  Processing...
                </Text>
              </View>
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

export default AITutor;
