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
const CURRENT_STEP = 1;

const PURPOSES = [
  {
    id: 'career',
    label: 'Potenziare la mia carriera professionale',
    emoji: '💼',
  },
  {
    id: 'education',
    label: 'Sostenere i miei studi',
    emoji: '🎓',
  },
  {
    id: 'relocation',
    label: 'Trasferirmi in un altro paese',
    emoji: '✈️',
  },
  {
    id: 'connect',
    label: 'Connettermi con più persone',
    emoji: '🤝',
  },
  {
    id: 'travel',
    label: 'Prepararmi a viaggiare',
    emoji: '🧳',
  },
  {
    id: 'confidence',
    label: 'Migliorare la mia sicurezza nel parlare',
    emoji: '🗣️',
  },
  {
    id: 'personal-growth',
    label: 'Aggiornare le mie competenze linguistiche per piacere personale',
    emoji: '📖',
    fullWidth: true,
  },
];
const PROGRESS_GRADIENT = ['#7F7CFF', '#00F5FF'] as const;
const CARD_INACTIVE_BG = 'rgba(255,255,255,0.8)';
const CARD_BORDER_INACTIVE = 'rgba(0,0,0,0.1)';
const CARD_BORDER_ACTIVE = 'rgba(11,61,77,0.5)';
// Color para opciones seleccionadas
const ACTIVE_BG = '#0b3d4d';

const Onboarding = () => {
  const {sizes} = useTheme();
  const {t} = useTranslation();
  const navigation = useNavigation<any>();

  const [selected, setSelected] = useState<string[]>([]);

  const progress = useMemo(
    () => Math.min((CURRENT_STEP / TOTAL_STEPS) * 100, 100),
    [],
  );

  const handleToggle = useCallback((id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id],
    );
  }, []);

  const handleContinue = useCallback(() => {
    if (selected.length) {
      navigation.navigate('OnboardingStepTwo');
    }
  }, [navigation, selected.length]);

  const continueDisabled = useMemo(() => {
    return selected.length === 0;
  }, [selected]);

  return (
    <BrandBackground>
      {/* Header fijo solo con la barra */}
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={PROGRESS_GRADIENT}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[styles.progressFill, {width: `${progress}%`}]}
          />
        </View>
      </View>

      {/* Contenido scrollable: empieza inmediatamente debajo del header */}
      <Block
        scroll
        color="transparent"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
          {/* Avatar */}
          <Block align="center" marginBottom={0}>
            <AssistantOrb size={160} state="idle" />
          </Block>

          {/* Título y subtítulo */}
          <Block
            align="center"
            marginHorizontal={sizes.sm}
            marginBottom={0}>
            <Text h5 center color="#334155" marginBottom={0}>
              Perché vuoi imparare l'inglese?
            </Text>
            <Text
              center
              size={sizes.text}
              color="rgba(51,65,85,0.7)"
              marginTop={0}>
              Personalizziamo il tuo piano in base ai tuoi obiettivi.
            </Text>
          </Block>

          {/* Opciones */}
          <View style={styles.grid}>
            {PURPOSES.map(option => {
              const isActive = selected.includes(option.id);

              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleToggle(option.id)}
                  style={[
                    styles.cardWrapper,
                    option.fullWidth && styles.cardWrapperFull,
                  ]}
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
                    <Text
                      center
                      color={isActive ? "#FFFFFF" : "#334155"}
                      semibold
                      size={14}
                      numberOfLines={2}>
                      {option.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Botón CONTINUAR debajo de las opciones */}
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
  /* Header (solo barra, sin flex extra) */
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

  /* Contenido: arranca pegado al header */
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },

  /* Avatar */
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

  /* Grid & cards */
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
    height: 110,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
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
    marginBottom: 4,
  },
  iconEmoji: {
    fontSize: 28,
    lineHeight: 30,
  },
});

export default Onboarding;
