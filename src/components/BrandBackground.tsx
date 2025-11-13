import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

import Block from './Block';

interface BrandBackgroundProps {
  children: React.ReactNode;
}

// Contenedor de fondo global que centraliza el degradado de marca y los brillos decorativos
const BrandBackground = ({children}: BrandBackgroundProps) => {
  const glowTopAnim = useRef(new Animated.Value(0)).current;
  const glowBottomAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const topLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowTopAnim, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(glowTopAnim, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ]),
    );
    const bottomLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowBottomAnim, {
          toValue: 1,
          duration: 3600,
          useNativeDriver: true,
        }),
        Animated.timing(glowBottomAnim, {
          toValue: 0,
          duration: 3600,
          useNativeDriver: true,
        }),
      ]),
    );

    topLoop.start();
    bottomLoop.start();

    return () => {
      topLoop.stop();
      bottomLoop.stop();
    };
  }, [glowTopAnim, glowBottomAnim]);

  const topGlowStyle = {
    opacity: glowTopAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.35, 0.65],
    }),
    transform: [
      {
        scale: glowTopAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.18],
        }),
      },
    ],
  };

  const bottomGlowStyle = {
    opacity: glowBottomAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.28, 0.52],
    }),
    transform: [
      {
        scale: glowBottomAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.22],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Block safe flex={1} color="transparent">
        <Animated.View
          pointerEvents="none"
          style={[styles.glowTopRight, topGlowStyle]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.glowBottomLeft, bottomGlowStyle]}
        />
        {children}
      </Block>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B3D4D',
  },
  glowTopRight: {
    position: 'absolute',
    top: -80,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(96,203,88,0.34)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(96,203,88,0.22)',
  },
});

export default BrandBackground;

