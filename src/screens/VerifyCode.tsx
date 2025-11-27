import React, {useCallback, useState, useRef} from 'react';
import {Platform, StyleSheet, Alert, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/core';

import {useData, useTheme, useTranslation} from '../hooks/';
import {
  Block,
  Button,
  Text,
  BrandBackground,
  BrandActionButton,
  AssistantOrb,
} from '../components/';

const isAndroid = Platform.OS === 'android';

interface VerifyCodeRouteParams {
  email?: string;
}

const CODE_LENGTH = 6;
const MIN_TOKEN_LENGTH = 20; // Los tokens de Supabase son largos

const VerifyCode = () => {
  const {t} = useTranslation();
  const {verifyPasswordResetCode, forgotPassword} = useData();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {email} = (route?.params as VerifyCodeRouteParams) ?? {};

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {colors, sizes} = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = useCallback(
    (index: number, value: string) => {
      // Solo permitir números para códigos de 6 dígitos
      if (value && !/^\d+$/.test(value)) {
        return;
      }

      const newCode = [...code];
      newCode[index] = value.slice(-1); // Solo tomar el último carácter
      setCode(newCode);
      setErrorMessage(null);

      // Auto-focus al siguiente input
      if (value && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Si se completó el código, verificar automáticamente
      if (newCode.every((digit) => digit !== '') && newCode.join('').length === CODE_LENGTH) {
        handleVerifyCode(newCode.join(''));
      }
    },
    [code],
  );

  const handleKeyPress = useCallback(
    (index: number, key: string) => {
      if (key === 'Backspace' && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code],
  );

  const handleVerifyCode = useCallback(
    async (codeToVerify?: string) => {
      const codeString = codeToVerify || code.join('');
      
      if (!email) {
        Alert.alert('Errore', 'Email non trovato. Riprova dalla schermata di login.');
        navigation.navigate('Login');
        return;
      }

      if (codeString.length !== CODE_LENGTH) {
        setErrorMessage('Inserisci tutti i 6 numeri del codice.');
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        await verifyPasswordResetCode(email, codeString);
        // Si la verificación es exitosa, navegar a ResetPassword
        navigation.replace('ResetPassword', {email});
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'Codice non valido o scaduto. Controlla il codice e riprova.';
        setErrorMessage(message);
        // Limpiar el código en caso de error
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [code, email, verifyPasswordResetCode, navigation],
  );

  const handleResendCode = useCallback(async () => {
    if (!email) {
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      Alert.alert(
        'Codice reinviato',
        'Controlla la tua email per il nuovo codice.',
      );
      // Limpiar el código actual
      setCode(Array(CODE_LENGTH).fill(''));
      setErrorMessage(null);
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Impossibile reinviare il codice. Riprova più tardi.';
      Alert.alert('Errore', message);
    } finally {
      setLoading(false);
    }
  }, [email, forgotPassword]);

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
              Verifica codice
            </Text>

            <Text
              size={sizes.p - 1}
              color={colors.text}
              opacity={0.7}
              center
              marginBottom={sizes.sm}
              marginHorizontal={sizes.sm}>
              Inserisci il codice di verifica
            </Text>
            <Text
              size={sizes.p - 2}
              color={colors.text}
              opacity={0.6}
              center
              marginBottom={sizes.md}
              marginHorizontal={sizes.sm}>
              Controlla la tua email a {email} e inserisci il codice di 6 cifre che hai ricevuto.
            </Text>

            <Block paddingHorizontal={sizes.sm} marginBottom={sizes.md}>
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.codeInput,
                      {
                        borderColor: digit
                          ? colors.primary
                          : errorMessage
                            ? colors.danger
                            : 'rgba(11,61,77,0.2)',
                        color: colors.text,
                      },
                    ]}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(index, value)}
                    onKeyPress={({nativeEvent}) => handleKeyPress(index, nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!loading}
                  />
                ))}
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
              label={loading ? 'Verifica in corso...' : 'Verifica codice'}
              onPress={() => handleVerifyCode()}
              disabled={loading || code.join('').length !== CODE_LENGTH}
              style={{marginVertical: sizes.xs, marginHorizontal: sizes.sm}}
            />

            <Button
              outlined={colors.primary}
              shadow={false}
              marginVertical={sizes.xs}
              marginHorizontal={sizes.sm}
              onPress={handleResendCode}
              disabled={loading}>
              <Text bold color={colors.primary} transform="uppercase">
                Reinvia codice
              </Text>
            </Button>

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

export default VerifyCode;

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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  codeInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
});

