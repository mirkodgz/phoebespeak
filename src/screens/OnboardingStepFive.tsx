import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';
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
const CURRENT_STEP = 5;

type ChallengeOption = {
  id: string;
  label: string;
  description?: string;
  emoji: string;
  fullWidth?: boolean;
  hasInput?: boolean;
};

const OPTIONS: ChallengeOption[] = [
  {
    id: 'time',
    label: 'Mancanza di tempo',
    emoji: '⏰',
  },
  {
    id: 'consistency',
    label: 'Mancanza di costanza o motivazione',
    emoji: '📉',
  },
  {
    id: 'anxiety',
    label: 'Difficoltà nel parlare senza ansia',
    emoji: '😬',
  },
  {
    id: 'understanding',
    label: 'Difficoltà nel capire gli altri quando parlano',
    emoji: '👂',
  },
  {
    id: 'study-method',
    label: 'Non so come studiare in modo efficace',
    emoji: '🤷‍♀️',
  },
  {
    id: 'fear',
    label: 'Ho paura di sbagliare',
    emoji: '⚠️',
  },
  {
    id: 'other',
    label: 'Altro (campo libero)',
    emoji: '✍️',
    fullWidth: true,
    hasInput: true,
  },
];

const CARD_INACTIVE_BG = 'rgba(255,255,255,0.07)';
const CARD_BORDER_INACTIVE = 'rgba(255,255,255,0.18)';
const CARD_BORDER_ACTIVE = 'rgba(255,255,255,0.38)';
const PROGRESS_GRADIENT = ['#0B3D4D', '#60CB58'] as const;
// Color verde sólido para opciones seleccionadas
const ACTIVE_BG = '#60CB58';

const OnboardingStepFive = () => {
  const navigation = useNavigation<any>();
  const {sizes} = useTheme();
  const {t} = useTranslation();

  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');

  const progress = useMemo(
    () => Math.min((CURRENT_STEP / TOTAL_STEPS) * 100, 100),
    [],
  );

  const handleToggle = useCallback(
    (option: ChallengeOption) => {
      const isActive = selected.includes(option.id);

      if (isActive) {
        setSelected(prev => prev.filter(item => item !== option.id));
        if (option.id === 'other') {
          setOtherText('');
        }
      } else {
        setSelected(prev => [...prev, option.id]);
      }
    },
    [selected],
  );

  const handleContinue = useCallback(() => {
    if (selected.length === 0) {
      return;
    }
    if (selected.includes('other') && !otherText.trim()) {
      return;
    }
    navigation.navigate('OnboardingStepSix');
  }, [navigation, otherText, selected]);

  const continueDisabled = useMemo(() => {
    if (selected.length === 0) {
      return true;
    }
    if (selected.includes('other') && !otherText.trim()) {
      return true;
    }
    return false;
  }, [otherText, selected]);

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
            Cosa ti rende più difficile raggiungere il tuo obiettivo con l'inglese?
          </Text>
          <Text center size={sizes.text} color="rgba(255,255,255,0.76)" marginTop={0}>
            Conoscere i tuoi ostacoli ci aiuta a creare un percorso su misura per te.
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
                  {option.hasInput && isActive ? (
                    <TextInput
                      style={styles.input}
                      placeholder="Scrivi qui il tuo ostacolo"
                      placeholderTextColor="rgba(255,255,255,0.65)"
                      value={otherText}
                      onChangeText={setOtherText}
                      multiline
                    />
                  ) : null}
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
  input: {
    marginTop: 8,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(11,61,77,0.32)',
    color: '#FFFFFF',
    textAlignVertical: 'top',
  },
});

export default OnboardingStepFive;
