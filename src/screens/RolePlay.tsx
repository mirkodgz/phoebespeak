import React, {useCallback} from 'react';
import {Alert, ScrollView, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {
  Block,
  BrandActionButton,
  BrandBackground,
  BrandSectionHeader,
  BrandSurface,
  BrandChip,
  Text,
} from '../components';
import {useTheme} from '../hooks';
import {
  ROLE_PLAY_SCENARIOS,
  type RolePlayScenarioId,
} from '../roleplay';

const ROLE_PLAY_ENTRIES: Array<{
  id: RolePlayScenarioId;
  duration: string;
  available: boolean;
}> = [
  {id: 'jobInterview', duration: '4–6 min', available: true},
  {id: 'atTheCafe', duration: '3–5 min', available: true},
  {id: 'dailySmallTalk', duration: '3–5 min', available: true},
  {id: 'meetingSomeoneNew', duration: '3–5 min', available: true},
];

const RolePlay = () => {
  const navigation = useNavigation<any>();
  const {colors, sizes} = useTheme();

  const handleScenarioPress = useCallback(
    (entry: {id: RolePlayScenarioId; available: boolean}) => {
      if (!entry.available) {
        Alert.alert(
          'Presto disponibile',
          'Stiamo preparando questo scenario di role play. Sarà disponibile a breve!',
        );
        return;
      }

      navigation.navigate('PracticeSession', {
        scenarioId: entry.id,
      });
    },
    [navigation],
  );

  return (
    <BrandBackground>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sizes.padding,
          paddingTop: sizes.l,
          paddingBottom: sizes.xl,
        }}
        showsVerticalScrollIndicator={false}>
        <Block>
          <Block marginBottom={sizes.l}>
            <Text
              size={sizes.p - 2}
              color="rgba(255,255,255,0.7)"
              marginBottom={sizes.xs}>
              🎭 Role Play
            </Text>
            <BrandSectionHeader
              title="Scegli il tuo scenario"
              subtitle="Allena situazioni reali con la guida strutturata del tuo tutor AI."
            />
          </Block>

          {/* HERO */}
          <BrandSurface tone="glass" style={styles.heroSurface}>
            <Text color={colors.white} h5 semibold marginBottom={sizes.sm}>
              Sessioni guidate con il tuo tutor
            </Text>
            <Text
              color="rgba(255,255,255,0.82)"
              size={sizes.p - 1}
              marginBottom={sizes.sm}>
              Ogni role play riproduce una situazione autentica: il tutor parla,
              tu rispondi e ricevi feedback immediato su pronuncia, lessico e
              coerenza.
            </Text>
            <Text color="rgba(255,255,255,0.65)" size={sizes.p - 2}>
              Scegli lo scenario, affronta le domande in inglese e migliora
              turno dopo turno.
            </Text>
          </BrandSurface>

          {/* LISTA DE ESCENARIOS */}
          <Block marginTop={sizes.l}>
            {ROLE_PLAY_ENTRIES.map(entry => {
              const config = ROLE_PLAY_SCENARIOS[entry.id];
              const isAvailable = entry.available;

              return (
                <BrandSurface
                  key={entry.id}
                  tone={isAvailable ? 'glass' : 'neutral'}
                  padding={sizes.md}
                  style={[
                    styles.scenarioCard,
                    !isAvailable && styles.scenarioLocked,
                  ]}>
                  {/* Header del card: título + duración */}
                  <Block
                    row
                    justify="space-between"
                    align="center"
                    marginBottom={sizes.xs}>
                    <Text
                      h5
                      semibold
                      color={colors.white}
                      style={{flex: 1, marginRight: sizes.xs}}>
                      {config.title}
                    </Text>
                    <BrandChip
                      label={`Durata ${entry.duration}`}
                      tone="neutral"
                      style={styles.durationChip}
                    />
                  </Block>

                  {/* estado cortito */}
                  <Text
                    size={sizes.p - 2}
                    color="rgba(255,255,255,0.7)"
                    marginBottom={sizes.sm}>
                    {isAvailable
                      ? 'Pronto per iniziare subito.'
                      : 'Scenario in arrivo, presto disponibile.'}
                  </Text>

                  {/* Botón al final */}
                  <BrandActionButton
                    label={isAvailable ? 'Avvia pratica' : 'Avvisami'}
                    onPress={() => handleScenarioPress(entry)}
                    disabled={!isAvailable}
                    style={styles.actionButton}
                  />
                </BrandSurface>
              );
            })}
          </Block>
        </Block>
      </ScrollView>
    </BrandBackground>
  );
};

const styles = StyleSheet.create({
  heroSurface: {
    padding: 22,
  },
  scenarioCard: {
    marginBottom: 20,
  },
  scenarioLocked: {
    opacity: 0.6,
  },
  durationChip: {
    alignSelf: 'flex-start',
  },
  actionButton: {
    marginTop: 12,
    width: '100%',
  },
});

export default RolePlay;
