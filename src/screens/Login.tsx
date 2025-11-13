import React, {useCallback, useEffect, useState} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {LinearGradient} from 'expo-linear-gradient';

import {useData, useTheme, useTranslation} from '../hooks/';
import {
  Block,
  Button,
  Input,
  Image,
  Text,
  BrandBackground,
  BrandActionButton,
} from '../components/';

const isAndroid = Platform.OS === 'android';
const CARD_GRADIENT = ['rgba(11,61,77,0.52)', 'rgba(4,25,35,0.85)'] as const;

interface ICredentials {
  email: string;
  password: string;
}

interface ICredentialsValidation {
  email: boolean;
  password: boolean;
}

const Login = () => {
  const {signIn} = useData();
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const [isValid, setIsValid] = useState<ICredentialsValidation>({
    email: false,
    password: false,
  });
  const [credentials, setCredentials] = useState<ICredentials>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {assets, colors, sizes} = useTheme();

  const handleChange = useCallback(
    (value: Partial<ICredentials>) => {
      setCredentials((state) => ({...state, ...value}));
    },
    [setCredentials],
  );

  const handleSignIn = useCallback(async () => {
    if (Object.values(isValid).includes(false)) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await signIn(credentials);
      navigation.replace('PremiumUpsell');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión. Inténtalo nuevamente.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [credentials, isValid, navigation, signIn]);

  useEffect(() => {
    setIsValid({
      email:
        credentials.email.trim().length > 0 &&
        credentials.email.includes('@'),
      password: credentials.password.trim().length > 0,
    });
  }, [credentials]);

  return (
    <BrandBackground>
      <Block
        keyboard
        flex={1}
        color="transparent"
        behavior={!isAndroid ? 'padding' : 'height'}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: sizes.s,
          paddingVertical: sizes.xl,
        }}>
        <Block flex={0} marginHorizontal="8%" style={{borderRadius: sizes.sm}}>
          <LinearGradient
            colors={CARD_GRADIENT}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.card, {borderRadius: sizes.sm, paddingVertical: sizes.md}]}>
            <Block marginHorizontal={sizes.sm} marginBottom={sizes.sm}>
              <View style={styles.mediaWrapper}>
                <Image
                  source={assets.gifPresentationAvatar}
                  style={styles.media}
                  resizeMode="cover"
                />
              </View>
            </Block>

            <Text p semibold center>
              <Text color="rgba(255,255,255,0.78)" size={sizes.p - 2}>
                {t('login.subtitle')}
              </Text>
            </Text>

            <Block paddingHorizontal={sizes.sm}>
              <Text
                semibold
                color="rgba(255,255,255,0.85)"
                marginBottom={sizes.xs}>
                {t('common.email')}
              </Text>
              <Input
                autoCapitalize="none"
                marginBottom={sizes.m}
                keyboardType="email-address"
                placeholder={t('common.emailPlaceholder')}
                success={Boolean(credentials.email && isValid.email)}
                danger={Boolean(credentials.email && !isValid.email)}
                onChangeText={(value) => handleChange({email: value})}
              />
              <Text
                semibold
                color="rgba(255,255,255,0.85)"
                marginBottom={sizes.xs}>
                {t('common.password')}
              </Text>
              <Input
                secureTextEntry
                autoCapitalize="none"
                marginBottom={sizes.m}
                placeholder={t('common.passwordPlaceholder')}
                onChangeText={(value) => handleChange({password: value})}
                success={Boolean(credentials.password && isValid.password)}
                danger={Boolean(credentials.password && !isValid.password)}
              />
            </Block>

            <Block
              row
              align="center"
              justify="center"
              marginTop={sizes.xs}
              marginBottom={sizes.xs}>
              <Text
                size={sizes.p - 2}
                color="rgba(255,255,255,0.7)"
                marginRight={sizes.xs}>
                {t('login.google')}
              </Text>
              <Button
                round
                outlined="rgba(255,255,255,0.35)"
                shadow={false}
                height={sizes.sm * 1.8}
                width={sizes.sm * 1.8}
                padding={sizes.xs}
                radius={(sizes.sm * 1.8) / 2}
                justify="center"
                align="center">
                <Image
                  source={assets.google}
                  height={sizes.sm * 1.1}
                  width={sizes.sm * 1.1}
                />
              </Button>
            </Block>

            {errorMessage ? (
              <Text
                center
                color={colors.danger ?? '#FF6B6B'}
                size={sizes.p - 2}
                marginBottom={sizes.xs}>
                {errorMessage}
              </Text>
            ) : null}

            <BrandActionButton
              label={loading ? 'Iniciando...' : t('common.signin')}
              onPress={handleSignIn}
              disabled={loading || Object.values(isValid).includes(false)}
              style={{marginVertical: sizes.s, marginHorizontal: sizes.sm}}
            />

            <Button
              outlined="rgba(255,255,255,0.35)"
              shadow={false}
              marginVertical={sizes.s}
              marginHorizontal={sizes.sm}
              onPress={() => navigation.navigate('Register')}>
              <Text bold white transform="uppercase">
                {t('common.signup')}
              </Text>
            </Button>
          </LinearGradient>
        </Block>
      </Block>
    </BrandBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: 'rgba(96,203,88,0.28)',
    shadowColor: 'rgba(0,0,0,0.55)',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 12},
    elevation: 8,
  },
  mediaWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: 176,
  },
});

