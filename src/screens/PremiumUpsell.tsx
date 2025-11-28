import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';

import {
  AssistantOrb,
  Block,
  BrandActionButton,
  BrandBackground,
  BrandChip,
  BrandSurface,
  Button,
  Image,
  Text,
} from '../components';
import {useData, useTheme} from '../hooks';

const HIGHLIGHTS = [
  {
    id: 'coach',
    title: 'Coach IA ilimitado',
    description:
      'Práctica guiada diaria con feedback de pronunciación y acento en tiempo real.',
    assetKey: 'notification',
  },
  {
    id: 'curriculum',
    title: 'Plan personalizado',
    description:
      'Lecciones adaptadas a tu nivel con vocabulario profesional, viajes y entrevistas.',
    assetKey: 'documentation',
  },
  {
    id: 'reports',
    title: 'Informes semanales',
    description:
      'Seguimiento de progreso, métricas de fluidez y recomendaciones del tutor IA.',
    assetKey: 'star',
  },
];

const PremiumUpsell = () => {
  const navigation = useNavigation<any>();
  const {activateTrial, refreshProfile, hasActiveTrial, isAuthenticated} = useData();
  const {sizes, colors, gradients, assets, icons} = useTheme();
  const heroGradient = gradients?.primary ?? ['#0B3D4D', '#60CB58'];

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hasActiveTrial && isAuthenticated) {
      navigation.getParent()?.navigate('Onboarding');
    }
  }, [hasActiveTrial, isAuthenticated, navigation]);

  const handleStartTrial = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await activateTrial();
      await refreshProfile();
      navigation.getParent()?.navigate('Onboarding');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo activar la prueba gratuita.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [activateTrial, refreshProfile, navigation]);

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <BrandBackground>
      <Block
        scroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sizes.md,
          paddingBottom: sizes.xxl,
          paddingTop: sizes.l,
        }}>
        <BrandChip
          label="Prueba gratuita 5 días"
          tone="brand"
          style={{alignSelf: 'center', marginBottom: sizes.md}}
        />

        <BrandSurface tone="glass" style={styles.card}>
          <LinearGradient
            colors={heroGradient}
            start={{x: 0.1, y: 0}}
            end={{x: 0.9, y: 1}}
            style={styles.heroGradient}>
            <AssistantOrb state="idle" size={160} />
          </LinearGradient>

          <Block align="center" marginTop={sizes.md} paddingHorizontal={sizes.sm}>
            <Text h4 white center marginBottom={sizes.xs}>
              Hazte Premium y domina el inglés hablado
            </Text>
            <Text center color="rgba(255,255,255,0.72)" size={sizes.p - 1}>
              Disfruta de 5 días gratis. Después, sólo 15€ al mes para continuar
              con tu coach IA y planes personalizados sin límites.
            </Text>
          </Block>

          <Block
            row
            align="flex-end"
            justify="center"
            marginVertical={sizes.md}>
            <Text h1 white marginRight={sizes.xs}>15€</Text>
            <Text color="rgba(255,255,255,0.7)" size={sizes.p}>
              /mes tras la prueba
            </Text>
          </Block>

          {errorMessage ? (
            <Text
              center
              color={colors.danger}
              size={sizes.p - 2}
              marginBottom={sizes.xs}>
              {errorMessage}
            </Text>
          ) : null}

          <BrandActionButton
            label={loading ? 'Activando...' : 'Activar prueba gratuita'}
            onPress={handleStartTrial}
            disabled={loading}
            style={{marginHorizontal: sizes.md}}
          />
          <Text
            size={sizes.p - 3}
            color="rgba(255,255,255,0.55)"
            center
            marginTop={sizes.xs}>
            Cancela cuando quieras dentro de los primeros 5 días sin coste.
          </Text>
        </BrandSurface>

        <BrandSurface tone="glass" style={{marginTop: sizes.l}}>
          <Text
            white
            semibold
            size={sizes.p + 1}
            marginBottom={sizes.sm}
            center>
            Todo lo que incluye Premium
          </Text>
          {HIGHLIGHTS.map(item => (
            <BrandSurface
              key={item.id}
              tone="neutral"
              style={{marginBottom: sizes.sm}}>
              <Block row align="center" marginBottom={sizes.xs}>
                <Image
                  source={
                    assets[item.assetKey as keyof typeof assets] ?? icons.star
                  }
                  width={18}
                  height={18}
                  radius={0}
                  color={colors.white}
                  style={{marginRight: sizes.xs}}
                />
                <Text white semibold>
                  {item.title}
                </Text>
              </Block>
              <Text size={sizes.p - 2} color="rgba(255,255,255,0.72)">
                {item.description}
              </Text>
            </BrandSurface>
          ))}
        </BrandSurface>

        <BrandSurface tone="glass" style={{marginTop: sizes.l}}>
          <Text white semibold marginBottom={sizes.sm} center>
            ¿Qué obtienes desde el primer día?
          </Text>
          <Block paddingHorizontal={sizes.sm}>
            {[
              'Acceso ilimitado a sesiones interactivas con IA.',
              'Pronunciación corregida palabra por palabra.',
              'Retos diarios para mantener tu racha de estudio.',
            ].map(point => (
              <Block
                key={point}
                row
                align="flex-start"
                marginBottom={sizes.xs}>
                <Image
                  source={icons.check}
                  width={16}
                  height={16}
                  radius={0}
                  color={colors.success ?? '#60CB58'}
                  style={{marginTop: 2, marginRight: sizes.xs}}
                />
                <Text color="rgba(255,255,255,0.72)" size={sizes.p - 1}>
                  {point}
                </Text>
              </Block>
            ))}
          </Block>
        </BrandSurface>

        <Block align="center" marginTop={sizes.l}>
          <Button
            outlined="rgba(255,255,255,0.32)"
            shadow={false}
            onPress={handleBackToLogin}
            style={{paddingHorizontal: sizes.l, paddingVertical: sizes.sm}}>
            <Text white semibold>
              Cambiar email / Iniciar sesión
            </Text>
          </Button>
        </Block>
      </Block>
    </BrandBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(96,203,88,0.25)',
    shadowColor: 'rgba(0,0,0,0.55)',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 12},
    elevation: 10,
  },
  heroGradient: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default PremiumUpsell;

