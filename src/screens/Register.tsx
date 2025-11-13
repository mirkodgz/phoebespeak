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

interface IRegistration {
  name: string;
  email: string;
  password: string;
}

interface IRegistrationValidation {
  name: boolean;
  email: boolean;
  password: boolean;
}

const Register = () => {
  const {t} = useTranslation();
  const {signUp} = useData();
  const navigation = useNavigation<any>();
  const [isValid, setIsValid] = useState<IRegistrationValidation>({
    name: false,
    email: false,
    password: false,
  });
  const [registration, setRegistration] = useState<IRegistration>({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const {assets, colors, sizes} = useTheme();

  const handleChange = useCallback(
    (value: Partial<IRegistration>) => {
      setRegistration((state) => ({...state, ...value}));
    },
    [setRegistration],
  );

  const handleSignUp = useCallback(async () => {
    if (Object.values(isValid).includes(false)) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const result = await signUp({
        email: registration.email,
        password: registration.password,
        fullName: registration.name,
      });
      if (result === 'confirmation_required') {
        setInfoMessage(
          'Revisa tu correo y confirma tu cuenta antes de iniciar sesión.',
        );
      } else {
        navigation.replace('PremiumUpsell');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo crear la cuenta. Inténtalo nuevamente.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [isValid, navigation, registration, signUp]);

  useEffect(() => {
    setIsValid({
      name: registration.name.trim().length > 0,
      email:
        registration.email.trim().length > 0 &&
        registration.email.includes('@'),
      password: registration.password.trim().length > 0,
    });
  }, [registration]);

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
                {t('register.subtitle')}
              </Text>
                </Text>

              <Block paddingHorizontal={sizes.sm}>
              <Text
                semibold
                color="rgba(255,255,255,0.85)"
                marginBottom={sizes.xs}>
                {t('common.name')}
              </Text>
                <Input
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  placeholder={t('common.namePlaceholder')}
                  success={Boolean(registration.name && isValid.name)}
                  danger={Boolean(registration.name && !isValid.name)}
                  onChangeText={(value) => handleChange({name: value})}
                />
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
                  success={Boolean(registration.email && isValid.email)}
                  danger={Boolean(registration.email && !isValid.email)}
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
                  success={Boolean(registration.password && isValid.password)}
                  danger={Boolean(registration.password && !isValid.password)}
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
                {t('register.google')}
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

            {infoMessage ? (
              <Text
                center
                color={colors.success ?? '#60CB58'}
                size={sizes.p - 2}
                marginBottom={sizes.xs}>
                {infoMessage}
              </Text>
            ) : null}

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
              label={loading ? 'Creando cuenta...' : t('common.signup')}
              onPress={handleSignUp}
              disabled={loading || Object.values(isValid).includes(false)}
              style={{marginVertical: sizes.s, marginHorizontal: sizes.sm}}
            />

              <Button
              outlined="rgba(255,255,255,0.35)"
              shadow={false}
                marginVertical={sizes.s}
                marginHorizontal={sizes.sm}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Login');
                }
              }}>
              <Text bold white transform="uppercase">
                  {t('common.signin')}
                </Text>
              </Button>
          </LinearGradient>
        </Block>
      </Block>
    </BrandBackground>
  );
};

export default Register;

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
