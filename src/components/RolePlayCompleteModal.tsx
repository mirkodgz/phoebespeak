import React, {useRef, useEffect} from 'react';
import {Modal, StyleSheet, View, Animated, Dimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Text, FullScreenConfetti} from './';
import {useTheme} from '../hooks';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface RolePlayCompleteModalProps {
  visible: boolean;
  scenarioName?: string;
  onClose?: () => void;
  autoCloseDelay?: number; // Tiempo en ms antes de cerrar automáticamente
}

const RolePlayCompleteModal = ({
  visible,
  scenarioName,
  onClose,
  autoCloseDelay = 4000,
}: RolePlayCompleteModalProps) => {
  const {sizes, colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(sizes);

  // Animaciones para el texto
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(-20)).current;
  
  // Animación de resplandor (glow) para el texto
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada del texto
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animación de resplandor (glow) pulsante
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Auto-cerrar después del delay
      if (autoCloseDelay > 0 && onClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    } else {
      // Resetear animaciones
      textOpacity.setValue(0);
      textTranslateY.setValue(-20);
      glowAnimation.setValue(0);
    }
  }, [visible, autoCloseDelay, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.fullScreenContainer}>
        {/* Confeti a pantalla completa - por debajo del contenido */}
        <View style={{zIndex: 1}}>
          <FullScreenConfetti visible={visible} duration={autoCloseDelay} />
        </View>

        {/* Contenido flotante sin fondo - por encima del confeti */}
        <View
          style={[
            styles.contentContainer,
            {
              paddingTop: insets.top + 100,
              paddingBottom: insets.bottom + 100,
              zIndex: 1000,
            },
          ]}>
          {/* Contenedor con texto sin fondo */}
          <Animated.View
            style={{
              opacity: textOpacity,
              transform: [{translateY: textTranslateY}],
              alignItems: 'center',
              width: '100%',
              paddingHorizontal: sizes.padding * 2,
              zIndex: 1001,
            }}>
            {/* Texto de felicitación con efecto de resplandor */}
            <View style={[styles.textWrapper, {zIndex: 1002}]}>
              <Animated.Text
                style={[
                  styles.animatedText,
                  {
                    textShadowRadius: glowAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 20],
                    }),
                  },
                ]}>
                🎉 Ottimo lavoro! 🎊 Hai completato il role play! ✨
              </Animated.Text>
            </View>
            {scenarioName && (
              <Text
                h5
                semibold
                color="#FFFFFF"
                opacity={0.9}
                center
                style={{marginTop: sizes.sm, ...styles.floatingText}}>
                {scenarioName}
              </Text>
            )}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (sizes: any) => StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedText: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF', // Texto blanco
    // Resplandor verde de la empresa que pulsa
    textShadowColor: '#60CB58', // Verde secondary de la empresa
    textShadowOffset: {width: 0, height: 0},
    // textShadowRadius se anima dinámicamente
    includeFontPadding: false,
  },
  floatingText: {
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 6,
  },
});

export default RolePlayCompleteModal;

