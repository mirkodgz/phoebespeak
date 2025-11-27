import React, {useMemo, useEffect, useRef} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';

import {Block, Text, Image, CrownIcon} from '../components';
import {useData, useTheme} from '../hooks';
import {ROLE_PLAY_SCENARIOS, type RolePlayScenarioId} from '../roleplay';
import {getUserAvatarSource} from '../utils/avatarHelper';

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

  // Datos de progreso
  const progressData = {
    roleplaysCompleted: 0, // Se puede calcular desde historial de sesiones
    totalPracticeTime: 0, // En minutos, se puede calcular desde historial
  };

  // Nivel de inglés actual
  const currentLevel = user?.department || 'beginner';
  const levelLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzato',
  };

  // Estadísticas por nivel (ejemplo - se pueden obtener de datos reales)
  const levelStats = {
    beginner: {completed: 3, total: 12},
    intermediate: {completed: 1, total: 12},
    advanced: {completed: 0, total: 12},
  };

  // Calcular altura aproximada del header
  const headerHeight = Math.max(insets.top + 5, 15) + 80 + sizes.xs;

  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      {/* Header fijo */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: Math.max(insets.top + 5, 15),
          paddingHorizontal: sizes.padding,
          paddingBottom: sizes.xs,
          backgroundColor: '#F5F5F5',
        }}>
        <Block
          row
          justify="space-between"
          align="center"
          style={{minHeight: 80}}>
          <Block row align="center" flex={1}>
            <Image
              source={
                getUserAvatarSource(user?.avatar, assets) ||
                (user?.avatar ? {uri: user.avatar} : assets.avatar1)
              }
              width={60}
              height={60}
              radius={30}
              style={{marginRight: sizes.sm}}
            />
            <Block flex={1}>
              <Text h4 semibold color={colors.text}>
                {user?.name || ''}
              </Text>
              <Block row align="center" marginTop={2}>
                <Ionicons
                  name="trophy"
                  size={14}
                  color={colors.primary}
                  style={{marginRight: 4}}
                />
                <Text size={12} color={colors.text} opacity={0.7}>
                  {progressData.roleplaysCompleted} Roleplays completati
                </Text>
              </Block>
            </Block>
          </Block>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SettingsScreen');
            }}
            style={{padding: sizes.sm}}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </Block>
      </View>

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

        {/* Sección Il tuo livello */}
        <Block marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Il tuo livello di inglese
          </Text>

          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.progressCard}>
            <Block row align="center" marginBottom={sizes.sm}>
              <Block
                color="rgba(11,61,77,0.1)"
                radius={12}
                width={44}
                height={44}
                align="center"
                justify="center"
                marginRight={sizes.sm}>
                <Ionicons name="school" size={24} color={colors.primary} />
              </Block>
              <Block flex={1}>
                <Text semibold color={colors.text}>
                  Livello attuale
                </Text>
                <Text size={12} color={colors.text} opacity={0.6} marginTop={2}>
                  {levelLabels[currentLevel as keyof typeof levelLabels]}
                </Text>
              </Block>
              <Block
                color={colors.primary}
                radius={8}
                paddingHorizontal={sizes.sm}
                paddingVertical={sizes.xs / 2}>
                <Text size={12} white semibold>
                  {currentLevel.toUpperCase()}
                </Text>
              </Block>
            </Block>

            {/* Barra de progreso por nivel */}
            {Object.entries(levelStats).map(([level, stats]) => (
              <Block key={level} marginTop={sizes.sm}>
                <Block row justify="space-between" align="center" marginBottom={sizes.xs / 2}>
                  <Text size={12} color={colors.text} opacity={0.7}>
                    {levelLabels[level as keyof typeof levelLabels]}
                  </Text>
                  <Text size={12} color={colors.text} opacity={0.7}>
                    {stats.completed}/{stats.total}
                  </Text>
                </Block>
                <View
                  style={{
                    height: 6,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${(stats.completed / stats.total) * 100}%`,
                      backgroundColor: level === currentLevel ? colors.primary : colors.secondary,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </Block>
            ))}
          </Block>
        </Block>

        {/* Sección Statistiche per scenario */}
        <Block marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Statistiche per scenario
          </Text>

          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.progressCard}>
            {Object.entries(ROLE_PLAY_SCENARIOS).map(([scenarioId, scenario], index) => {
              const stats = {
                completed: Math.floor(Math.random() * 5), // Ejemplo - se puede obtener de datos reales
                total: 9, // Total de rounds disponibles
              };
              return (
                <Block
                  key={scenarioId}
                  marginBottom={index < Object.keys(ROLE_PLAY_SCENARIOS).length - 1 ? sizes.md : 0}>
                  <Block row justify="space-between" align="center" marginBottom={sizes.xs / 2}>
                    <Text size={14} semibold color={colors.text}>
                      {scenario.title}
                    </Text>
                    <Text size={12} color={colors.text} opacity={0.7}>
                      {stats.completed}/{stats.total}
                    </Text>
                  </Block>
                  <View
                    style={{
                      height: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${(stats.completed / stats.total) * 100}%`,
                        backgroundColor: colors.secondary,
                        borderRadius: 2,
                      }}
                    />
                  </View>
                </Block>
              );
            })}
          </Block>
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
