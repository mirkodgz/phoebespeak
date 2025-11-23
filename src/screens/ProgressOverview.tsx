import React, {useMemo} from 'react';
import {ScrollView} from 'react-native';

import {
  Block,
  BrandBackground,
  BrandChip,
  BrandLineChart,
  BrandProgressBar,
  BrandSectionHeader,
  BrandSurface,
  Text,
} from '../components';
import {useTheme} from '../hooks';
import {useData} from '../hooks/useData';

const ProgressOverview = () => {
  const {sizes, colors} = useTheme();
  const {progress} = useData();

  const defaultArea = {
    id: 'none',
    label: 'Pronuncia',
    score: 0,
    trend: 'steady' as const,
  };

  const bestArea = useMemo(() => {
    if (!progress.focusAreas.length) {
      return defaultArea;
    }
    return progress.focusAreas.reduce((best, current) =>
      current.score > best.score ? current : best,
    progress.focusAreas[0]);
  }, [progress.focusAreas]);

  const needsWork = useMemo(() => {
    if (!progress.focusAreas.length) {
      return defaultArea;
    }
    return progress.focusAreas.reduce((worst, current) =>
      current.score < worst.score ? current : worst,
    progress.focusAreas[0]);
  }, [progress.focusAreas]);

  const weeklyValues = progress.weeklyScores.map(score => score.value);
  const weeklyLabels = progress.weeklyScores.map(score => score.label);

  const weeklySummary = useMemo(() => {
    if (!progress.weeklyScores.length) {
      return {average: 0, bestLabel: '-', bestValue: 0};
    }
    const average =
      weeklyValues.reduce((acc, v) => acc + v, 0) / weeklyValues.length;
    const best = progress.weeklyScores.reduce((bestScore, current) =>
      current.value > bestScore.value ? current : bestScore,
    progress.weeklyScores[0]);
    return {
      average: Math.round(average),
      bestLabel: best.label,
      bestValue: best.value,
    };
  }, [progress.weeklyScores, weeklyValues]);

  return (
    <BrandBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: sizes.md}}>
        <BrandSectionHeader
          title="I tuoi progressi"
          subtitle="Panoramica delle ultime settimane"
          action={<BrandChip label="Esporta report" tone="outline" onPress={() => {}} />}
        />

        <BrandSurface tone="glass" style={{marginBottom: sizes.l}}>
          <BrandSectionHeader
            title="Punteggio settimanale"
            subtitle="Andamento delle sessioni completate"
          />
          <BrandLineChart
            data={weeklyValues}
            labels={weeklyLabels}
            height={160}
            style={{marginBottom: sizes.m}}
          />
          <Block row justify="space-between">
            <BrandSurface tone="neutral" style={{width: '48%'}}>
              <Text color={colors.white} semibold>
                Media settimana
              </Text>
              <Text h5 white marginTop={sizes.xs}>
                {weeklySummary.average}%
              </Text>
              <Text size={sizes.p - 2} color="rgba(255,255,255,0.7)">
                Calcolata sugli ultimi 7 giorni
              </Text>
            </BrandSurface>
            <BrandSurface tone="neutral" style={{width: '48%'}}>
              <Text color={colors.white} semibold>
                Miglior giorno
              </Text>
              <Text h5 white marginTop={sizes.xs}>
                {weeklySummary.bestLabel}
              </Text>
              <Text size={sizes.p - 2} color="rgba(255,255,255,0.7)">
                {weeklySummary.bestValue}%
              </Text>
            </BrandSurface>
          </Block>
        </BrandSurface>

        <BrandSectionHeader
          title="Aree di miglioramento prioritario"
          subtitle="Aggiornate in base ai feedback AI"
        />
        <Block row justify="space-between" marginBottom={sizes.sm}>
          <BrandSurface tone="neutral" style={{width: '48%'}}>
            <Text color={colors.white} semibold>
              Punto di forza
            </Text>
            <Text size={sizes.p - 2} color="rgba(255,255,255,0.72)" marginBottom={sizes.xs}>
              Stai eccellendo in {bestArea.label.toLowerCase()}.
            </Text>
            <BrandProgressBar value={bestArea.score} />
          </BrandSurface>
          <BrandSurface tone="warning" style={{width: '48%'}}>
            <Text white semibold>
              Campo da potenziare
            </Text>
            <Text size={sizes.p - 2} color="rgba(255,255,255,0.92)" marginBottom={sizes.xs}>
              Concentrati su {needsWork.label.toLowerCase()} nelle prossime sessioni.
            </Text>
            <BrandProgressBar value={needsWork.score} />
          </BrandSurface>
        </Block>

        {progress.focusAreas.map(area => (
          <BrandSurface key={area.id} tone="neutral" style={{marginBottom: sizes.sm}}>
            <Block row justify="space-between" align="center">
              <Block flex={1} marginRight={sizes.sm}>
                <Text color={colors.white} semibold>
                  {area.label}
                </Text>
                <Text size={sizes.p - 2} color="rgba(255,255,255,0.65)">
                  Focus intensivo consigliato
                </Text>
              </Block>
              <Text h5 white>
                {area.score}%
              </Text>
            </Block>
            <BrandProgressBar value={area.score} />
          </BrandSurface>
        ))}

        <BrandSectionHeader
          title="Traguardi e motivazione"
          subtitle="Resta concentrato sui tuoi obiettivi"
        />
        {progress.milestones.map(item => (
          <BrandSurface key={item.id} tone="glass" style={{marginBottom: sizes.sm}}>
            <Text white semibold>
              {item.title}
            </Text>
            <Text h5 white marginTop={sizes.xs} marginBottom={sizes.xs / 2}>
              {item.value}
            </Text>
            <Text size={sizes.p - 2} color="rgba(255,255,255,0.7)">
              {item.description}
            </Text>
          </BrandSurface>
        ))}
      </ScrollView>
    </BrandBackground>
  );
};

export default ProgressOverview;

