import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useNavigation} from '@react-navigation/native';

import {useTheme, useTranslation} from '../hooks/';
import {Block, Image, Text, BrandBackground, BrandActionButton} from '../components/';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 1;

const PURPOSES = [
  {
    id: 'career',
    label: 'Potenziare la mia carriera professionale',
    emoji: '💼',
    activeGradient: ['#43E97B', '#38F9D7'] as const,
  },
  {
    id: 'education',
    label: 'Sostenere i miei studi',
    emoji: '📚',
    activeGradient: ['#A18CD1', '#FBC2EB'] as const,
  },
  {
    id: 'relocation',
    label: 'Trasferirmi in un altro paese',
    emoji: '🌍',
    activeGradient: ['#43E97B', '#38F9D7'] as const,
  },
  {
    id: 'connect',
    label: 'Connettermi con più persone',
    emoji: '🤝',
    activeGradient: ['#FDD819', '#E80505'] as const,
  },
  {
    id: 'travel',
    label: 'Prepararmi a viaggiare',
    emoji: '🧳',
    activeGradient: ['#8EC5FC', '#E0C3FC'] as const,
    fullWidth: true,
  },
];
const PROGRESS_GRADIENT = ['#7F7CFF', '#00F5FF'] as const;
const CARD_INACTIVE_BG = 'rgba(255,255,255,0.06)';
const CARD_BORDER_INACTIVE = 'rgba(255,255,255,0.16)';
const CARD_BORDER_ACTIVE = 'rgba(255,255,255,0.36)';

const Onboarding = () => {
  const {colors, sizes, icons} = useTheme();
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
            style={[styles.progressFill, {width: `${progress}%`}]} // 4 steps => 25% cada uno
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

          {/* Título y subtítulo */}
          <Block
            align="center"
            marginHorizontal={sizes.sm}
            marginBottom={sizes.m}>
            <Text h4 center white marginBottom={sizes.xs}>
              Perché vuoi imparare l'inglese?
            </Text>
            <Text
              center
              size={sizes.s}
              color="rgba(255,255,255,0.76)">
              Personalizzeremo il tuo piano in base ai tuoi obiettivi.
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
                    <Text
                      center
                      white
                      semibold
                      size={sizes.p - 1}
                      numberOfLines={2}>
                      {option.label}
                    </Text>
                  </LinearGradient>
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
    backgroundColor: 'rgba(255,255,255,0.14)',
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
    minHeight: 90,
    borderRadius: 18,
    paddingVertical: 12,
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
    fontSize: 24,
    lineHeight: 26,
  },
});

export default Onboarding;
