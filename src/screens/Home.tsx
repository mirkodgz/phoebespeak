import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
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

const Home = () => {
  const {user, progress} = useData();
  const {sizes, colors, assets} = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

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

  // Datos de progreso (por ahora hardcodeados, se pueden obtener de una fuente de datos)
  const progressData = {
    roleplaysCompleted: 0, // Se puede calcular desde historial de sesiones
    totalPracticeTime: 0, // En minutos, se puede calcular desde historial
    lastRoleplay: null as RolePlayScenarioId | null, // Último roleplay practicado
  };

  // Roleplays disponibles para mostrar (todos)
  const availableRoleplays = useMemo(() => {
    return Object.entries(ROLE_PLAY_SCENARIOS); // Mostrar todos los roleplays
  }, []);

  // Colores sólidos para las métricas (usando colores del tema y complementarios)
  const metricColors = {
    streak: colors.primary, // Color primario de marca (#0B3D4D)
    gems: colors.secondary, // Color secundario de marca (#60CB58)
    stars: '#FFA500', // Naranja (complementario que va bien con azul/verde)
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
              <Ionicons name="flash" size={24} color="#FFFFFF" />
              <Text h3 bold white marginTop={sizes.sm}>
                {metrics.streak}
              </Text>
              <Text size={12} white opacity={0.9} marginTop={4}>
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
              <Ionicons name="diamond" size={24} color="#FFFFFF" />
              <Text h3 bold white marginTop={sizes.sm}>
                {metrics.gems}
              </Text>
              <Text size={12} white opacity={0.9} marginTop={4}>
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
              <Ionicons name="star" size={24} color="#FFFFFF" />
              <Text h3 bold white marginTop={sizes.sm}>
                {metrics.totalStars}
              </Text>
              <Text size={12} white opacity={0.9} marginTop={4}>
                Stelle Totali
              </Text>
            </Block>
          </Block>
        </Block>

        {/* CTA Principal: Inizia a praticare */}
        <Block marginBottom={sizes.md}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('RolePlayMain');
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
                    Inizia a praticare
                  </Text>
                  <Text size={12} white opacity={0.9}>
                    Scegli un roleplay e migliora il tuo inglese
                  </Text>
                </Block>
                <Block
                  color="rgba(255,255,255,0.2)"
                  radius={12}
                  width={48}
                  height={48}
                  align="center"
                  justify="center"
                  marginLeft={sizes.sm}>
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                </Block>
              </Block>
            </Block>
          </TouchableOpacity>
        </Block>

        {/* Sección Il tuo progresso */}
        <Block marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Il tuo progresso
          </Text>

          <Block
            color={colors.card}
            radius={16}
            padding={sizes.md}
            style={[styles.progressCard, styles.card]}>
            <Block row justify="space-between" align="center" marginBottom={sizes.md}>
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
                    Minuti totali di pratica
                  </Text>
                </Block>
              </Block>
              <Text h4 bold color={colors.secondary}>
                {progressData.totalPracticeTime}
              </Text>
            </Block>
          </Block>
        </Block>

        {/* Sección Roleplays disponibili */}
        <Block marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Roleplays disponibili
          </Text>

          {availableRoleplays.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingRight: sizes.padding}}>
              {availableRoleplays.map(([scenarioId, scenario], index) => (
                <TouchableOpacity
                  key={scenarioId}
                  onPress={() => {
                    navigation.navigate('RolePlayMain');
                  }}
                  style={[
                    styles.roleplayCard,
                    {marginRight: index < availableRoleplays.length - 1 ? sizes.sm : 0},
                  ]}>
                  <Block
                    color={colors.primary}
                    radius={16}
                    padding={sizes.md}
                    style={styles.roleplayCardInner}>
                    <Block align="center">
                      <Block
                        color="rgba(255,255,255,0.2)"
                        radius={12}
                        width={56}
                        height={56}
                        align="center"
                        justify="center"
                        marginBottom={sizes.sm}>
                        <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
                      </Block>
                      <Text white semibold center marginBottom={sizes.xs}>
                        {scenario.title}
                      </Text>
                      <Text size={11} white opacity={0.8} center>
                        {scenario.introIt}
                      </Text>
                    </Block>
                  </Block>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Block
              color={colors.card}
              radius={16}
              padding={sizes.md}
              style={[styles.emptyStateCard, styles.card]}>
              <Block align="center">
                <Ionicons name="chatbubbles-outline" size={48} color={colors.text} opacity={0.3} />
                <Text semibold color={colors.text} marginTop={sizes.md} marginBottom={sizes.xs}>
                  Inizia il tuo primo roleplay
                </Text>
                <Text size={12} color={colors.text} opacity={0.6} center>
                  Clicca su "Inizia a praticare" per iniziare
                </Text>
              </Block>
            </Block>
          )}
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
  progressCard: {
    minHeight: 140,
  },
  roleplayCard: {
    width: 180,
  },
  roleplayCardInner: {
    minHeight: 160,
  },
  emptyStateCard: {
    minHeight: 160,
    justifyContent: 'center',
  },
});

export default Home;
