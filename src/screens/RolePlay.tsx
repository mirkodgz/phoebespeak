import React, {useCallback, useState, useMemo, useEffect, useRef} from 'react';
import {Alert, ScrollView, StyleSheet, TouchableOpacity, View, Image as RNImage, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  Block,
  BrandActionButton,
  Image,
  Text,
} from '../components';
import {useTheme, useData} from '../hooks';
import {
  ROLE_PLAY_SCENARIOS,
  type RolePlayScenarioId,
  type RolePlayLevelId,
} from '../roleplay';

const ROLE_PLAY_ENTRIES: Array<{
  id: RolePlayScenarioId;
  duration: string;
  available: boolean;
  image?: any;
}> = [
  {id: 'jobInterview', duration: '4–6 min', available: true, image: require('../../assets/jobinterview.jpg')},
  {id: 'atTheCafe', duration: '3–5 min', available: true, image: require('../../assets/atthecafe.jpg')},
  {id: 'dailySmallTalk', duration: '3–5 min', available: true, image: require('../../assets/Dailysmalltalk.jpg')},
  {id: 'meetingSomeoneNew', duration: '3–5 min', available: true, image: require('../../assets/meetingsomeonenew.jpg')},
];

const RolePlay = () => {
  const navigation = useNavigation<any>();
  const {colors, sizes} = useTheme();
  const {user} = useData();
  const insets = useSafeAreaInsets();
  
  // Animación para alternar entre imágenes de tutores
  const fadeAnim1 = useRef(new Animated.Value(1)).current; // Donna - visible inicialmente
  const fadeAnim2 = useRef(new Animated.Value(0)).current; // Uomo - oculta inicialmente
  
  const tutors = [
    require('../../assets/donnafrontew.webp'),
    require('../../assets/uomofrontew.webp'),
  ];
  
  // Efecto para alternar las imágenes cada 0.5 segundos
  useEffect(() => {
    let isMounted = true;
    let currentIndex = 0;
    
    const animate = () => {
      if (!isMounted) return;
      
      const nextIndex = (currentIndex + 1) % tutors.length;
      
      // Animar fade out de la imagen actual y fade in de la nueva con transición suave
      Animated.parallel([
        Animated.timing(currentIndex === 0 ? fadeAnim1 : fadeAnim2, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(nextIndex === 0 ? fadeAnim1 : fadeAnim2, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
      
      currentIndex = nextIndex;
    };
    
    // Iniciar la animación cada 1.5 segundos
    const interval = setInterval(animate, 1500);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fadeAnim1, fadeAnim2, tutors.length]);
  
  // Obtener el nivel del usuario (por defecto 'beginner')
  const userLevel = useMemo<RolePlayLevelId>(() => {
    const level = (user?.department || 'beginner') as RolePlayLevelId;
    // Validar que el nivel sea uno de los permitidos
    if (['beginner', 'intermediate', 'advanced'].includes(level)) {
      return level;
    }
    return 'beginner';
  }, [user?.department]);
  
  // Estado para almacenar el nivel seleccionado por cada scenario
  // Inicializar con 'beginner' por defecto, se actualizará con el nivel del usuario cuando esté disponible
  const [selectedLevels, setSelectedLevels] = useState<Record<RolePlayScenarioId, RolePlayLevelId>>(
    () => {
      const initialLevels = {} as Record<RolePlayScenarioId, RolePlayLevelId>;
      // Inicializar todos los scenarios con 'beginner' por defecto
      (['jobInterview', 'atTheCafe', 'dailySmallTalk', 'meetingSomeoneNew'] as RolePlayScenarioId[]).forEach(
        (scenarioId) => {
          initialLevels[scenarioId] = 'beginner';
        }
      );
      return initialLevels;
    }
  );
  
  // Actualizar selectedLevels cuando cambie el nivel del usuario o cuando se cargue por primera vez
  useEffect(() => {
    setSelectedLevels(prev => {
      const updated = {...prev};
      let hasChanges = false;
      // Actualizar todos los scenarios con el nuevo nivel del usuario
      (['jobInterview', 'atTheCafe', 'dailySmallTalk', 'meetingSomeoneNew'] as RolePlayScenarioId[]).forEach(
        (scenarioId) => {
          if (updated[scenarioId] !== userLevel) {
            updated[scenarioId] = userLevel;
            hasChanges = true;
          }
        }
      );
      return hasChanges ? updated : prev;
    });
  }, [userLevel]);

  const handleLevelSelect = useCallback(
    (scenarioId: RolePlayScenarioId, levelId: RolePlayLevelId) => {
      setSelectedLevels(prev => ({
        ...prev,
        [scenarioId]: levelId,
      }));
    },
    [],
  );

  const handleScenarioPress = useCallback(
    (entry: {id: RolePlayScenarioId; available: boolean}) => {
      if (!entry.available) {
        Alert.alert(
          'Presto disponibile',
          'Stiamo preparando questo scenario di role play. Sarà disponibile a breve!',
        );
        return;
      }

      // Obtener el nivel seleccionado para este scenario, o usar el nivel del usuario por defecto
      const levelId = selectedLevels[entry.id] || userLevel;

      navigation.navigate('RolePlayModeSelection', {
        scenarioId: entry.id,
        levelId: levelId,
      });
    },
    [navigation, selectedLevels, userLevel],
  );

  return (
    <View style={{flex: 1, backgroundColor: '#f1f5f9'}}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          paddingHorizontal: sizes.padding,
          paddingTop: Math.max(insets.top + 20, 40),
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}>
        <View>
          {/* Sección Classico */}
          <View style={{marginBottom: sizes.sm}}>
            <Text semibold color="#334155" marginBottom={sizes.xs} size={18}>
              Classico
            </Text>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.classicCard}
              onPress={() => handleScenarioPress({id: 'jobInterview', available: true})}>
              <View style={styles.classicCardContent}>
                <View style={styles.classicImageContainer}>
                  {/* Imagen 1: Donna */}
                  <Animated.View
                    style={[
                      StyleSheet.absoluteFill,
                      {opacity: fadeAnim1},
                    ]}>
                    <RNImage
                      source={tutors[0]}
                      style={styles.classicImage}
                      resizeMode="cover"
                    />
                  </Animated.View>
                  {/* Imagen 2: Uomo */}
                  <Animated.View
                    style={[
                      StyleSheet.absoluteFill,
                      {opacity: fadeAnim2},
                    ]}>
                    <RNImage
                      source={tutors[1]}
                      style={styles.classicImage}
                      resizeMode="cover"
                    />
                  </Animated.View>
                </View>
                <View style={styles.classicTextContainer}>
                  <Text h5 semibold color="#334155" marginBottom={sizes.xs} style={styles.classicTitle}>
                    Fai pratica con l'inglese insieme al tuo tutor AI
                  </Text>
                  <View style={styles.classicButton}>
                    <Text semibold color="#FFFFFF" size={sizes.p - 1}>
                      Inizia lezione
                    </Text>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Sección Role Plays */}
          <View style={{marginBottom: 0}}>
            <Text semibold color="#334155" marginBottom={sizes.xs} size={18}>
              Role Plays
            </Text>
            <View style={styles.rolePlayGrid}>
              {ROLE_PLAY_ENTRIES.map(entry => {
                const config = ROLE_PLAY_SCENARIOS[entry.id];
                const isAvailable = entry.available;

                return (
                  <TouchableOpacity
                    key={entry.id}
                    activeOpacity={0.8}
                    style={styles.rolePlayCard}
                    onPress={() => handleScenarioPress(entry)}
                    disabled={!isAvailable}>
                    <View style={styles.rolePlayImageContainer}>
                      {entry.image ? (
                        <RNImage
                          source={entry.image}
                          style={styles.rolePlayImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.rolePlayImage, styles.rolePlayPlaceholder]}>
                          <Text size={sizes.h1} color="rgba(51,65,85,0.3)">
                            🎭
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      semibold
                      color="#334155"
                      size={sizes.p - 1}
                      center
                      marginTop={4}>
                      {config.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Classic Card
  classicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  classicCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classicImageContainer: {
    width: 120,
    height: 150,
    overflow: 'hidden',
  },
  classicImage: {
    width: '100%',
    height: '100%',
  },
  classicTextContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  classicTitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  classicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b3d4d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 12,
    gap: 8,
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 6,
  },
  // Role Play Grid
  rolePlayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Role Play Cards
  rolePlayCard: {
    width: '48%',
    marginBottom: 24,
  },
  rolePlayImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    marginBottom: 4,
  },
  rolePlayImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  rolePlayPlaceholder: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RolePlay;
