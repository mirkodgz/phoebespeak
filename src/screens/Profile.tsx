import React, {useMemo, useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View, Animated, Easing} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';

import {Block, Text, Image, CrownIcon, UserHeader} from '../components';
import {useData, useTheme} from '../hooks';
import {ROLE_PLAY_SCENARIOS, type RolePlayScenarioId, type RolePlayLevelId} from '../roleplay';
import {getLevelStats, getAllScenarioStats, getAllRoundsByScenario, getAllRoundsByScenarioAndLevel} from '../services/progressService';

const Profile = () => {
  const {user, progress} = useData();
  const {sizes, colors, assets} = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // Animación para el icono de la copa
  const trophyAnim = useRef(new Animated.Value(0)).current;
  const trophyScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de pulso (brillo/glow)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(trophyAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(trophyScale, {
            toValue: 1.15,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(trophyAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(trophyScale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const opacity = trophyAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.7, 1],
  });

  // Obtener datos de métricas desde progress (reutilizando la misma lógica de Home)
  const streakMilestone = progress.milestones.find(m => m.id === 'streak');
  const streakValue = streakMilestone?.value
    ? parseInt(streakMilestone.value.replace(/\D/g, ''), 10) || 0
    : 0;

  const metrics = {
    streak: streakValue,
    gems: 0, // Por ahora hardcodeado, se puede agregar al modelo de datos
    totalStars: 6, // Por ahora hardcodeado, se puede agregar al modelo de datos
  };

  // Colores pastel para las métricas (versiones suaves de los colores originales)
  const metricColors = {
    streak: '#A8D5E2', // Azul pastel (versión suave de #0B3D4D)
    gems: '#B8E6C1', // Verde pastel (versión suave de #60CB58)
    stars: '#FFD4A3', // Naranja pastel (versión suave de #FFA500)
  };

  // Datos de progreso desde el resumen
  const sessionsMilestone = progress.milestones.find(m => m.id === 'sessions');
  const timeMilestone = progress.milestones.find(m => m.id === 'time');
  
  const progressData = {
    roleplaysCompleted: sessionsMilestone?.value 
      ? parseInt(sessionsMilestone.value.replace(/\D/g, ''), 10) || 0
      : 0,
    totalPracticeTime: timeMilestone?.value
      ? parseInt(timeMilestone.value.replace(/\D/g, ''), 10) || 0
      : 0,
  };

  // Nivel de inglés actual - validar que sea un nivel válido
  const getValidLevel = (level: string | undefined): RolePlayLevelId => {
    if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
      return level as RolePlayLevelId;
    }
    return 'beginner';
  };
  
  const currentLevel = getValidLevel(user?.department);
  const levelLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzato',
  };

  // Estados para estadísticas reales
  const [levelStats, setLevelStats] = useState<{
    beginner: {completed: number; total: number};
    intermediate: {completed: number; total: number};
    advanced: {completed: number; total: number};
  }>({
    beginner: {completed: 0, total: 12},
    intermediate: {completed: 0, total: 12},
    advanced: {completed: 0, total: 12},
  });
  
  const [scenarioStats, setScenarioStats] = useState<Record<RolePlayScenarioId, number>>({
    jobInterview: 0,
    atTheCafe: 0,
    dailySmallTalk: 0,
    meetingSomeoneNew: 0,
  });
  
  const [roundsStats, setRoundsStats] = useState<Record<RolePlayScenarioId, number>>({
    jobInterview: 0,
    atTheCafe: 0,
    dailySmallTalk: 0,
    meetingSomeoneNew: 0,
  });
  
  const [roundsByScenarioAndLevel, setRoundsByScenarioAndLevel] = useState<
    Record<RolePlayScenarioId, Record<RolePlayLevelId, number>>
  >({
    jobInterview: {beginner: 0, intermediate: 0, advanced: 0},
    atTheCafe: {beginner: 0, intermediate: 0, advanced: 0},
    dailySmallTalk: {beginner: 0, intermediate: 0, advanced: 0},
    meetingSomeoneNew: {beginner: 0, intermediate: 0, advanced: 0},
  });
  
  // Obtener nivel actual del usuario - validar que sea un nivel válido
  const currentUserLevel = getValidLevel(user?.department);

  // Animaciones para el banner del nivel
  const levelBannerScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de entrada con spring
    Animated.spring(levelBannerScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Animación de pulso suave continua
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(levelBannerScale, {
          toValue: 1.02,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(levelBannerScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Iniciar el pulso después de un pequeño delay
    const timeout = setTimeout(() => {
      pulseAnimation.start();
    }, 500);

    return () => {
      pulseAnimation.stop();
      clearTimeout(timeout);
    };
  }, [currentUserLevel]);

  // Cargar estadísticas reales
  useFocusEffect(
    React.useCallback(() => {
      const loadStats = async () => {
        try {
          const [levelData, scenarioData, roundsData, roundsByLevelData] = await Promise.all([
            getLevelStats(),
            getAllScenarioStats(),
            getAllRoundsByScenario(),
            getAllRoundsByScenarioAndLevel(),
          ]);

          // Calcular total de rounds posibles por nivel
          // Cada escenario tiene 3 niveles, y cada nivel puede tener múltiples rounds
          // Por ahora usamos un total estimado de 12 rounds por nivel (4 escenarios × 3 niveles)
          const totalRoundsPerLevel = 12;
          
          setLevelStats({
            beginner: {
              completed: levelData.beginner,
              total: totalRoundsPerLevel,
            },
            intermediate: {
              completed: levelData.intermediate,
              total: totalRoundsPerLevel,
            },
            advanced: {
              completed: levelData.advanced,
              total: totalRoundsPerLevel,
            },
          });

          setScenarioStats(scenarioData);
          setRoundsStats(roundsData);
          setRoundsByScenarioAndLevel(roundsByLevelData);
        } catch (error) {
          console.error('[Profile] Error al cargar estadísticas:', error);
          // Mantener valores por defecto si hay error
        }
      };

      loadStats();
    }, []),
  );

  // Calcular altura aproximada del header
  const headerHeight = Math.max(insets.top + 5, 15) + 80 + sizes.xs;

  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      <UserHeader />

      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sizes.padding,
          paddingTop: headerHeight,
          paddingBottom: sizes.padding * 2,
        }}>

        {/* Tarjetas de métricas (reutilizando el mismo estilo de Home) */}
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
          <Block flex={1} color={metricColors.stars} radius={16}>
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

        {/* Sección Suscripción Pro - Destacada */}
        <Block marginBottom={sizes.md}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ProPlans');
            }}
            activeOpacity={0.9}
            style={styles.proCardContainer}>
            <LinearGradient
              colors={['#0B3D4D', '#1A5A6B', '#0B3D4D']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.proGradient}>
              <Block row align="center" justify="space-between">
                <Block flex={1}>
                  <Text h4 bold white marginBottom={sizes.xs / 2}>
                    Passa a Pro
                  </Text>
                  <Text size={sizes.p - 2} white opacity={0.95} marginBottom={sizes.sm}>
                    Sblocca tutte le funzionalità
                  </Text>
                  <Block
                    row
                    align="center"
                    color="rgba(255,255,255,0.3)"
                    radius={16}
                    paddingHorizontal={sizes.md}
                    paddingVertical={sizes.sm}
                    style={{alignSelf: 'flex-start'}}>
                    <Text size={sizes.p - 1} white bold marginRight={sizes.xs / 2}>
                      Vedi piani
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </Block>
                </Block>
                <Animated.View
                  style={{
                    marginRight: sizes.sm,
                    transform: [{scale: trophyScale}],
                    opacity: opacity,
                  }}>
                  <Ionicons name="trophy" size={72} color="#FFFFFF" />
                </Animated.View>
              </Block>
            </LinearGradient>
          </TouchableOpacity>
        </Block>

        {/* Sección Il tuo progresso */}
        <Block marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Il tuo progresso
          </Text>

          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.progressCard}>
            <Block
              row
              justify="space-between"
              align="center"
              marginBottom={sizes.md}>
              <Block row align="center" flex={1}>
                <Block
                  color="rgba(11,61,77,0.1)"
                  radius={12}
                  width={44}
                  height={44}
                  align="center"
                  justify="center"
                  marginRight={sizes.sm}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </Block>
                <Block flex={1}>
                  <Text semibold color={colors.text}>
                    Roleplays completati
                  </Text>
                  <Text size={12} color={colors.text} opacity={0.6} marginTop={2}>
                    Totale sessioni completate
                  </Text>
                </Block>
              </Block>
              <Text h4 bold color={colors.primary}>
                {progressData.roleplaysCompleted}
              </Text>
            </Block>

            <Block row justify="space-between" align="center">
              <Block row align="center" flex={1}>
                <Block
                  color="rgba(11,61,77,0.1)"
                  radius={12}
                  width={44}
                  height={44}
                  align="center"
                  justify="center"
                  marginRight={sizes.sm}>
                  <Ionicons name="time" size={24} color={colors.secondary} />
                </Block>
                <Block flex={1}>
                  <Text semibold color={colors.text}>
                    Tempo di pratica
                  </Text>
                  <Text size={12} color={colors.text} opacity={0.6} marginTop={2}>
                    Minuti totali de práctica
                  </Text>
                </Block>
              </Block>
              <Text h4 bold color={colors.secondary}>
                {progressData.totalPracticeTime}
              </Text>
            </Block>
          </Block>
        </Block>

        {/* Sección: Nivel actual del usuario */}
        <Block marginBottom={sizes.md}>
          <Animated.View
            style={{
              transform: [{scale: levelBannerScale}],
            }}>
            <Block
              color={colors.primary}
              radius={sizes.cardRadius}
              padding={sizes.md}
              style={styles.progressCard}>
              <Block align="center">
                <Text size={12} color="#FFFFFF" opacity={0.9} marginBottom={4}>
                  Il tuo livello attuale
                </Text>
                <Text h4 white semibold>
                  {levelLabels[currentUserLevel]}
                </Text>
              </Block>
            </Block>
          </Animated.View>
        </Block>

        {/* Sección Statistiche per scenario - Separado por nivel */}
        <Block marginBottom={sizes.md}>
          {/* Ordenar niveles: primero el nivel actual, luego los otros */}
          {(['beginner', 'intermediate', 'advanced'] as RolePlayLevelId[])
            .sort((a, b) => {
              // El nivel actual va primero
              if (a === currentUserLevel) return -1;
              if (b === currentUserLevel) return 1;
              return 0;
            })
            .map(levelId => {
              const isCurrentLevel = levelId === currentUserLevel;
              
              return (
                <Block key={levelId} marginBottom={sizes.xl}>
                  <Block 
                    row 
                    align="center" 
                    justify="space-between"
                    marginBottom={sizes.md}
                    paddingBottom={sizes.sm}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: 'rgba(0,0,0,0.1)',
                    }}>
                    <Block row align="center" flex={1}>
                      <Text h4 semibold color={colors.text}>
                        {levelLabels[levelId]}
                      </Text>
                      {isCurrentLevel && (
                        <LinearGradient
                          colors={[colors.primary, colors.secondary]}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 0}}
                          style={{
                            borderRadius: 12,
                            paddingHorizontal: sizes.sm,
                            paddingVertical: sizes.xs / 2,
                            marginLeft: sizes.sm,
                            shadowColor: colors.primary,
                            shadowOffset: {width: 0, height: 2},
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 3,
                          }}>
                          <Text size={11} white semibold>
                            ATTIVO
                          </Text>
                        </LinearGradient>
                      )}
                    </Block>
                  </Block>
                  <Block
                    color={colors.card}
                    radius={sizes.cardRadius}
                    padding={sizes.md}
                    style={[
                      styles.progressCard,
                      isCurrentLevel && {
                        borderWidth: 2,
                        borderColor: colors.secondary,
                      },
                    ]}>
                    {Object.entries(ROLE_PLAY_SCENARIOS).map(([scenarioId, scenario], index) => {
                      // Obtener rounds completados para este escenario y nivel específico
                      const completedRounds = roundsByScenarioAndLevel[scenarioId as RolePlayScenarioId]?.[levelId] || 0;
                      
                      // Calcular total de rounds posibles para este escenario y nivel
                      const levelConfig = scenario.levels.find(l => l.id === levelId);
                      const rounds = levelConfig?.flowConfig?.rounds || [];
                      const totalRounds = rounds.length;
                      
                      const percentage = totalRounds > 0 ? Math.round((completedRounds / totalRounds) * 100) : 0;
                      
                      return (
                        <Block
                          key={scenarioId}
                          marginBottom={index < Object.keys(ROLE_PLAY_SCENARIOS).length - 1 ? sizes.md : 0}>
                          <Block row justify="space-between" align="center" marginBottom={sizes.xs / 2}>
                            <Block flex={1}>
                              <Text size={14} semibold color={colors.text} marginBottom={2}>
                                {scenario.title}
                              </Text>
                              <Text size={11} color={colors.text} opacity={0.6}>
                                Rounds completati
                              </Text>
                            </Block>
                            <Block align="flex-end">
                              <Text size={16} bold color={isCurrentLevel ? colors.primary : colors.text}>
                                {completedRounds}/{totalRounds}
                              </Text>
                              <Text size={10} color={colors.text} opacity={0.5}>
                                {percentage}%
                              </Text>
                            </Block>
                          </Block>
                          <View
                            style={{
                              height: 8,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 4,
                              overflow: 'hidden',
                              marginTop: sizes.xs / 2,
                            }}>
                            <View
                              style={{
                                height: '100%',
                                width: `${percentage}%`,
                                backgroundColor: colors.secondary,
                                borderRadius: 4,
                              }}
                            />
                          </View>
                        </Block>
                      );
                    })}
                  </Block>
                </Block>
              );
            })}
        </Block>

      </ScrollView>
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
  progressCard: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  proCardContainer: {
    borderRadius: 20,
    shadowColor: '#0B3D4D',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  proGradient: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
});

export default Profile;
