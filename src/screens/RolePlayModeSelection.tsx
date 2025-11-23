import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View, Text as RNText} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';

import {Text} from '../components';
import {useTheme} from '../hooks';
import {
  type RolePlayScenarioId,
  type RolePlayLevelId,
  ROLE_PLAY_SCENARIOS,
} from '../roleplay';

type RolePlayModeSelectionRouteParams = {
  scenarioId: RolePlayScenarioId;
  levelId?: RolePlayLevelId;
};

const RolePlayModeSelection = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {sizes} = useTheme();
  const insets = useSafeAreaInsets();
  const {scenarioId, levelId} = (route?.params as RolePlayModeSelectionRouteParams) ?? {};

  const scenarioConfig = ROLE_PLAY_SCENARIOS[scenarioId || 'jobInterview'];
  const styles = createStyles(sizes);

  const handleModeSelect = (mode: 'guided' | 'free') => {
    navigation.navigate('PracticeSession', {
      scenarioId,
      levelId: levelId || 'beginner',
      mode,
    });
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f1f5f9'}}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          paddingHorizontal: sizes.padding,
          paddingTop: Math.max(insets.top + 20, 40),
          paddingBottom: sizes.md,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <Text h4 semibold color="#334155" center style={styles.title}>
            {scenarioConfig.title}
          </Text>
          <View style={{width: 40}} />
        </View>

        <Text
          size={sizes.p}
          color="rgba(51,65,85,0.7)"
          center
          marginBottom={sizes.l / 2}
          style={styles.subtitle}>
          Scegli come vuoi praticare
        </Text>

        {/* Opción 1: Role Play Guidato */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.modeCard}
          onPress={() => handleModeSelect('guided')}>
          <View style={styles.modeCardContent}>
            <View style={styles.iconWrapper}>
              <View style={[styles.iconContainer, {backgroundColor: '#E8F5E9'}]} />
              <RNText style={styles.emojiText}>🎯</RNText>
            </View>
            <View style={styles.textContainer}>
              <Text h5 semibold color="#334155" marginBottom={sizes.xs / 2}>
                Role Play Guidato
              </Text>
              <Text size={sizes.p - 1} color="rgba(51,65,85,0.7)" style={styles.description}>
                In questo role play verrai guidato con domande sul tema. Puoi rispondere usando
                le frasi di esempio oppure liberamente.
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={24} color="#0b3d4d" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Opción 2: Role Play Libero */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.modeCard}
          onPress={() => handleModeSelect('free')}>
          <View style={styles.modeCardContent}>
            <View style={styles.iconWrapper}>
              <View style={[styles.iconContainer, {backgroundColor: '#FFF3E0'}]} />
              <RNText style={styles.emojiText}>✨</RNText>
            </View>
            <View style={styles.textContainer}>
              <Text h5 semibold color="#334155" marginBottom={sizes.xs / 2}>
                Role Play Libero
              </Text>
              <Text size={sizes.p - 1} color="rgba(51,65,85,0.7)" style={styles.description}>
                Qui riceverai domande sul role play che hai scelto, ma potrai rispondere come vuoi.
                Il nostro tutor ti guiderà durante la conversazione.
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={24} color="#0b3d4d" />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (sizes: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sizes.md / 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    flex: 1,
    marginHorizontal: sizes.sm,
  },
  subtitle: {
    marginBottom: sizes.l,
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: sizes.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: sizes.md,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    marginRight: sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  iconContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 0,
    left: 0,
    zIndex: 0,
  },
  emojiText: {
    fontSize: 60,
    lineHeight: 60,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    zIndex: 1,
    position: 'absolute',
  },
  textContainer: {
    flex: 1,
    paddingTop: 4,
  },
  description: {
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: sizes.xs,
    paddingTop: 4,
    justifyContent: 'center',
  },
});

export default RolePlayModeSelection;

