import React, {useCallback, useEffect, useState} from 'react';
import {Platform, StyleSheet, TouchableOpacity, Alert, View} from 'react-native';
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

interface ICredentials {
  email: string;
  password: string;
}

interface ICredentialsValidation {
  email: boolean;
  password: boolean;
}

const Login = () => {
  const {signIn, signInWithGoogle, forgotPassword} = useData();
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {colors, sizes, icons} = useTheme();

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
      // El cambio de isAuthenticated hará que App.tsx muestre Main automáticamente
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

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      // El cambio de isAuthenticated hará que App.tsx muestre Main automáticamente
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión con Google. Inténtalo nuevamente.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, navigation]);

  const handleForgotPassword = useCallback(async () => {
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      Alert.alert('Errore', 'Inserisci un indirizzo email valido.');
      return;
    }

    setResetLoading(true);
    try {
      await forgotPassword(resetEmail.trim());
      // Navegar a la pantalla de verificación de código
      navigation.navigate('VerifyCode', {email: resetEmail.trim()});
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Impossibile inviare l\'email di recupero. Riprova più tardi.';
      Alert.alert('Errore', message);
    } finally {
      setResetLoading(false);
    }
  }, [resetEmail, forgotPassword, navigation]);

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
              {t('login.subtitle')}
            </Text>

            <Block paddingHorizontal={sizes.sm}>
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
                success={Boolean(credentials.email && isValid.email)}
                danger={Boolean(credentials.email && !isValid.email)}
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
                  danger={Boolean(credentials.password && !isValid.password)}
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
                {t('login.google')}
              </Text>
              <Button
                round
                outlined={String(colors.primary)}
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

            <Block align="center" marginTop={sizes.xs} marginBottom={sizes.xs}>
              <TouchableOpacity
                onPress={() => {
                  setResetEmail(credentials.email);
                  setShowForgotPassword(true);
                }}>
                <Text
                  size={sizes.p - 2}
                  color={colors.primary}
                  opacity={0.8}>
                  Ho dimenticato la password
                </Text>
              </TouchableOpacity>
            </Block>

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
              label={loading ? 'Iniciando...' : t('common.signin')}
              onPress={handleSignIn}
              disabled={loading || Object.values(isValid).includes(false)}
              style={{marginVertical: sizes.xs, marginHorizontal: sizes.sm}}
            />

            <Button
              outlined={String(colors.primary)}
              shadow={false}
              marginVertical={sizes.xs}
              marginHorizontal={sizes.sm}
              onPress={() => navigation.navigate('Register')}>
              <Text bold color={colors.primary} transform="uppercase">
                {t('common.signup')}
              </Text>
            </Button>
          </Block>
        </Block>
      </Block>

      {/* Modal de Olvidé mi contraseña */}
      {showForgotPassword && (
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: sizes.padding,
            zIndex: 1000,
          }}
          onPress={() => {
            setShowForgotPassword(false);
            setResetEmail('');
          }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{width: '100%', maxWidth: 400}}>
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: sizes.sm,
                padding: sizes.md,
                width: '100%',
                borderWidth: 1,
                borderColor: 'rgba(11,61,77,0.15)',
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 10,
              }}>
              <Text h5 semibold color={colors.primary} marginBottom={sizes.sm}>
                Recupera password
              </Text>
              <Text
                size={sizes.p}
                color={colors.text}
                opacity={0.8}
                marginBottom={sizes.md}>
                Inserisci la tua email e ti invieremo un link per reimpostare la password.
              </Text>
              <Input
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email"
                value={resetEmail}
                onChangeText={setResetEmail}
                marginBottom={sizes.md}
              />
              <View style={{flexDirection: 'row', marginTop: sizes.xs}}>
                <View style={{flex: 1, marginRight: sizes.xs / 2}}>
                  <Button
                    outlined={String(colors.primary)}
                    shadow={false}
                    onPress={() => {
                      setShowForgotPassword(false);
                      setResetEmail('');
                    }}
                    style={{width: '100%'}}>
                    <Text bold color={colors.primary}>
                      Annulla
                    </Text>
                  </Button>
                </View>
                <View style={{flex: 1, marginLeft: sizes.xs / 2}}>
                  <BrandActionButton
                    label={resetLoading ? 'Invio...' : 'Invia'}
                    onPress={handleForgotPassword}
                    disabled={resetLoading || !resetEmail.trim() || !resetEmail.includes('@')}
                    style={{width: '100%'}}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </BrandBackground>
  );
};

export default Login;

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

