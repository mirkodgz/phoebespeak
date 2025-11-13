import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useNavigation} from '@react-navigation/native';

import {useTheme, useTranslation} from '../hooks/';
import {
  Block,
  BrandActionButton,
  BrandBackground,
  Image,
  Text,
} from '../components/';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 3;

type FocusOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  activeGradient: readonly [string, string];
  fullWidth?: boolean;
};

const OPTIONS: FocusOption[] = [
  {
    id: 'grammar',
    label: 'Grammatica',
    description: 'Costruisci frasi corrette e naturali.',
    emoji: '📘',
    activeGradient: ['#43E97B', '#38F9D7'] as const,
  },
  {
    id: 'vocabulary',
    label: 'Vocabolario',
    description: 'Impara parole e espressioni nuove.',
    emoji: '🗣️',
    activeGradient: ['#FBC2EB', '#A6C1EE'] as const,
  },
  {
    id: 'pronunciation',
    label: 'Pronuncia',
    description: 'Migliora la tua dizione e l’accento.',
    emoji: '🎤',
    activeGradient: ['#F6D365', '#FDA085'] as const,
  },
  {
    id: 'listening',
    label: 'Comprensione orale',
    description: 'Capisci meglio ciò che ascolti.',
    emoji: '🎧',
    activeGradient: ['#4FACFE', '#00F2FE'] as const,
  },
  {
    id: 'conversation',
    label: 'Conversazione',
    description: 'Sii più fluente nelle interazioni.',
    emoji: '💬',
    activeGradient: ['#8EC5FC', '#E0C3FC'] as const,
  },
];
const PROGRESS_GRADIENT = ['#7F7CFF', '#00F5FF'] as const;
const CARD_INACTIVE_BG = 'rgba(255,255,255,0.06)';
const CARD_BORDER_INACTIVE = 'rgba(255,255,255,0.16)';
const CARD_BORDER_ACTIVE = 'rgba(255,255,255,0.36)';

const OnboardingStepThree = () => {
  const {colors, sizes, icons} = useTheme();
  const {t} = useTranslation();
  const navigation = useNavigation<any>();

  const [selected, setSelected] = useState<string[]>([]);

  const progress = useMemo(
    () => Math.min((CURRENT_STEP / TOTAL_STEPS) * 100, 100),
    [],
  );

  const handleToggle = useCallback((option: FocusOption) => {
    setSelected(prev => {
      const exists = prev.includes(option.id);

      if (exists) {
        return prev.filter(item => item !== option.id);
      }

      return [...prev, option.id];
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (selected.length < 2) {
      return;
    }

    navigation.navigate('OnboardingStepFour');
  }, [navigation, selected]);

  const continueDisabled = useMemo(() => {
    return selected.length < 2;
  }, [selected]);

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
          <Block align="center" marginBottom={sizes.m}>
            <LinearGradient
              colors={['rgba(11,61,77,0.28)', 'rgba(4,25,35,0.18)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.avatarWrapper}>
              <LinearGradient
                colors={PROGRESS_GRADIENT}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.avatarInner}>
                <Image
                  source={icons.profile}
                  radius={999}
                  width={56}
                  height={56}
                  color={colors.white}
                />
              </LinearGradient>
            </LinearGradient>
          </Block>

          <Block
            align="center"
            marginHorizontal={sizes.sm}
            marginBottom={sizes.m}>
            <Text h4 center white marginBottom={sizes.xs}>
              Su cosa vuoi concentrarti?
            </Text>
            <Text center size={sizes.s} color="rgba(255,255,255,0.76)">
              L’IA creerà lezioni per migliorare queste abilità. Seleziona almeno
              due opzioni per continuare.
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
                  <LinearGradient
                    colors={
                      isActive
                        ? option.activeGradient
                        : [CARD_INACTIVE_BG, CARD_INACTIVE_BG]
                    }
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[
                      styles.card,
                      {
                        borderColor: isActive
                          ? CARD_BORDER_ACTIVE
                          : CARD_BORDER_INACTIVE,
                      },
                    ]}>
                    <View style={styles.iconBadge}>
                      <Text style={styles.iconEmoji} white>
                        {option.emoji}
                      </Text>
                    </View>
                    <Text center white semibold size={sizes.p - 1}>
                      {option.label}
                    </Text>
                    <Text center size={sizes.s - 1} color="rgba(255,255,255,0.72)" marginTop={4}>
                      {option.description}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>

          <Block marginTop={sizes.l} marginBottom={sizes.m}>
            <BrandActionButton
              label={t('common.continue') || 'Continua'}
              onPress={handleContinue}
              disabled={continueDisabled}
              style={styles.continueButton}
              disabledStyle={styles.continueDisabled}
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
  avatarWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(96,203,88,0.35)',
    padding: 8,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 14,
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
    fontSize: 24,
    lineHeight: 26,
  },
  continueButton: {
    borderRadius: 20,
    paddingVertical: 10,
  },
  continueDisabled: {
    opacity: 0.6,
  },
});

export default OnboardingStepThree;

