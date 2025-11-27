import React, {useMemo, useEffect, useRef} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';

import {
  Block,
  Text,
  Image,
} from '../components';
import {useData, useTheme} from '../hooks';
import {ROLE_PLAY_SCENARIOS, type RolePlayScenarioId} from '../roleplay';
import {getUserAvatarSource} from '../utils/avatarHelper';

const Home = () => {
  const {user, progress} = useData();
  const {sizes, colors, assets} = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

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


  // Nivel de inglés actual
  const currentLevel = user?.department || 'beginner';
  const levelLabels = {
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
  const getRoleplayIcon = (roleplayId: RolePlayScenarioId): string => {
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
                  Continua a praticare
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
