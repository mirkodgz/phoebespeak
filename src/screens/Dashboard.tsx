import React, {useMemo} from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {
  Block,
  BrandActionButton,
  BrandBackground,
  BrandChip,
  BrandProgressBar,
  BrandSectionHeader,
  BrandSurface,
  Image,
  Text,
} from '../components';
import {useData, useTheme, useTranslation} from '../hooks';

const Dashboard = () => {
  const {t} = useTranslation();
  const {user, dashboard} = useData();
  const {sizes, icons, colors, assets} = useTheme();
  const navigation = useNavigation<any>();

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      return 'Buongiorno';
    }
    if (hours < 18) {
      return 'Buon pomeriggio';
    }
    return 'Buonasera';
  }, []);

  return (
    <BrandBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: sizes.md}}>
        <Block row justify="space-between" align="center" marginBottom={sizes.l}>
          <Block>
            <Text color="rgba(255,255,255,0.76)" size={sizes.p - 2}>
              {greeting}
            </Text>
            <Text h4 white semibold>
              {user?.name || ''}
            </Text>
          </Block>
          <BrandActionButton
            label={t('common.continue') || 'Continua'}
            onPress={() => {}}
            style={{paddingHorizontal: sizes.sm}}
          />
        </Block>

        <BrandSurface tone="glass" style={{marginBottom: sizes.l}}>
          <BrandSectionHeader
            title="Obiettivo giornaliero"
            subtitle="7 minuti di pronuncia mirata"
            action={
              <BrandChip label="Modifica" tone="outline" onPress={() => {}} />
            }
          />
          {dashboard.dailyGoals.map(goal => (
            <BrandProgressBar
              key={goal.id}
              value={goal.progress}
              label={goal.label}
              style={{marginBottom: sizes.sm}}
            />
          ))}
        </BrandSurface>

        <BrandSectionHeader
          title="Prossime lezioni consigliate"
          subtitle="In base agli ultimi feedback ottenuti"
          action={<BrandChip label="Vedi tutte" tone="neutral" onPress={() => {}} />}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: sizes.m}}>
          {dashboard.lessons.map(lesson => (
            <BrandSurface
              key={lesson.id}
              tone="brand"
              style={{width: 220, marginRight: sizes.sm}}>
              <Block row align="center" marginBottom={sizes.sm}>
                <Block
                  flex={0}
                  radius={12}
                  width={44}
                  height={44}
                  align="center"
                  justify="center"
                  color="rgba(255,255,255,0.18)"
                  marginRight={sizes.sm}>
                  <Image
                    source={icons[lesson.icon]}
                    width={22}
                    height={22}
                    color={colors.white}
                  />
                </Block>
                <Block>
                  <Text white semibold>{lesson.title}</Text>
                  <Text size={sizes.p - 2} color="rgba(255,255,255,0.7)">
                    {lesson.subtitle}
                  </Text>
                </Block>
              </Block>
              <BrandActionButton
                label="Inizia"
                onPress={() => {}}
                style={{marginTop: sizes.sm}}
              />
            </BrandSurface>
          ))}
        </ScrollView>

        <BrandSectionHeader
          title="Azioni rapide"
          subtitle="Allenati in base alle tue priorità"
        />
        <Block
          row
          wrap="wrap"
          justify="space-between"
          style={{gap: sizes.sm}}>
          {dashboard.quickActions.map(action => (
            <BrandSurface
              key={action.id}
              tone="neutral"
              onPress={() => {}}
              style={{
                width: '100%',
              }}>
              <Text semibold color={colors.white} marginBottom={sizes.xs}>
                {action.label}
              </Text>
              <Text size={sizes.p - 2} color="rgba(255,255,255,0.7)">
                {action.description || 'Focus personalizzato'}
              </Text>
            </BrandSurface>
          ))}
        </Block>
      </ScrollView>
    </BrandBackground>
  );
};

export default Dashboard;

