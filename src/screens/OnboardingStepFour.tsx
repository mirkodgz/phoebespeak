import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useNavigation} from '@react-navigation/native';

import {useTheme, useTranslation} from '../hooks/';
import {
  AssistantOrb,
  Block,
  Text,
  BrandBackground,
  BrandActionButton,
} from '../components/';

const TOTAL_STEPS = 8;
const CURRENT_STEP = 4;

type LearningStyleOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  fullWidth?: boolean;
};

const OPTIONS: LearningStyleOption[] = [
  {
    id: 'conversations',
    label: 'Conversazioni pratiche',
    description: 'Dialoghi realistici per imparare parlando.',
    emoji: '🗨️',
  },
  {
    id: 'mini-lessons',
    label: 'Mini-lezioni con spiegazioni chiare',
    description: 'Brevi spiegazioni guidate passo dopo passo.',
    emoji: '📚',
  },
  {
    id: 'games',
    label: 'Giochi e quiz',
    description: 'Sfide divertenti per memorizzare più in fretta.',
    emoji: '🎯',
  },
  {
    id: 'repetition',
    label: 'Ripetizione e memorizzazione',
    description: 'Routine e ripassi per fissare i concetti.',
    emoji: '🔁',
  },
  {
    id: 'feedback',
    label: 'Feedback e correzioni dal tutor',
    description: 'Indicaciones personalizzate per migliorare subito.',
    emoji: '✅',
    fullWidth: true,
  },
];

const CARD_INACTIVE_BG = 'rgba(255,255,255,0.07)';
const CARD_BORDER_INACTIVE = 'rgba(255,255,255,0.18)';
const CARD_BORDER_ACTIVE = 'rgba(255,255,255,0.38)';
const PROGRESS_GRADIENT = ['#0B3D4D', '#60CB58'] as const;
// Color verde sólido para opciones seleccionadas
const ACTIVE_BG = '#60CB58';

const OnboardingStepFour = () => {
  const navigation = useNavigation<any>();
  const {sizes} = useTheme();
  const {t} = useTranslation();

  const [selected, setSelected] = useState<string[]>([]);

  const progress = useMemo(
    () => Math.min((CURRENT_STEP / TOTAL_STEPS) * 100, 100),
    [],
  );

  const handleToggle = useCallback((option: LearningStyleOption) => {
    setSelected(prev =>
      prev.includes(option.id)
        ? prev.filter(item => item !== option.id)
        : [...prev, option.id],
    );
  }, []);

  const handleContinue = useCallback(() => {
    if (!selected.length) {
      return;
    }
    navigation.navigate('OnboardingStepFive');
  }, [navigation, selected.length]);

  const continueDisabled = useMemo(() => selected.length === 0, [selected]);

  return (
    <BrandBackground>
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={PROGRESS_GRADIENT}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[styles.progressFill, {width: `${progress}%`}]}>
            <View />
          </LinearGradient>
        </View>
      </View>

      <Block
        scroll
        color="transparent"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Block align="center" marginBottom={0}>
            <AssistantOrb size={160} state="idle" />
        </Block>

        <Block
          align="center"
          marginHorizontal={sizes.sm}
          marginBottom={0}>
          <Text h5 center white marginBottom={0}>
            Come preferisci imparare?
          </Text>
          <Text center size={sizes.text} color="rgba(255,255,255,0.76)" marginTop={0}>
            Scegli il metodo che ti aiuta di più.
          </Text>
        </Block>

        <View style={styles.grid}>
          {OPTIONS.map(option => {
            const isActive = selected.includes(option.id);

            return (
              <Pressable
                key={option.id}
                onPress={() => handleToggle(option)}
                style={[styles.cardWrapper, option.fullWidth && styles.cardWrapperFull]}
                android_ripple={{color: 'rgba(255,255,255,0.08)'}}
                accessibilityRole="button">
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: isActive ? ACTIVE_BG : CARD_INACTIVE_BG,
                      borderColor: isActive
                        ? CARD_BORDER_ACTIVE
                        : CARD_BORDER_INACTIVE,
                    },
                  ]}>
                  <View style={styles.iconBadge}>
                    <Text
                      style={styles.iconEmoji}
                      white
                      size={28}
                      lineHeight={34}>
                      {option.emoji}
                    </Text>
                  </View>
                  <Text center white semibold size={14}>
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Block marginTop={sizes.l} marginBottom={sizes.m}>
          <BrandActionButton
            label={t('common.continue') || 'Continua'}
            onPress={handleContinue}
            disabled={continueDisabled}
          />
        </Block>
      </Block>
    </BrandBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  progressTrack: {
    height: 3,
    width: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  grid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 14,
  },
  cardWrapperFull: {
    width: '100%',
  },
  card: {
    minHeight: 110,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0,0.45)',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 6},
    shadowRadius: 10,
    elevation: 4,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconEmoji: {
    fontSize: 28,
    lineHeight: 30,
  },
});

export default OnboardingStepFour;

