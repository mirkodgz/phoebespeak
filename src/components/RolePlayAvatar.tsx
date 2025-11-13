import React, {useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, View} from 'react-native';
import {Video, ResizeMode} from 'expo-av';

type RolePlayAvatarMode = 'speaking' | 'listening' | 'idle';

type RolePlayAvatarProps = {
  mode: RolePlayAvatarMode;
  size?: number;
};

const AVATAR_SPEAKING = require('../../assets/habla.mp4');
const AVATAR_STATIC = require('../../assets/imageneavatarestatico.jpeg');

const RolePlayAvatar = ({mode, size = 260}: RolePlayAvatarProps) => {
  const tutorOpacity = useRef(new Animated.Value(mode === 'speaking' ? 1 : 0))
    .current;
  const silentOpacity = useRef(
    new Animated.Value(mode === 'speaking' ? 0 : 1),
  ).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const speakingRef = useRef<Video | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(tutorOpacity, {
        toValue: mode === 'speaking' ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(silentOpacity, {
        toValue: mode === 'speaking' ? 0 : 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    if (mode === 'speaking') {
      speakingRef.current?.setPositionAsync(0);
      speakingRef.current?.playAsync().catch(() => {});
    } else {
      speakingRef.current?.stopAsync().catch(() => {});
    }
  }, [mode, silentOpacity, tutorOpacity]);

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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
        },
        animatedContainerStyle,
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, {opacity: silentOpacity}]}>
        <Image source={AVATAR_STATIC} style={styles.image} resizeMode="cover" />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, {opacity: tutorOpacity}]}>
        <Video
          source={AVATAR_SPEAKING}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          ref={(ref) => {
            speakingRef.current = ref;
          }}
          shouldPlay
          isLooping
          isMuted
          onPlaybackStatusUpdate={(status) => {
            if (!status.isLoaded && status.error && __DEV__) {
              console.warn('Speaking avatar playback error', status.error);
            }
          }}
        />
      </Animated.View>

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
    backgroundColor: '#0B3D4D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: 'rgba(0,0,0,0.55)',
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: {width: 0, height: 18},
    elevation: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: 'rgba(96,203,88,0.28)',
  },
});

export default RolePlayAvatar;


