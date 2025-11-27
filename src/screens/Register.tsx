import React, {useCallback, useEffect, useState} from 'react';
import {Platform, StyleSheet, View, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {Ionicons} from '@expo/vector-icons';

import {useData, useTheme, useTranslation} from '../hooks/';
import {
  Block,
  Button,
  Input,
  Image,
  Text,
  BrandBackground,
  BrandActionButton,
  AssistantOrb,
} from '../components/';

const isAndroid = Platform.OS === 'android';

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
  const {signInWithGoogle, signUp} = useData();
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
  const [showPassword, setShowPassword] = useState(false);
  const {colors, sizes, icons} = useTheme();

  const handleChange = useCallback(
    (value: Partial<IRegistration>) => {
      setRegistration((state) => ({...state, ...value}));
    },
    [setRegistration],
  );

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      await signInWithGoogle();
      navigation.replace('Main');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo registrar con Google. Inténtalo nuevamente.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, navigation]);

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
          paddingVertical: sizes.l,
        }}>
        <Block flex={0} marginHorizontal="8%" style={[styles.card, {borderRadius: sizes.sm}]}>
          <Block
            color={colors.white}
            style={[styles.cardContent, {borderRadius: sizes.sm, paddingVertical: sizes.md}]}>
            <Block marginHorizontal={sizes.sm} marginBottom={sizes.sm} align="center">
              <AssistantOrb size={160} state="idle" />
            </Block>

            <Text h5 semibold center color={colors.primary} marginBottom={sizes.xs / 2}>
              {t('register.subtitle')}
            </Text>

            <Block paddingHorizontal={sizes.sm}>
              <Text
                semibold
                color={colors.text}
                marginBottom={sizes.xs / 2}>
                {t('common.name')}
              </Text>
              <Input
                autoCapitalize="none"
                marginBottom={sizes.sm}
                placeholder={t('common.namePlaceholder')}
                success={Boolean(registration.name && isValid.name)}
                danger={Boolean(registration.name && !isValid.name)}
                onChangeText={(value) => handleChange({name: value})}
              />
              <Text
                semibold
                color={colors.text}
                marginBottom={sizes.xs / 2}>
                {t('common.email')}
              </Text>
              <Input
                autoCapitalize="none"
                marginBottom={sizes.sm}
                keyboardType="email-address"
                placeholder={t('common.emailPlaceholder')}
                success={Boolean(registration.email && isValid.email)}
                danger={Boolean(registration.email && !isValid.email)}
                onChangeText={(value) => handleChange({email: value})}
              />
              <Text
                semibold
                color={colors.text}
                marginBottom={sizes.xs / 2}>
                {t('common.password')}
              </Text>
              <View style={{position: 'relative', marginBottom: sizes.sm}}>
                <Input
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  marginBottom={0}
                  placeholder={t('common.passwordPlaceholder')}
                  onChangeText={(value) => handleChange({password: value})}
                  danger={Boolean(registration.password && !isValid.password)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: sizes.sm,
                    top: '50%',
                    marginTop: -10,
                    zIndex: 10,
                    padding: sizes.xs,
                  }}
                  activeOpacity={0.7}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text}
                    style={{opacity: 0.6}}
                  />
                </TouchableOpacity>
              </View>
            </Block>

            <Block
              row
              align="center"
              justify="center"
              marginTop={sizes.xs}
              marginBottom={sizes.xs}>
              <Text
                size={sizes.p - 2}
                color={colors.text}
                opacity={0.7}
                marginRight={sizes.xs}>
                {t('register.google')}
              </Text>
              <Button
                round
                outlined={colors.primary}
                shadow={false}
                height={sizes.sm * 1.8}
                width={sizes.sm * 1.8}
                padding={sizes.xs}
                radius={(sizes.sm * 1.8) / 2}
                justify="center"
                align="center"
                onPress={handleGoogleSignIn}>
                <Image
                  source={icons.google}
                  height={sizes.sm * 1.1}
                  width={sizes.sm * 1.1}
                />
              </Button>
            </Block>

            {infoMessage ? (
              <Text
                center
                color={colors.success}
                size={sizes.p - 2}
                marginBottom={sizes.xs / 2}
                marginHorizontal={sizes.sm}>
                {infoMessage}
              </Text>
            ) : null}

            {errorMessage ? (
              <Text
                center
                color={colors.danger}
                size={sizes.p - 2}
                marginBottom={sizes.xs / 2}
                marginHorizontal={sizes.sm}>
                {errorMessage}
              </Text>
            ) : null}

            <BrandActionButton
              label={loading ? 'Creando cuenta...' : t('common.signup')}
              onPress={handleSignUp}
              disabled={loading || Object.values(isValid).includes(false)}
              style={{marginVertical: sizes.xs, marginHorizontal: sizes.sm}}
            />

            <Button
              outlined={colors.primary}
              shadow={false}
              marginVertical={sizes.xs}
              marginHorizontal={sizes.sm}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Login');
                }
              }}>
              <Text bold color={colors.primary} transform="uppercase">
                {t('common.signin')}
              </Text>
            </Button>
          </Block>
        </Block>
      </Block>
    </BrandBackground>
  );
};

export default Register;

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    borderWidth: 1,
    borderColor: 'rgba(11,61,77,0.1)',
  },
});
