import React, {useMemo, useEffect, useRef} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';

import {Block, Text, Image} from '../components';
import {useData, useTheme} from '../hooks';

type TutorOption = {
  id: 'davide' | 'phoebe';
  name: string;
  characteristics: string[];
  avatar: ReturnType<typeof require>;
};

const TUTORS: TutorOption[] = [
  {
    id: 'davide',
    name: 'DAVIDE',
    characteristics: ['Amable', 'Voz clara', 'Paciente'],
    avatar: require('../../assets/uomofrontew.webp'),
  },
  {
    id: 'phoebe',
    name: 'PHOEBE',
    characteristics: ['Empática', 'Voz suave', 'Motivadora'],
    avatar: require('../../assets/donnafrontew.webp'),
  },
];

// Componente animado para las imágenes de los tutores
const AnimatedTutorAvatar = ({source, width, height, radius}: {source: any; width: number; height: number; radius: number}) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [scale]);

  return (
    <Animated.View
      style={{
        transform: [{scale}],
        width,
        height,
        overflow: 'hidden',
        borderRadius: radius,
      }}>
      <Image
        source={source}
        width={width}
        height={height}
        radius={radius}
      />
    </Animated.View>
  );
};

const Profile = () => {
  const {user, progress, preferences, updatePreferences} = useData();
  const {sizes, colors, assets} = useTheme();
  const navigation = useNavigation<any>();

  const selectedTutor = preferences.selectedTutor || 'davide';

  const handleTutorSelect = (tutorId: 'davide' | 'phoebe') => {
    updatePreferences({selectedTutor: tutorId});
  };

  // Obtener datos de métricas desde progress
  const streakMilestone = progress.milestones.find(m => m.id === 'streak');
  const streakValue = streakMilestone?.value 
    ? parseInt(streakMilestone.value.replace(/\D/g, ''), 10) || 0 
    : 0;
  
  const metrics = {
    streak: streakValue,
    gems: 0, // Por ahora hardcodeado, se puede agregar al modelo de datos
    totalStars: 2, // Por ahora hardcodeado, se puede agregar al modelo de datos
  };

  // Obtener lecciones completadas
  const lessonsCompleted = 0;
  const championship = 'CAMPIONATO BLU';

  // Datos de vocabulario (por ahora hardcodeados, se pueden obtener de una fuente de datos)
  const vocabularyData = {
    totalWords: 26,
    weeklyData: [
      {period: 'Oct 27-2', value: 5},
      {period: 'Nov 3-9', value: 5},
      {period: 'Nov 10-16', value: 5},
      {period: 'Nov 17-23', value: 26},
    ],
  };

  return (
    <Block safe color="#F5F5F5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: sizes.padding * 2}}>
        {/* Header con perfil */}
        <Block
          row
          justify="space-between"
          align="center"
          paddingHorizontal={sizes.padding}
          paddingTop={sizes.md}
          marginBottom={sizes.l}>
          <Block row align="center" flex={1}>
            <Image
              source={user?.avatar ? {uri: user.avatar} : assets.avatar1}
              width={60}
              height={60}
              radius={30}
              style={{marginRight: sizes.sm}}
            />
            <Block flex={1}>
              <Text h4 semibold color={colors.text}>
                {user?.name || 'Andres'}
              </Text>
              <Block row align="center" marginTop={2}>
                <Ionicons
                  name="trophy"
                  size={14}
                  color="#FFA500"
                  style={{marginRight: 4}}
                />
                <Text size={12} color={colors.text} opacity={0.7}>
                  {lessonsCompleted} LEZIONI
                </Text>
              </Block>
              <Block row align="center" marginTop={2}>
                <Ionicons
                  name="shield"
                  size={14}
                  color="#0B3D4D"
                  style={{marginRight: 4}}
                />
                <Text size={12} color={colors.text} opacity={0.7}>
                  {championship}
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

        {/* Tarjetas de métricas */}
        <Block
          row
          justify="space-between"
          paddingHorizontal={sizes.padding}
          marginBottom={sizes.l}>
          {/* Serie */}
          <Block
            flex={1}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              marginRight: sizes.sm,
            }}>
            <LinearGradient
              colors={['#FFB84D', '#FFA500']}
              style={styles.metricCard}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <Ionicons name="flash" size={24} color="#FFFFFF" />
              <Text h3 bold white marginTop={sizes.sm}>
                {metrics.streak}
              </Text>
              <Text size={12} white opacity={0.9} marginTop={4}>
                Serie
              </Text>
            </LinearGradient>
          </Block>

          {/* Gemme */}
          <Block
            flex={1}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              marginRight: sizes.sm,
            }}>
            <LinearGradient
              colors={['#FF6B9D', '#C44569']}
              style={styles.metricCard}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <Ionicons name="diamond" size={24} color="#FFFFFF" />
              <Text h3 bold white marginTop={sizes.sm}>
                {metrics.gems}
              </Text>
              <Text size={12} white opacity={0.9} marginTop={4}>
                Gemme
              </Text>
            </LinearGradient>
          </Block>

          {/* Stelle Totali */}
          <Block
            flex={1}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
            }}>
            <LinearGradient
              colors={['#FFD93D', '#FFA500']}
              style={styles.metricCard}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <Ionicons name="star" size={24} color="#FFFFFF" />
              <Text h3 bold white marginTop={sizes.sm}>
                {metrics.totalStars}
              </Text>
              <Text size={12} white opacity={0.9} marginTop={4}>
                Stelle Totali
              </Text>
            </LinearGradient>
          </Block>
        </Block>

        {/* Sección Il mio lessico */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.l}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.md}>
            Il mio lessico
          </Text>

          {/* Tarjeta de palabras totales */}
          <Block
            color="#FFFFFF"
            radius={16}
            padding={sizes.md}
            marginBottom={sizes.md}
            style={styles.card}>
            <Block row justify="space-between" align="center">
              <Block row align="center">
                <Block
                  color="#E8F4F8"
                  radius={12}
                  width={44}
                  height={44}
                  align="center"
                  justify="center"
                  marginRight={sizes.sm}>
                  <Text h4 bold color="#0B3D4D">
                    ABC
                  </Text>
                </Block>
                <Text semibold color={colors.text}>
                  Parole totali utilizzate
                </Text>
              </Block>
              <Text h4 bold color="#0B3D4D">
                {vocabularyData.totalWords}
              </Text>
            </Block>
          </Block>

          {/* Gráfico de barras semanales */}
          <Block style={{height: 100, marginTop: sizes.sm}}>
            <Block row justify="space-between" align="flex-end" style={{height: 80}}>
              {vocabularyData.weeklyData.map((week, index) => {
                const maxValue = Math.max(
                  ...vocabularyData.weeklyData.map(w => w.value),
                );
                const maxBarHeight = 50;
                const barHeight = (week.value / maxValue) * maxBarHeight;
                const isLast = index === vocabularyData.weeklyData.length - 1;
                const isHighlighted = isLast;
                return (
                  <Block key={index} flex={1} align="center" marginRight={isLast ? 0 : 4} style={{position: 'relative'}}>
                    {isHighlighted && (
                      <Block
                        absolute
                        style={{
                          top: -18,
                          left: 0,
                          right: 0,
                          alignItems: 'center',
                          zIndex: 1,
                        }}>
                        <Text size={10} bold white>
                          +{week.value}
                        </Text>
                      </Block>
                    )}
                    <Block
                      color={isHighlighted ? '#60CB58' : '#E0E0E0'}
                      width="100%"
                      style={{
                        height: Math.max(barHeight, 15),
                        borderRadius: 8,
                        minWidth: 20,
                      }}
                    />
                  </Block>
                );
              })}
            </Block>
            <Block row justify="space-between" marginTop={sizes.xs}>
              {vocabularyData.weeklyData.map((week, index) => (
                <Block key={index} flex={1} align="center" marginRight={index === vocabularyData.weeklyData.length - 1 ? 0 : 4}>
                  <Text
                    size={10}
                    color={colors.text}
                    opacity={0.6}
                    center>
                    {week.period}
                  </Text>
                </Block>
              ))}
            </Block>
          </Block>
        </Block>

        {/* Sección Selección de Tutor */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.l}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.md}>
            Scegli il tuo Tutor
          </Text>
          <Block row justify="space-between">
            {TUTORS.map(tutor => {
              const isSelected = selectedTutor === tutor.id;
              return (
                <TouchableOpacity
                  key={tutor.id}
                  onPress={() => handleTutorSelect(tutor.id)}
                  activeOpacity={0.8}
                  style={styles.tutorCardContainer}>
                  <Block
                    color="#FFFFFF"
                    radius={16}
                    padding={sizes.md}
                    style={[
                      styles.card,
                      styles.tutorCard,
                      isSelected && styles.tutorCardSelected,
                    ]}>
                    <Block align="center" marginBottom={sizes.sm}>
                      <AnimatedTutorAvatar
                        source={tutor.avatar}
                        width={120}
                        height={150}
                        radius={8}
                      />
                    </Block>
                    <Text
                      h5
                      semibold
                      color={isSelected ? '#0B3D4D' : colors.text}
                      center>
                      {tutor.name}
                    </Text>
                    {isSelected && (
                      <Block
                        absolute
                        style={{
                          top: sizes.sm,
                          right: sizes.sm,
                        }}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#60CB58"
                        />
                      </Block>
                    )}
                  </Block>
                </TouchableOpacity>
              );
            })}
          </Block>
        </Block>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  metricCard: {
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tutorCardContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  tutorCard: {
    position: 'relative',
    minHeight: 200,
  },
  tutorCardSelected: {
    borderWidth: 2,
    borderColor: '#60CB58',
  },
});

export default Profile;
