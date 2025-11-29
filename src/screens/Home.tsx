import React, {useMemo, useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View, Animated, Dimensions, Easing} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';

import {
  Block,
  Text,
  Image,
  UserHeader,
  RoundCompleteModal,
  RolePlayCompleteModal,
} from '../components';
import {useData, useTheme} from '../hooks';
import {ROLE_PLAY_SCENARIOS, type RolePlayScenarioId, type RolePlayLevelId} from '../roleplay';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Componente de confeti personalizado
interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  color: string;
  size: number;
  startX: number;
  endX: number;
}

// Componente de confeti que aparece solo en la parte superior del contenido
const Confetti: React.FC<{visible: boolean; animationKey: number; userName?: string; sizes: any; colors: any}> = ({visible, animationKey, userName, sizes, colors}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const confettiHeight = 200; // Altura máxima del área de confeti
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerScale = useRef(new Animated.Value(0.9)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada del contenedor
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(containerScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            delay: 100,
            useNativeDriver: true,
          }),
          Animated.spring(textTranslateY, {
            toValue: 0,
            tension: 50,
            friction: 7,
            delay: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Crear piezas de confeti con diferentes propiedades
      const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
      
      const newPieces: ConfettiPiece[] = Array.from({length: 60}, (_, i) => {
        const startX = Math.random() * SCREEN_WIDTH;
        const horizontalMovement = (Math.random() - 0.5) * 200;
        return {
          id: i,
          x: new Animated.Value(startX),
          y: new Animated.Value(-30),
          rotate: new Animated.Value(0),
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          size: Math.random() * 10 + 8, // Tamaño más grande (8-18px)
          startX,
          endX: startX + horizontalMovement,
        };
      });

      setPieces(newPieces);

      // Animar cada pieza con delay escalonado para efecto más suave
      newPieces.forEach((piece, index) => {
        const delay = index * 15; // Delay escalonado de 15ms por pieza
        const fallDuration = Math.random() * 2000 + 2500; // 2.5-4.5 segundos
        const rotationValue = Math.random() * 720; // Rotación completa (2 vueltas)

        // Animación de opacidad para entrada suave
        const opacity = new Animated.Value(0);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          delay: delay,
          useNativeDriver: true,
        }).start();

        // Guardar la opacidad en la pieza para usarla después
        (piece as any).opacity = opacity;

        setTimeout(() => {
          Animated.parallel([
            Animated.timing(piece.y, {
              toValue: confettiHeight + 50, // Solo cae hasta la altura del confeti
              duration: fallDuration,
              easing: Easing.out(Easing.quad), // Easing suave
              useNativeDriver: true,
            }),
            Animated.timing(piece.x, {
              toValue: piece.endX,
              duration: fallDuration,
              easing: Easing.inOut(Easing.sin), // Movimiento horizontal suave
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
    } else {
      // Animación de salida
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(containerScale, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPieces([]);
      });
    }
  }, [visible, animationKey]);

  if (!visible && pieces.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={{
        height: confettiHeight,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'none',
        marginBottom: sizes.md,
        opacity: containerOpacity,
        transform: [{scale: containerScale}],
      }}>
      {/* Texto del usuario */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: sizes.md,
          zIndex: 10,
          opacity: textOpacity,
          transform: [{translateY: textTranslateY}],
        }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
          }}>
          {userName || 'Usuario'} ora su Speak
        </Text>
      </Animated.View>

      {/* Confeti */}
      {pieces.map((piece) => {
        const rotate = piece.rotate.interpolate({
          inputRange: [0, 720],
          outputRange: ['0deg', '720deg'],
        });

        const opacity = (piece as any).opacity || new Animated.Value(1);

        return (
          <Animated.View
            key={piece.id}
            style={{
              position: 'absolute',
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.size / 4,
              opacity: opacity,
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

const Home = () => {
  const {user, progress} = useData();
  const {sizes, colors, assets} = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // Estado para controlar el confeti
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollY = useRef(0);
  const lastScrollDirection = useRef<'up' | 'down' | null>(null);
  const confettiTimeout = useRef<NodeJS.Timeout | null>(null);
  const confettiKey = useRef(0);
  const hasScrolledDown = useRef(false); // Para saber si el usuario ha scrolleado hacia abajo primero

  // Estados temporales para probar los modales de confeti
  const [showRoundCompleteModal, setShowRoundCompleteModal] = useState(false);
  const [showRolePlayCompleteModal, setShowRolePlayCompleteModal] = useState(false);

  // Animación para el icono sparkles
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de movimiento flotante
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de rotación suave
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    floatAnimation.start();
    rotateAnimation.start();

    return () => {
      floatAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const translateY = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  // Obtener datos de métricas desde progress
  const streakMilestone = progress.milestones.find(m => m.id === 'streak');
  const streakValue = streakMilestone?.value 
    ? parseInt(streakMilestone.value.replace(/\D/g, ''), 10) || 0 
    : 0;
  
  const metrics = {
    streak: streakValue,
    gems: 0, // Por ahora hardcodeado, se puede agregar al modelo de datos
    totalStars: 6, // Por ahora hardcodeado, se puede agregar al modelo de datos
  };



  // Labels para los niveles
  const levelLabels: Record<RolePlayLevelId, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzato',
  };

  // Últimos roleplays completados (ejemplo)
  const recentRoleplays = [
    {id: 'jobInterview' as RolePlayScenarioId, level: 'beginner', date: 'Hace 2 días'},
    {id: 'atTheCafe' as RolePlayScenarioId, level: 'beginner', date: 'Hace 5 días'},
    {id: 'dailySmallTalk' as RolePlayScenarioId, level: 'intermediate', date: 'Hace 1 semana'},
    {id: 'meetingSomeoneNew' as RolePlayScenarioId, level: 'beginner', date: 'Hace 2 semanas'},
  ];

  // Función para obtener el icono según el tipo de roleplay
  const getRoleplayIcon = (roleplayId: RolePlayScenarioId): keyof typeof Ionicons.glyphMap => {
    switch (roleplayId) {
      case 'jobInterview':
        return 'briefcase';
      case 'atTheCafe':
        return 'cafe';
      case 'dailySmallTalk':
        return 'chatbubbles';
      case 'meetingSomeoneNew':
        return 'person-add';
      default:
        return 'chatbubbles';
    }
  };


  // Colores pastel para las métricas (versiones suaves de los colores originales)
  const metricColors = {
    streak: '#A8D5E2', // Azul pastel (versión suave de #0B3D4D)
    gems: '#B8E6C1', // Verde pastel (versión suave de #60CB58)
    stars: '#FFD4A3', // Naranja pastel (versión suave de #FFA500)
  };

  // Calcular altura aproximada del header
  const headerHeight = Math.max(insets.top + 5, 15) + 80 + sizes.xs;

  // Función para activar el confeti
  const triggerConfetti = () => {
    if (showConfetti) return; // Evitar múltiples activaciones simultáneas
    
    if (__DEV__) {
      console.log('[Home] Confetti activado!');
    }
    setShowConfetti(true);
    confettiKey.current += 1; // Forzar re-render del confeti

    // Limpiar timeout anterior si existe
    if (confettiTimeout.current) {
      clearTimeout(confettiTimeout.current);
    }

    // Ocultar el confeti después de 3 segundos
    confettiTimeout.current = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  // Manejar el scroll para detectar cuando el usuario se desliza hacia arriba
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDelta = currentScrollY - scrollY.current;

    // Determinar la dirección del scroll
    const currentDirection = scrollDelta < 0 ? 'up' : scrollDelta > 0 ? 'down' : null;

    // Si el usuario scrollea hacia abajo, marcar que ha scrolleado
    if (currentDirection === 'down' && currentScrollY > 50) {
      hasScrolledDown.current = true;
    }

    // Si el usuario se desliza hacia arriba y está cerca del top de la pantalla
    // Se activa cuando hace scroll hacia arriba rápidamente cerca del top
    if (
      currentDirection === 'up' &&
      scrollDelta < -10 && // Movimiento rápido hacia arriba (más de 10px)
      currentScrollY < 100 && // Muy cerca del top (menos de 100px)
      !showConfetti
    ) {
      if (__DEV__) {
        console.log('[Home] Scroll hacia arriba detectado - Activando confeti', {
          currentScrollY,
          scrollDelta,
          hasScrolledDown: hasScrolledDown.current,
        });
      }
      triggerConfetti();
    }

    // Actualizar la dirección del scroll solo si hay movimiento significativo
    if (Math.abs(scrollDelta) > 3) {
      lastScrollDirection.current = currentDirection;
    }

    scrollY.current = currentScrollY;
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (confettiTimeout.current) {
        clearTimeout(confettiTimeout.current);
      }
    };
  }, []);

  // Obtener el nombre del usuario
  const userName = user?.name || 'Usuario';

  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      <UserHeader />

      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: sizes.padding,
          paddingTop: headerHeight,
          paddingBottom: sizes.padding * 2,
        }}>

        {/* Confeti con texto del usuario - aparece solo en la parte superior */}
        <Confetti 
          visible={showConfetti} 
          animationKey={confettiKey.current} 
          userName={userName}
          sizes={sizes}
          colors={colors}
        />

        {/* Tarjetas de métricas con colores de marca */}
        <Block
          row
          justify="space-between"
          marginBottom={sizes.md}>
          {/* Serie */}
          <Block
            flex={1}
            color={metricColors.streak}
            radius={16}
            style={{
              marginRight: sizes.sm,
            }}>
            <Block style={styles.metricCard}>
              <Ionicons name="flash" size={24} color={colors.primary} />
              <Text h3 bold color={colors.primary} marginTop={sizes.sm}>
                {metrics.streak}
              </Text>
              <Text size={12} color={colors.primary} opacity={0.8} marginTop={4}>
                Serie
              </Text>
            </Block>
          </Block>

          {/* Gemme */}
          <Block
            flex={1}
            color={metricColors.gems}
            radius={16}
            style={{
              marginRight: sizes.sm,
            }}>
            <Block style={styles.metricCard}>
              <Ionicons name="diamond" size={24} color={colors.secondary} />
              <Text h3 bold color={colors.secondary} marginTop={sizes.sm}>
                {metrics.gems}
              </Text>
              <Text size={12} color={colors.secondary} opacity={0.8} marginTop={4}>
                Gemme
              </Text>
            </Block>
          </Block>

          {/* Stelle Totali */}
          <Block
            flex={1}
            color={metricColors.stars}
            radius={16}>
            <Block style={styles.metricCard}>
              <Ionicons name="star" size={24} color="#FF8C42" />
              <Text h3 bold color="#FF8C42" marginTop={sizes.sm}>
                {metrics.totalStars}
              </Text>
              <Text size={12} color="#FF8C42" opacity={0.8} marginTop={4}>
                Stelle Totali
              </Text>
            </Block>
          </Block>
        </Block>

        {/* CTA Principal: Chatta con il tutor */}
        <Block marginBottom={sizes.md}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('AI tutor');
            }}
            activeOpacity={0.8}>
            <Block
              color={colors.primary}
              radius={16}
              padding={sizes.md}
              style={styles.ctaCard}>
              <Block row align="center" justify="space-between">
                <Block flex={1}>
                  <Text h5 white semibold marginBottom={sizes.xs}>
                    Parla con il tutor
                  </Text>
                  <Text size={12} white opacity={0.9}>
                    Fai domande e migliora il tuo inglese
                  </Text>
                </Block>
                <Animated.View
                  style={{
                    marginLeft: sizes.sm,
                    transform: [{translateY}, {rotate}, {scale}],
                  }}>
                  <Ionicons name="sparkles" size={32} color="#FFFFFF" />
                </Animated.View>
              </Block>
            </Block>
          </TouchableOpacity>
        </Block>

        {/* Sección Roleplays recenti */}
        <Block marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Roleplays recenti
          </Text>

          <Block
            color={colors.card}
            radius={16}
            padding={sizes.md}
            style={styles.recentRoleplaysCard}>
            {recentRoleplays.length > 0 ? (
              recentRoleplays.map((roleplay, index) => {
                const scenario = ROLE_PLAY_SCENARIOS[roleplay.id];
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      navigation.navigate('RolePlays');
                    }}
                    style={{
                      marginBottom: index < recentRoleplays.length - 1 ? sizes.md : 0,
                    }}>
                    <Block row align="center">
                      <Block
                        color="rgba(96,203,88,0.1)"
                        radius={12}
                        width={44}
                        height={44}
                        align="center"
                        justify="center"
                        marginRight={sizes.sm}>
                        <Ionicons name={getRoleplayIcon(roleplay.id)} size={20} color={colors.secondary} />
                      </Block>
                      <Block flex={1}>
                        <Text semibold color={colors.text}>
                          {scenario?.title || roleplay.id}
                        </Text>
                        <Text size={12} color={colors.text} opacity={0.6} marginTop={2}>
                          {levelLabels[roleplay.level as keyof typeof levelLabels]} • {roleplay.date}
                        </Text>
                      </Block>
                      <Ionicons name="chevron-forward" size={20} color={colors.text} opacity={0.4} />
                    </Block>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Block align="center" padding={sizes.md}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.text} opacity={0.3} />
                <Text semibold color={colors.text} marginTop={sizes.sm} marginBottom={sizes.xs}>
                  Nessun roleplay completato
                </Text>
                <Text size={12} color={colors.text} opacity={0.6} center>
                  Inizia a praticare per vedere i tuoi progressi qui
                </Text>
              </Block>
            )}
          </Block>
        </Block>

        {/* Sección Consigli per migliorare */}
        <Block marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Consigli per migliorare
          </Text>

          <Block
            color={colors.card}
            radius={16}
            padding={sizes.md}
            style={styles.tipsCard}>
            <Block row align="center" marginBottom={sizes.sm}>
              <Block
                color="rgba(11,61,77,0.1)"
                radius={12}
                width={44}
                height={44}
                align="center"
                justify="center"
                marginRight={sizes.sm}>
                <Ionicons name="bulb" size={24} color={colors.primary} />
              </Block>
              <Block flex={1}>
                <Text semibold color={colors.text}>
                  Pratica ogni giorno
                </Text>
                <Text size={12} color={colors.text} opacity={0.6} marginTop={2}>
                  Anche solo 10 minuti al giorno fanno la differenza
                </Text>
              </Block>
            </Block>

            <Block row align="center" marginBottom={sizes.sm}>
              <Block
                color="rgba(11,61,77,0.1)"
                radius={12}
                width={44}
                height={44}
                align="center"
                justify="center"
                marginRight={sizes.sm}>
                <Ionicons name="repeat" size={24} color={colors.primary} />
              </Block>
              <Block flex={1}>
                <Text semibold color={colors.text}>
                  Ripeti i roleplays
                </Text>
                <Text size={12} color={colors.text} opacity={0.6} marginTop={2}>
                  La ripetizione aiuta a consolidare le conoscenze
                </Text>
              </Block>
            </Block>

            <Block row align="center">
              <Block
                color="rgba(11,61,77,0.1)"
                radius={12}
                width={44}
                height={44}
                align="center"
                justify="center"
                marginRight={sizes.sm}>
                <Ionicons name="trending-up" size={24} color={colors.primary} />
              </Block>
              <Block flex={1}>
                <Text semibold color={colors.text}>
                  Prova livelli più alti
                </Text>
                <Text size={12} color={colors.text} opacity={0.6} marginTop={2}>
                  Sfidati con roleplays più complessi quando ti senti pronto
                </Text>
              </Block>
            </Block>
          </Block>
        </Block>

        {/* ============================================
            BOTONES TEMPORALES PARA PROBAR CONFETI
            TODO: Eliminar antes de producción
            ============================================ */}
        {__DEV__ && (
          <Block
            marginTop={sizes.xl}
            marginBottom={sizes.md}
            color={colors.card}
            radius={16}
            padding={sizes.md}>
            <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
              🧪 Prueba de Confeti (Temporal)
            </Text>
            <Text size={12} color={colors.text} opacity={0.6} marginBottom={sizes.md}>
              Botones temporales para probar los efectos de confeti
            </Text>
            
            <Block row justify="space-between">
              <TouchableOpacity
                onPress={() => setShowRoundCompleteModal(true)}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: sizes.sm,
                  paddingHorizontal: sizes.md,
                  marginRight: sizes.sm,
                  alignItems: 'center',
                }}>
                <Text white semibold center>
                  Probar Round Complete
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowRolePlayCompleteModal(true)}
                style={{
                  flex: 1,
                  backgroundColor: colors.secondary,
                  borderRadius: 12,
                  paddingVertical: sizes.sm,
                  paddingHorizontal: sizes.md,
                  alignItems: 'center',
                }}>
                <Text white semibold center>
                  Probar Role Play Complete
                </Text>
              </TouchableOpacity>
            </Block>
          </Block>
        )}

      </ScrollView>

      {/* Modales de confeti para pruebas */}
      <RoundCompleteModal
        visible={showRoundCompleteModal}
        roundNumber={1}
        roundTitle="Round 1"
        onContinue={() => setShowRoundCompleteModal(false)}
        isLastRound={false}
      />

      <RolePlayCompleteModal
        visible={showRolePlayCompleteModal}
        scenarioName="Job Interview"
        onClose={() => setShowRolePlayCompleteModal(false)}
        autoCloseDelay={4000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  metricCard: {
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaCard: {
    minHeight: 80,
  },
  tipsCard: {
    minHeight: 200,
  },
  recentRoleplaysCard: {
    minHeight: 120,
  },
});

export default Home;
