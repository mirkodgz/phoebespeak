import React, {useCallback, useMemo, useState, useRef, useEffect} from 'react';
import {Pressable, StyleSheet, View, Animated} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';

import {useData, useTheme, useTranslation} from '../hooks/';
import {
  Block,
  BrandActionButton,
  BrandBackground,
  Text,
  Image,
} from '../components/';

const TOTAL_STEPS = 9;
const CURRENT_STEP = 9;

type TutorOption = {
  id: 'davide' | 'phoebe';
  name: string;
  avatar: ReturnType<typeof require>;
};

const TUTORS: TutorOption[] = [
  {
    id: 'davide',
    name: 'Víctor',
    avatar: require('../../assets/uomofrontew.webp'),
  },
  {
    id: 'phoebe',
    name: 'Ace',
    avatar: require('../../assets/donnafrontew.webp'),
  },
];

const PROGRESS_GRADIENT = ['#0B3D4D', '#60CB58'] as const;
const CARD_INACTIVE_BG = 'rgba(255,255,255,0.8)';
const CARD_BORDER_INACTIVE = 'rgba(0,0,0,0.1)';
const CARD_BORDER_ACTIVE = 'rgba(11,61,77,0.5)';
const ACTIVE_BG = '#0b3d4d';

const OnboardingStepNine = () => {
  const {completeOnboarding, isAuthenticated, preferences, updatePreferences} = useData();
  const {sizes, colors} = useTheme();
  const {t} = useTranslation();

  const [selectedTutor, setSelectedTutor] = useState<'davide' | 'phoebe' | null>(
    preferences.selectedTutor || null,
  );

  const progress = useMemo(
    () => Math.min((CURRENT_STEP / TOTAL_STEPS) * 100, 100),
    [],
  );

  // Animaciones para las tarjetas
  const card1Scale = useRef(new Animated.Value(1)).current;
  const card2Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Si ya hay un tutor seleccionado en las preferencias, usarlo
    if (preferences.selectedTutor && !selectedTutor) {
      setSelectedTutor(preferences.selectedTutor);
    }
  }, [preferences.selectedTutor, selectedTutor]);

  const handleSelect = useCallback((tutorId: 'davide' | 'phoebe') => {
    setSelectedTutor(tutorId);

    // Animación de escala al seleccionar
    const scaleAnim = tutorId === 'davide' ? card1Scale : card2Scale;
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    updatePreferences({selectedTutor: tutorId});
  }, [updatePreferences]);

  const handleContinue = useCallback(async () => {
    if (!selectedTutor) {
      return;
    }
    
    // Verificar que el usuario esté autenticado antes de completar el onboarding
    if (!isAuthenticated) {
      console.error('[OnboardingStepNine] Usuario no autenticado, no se puede completar el onboarding');
      return;
    }
    
    // Asegurar que la preferencia del tutor esté guardada
    updatePreferences({selectedTutor: selectedTutor});
    
    await completeOnboarding();
    // El cambio de hasOnboarded hará que App.tsx muestre Main automáticamente
  }, [completeOnboarding, selectedTutor, isAuthenticated, updatePreferences]);

  const continueDisabled = useMemo(() => selectedTutor === null, [selectedTutor]);

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
        <Block align="center" marginBottom={sizes.l}>
          <Text h4 center color="#334155" marginBottom={sizes.sm}>
            Scegli il tuo Tutor
          </Text>
          <Text center size={sizes.text} color="rgba(51,65,85,0.7)">
            Seleziona il tutor con cui vuoi praticare
          </Text>
        </Block>

        <Block row justify="space-between" marginBottom={sizes.xl}>
          {TUTORS.map((tutor, index) => {
            const isSelected = selectedTutor === tutor.id;
            const scaleAnim = index === 0 ? card1Scale : card2Scale;

            return (
              <Pressable
                key={tutor.id}
                onPress={() => handleSelect(tutor.id)}
                style={styles.cardWrapper}>
                <Animated.View
                  style={[
                    styles.card,
                    {
                      transform: [{scale: scaleAnim}],
                      backgroundColor: isSelected ? ACTIVE_BG : CARD_INACTIVE_BG,
                      borderColor: isSelected
                        ? CARD_BORDER_ACTIVE
                        : CARD_BORDER_INACTIVE,
                    },
                  ]}>
                  <Block align="center">
                    <Image
                      source={tutor.avatar}
                      width={120}
                      height={150}
                      radius={12}
                      marginBottom={sizes.sm}
                    />
                    <Text
                      center
                      semibold
                      size={16}
                      color={isSelected ? '#FFFFFF' : '#334155'}
                      marginBottom={sizes.xs / 2}>
                      {tutor.name}
                    </Text>
                    {isSelected && (
                      <Block
                        color="rgba(255,255,255,0.2)"
                        radius={12}
                        paddingHorizontal={sizes.sm}
                        paddingVertical={sizes.xs / 2}
                        marginTop={sizes.xs / 2}>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      </Block>
                    )}
                  </Block>
                </Animated.View>
              </Pressable>
            );
          })}
        </Block>

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
  cardWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  card: {
    minHeight: 220,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: 'rgba(0,0,0,0.45)',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 6},
    shadowRadius: 10,
    elevation: 4,
  },
});

export default OnboardingStepNine;

