import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

import {useData, useTheme, useTranslation} from '../hooks/';
import {
  AssistantOrb,
  Block,
  BrandActionButton,
  BrandBackground,
  Image,
  Text,
} from '../components/';

const TOTAL_STEPS = 8;
const CURRENT_STEP = 8;

const PROGRESS_GRADIENT = ['#0B3D4D', '#60CB58'] as const;
const CARD_INACTIVE_BG = 'rgba(11,61,77,0.12)';
const CARD_BORDER_INACTIVE = 'rgba(255,255,255,0.18)';
const CARD_BORDER_ACTIVE = 'rgba(255,255,255,0.38)';
// Color verde sólido para opciones seleccionadas
const ACTIVE_BG = '#60CB58';

type TutorOption = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  avatar: ReturnType<typeof require>;
};

const TUTORS: TutorOption[] = [
  {
    id: 'davide',
    name: 'Tutor uomo (Davide)',
    subtitle: 'Voce coinvolgente e motivante',
    description: 'Ideale per colloqui, business e conversazioni dinamiche.',
    avatar: require('../../assets/uomo.jpg'),
  },
  {
    id: 'fibi',
    name: 'Tutor donna (Fibi)',
    subtitle: 'Stile empatico e incoraggiante',
    description: 'Perfetta per pratica quotidiana e sicurezza nel parlare.',
    avatar: require('../../assets/dona.jpg'),
  },
];

const OnboardingStepEight = () => {
  const {completeOnboarding} = useData();
  const {sizes} = useTheme();
  const {t} = useTranslation();

  const [selected, setSelected] = useState<string | null>(null);

  const progress = useMemo(
    () => Math.min((CURRENT_STEP / TOTAL_STEPS) * 100, 100),
    [],
  );

  const handleSelect = useCallback((id: string) => {
    setSelected(prev => (prev === id ? null : id));
  }, []);

  const handleContinue = useCallback(() => {
    if (!selected) {
      return;
    }
    completeOnboarding();
  }, [completeOnboarding, selected]);

  const continueDisabled = useMemo(() => selected === null, [selected]);

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

        <Block align="center" marginHorizontal={sizes.sm} marginBottom={0}>
          <Text h5 center white marginBottom={0}>
            Scegli il tuo Tutor IA
          </Text>
          <Text center size={sizes.text} color="rgba(255,255,255,0.76)" marginTop={0}>
            Seleziona il tutor che vuoi utilizzare nell'app. Potrai cambiarlo in qualsiasi momento.
          </Text>
        </Block>

        <View style={styles.tutorList}>
          {TUTORS.map(tutor => {
            const isActive = selected === tutor.id;

            return (
              <Pressable
                key={tutor.id}
                onPress={() => handleSelect(tutor.id)}
                style={styles.tutorRow}
                android_ripple={{color: 'rgba(255,255,255,0.08)'}}
                accessibilityRole="button">
                <View
                  style={[
                    styles.tutorCard,
                    {
                      backgroundColor: isActive ? ACTIVE_BG : CARD_INACTIVE_BG,
                      borderColor: isActive
                        ? CARD_BORDER_ACTIVE
                        : CARD_BORDER_INACTIVE,
                    },
                  ]}>
                  <View style={styles.tutorInfo}>
                    <Image
                      source={tutor.avatar}
                      width={62}
                      height={62}
                      radius={20}
                    />
                    <View style={styles.tutorText}>
                      <Text white semibold size={sizes.p - 1}>
                        {tutor.name}
                      </Text>
                      <Text
                        size={11}
                        lineHeight={16}
                        color="rgba(255,255,255,0.78)"
                        marginTop={4}>
                        {tutor.subtitle}
                      </Text>
                      <Text
                        size={11}
                        lineHeight={16}
                        color="rgba(255,255,255,0.7)"
                        marginTop={4}>
                        {tutor.description}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Block marginTop={sizes.l} marginBottom={sizes.m}>
          <BrandActionButton
            label={t('common.continue') || 'Conferma tutor'}
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
  tutorList: {
    width: '100%',
    gap: 12,
  },
  tutorRow: {
    width: '100%',
  },
  tutorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0,0.45)',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 6},
    shadowRadius: 10,
    elevation: 4,
  },
  tutorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  tutorText: {
    flex: 1,
  },
});

export default OnboardingStepEight;
