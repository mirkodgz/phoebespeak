import React, {useCallback, useEffect, useState} from 'react';
import {Platform, StyleSheet, TouchableOpacity, Alert, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/core';

import {useData, useTheme, useTranslation} from '../hooks/';
import {
  Block,
  Button,
  Input,
  Text,
  BrandBackground,
  BrandActionButton,
  AssistantOrb,
} from '../components/';

const isAndroid = Platform.OS === 'android';

interface ResetPasswordRouteParams {
  email?: string;
}

const ResetPassword = () => {
  const {t} = useTranslation();
  const {updatePassword} = useData();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {email} = (route?.params as ResetPasswordRouteParams) ?? {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {colors, sizes} = useTheme();

  const isValidPassword = password.trim().length >= 6;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleResetPassword = useCallback(async () => {
    if (!isValidPassword) {
      Alert.alert('Errore', 'La password deve contenere almeno 6 caratteri.');
      return;
    }

    if (!passwordsMatch) {
      Alert.alert('Errore', 'Le password non corrispondono.');
      return;
    }

    if (!email) {
      Alert.alert('Errore', 'Email non trovato. Riprova dalla schermata di login.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await updatePassword(password.trim(), email);
      Alert.alert(
        'Password aggiornata',
        'La tua password è stata aggiornata con successo. Ora puoi accedere.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Login');
            },
          },
        ],
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Impossibile aggiornare la password. Il link potrebbe essere scaduto.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, isValidPassword, passwordsMatch, updatePassword, navigation]);

  // Verificar si hay email (debería venir de VerifyCode)
  useEffect(() => {
    if (!email) {
      Alert.alert(
        'Errore',
        'Email non trovato. Riprova dalla schermata di login.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    }
  }, [email, navigation]);

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
              Reimposta password
            </Text>

            <Text
              size={sizes.p - 1}
              color={colors.text}
              opacity={0.7}
              center
              marginBottom={sizes.md}
              marginHorizontal={sizes.sm}>
              Inserisci la tua nuova password. Deve contenere almeno 6 caratteri.
            </Text>

            <Block paddingHorizontal={sizes.sm}>
              <Text
                semibold
                color={colors.text}
                marginBottom={sizes.xs / 2}>
                Nuova password
              </Text>
              <View style={{position: 'relative', marginBottom: sizes.sm}}>
                <Input
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  marginBottom={0}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  danger={Boolean(password && !isValidPassword)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: password ? sizes.s + 25 : sizes.sm, // Más cerca del icono de validación
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                    paddingHorizontal: sizes.xs,
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
              <Text
                semibold
                color={colors.text}
                marginBottom={sizes.xs / 2}>
                Conferma password
              </Text>
              <View style={{position: 'relative', marginBottom: sizes.sm}}>
                <Input
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  marginBottom={0}
                  placeholder="Conferma password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  danger={Boolean(confirmPassword && !passwordsMatch)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: confirmPassword ? sizes.s + 25 : sizes.sm, // Más cerca del icono de validación
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                    paddingHorizontal: sizes.xs,
                  }}
                  activeOpacity={0.7}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text}
                    style={{opacity: 0.6}}
                  />
                </TouchableOpacity>
              </View>
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
              label={loading ? 'Aggiornamento...' : 'Reimposta password'}
              onPress={handleResetPassword}
              disabled={loading || !isValidPassword || !passwordsMatch}
              style={{marginVertical: sizes.xs, marginHorizontal: sizes.sm}}
            />

            <Button
              outlined={colors.primary}
              shadow={false}
              marginVertical={sizes.xs}
              marginHorizontal={sizes.sm}
              onPress={() => navigation.navigate('Login')}>
              <Text bold color={colors.primary} transform="uppercase">
                Annulla
              </Text>
            </Button>
          </Block>
        </Block>
      </Block>
    </BrandBackground>
  );
};

export default ResetPassword;

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

