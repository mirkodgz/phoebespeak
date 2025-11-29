import React, {useState, useEffect, useRef} from 'react';
import {View, Animated, Dimensions, Easing} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  startX: number;
  endX: number;
}

interface FullScreenConfettiProps {
  visible: boolean;
  duration?: number; // Duración en ms antes de desaparecer automáticamente
}

const FullScreenConfetti: React.FC<FullScreenConfettiProps> = ({visible, duration = 3000}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const containerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Crear piezas de confeti
      const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
      
      const newPieces: ConfettiPiece[] = Array.from({length: 100}, (_, i) => {
        const startX = Math.random() * SCREEN_WIDTH;
        const horizontalMovement = (Math.random() - 0.5) * 300;
        return {
          id: i,
          x: new Animated.Value(startX),
          y: new Animated.Value(-50),
          rotate: new Animated.Value(0),
          opacity: new Animated.Value(0),
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          size: Math.random() * 12 + 8, // 8-20px
          startX,
          endX: startX + horizontalMovement,
        };
      });

      setPieces(newPieces);

      // Animar cada pieza con delay escalonado
      newPieces.forEach((piece, index) => {
        const delay = index * 10; // Delay escalonado de 10ms
        const fallDuration = Math.random() * 3000 + 3000; // 3-6 segundos
        const rotationValue = Math.random() * 1080; // Hasta 3 vueltas

        // Animación de opacidad para entrada
        Animated.timing(piece.opacity, {
          toValue: 1,
          duration: 300,
          delay: delay,
          useNativeDriver: true,
        }).start();

        // Animación de caída
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(piece.y, {
              toValue: SCREEN_HEIGHT + 100,
              duration: fallDuration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(piece.x, {
              toValue: piece.endX,
              duration: fallDuration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(piece.rotate, {
              toValue: rotationValue,
              duration: fallDuration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]).start();
        }, delay);
      });

      // Auto-ocultar después de la duración especificada
      if (duration > 0) {
        const timer = setTimeout(() => {
          Animated.timing(containerOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setPieces([]);
          });
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // Animación de salida
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setPieces([]);
      });
    }
  }, [visible, duration]);

  if (!visible && pieces.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        pointerEvents: 'none',
        zIndex: 9998,
        opacity: containerOpacity,
      }}>
      {pieces.map((piece) => {
        const rotate = piece.rotate.interpolate({
          inputRange: [0, 1080],
          outputRange: ['0deg', '1080deg'],
        });

        return (
          <Animated.View
            key={piece.id}
            style={{
              position: 'absolute',
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.size / 4,
              opacity: piece.opacity,
              transform: [
                {translateX: piece.x},
                {translateY: piece.y},
                {rotate},
              ],
            }}
          />
        );
      })}
    </Animated.View>
  );
};

export default FullScreenConfetti;

