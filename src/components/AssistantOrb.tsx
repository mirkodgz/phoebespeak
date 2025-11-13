import React, {useEffect, useMemo} from 'react';
import {Image as RNImage, StyleSheet} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {LinearGradient} from 'expo-linear-gradient';

import {useTheme} from '../hooks';

export type AssistantOrbState = 'idle' | 'listening' | 'speaking';

type AssistantOrbProps = {
  state?: AssistantOrbState;
  size?: number;
};

const AnimatedImage = Animated.createAnimatedComponent(RNImage);
const BRAND_LOGO = require('../../assets/logo.png');

const AssistantOrb = ({state = 'idle', size = 140}: AssistantOrbProps) => {
  const {gradients, colors} = useTheme();

  const haloScale = useSharedValue(1);
  const haloOpacity = useSharedValue(0.35);
  const coreScale = useSharedValue(1);
  const logoScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const ringRotation = useSharedValue(0);

  useEffect(() => {
    if (state === 'listening') {
      haloScale.value = withRepeat(withTiming(1.35, {duration: 1400}), -1, true);
      haloOpacity.value = withRepeat(
        withSequence(
          withTiming(0.55, {duration: 700}),
          withTiming(0.25, {duration: 700}),
        ),
        -1,
        false,
      );
      coreScale.value = withTiming(1.05, {duration: 400});
    } else if (state === 'speaking') {
      haloScale.value = withRepeat(withTiming(1.22, {duration: 900}), -1, true);
      haloOpacity.value = withTiming(0.45, {duration: 280});
      coreScale.value = withRepeat(withTiming(1.09, {duration: 320}), -1, true);
    } else {
      haloScale.value = withTiming(1, {duration: 450});
      haloOpacity.value = withTiming(0.28, {duration: 450});
      coreScale.value = withTiming(1, {duration: 450});
    }
  }, [state, haloOpacity, haloScale, coreScale]);

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.06, {duration: 1400, easing: Easing.inOut(Easing.quad)}),
        withTiming(0.96, {duration: 1400, easing: Easing.inOut(Easing.quad)}),
      ),
      -1,
      true,
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, {duration: 1600, easing: Easing.inOut(Easing.quad)}),
        withTiming(0.35, {duration: 1600, easing: Easing.inOut(Easing.quad)}),
      ),
      -1,
      true,
    );

    ringRotation.value = withRepeat(
      withTiming(1, {
        duration: 7000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [glowOpacity, logoScale, ringRotation]);

  const haloAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: haloScale.value}],
    opacity: haloOpacity.value,
  }));

  const coreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: coreScale.value}],
  }));

  const bars = useMemo(() => Array.from({length: 4}), []);

  const gradient =
    gradients?.primary ?? (['#0B3D4D', '#60CB58'] as const);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: logoScale.value}],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${ringRotation.value * 360}deg`}],
  }));

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
        },
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            backgroundColor: colors.primary ?? '#0B3D4D',
          },
          haloAnimatedStyle,
        ]}
      />

      <Animated.View style={[styles.core, coreAnimatedStyle]}>
        <LinearGradient
          colors={gradient}
          start={{x: 0.1, y: 0.1}}
          end={{x: 0.9, y: 0.9}}
          style={styles.gradient}
        />
        <Animated.View style={[styles.innerGlow, glowAnimatedStyle]} />

        <Animated.View style={[styles.logoAura, glowAnimatedStyle]} />

        <Animated.View style={[styles.ringWrapper, ringAnimatedStyle]}>
          <LinearGradient
            colors={['rgba(96,203,88,0.1)', 'rgba(255,255,255,0.55)', 'rgba(11,61,77,0.35)']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.ringGradient}
          />
          <Animated.View style={styles.ringMask} />
        </Animated.View>

        <AnimatedImage
          source={BRAND_LOGO}
          resizeMode="contain"
          style={[styles.logo, logoAnimatedStyle]}
        />

        {state === 'speaking' && (
          <Animated.View style={styles.barsContainer}>
            {bars.map((_, idx) => (
              <SpeakingBar key={idx} index={idx} />
            ))}
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const SpeakingBar = ({index}: {index: number}) => {
  const height = useSharedValue(16);

  useEffect(() => {
    height.value = withDelay(
      index * 90,
      withRepeat(
        withSequence(
          withTiming(44, {duration: 220}),
          withTiming(20, {duration: 180}),
        ),
        -1,
        true,
      ),
    );
  }, [height, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: '92%',
    height: '92%',
    borderRadius: 999,
    opacity: 0.32,
  },
  core: {
    width: '68%',
    height: '68%',
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.45)',
    shadowOpacity: 0.35,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 18,
    elevation: 6,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  innerGlow: {
    position: 'absolute',
    width: '78%',
    height: '78%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  logoAura: {
    position: 'absolute',
    width: '82%',
    height: '82%',
    borderRadius: 999,
    backgroundColor: 'rgba(96,203,88,0.28)',
    shadowColor: 'rgba(96,203,88,0.8)',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 16,
  },
  ringWrapper: {
    position: 'absolute',
    width: '94%',
    height: '94%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(96,203,88,0.6)',
    shadowOpacity: 0.35,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 10,
    opacity: 0.95,
  },
  ringGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
  ringMask: {
    width: '82%',
    height: '82%',
    borderRadius: 999,
    backgroundColor: 'rgba(11,61,77,0.18)',
  },
  logo: {
    width: '56%',
    height: '56%',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    position: 'absolute',
    bottom: '18%',
  },
  bar: {
    width: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
});

export default AssistantOrb;

