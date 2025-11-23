import React, {useCallback, useState} from 'react';
import {Alert, ScrollView, StyleSheet, TouchableOpacity, View, Image as RNImage} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  Block,
  BrandActionButton,
  Image,
  Text,
} from '../components';
import {useTheme} from '../hooks';
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
  const insets = useSafeAreaInsets();
  // Estado para almacenar el nivel seleccionado por cada scenario
  const [selectedLevels, setSelectedLevels] = useState<Record<RolePlayScenarioId, RolePlayLevelId>>(
    {} as Record<RolePlayScenarioId, RolePlayLevelId>
  );

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

      // Obtener el nivel seleccionado para este scenario, o usar 'beginner' por defecto
      const levelId = selectedLevels[entry.id] || 'beginner';

      navigation.navigate('RolePlayModeSelection', {
        scenarioId: entry.id,
        levelId: levelId,
      });
    },
    [navigation, selectedLevels],
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
                  <RNImage
                    source={require('../../assets/uomofronte.png')}
                    style={styles.classicImage}
                    resizeMode="cover"
                  />
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
