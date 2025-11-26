import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';

import {Block, Text, Image, CrownIcon} from '../components';
import {useData, useTheme} from '../hooks';
import {ROLE_PLAY_SCENARIOS, type RolePlayScenarioId} from '../roleplay';

const Profile = () => {
  const {user, progress} = useData();
  const {sizes, colors, assets} = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

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

  // Colores sólidos para las métricas (mismo que Home)
  const metricColors = {
    streak: colors.primary, // Color primario de marca (#0B3D4D)
    gems: colors.secondary, // Color secundario de marca (#60CB58)
    stars: '#FFA500', // Naranja (complementario que va bien con azul/verde)
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

  // Últimos roleplays completados (ejemplo)
  const recentRoleplays = [
    {id: 'jobInterview' as RolePlayScenarioId, level: 'beginner', date: 'Hace 2 días'},
    {id: 'atTheCafe' as RolePlayScenarioId, level: 'beginner', date: 'Hace 5 días'},
    {id: 'dailySmallTalk' as RolePlayScenarioId, level: 'intermediate', date: 'Hace 1 semana'},
  ];


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
          <Block flex={1} color={metricColors.stars} radius={16}>
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

        {/* Sección Suscripción Pro - Destacada */}
        <Block marginBottom={sizes.md}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ProPlans');
            }}
            activeOpacity={0.8}>
            <View
              style={{
                backgroundColor: colors.secondary,
                borderRadius: sizes.cardRadius,
                padding: sizes.l,
                shadowColor: colors.secondary,
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}>
              <Block row align="center" marginBottom={sizes.sm}>
                <Block
                  color="rgba(255,255,255,0.25)"
                  radius={20}
                  width={80}
                  height={80}
                  align="center"
                  justify="center"
                  marginRight={sizes.md}>
                  <CrownIcon size={56} color="#FFFFFF" />
                </Block>
                <Block flex={1}>
                  <Text h4 bold white marginBottom={sizes.xs / 2}>
                    Passa a Pro
                  </Text>
                  <Text size={sizes.p - 2} white opacity={0.95}>
                    Sblocca tutte le funzionalità
                  </Text>
                </Block>
              </Block>
              <Block row align="center" justify="flex-end">
                <Block
                  color="rgba(0,0,0,0.2)"
                  radius={12}
                  paddingHorizontal={sizes.md}
                  paddingVertical={sizes.sm}
                  style={{flexShrink: 0}}>
                  <Block row align="center">
                    <Text size={sizes.p - 2} white bold marginRight={sizes.xs / 2}>
                      Vedi piani
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#1a1a1a" />
                  </Block>
                </Block>
              </Block>
            </View>
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

        {/* Sección Roleplays recenti */}
        <Block marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Roleplays recenti
          </Text>

          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.progressCard}>
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
                        color="rgba(11,61,77,0.1)"
                        radius={12}
                        width={44}
                        height={44}
                        align="center"
                        justify="center"
                        marginRight={sizes.sm}>
                        <Ionicons name="chatbubbles" size={20} color={colors.primary} />
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

        {/* Sección Consigli per migliorare */}
        <Block marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Consigli per migliorare
          </Text>

          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.progressCard}>
            <Block row align="center" marginBottom={sizes.sm}>
              <Block
                color="rgba(96,203,88,0.1)"
                radius={12}
                width={44}
                height={44}
                align="center"
                justify="center"
                marginRight={sizes.sm}>
                <Ionicons name="bulb" size={24} color={colors.secondary} />
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
                color="rgba(96,203,88,0.1)"
                radius={12}
                width={44}
                height={44}
                align="center"
                justify="center"
                marginRight={sizes.sm}>
                <Ionicons name="repeat" size={24} color={colors.secondary} />
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
                color="rgba(96,203,88,0.1)"
                radius={12}
                width={44}
                height={44}
                align="center"
                justify="center"
                marginRight={sizes.sm}>
                <Ionicons name="trending-up" size={24} color={colors.secondary} />
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
});

export default Profile;
