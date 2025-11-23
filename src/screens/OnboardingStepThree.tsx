import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useNavigation} from '@react-navigation/native';

import {useTheme, useTranslation} from '../hooks/';
import {
  AssistantOrb,
  Block,
  BrandActionButton,
  BrandBackground,
  Text,
} from '../components/';

const TOTAL_STEPS = 8;
const CURRENT_STEP = 3;

type FocusOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  fullWidth?: boolean;
};

const OPTIONS: FocusOption[] = [
  {
    id: 'grammar',
    label: 'Grammatica',
    description: 'Costruisci frasi corrette e naturali.',
    emoji: '📘',
  },
  {
    id: 'vocabulary',
    label: 'Vocabolario',
    description: 'Impara parole e espressioni nuove.',
    emoji: '📝',
  },
  {
    id: 'pronunciation',
    label: 'Pronuncia',
    description: "Migliora la tua dizione e l'accento.",
    emoji: '🎤',
  },
  {
    id: 'listening',
    label: 'Comprensione orale',
    description: 'Capisci meglio ciò che ascolti.',
    emoji: '🎧',
  },
  {
    id: 'conversation',
    label: 'Conversazione',
    description: 'Sii più fluente nelle interazioni.',
    emoji: '💬',
  },
  {
    id: 'active-listening',
    label: 'Ascolto attivo',
    description: 'Rispondi con sicurezza durante i dialoghi.',
    emoji: '👂',
  },
  {
    id: 'work-english',
    label: 'Inglese per il lavoro',
    description: 'Gestisci riunioni, email e presentazioni.',
    emoji: '🏢',
    fullWidth: true,
  },
];
const PROGRESS_GRADIENT = ['#7F7CFF', '#00F5FF'] as const;
const CARD_INACTIVE_BG = 'rgba(255,255,255,0.8)';
const CARD_BORDER_INACTIVE = 'rgba(0,0,0,0.1)';
const CARD_BORDER_ACTIVE = 'rgba(11,61,77,0.5)';
// Color para opciones seleccionadas
const ACTIVE_BG = '#0b3d4d';

const OnboardingStepThree = () => {
  const {sizes} = useTheme();
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
          <Block align="center" marginBottom={0}>
            <AssistantOrb size={160} state="idle" />
          </Block>

          <Block
            align="center"
            marginHorizontal={sizes.sm}
            marginBottom={0}>
            <Text h5 center color="#334155" marginBottom={0}>
              Su cosa vuoi concentrarti?
            </Text>
            <Text center size={sizes.text} color="rgba(51,65,85,0.7)" marginTop={0}>
              L'appIA creerà lezioni per migliorare queste abilità. Seleziona
              almeno due opzioni per continuare.
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
                        color="#334155"
                        size={28}
                        lineHeight={34}>
                        {option.emoji}
                      </Text>
                    </View>
                    <Text center color={isActive ? "#FFFFFF" : "#334155"} semibold size={14}>
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
    backgroundColor: 'rgba(0,0,0,0.1)',
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
  continueButton: {
    borderRadius: 20,
    paddingVertical: 10,
  },
  continueDisabled: {
    opacity: 0.6,
  },
});

export default OnboardingStepThree;

