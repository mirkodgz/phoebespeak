import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useNavigation} from '@react-navigation/native';

import {useData, useTheme, useTranslation} from '../hooks/';
import {
  AssistantOrb,
  Block,
  BrandActionButton,
  BrandBackground,
  Text,
} from '../components/';
import {getCurrentAuthUser, upsertProfile} from '../services/supabaseAuth';

const TOTAL_STEPS = 9;
const CURRENT_STEP = 7;

type LevelOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
};

const OPTIONS: LevelOption[] = [
  {
    id: 'beginner',
    label: 'Principiante',
    description: 'Posso dire solo poche parole.',
    emoji: '🌱',
  },
  {
    id: 'intermediate',
    label: 'Intermedio',
    description: 'Capisco ma mi blocco nel parlare.',
    emoji: '🧗',
  },
  {
    id: 'advanced',
    label: 'Avanzato',
    description: 'Me la cavo, ma voglio più naturalezza.',
    emoji: '🏅',
  },
];

const CARD_INACTIVE_BG = 'rgba(255,255,255,0.8)';
const CARD_BORDER_INACTIVE = 'rgba(0,0,0,0.1)';
const CARD_BORDER_ACTIVE = 'rgba(11,61,77,0.5)';
const PROGRESS_GRADIENT = ['#0B3D4D', '#60CB58'] as const;
// Color para opciones seleccionadas
const ACTIVE_BG = '#0b3d4d';

const OnboardingStepSeven = () => {
  const {completeOnboarding, isAuthenticated, setUser} = useData();
  const {sizes} = useTheme();
  const {t} = useTranslation();
  const navigation = useNavigation<any>();

  const [selected, setSelected] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const progress = useMemo(
    () => Math.min((CURRENT_STEP / TOTAL_STEPS) * 100, 100),
    [],
  );

  const handleSelect = useCallback((option: LevelOption) => {
    setSelected(prev => (prev === option.id ? null : option.id));
  }, []);

  const handleContinue = useCallback(async () => {
    if (!selected || isSaving) {
      return;
    }
    
    setIsSaving(true);
    try {
      // Guardar el nivel seleccionado
      if (isAuthenticated) {
        const authUser = await getCurrentAuthUser();
        if (authUser) {
          // Guardar en Supabase
          await upsertProfile({
            id: authUser.id,
            level: selected,
          });
        }
      }
      
      // Actualizar estado local
      setUser({department: selected as 'beginner' | 'intermediate' | 'advanced'});
      
      // Navegar a la siguiente pantalla (promemoria)
      navigation.navigate('OnboardingStepEight');
    } catch (error) {
      console.error('[OnboardingStepSeven] Error guardando nivel:', error);
      // Continuar de todas formas para no bloquear al usuario
      setUser({department: selected as 'beginner' | 'intermediate' | 'advanced'});
      navigation.navigate('OnboardingStepEight');
    } finally {
      setIsSaving(false);
    }
  }, [navigation, selected, isAuthenticated, setUser, isSaving]);

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

        <Block
          align="center"
          marginHorizontal={sizes.sm}
          marginBottom={0}>
          <Text h5 center color="#334155" marginBottom={0}>
            Come valuteresti il tuo livello di inglese?
          </Text>
          <Text center size={sizes.text} color="rgba(51,65,85,0.7)" marginTop={0}>
            Questo ci aiuterà a proporre lezioni al livello giusto per te.
          </Text>
        </Block>

        <View style={styles.grid}>
          {OPTIONS.map(option => {
            const isActive = selected === option.id;

            return (
              <Pressable
                key={option.id}
                onPress={() => handleSelect(option)}
                style={styles.cardWrapper}
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
                  <Text
                    center
                    size={11}
                    lineHeight={16}
                    color={isActive ? "rgba(255,255,255,0.9)" : "rgba(51,65,85,0.7)"}
                    marginTop={4}>
                    {option.description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Block marginTop={sizes.l} marginBottom={sizes.m}>
          <BrandActionButton
            label={isSaving ? 'Salvataggio...' : (t('common.continue') || 'Continua')}
            onPress={handleContinue}
            disabled={continueDisabled || isSaving}
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
  card: {
    minHeight: 120,
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

export default OnboardingStepSeven;
