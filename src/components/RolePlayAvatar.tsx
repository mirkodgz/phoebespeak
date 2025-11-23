import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {AVPlaybackStatus, ResizeMode, Video} from 'expo-av';

type RolePlayAvatarMode = 'speaking' | 'listening' | 'idle';

type RolePlayAvatarProps = {
  mode: RolePlayAvatarMode;
  size?: number;
  tutor?: 'davide' | 'phoebe';
};

const AVATAR_UOMO = require('../../assets/avataruomo.mp4');
const AVATAR_DONNA = require('../../assets/avatardonna.mp4');
const AVATAR_SILENCE = require('../../assets/silencio.mp4');
const IDLE_FRAME_MS = 220;

const RolePlayAvatar = ({mode, size = 260, tutor = 'davide'}: RolePlayAvatarProps) => {
  const avatarSource = tutor === 'phoebe' ? AVATAR_DONNA : AVATAR_UOMO;
  const bounce = useRef(new Animated.Value(0)).current;
  const listeningRing = useRef(new Animated.Value(0)).current;
  const listeningOpacity = useRef(new Animated.Value(0)).current;
  const speakingRef = useRef<Video | null>(null);
  const hasLoadedVideoRef = useRef(false);

  const syncVideoWithMode = useCallback(
    async (targetMode: RolePlayAvatarMode) => {
      const video = speakingRef.current;
      if (!video) {
        return;
      }

      try {
        const status = await video.getStatusAsync();
        if (!status.isLoaded) {
          return;
        }

        if (targetMode === 'speaking') {
          await video.setPositionAsync(0);
          await video.playAsync();
        } else if (targetMode === 'listening') {
          // Para listening, mantener el video en el frame con boca cerrada
          if (status.isPlaying) {
            await video.pauseAsync();
          }
          // Ir al frame con boca cerrada (inicio del video)
          await video.setPositionAsync(IDLE_FRAME_MS);
        } else {
          // Idle mode - frame con boca cerrada
          if (status.isPlaying) {
            await video.pauseAsync();
          }
          // Ir al frame con boca cerrada (inicio del video)
          await video.setPositionAsync(IDLE_FRAME_MS);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Avatar video sync error', error);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (hasLoadedVideoRef.current) {
      syncVideoWithMode(mode);
    }
  }, [mode, syncVideoWithMode]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [bounce]);

  // Animación para el modo listening (anillo pulsante)
  useEffect(() => {
    if (mode === 'listening') {
      // Anillo pulsante
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(listeningRing, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(listeningOpacity, {
                toValue: 0.8,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(listeningOpacity, {
                toValue: 0.3,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.parallel([
            Animated.timing(listeningRing, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(listeningOpacity, {
              toValue: 0.3,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    } else {
      listeningRing.setValue(0);
      listeningOpacity.setValue(0);
    }
  }, [mode, listeningRing, listeningOpacity]);

  const animatedContainerStyle = {
    transform: [
      {
        translateY: bounce.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
      {
        scale: bounce.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
  };

  const borderRadius = size * 0.16;
  const videoStyle = styles.video;

  // Estilos animados para el anillo de listening
  const listeningRingStyle = {
    transform: [
      {
        scale: listeningRing.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.15],
        }),
      },
    ],
    opacity: listeningOpacity,
  };

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error && __DEV__) {
          console.warn('RolePlay avatar playback error', status.error);
        }
        return;
      }

      if (!hasLoadedVideoRef.current) {
        hasLoadedVideoRef.current = true;
        syncVideoWithMode(mode);
      }
    },
    [mode, syncVideoWithMode],
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size * 1.3, // Aumentar altura del contenedor
          borderRadius,
        },
        animatedContainerStyle,
      ]}>
      <Video
        ref={(ref) => {
          speakingRef.current = ref;
        }}
        source={avatarSource}
        style={[styles.video, {height: size * 1.3}]}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        isLooping
        isMuted
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        key={tutor} // Forzar re-render cuando cambia el tutor
      />
      {/* Anillo de listening */}
      {mode === 'listening' && (
        <Animated.View
          style={[
            styles.listeningRing,
            {
              borderRadius,
              borderWidth: 3,
              borderColor: '#60CB58',
            },
            listeningRingStyle,
          ]}
          pointerEvents="none"
        />
      )}
      <View
        style={[
          styles.ring,
          {
            borderRadius,
          },
        ]}
        pointerEvents="none"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    shadowColor: 'rgba(0,0,0,0.55)',
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: {width: 0, height: 18},
    elevation: 8,
  },
  video: {
    width: '100%',
    height: '130%',
    alignSelf: 'center',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  listeningRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#60CB58',
  },
});

export default RolePlayAvatar;


