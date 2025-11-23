import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';

import {Block, Text, Image} from '../components';
import {useData, useTheme} from '../hooks';

const Home = () => {
  const {user, progress} = useData();
  const {sizes, colors, assets} = useTheme();
  const navigation = useNavigation<any>();

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

  // Datos de vocabulario (por ahora hardcodeados, se pueden obtener de una fuente de datos)
  const vocabularyData = {
    totalWords: 109,
    weeklyData: [
      {period: 'Oct 27-2', value: 20},
      {period: 'Nov 3-9', value: 35},
      {period: 'Nov 10-16', value: 45},
      {period: 'Nov 17-23', value: 50},
    ],
  };

  // Obtener lecciones completadas (por ahora hardcodeado)
  const lessonsCompleted = 0;
  const championship = 'CAMPIONATO BLU';

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
                {user?.name || 'Giulia'}
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
                  name="globe"
                  size={14}
                  color="#4A90E2"
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
              // Navegar a SettingsScreen dentro del mismo stack
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
                  color="#F0F0F0"
                  radius={12}
                  width={44}
                  height={44}
                  align="center"
                  justify="center"
                  marginRight={sizes.sm}>
                  <Text h4 bold color={colors.text}>
                    ABC
                  </Text>
                </Block>
                <Text semibold color={colors.text}>
                  Parole totali utilizzate
                </Text>
              </Block>
              <Text h4 bold color={colors.text}>
                {vocabularyData.totalWords}
              </Text>
            </Block>
          </Block>

          {/* Gráfico de barras semanales */}
          <Block row justify="space-between" align="flex-end" style={{height: 100, marginTop: sizes.sm}}>
            {vocabularyData.weeklyData.map((week, index) => {
              const maxValue = Math.max(
                ...vocabularyData.weeklyData.map(w => w.value),
              );
              const maxBarHeight = 60;
              const barHeight = (week.value / maxValue) * maxBarHeight;
              const isLast = index === vocabularyData.weeklyData.length - 1;
              return (
                <Block key={index} flex={1} align="center" marginRight={isLast ? 0 : 4}>
                  <Block
                    color="#FFB6C1"
                    width="100%"
                    style={{
                      height: Math.max(barHeight, 15),
                      borderRadius: 8,
                      minWidth: 20,
                    }}
                  />
                  <Text
                    size={10}
                    color={colors.text}
                    opacity={0.6}
                    marginTop={sizes.xs}
                    center>
                    {week.period}
                  </Text>
                </Block>
              );
            })}
          </Block>
        </Block>

        {/* Sección Le mie parole quotidiane (bloqueada) */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.l}>
          <Block
            color="#FFFFFF"
            radius={16}
            padding={sizes.md}
            style={styles.card}>
            <Block row align="center" justify="space-between">
              <Block row align="center" flex={1}>
                <Ionicons
                  name="book"
                  size={24}
                  color="#4A90E2"
                  style={{marginRight: sizes.sm}}
                />
                <Block flex={1}>
                  <Text semibold color={colors.text} marginBottom={4}>
                    Le mie parole quotidiane
                  </Text>
                  <Text size={12} color={colors.text} opacity={0.6}>
                    Completa la tua prima lezione per sbloccare.
                  </Text>
                </Block>
              </Block>
              <Ionicons name="lock-closed" size={20} color={colors.text} />
            </Block>
          </Block>
        </Block>

        {/* Sección Lessico stimato (bloqueada) */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.l}>
          <Block
            color="#FFFFFF"
            radius={16}
            padding={sizes.md}
            style={styles.card}>
            <Block row align="center" justify="space-between">
              <Block row align="center" flex={1}>
                <Ionicons
                  name="sparkles-outline"
                  size={24}
                  color="#4A90E2"
                  style={{marginRight: sizes.sm}}
                />
                <Text semibold color={colors.text}>
                  Lessico stimato
                </Text>
              </Block>
              <Ionicons name="lock-closed" size={20} color={colors.text} />
            </Block>
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
});

export default Home;
