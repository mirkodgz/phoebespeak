import React, {useState, useEffect, useRef} from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';

import {Block, Text, Button} from '../components';
import {useTheme, useData} from '../hooks';
import {
  handleFreeTrialChoice,
  canChooseFreeTrial,
  getTrialInfo,
  getFeatureAccess,
  shouldShowPlansScreen,
} from '../services/subscription';
import {getCurrentAuthUser, fetchProfileById} from '../services/supabaseAuth';

type PlanType = 'free' | 'monthly' | 'quarterly' | 'yearly';

interface PaymentScreenParams {
  planId: PlanType;
  plan?: {
    id: PlanType;
    title: string;
    price: string;
    pricePerMonth: string;
  };
  fromOnboarding?: boolean;
  fromRoundComplete?: boolean;
  roundNumber?: number;
  fromAITutor?: boolean;
  fromFreeMode?: boolean;
  scenarioId?: string;
  levelId?: string;
}

const PaymentScreen = () => {
  const {sizes, colors} = useTheme();
  const {user, completeOnboarding, refreshProfile} = useData();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const {
    planId,
    plan,
    fromOnboarding,
    fromRoundComplete,
    fromAITutor,
    fromFreeMode,
    scenarioId,
    levelId,
  } = (route.params as PaymentScreenParams) || {};

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Animaciones
  const cardScale = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación shimmer en el card
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const formatCardNumber = (text: string) => {
    // Remover todos los espacios
    const cleaned = text.replace(/\s/g, '');
    // Agregar espacios cada 4 dígitos
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Máximo 16 dígitos + 3 espacios
  };

  const formatExpiryDate = (text: string) => {
    // Remover todo excepto números
    const cleaned = text.replace(/\D/g, '');
    // Formato MM/YY
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);
  };

  const handleCvvChange = (text: string) => {
    // Solo números, máximo 4 dígitos
    const cleaned = text.replace(/\D/g, '').substring(0, 4);
    setCvv(cleaned);
  };

  const validateForm = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Errore', 'Inserisci un numero di carta valido');
      return false;
    }
    if (!cardHolder || cardHolder.trim().length < 3) {
      Alert.alert('Errore', 'Inserisci il nome del titolare');
      return false;
    }
    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert('Errore', 'Inserisci una data di scadenza valida (MM/YY)');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Errore', 'Inserisci un CVV valido');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    // Si es "prova gratuita", verificar que aún tenga días restantes
    if (planId === 'free') {
      // Obtener el perfil actualizado para verificar la prueba gratuita
      let profile = null;
      try {
        const authUser = await getCurrentAuthUser();
        if (authUser) {
          profile = await fetchProfileById(authUser.id);
        }
      } catch (error) {
        console.error('[PaymentScreen] Error obteniendo perfil:', error);
      }
      
      const trialInfo = getTrialInfo(profile);
      const choice = handleFreeTrialChoice(profile);
      
      if (choice === 'must_subscribe') {
        Alert.alert(
          'Prova scaduta',
          'La prova gratuita è scaduta. Devi scegliere un piano di pagamento per continuare.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
        );
        return;
      }
    }

    setIsProcessing(true);

    // Animación de carga
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.98,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (planId === 'free') {
        // Prova gratuita: solo registrar tarjeta, NO procesar pago
        // TODO: Integrar con Stripe para registrar tarjeta sin procesar pago
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Actualizar perfil para refrescar datos
        await refreshProfile();
        
        Alert.alert(
          'Carta registrata!',
          'La tua carta è stata registrata con successo. Puoi usare i giorni rimanenti della prova gratuita.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Actualizar perfil para refrescar datos de suscripción
                await refreshProfile();
                
                // Verificar acceso antes de navegar (solo si no viene del onboarding)
                if (!fromOnboarding) {
                  try {
                    const authUser = await getCurrentAuthUser();
                    if (authUser) {
                      const updatedProfile = await fetchProfileById(authUser.id);
                      if (updatedProfile) {
                        // Verificar acceso según el origen
                        if (fromRoundComplete) {
                          const shouldShow = await shouldShowPlansScreen(updatedProfile, authUser.id, 'guided_round2');
                          if (shouldShow) {
                            // Aún no tiene acceso, volver a ProPlans
                            Alert.alert(
                              'Accesso non disponibile',
                              'La tua sottoscrizione potrebbe non essere ancora attiva. Riprova tra qualche momento.',
                            );
                            return;
                          }
                        } else if (fromAITutor) {
                          const shouldShow = await shouldShowPlansScreen(updatedProfile, authUser.id, 'ai_tutor');
                          if (shouldShow) {
                            Alert.alert(
                              'Accesso non disponibile',
                              'La tua sottoscrizione potrebbe non essere ancora attiva. Riprova tra qualche momento.',
                            );
                            return;
                          }
                        } else if (fromFreeMode) {
                          const shouldShow = await shouldShowPlansScreen(updatedProfile, authUser.id, 'free_mode');
                          if (shouldShow) {
                            Alert.alert(
                              'Accesso non disponibile',
                              'La tua sottoscrizione potrebbe non essere ancora attiva. Riprova tra qualche momento.',
                            );
                            return;
                          }
                        }
                      }
                    }
                  } catch (error) {
                    console.error('[PaymentScreen] Error verificando acceso después de registro de tarjeta:', error);
                    // Continuar con la navegación aunque haya error
                  }
                }
                
                // Navegar según el origen
                if (fromOnboarding) {
                  // Si viene del onboarding, completar el onboarding
                  await completeOnboarding();
                } else if (fromRoundComplete) {
                  // Si viene de round complete, volver a PracticeSession
                  // El usuario ya tiene acceso, puede continuar al siguiente round
                  navigation.navigate('PracticeSession', {
                    scenarioId,
                    levelId,
                    mode: 'guided',
                  });
                } else if (fromAITutor) {
                  // Si viene de AI Tutor, volver a AI Tutor
                  navigation.navigate('AITutorMain');
                } else if (fromFreeMode) {
                  // Si viene de free mode, volver a PracticeSession con mode='free'
                  navigation.navigate('PracticeSession', {
                    scenarioId,
                    levelId,
                    mode: 'free',
                  });
                } else {
                  // Caso por defecto: volver al perfil
                  navigation.navigate('ProfileMain');
                }
              },
            },
          ],
        );
      } else {
        // Plan de pago: procesar pago completo
        // TODO: Integrar con Stripe para procesar el pago
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Actualizar perfil para refrescar datos
        await refreshProfile();
        
        Alert.alert(
          'Pagamento completato!',
          'La tua sottoscrizione è stata attivata con successo.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Actualizar perfil para refrescar datos de suscripción
                await refreshProfile();
                
                // Verificar acceso antes de navegar (solo si no viene del onboarding)
                if (!fromOnboarding) {
                  try {
                    const authUser = await getCurrentAuthUser();
                    if (authUser) {
                      const updatedProfile = await fetchProfileById(authUser.id);
                      if (updatedProfile) {
                        // Verificar acceso según el origen
                        if (fromRoundComplete) {
                          const shouldShow = await shouldShowPlansScreen(updatedProfile, authUser.id, 'guided_round2');
                          if (shouldShow) {
                            // Aún no tiene acceso, volver a ProPlans
                            Alert.alert(
                              'Accesso non disponibile',
                              'La tua sottoscrizione potrebbe non essere ancora attiva. Riprova tra qualche momento.',
                            );
                            return;
                          }
                        } else if (fromAITutor) {
                          const shouldShow = await shouldShowPlansScreen(updatedProfile, authUser.id, 'ai_tutor');
                          if (shouldShow) {
                            Alert.alert(
                              'Accesso non disponibile',
                              'La tua sottoscrizione potrebbe non essere ancora attiva. Riprova tra qualche momento.',
                            );
                            return;
                          }
                        } else if (fromFreeMode) {
                          const shouldShow = await shouldShowPlansScreen(updatedProfile, authUser.id, 'free_mode');
                          if (shouldShow) {
                            Alert.alert(
                              'Accesso non disponibile',
                              'La tua sottoscrizione potrebbe non essere ancora attiva. Riprova tra qualche momento.',
                            );
                            return;
                          }
                        }
                      }
                    }
                  } catch (error) {
                    console.error('[PaymentScreen] Error verificando acceso después de pago:', error);
                    // Continuar con la navegación aunque haya error
                  }
                }
                
                // Navegar según el origen
                if (fromOnboarding) {
                  // Si viene del onboarding, completar el onboarding
                  await completeOnboarding();
                } else if (fromRoundComplete) {
                  // Si viene de round complete, volver a PracticeSession
                  // El usuario ya tiene acceso, puede continuar al siguiente round
                  navigation.navigate('PracticeSession', {
                    scenarioId,
                    levelId,
                    mode: 'guided',
                  });
                } else if (fromAITutor) {
                  // Si viene de AI Tutor, volver a AI Tutor
                  navigation.navigate('AITutorMain');
                } else if (fromFreeMode) {
                  // Si viene de free mode, volver a PracticeSession con mode='free'
                  navigation.navigate('PracticeSession', {
                    scenarioId,
                    levelId,
                    mode: 'free',
                  });
                } else {
                  // Caso por defecto: volver al perfil
                  navigation.navigate('ProfileMain');
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante il pagamento. Riprova.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanInfo = () => {
    if (plan) {
      return plan;
    }
    // Fallback si no viene el plan
    const plans = {
      free: {title: 'Prova Gratuita', price: 'Gratis', pricePerMonth: ''},
      monthly: {title: 'Mensile', price: '19,99 €', pricePerMonth: '/mese'},
      quarterly: {title: '3 Mesi', price: '47,99 €', pricePerMonth: '15,99 €/mese'},
      yearly: {title: '1 Anno', price: '113,88 €', pricePerMonth: '9,49 €/mese'},
    };
    return plans[planId || 'monthly'];
  };

  const planInfo = getPlanInfo();

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: '#F5F5F5'}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sizes.padding,
          paddingTop: 45,
          paddingBottom: sizes.padding * 2,
        }}>
        {/* Header con título y botón de volver */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: sizes.l,
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: sizes.sm,
            }}
            activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={28} color={colors.text || '#334155'} />
          </TouchableOpacity>
          <Text h4 semibold color={colors.text}>
            Pagamento
          </Text>
        </View>
        {/* Resumen del plan */}
        <Block
          color={colors.card}
          radius={16}
          padding={sizes.md}
          marginBottom={sizes.md}
          style={{
            borderWidth: 1.5,
            borderColor: colors.secondary,
          }}>
          <Block row align="center" justify="space-between" marginBottom={sizes.xs}>
            <Text h5 semibold color={colors.text}>
              Piano selezionato
            </Text>
            <View
              style={{
                backgroundColor: colors.secondary,
                borderRadius: 8,
                paddingHorizontal: sizes.sm,
                paddingVertical: 4,
              }}>
              <Text size={10} white bold>
                {planInfo.title}
              </Text>
            </View>
          </Block>
          <Block row align="center" justify="space-between">
            <Text size={sizes.p - 2} color={colors.text} opacity={0.7}>
              {planInfo.pricePerMonth || 'Gratis per 5 giorni'}
            </Text>
            <Text h4 bold color={colors.secondary}>
              {planInfo.price}
            </Text>
          </Block>
        </Block>

        {/* Tarjeta de crédito */}
        <Block marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Dati di pagamento
          </Text>

          <Animated.View style={{transform: [{scale: cardScale}]}}>
            <Block
              color={colors.primary}
              radius={16}
              style={{
                minHeight: 200,
                position: 'relative',
                overflow: 'hidden',
                padding: 14,
              }}>
              {/* Efecto shimmer */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  opacity: shimmerOpacity,
                }}
              />

              {/* Chip */}
              <View
                style={{
                  width: 50,
                  height: 40,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 6,
                  marginBottom: sizes.l,
                }}
              />

              {/* Número de tarjeta */}
              <Text
                white
                h3
                bold
                style={{
                  letterSpacing: 4,
                  marginBottom: sizes.l,
                  fontFamily: 'monospace',
                }}>
                {cardNumber || '•••• •••• •••• ••••'}
              </Text>

              {/* Nombre y fecha */}
              <Block row justify="space-between" align="flex-end">
                <Block flex={1}>
                  <Text size={sizes.p - 4} white opacity={0.7} marginBottom={4}>
                    TITOLARE
                  </Text>
                  <Text white semibold style={{textTransform: 'uppercase'}}>
                    {cardHolder || 'NOME COGNOME'}
                  </Text>
                </Block>
                <Block align="flex-end">
                  <Text size={sizes.p - 4} white opacity={0.7} marginBottom={4}>
                    SCADENZA
                  </Text>
                  <Text white semibold>
                    {expiryDate || 'MM/YY'}
                  </Text>
                </Block>
              </Block>
            </Block>
          </Animated.View>
        </Block>

        {/* Formulario */}
        <Block marginBottom={sizes.md}>
          <Text size={sizes.p - 2} color={colors.text} opacity={0.7} marginBottom={sizes.sm}>
            Numero carta
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: cardNumber ? colors.secondary : 'rgba(11,61,77,0.15)',
                borderWidth: cardNumber ? 2 : 1.5,
              },
            ]}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={String(colors.text || '#334155') + '60'}
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="numeric"
            maxLength={19}
          />
        </Block>

        <Block marginBottom={sizes.md}>
          <Text size={sizes.p - 2} color={colors.text} opacity={0.7} marginBottom={sizes.sm}>
            Nome titolare
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: cardHolder ? colors.secondary : 'rgba(11,61,77,0.15)',
                borderWidth: cardHolder ? 2 : 1.5,
              },
            ]}
            placeholder="MARIO ROSSI"
            placeholderTextColor={String(colors.text || '#334155') + '60'}
            value={cardHolder}
            onChangeText={setCardHolder}
            autoCapitalize="characters"
            maxLength={30}
          />
        </Block>

        <Block row marginBottom={sizes.md}>
          <Block flex={1} marginRight={sizes.sm}>
            <Text size={sizes.p - 2} color={colors.text} opacity={0.7} marginBottom={sizes.sm}>
              Scadenza
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: expiryDate ? colors.secondary : 'rgba(11,61,77,0.15)',
                  borderWidth: expiryDate ? 2 : 1.5,
                },
              ]}
              placeholder="MM/YY"
              placeholderTextColor={String(colors.text || '#334155') + '60'}
              value={expiryDate}
              onChangeText={handleExpiryDateChange}
              keyboardType="numeric"
              maxLength={5}
            />
          </Block>
          <Block flex={1} marginLeft={sizes.sm}>
            <Text size={sizes.p - 2} color={colors.text} opacity={0.7} marginBottom={sizes.sm}>
              CVV
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: cvv ? colors.secondary : 'rgba(11,61,77,0.15)',
                  borderWidth: cvv ? 2 : 1.5,
                },
              ]}
              placeholder="123"
              placeholderTextColor={String(colors.text || '#334155') + '60'}
              value={cvv}
              onChangeText={handleCvvChange}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </Block>
        </Block>

        {/* Información de seguridad */}
        <Block
          row
          align="center"
          marginBottom={sizes.l}
          style={{
            backgroundColor: 'rgba(96,203,88,0.1)',
            borderRadius: 12,
            padding: sizes.sm,
          }}>
          <Ionicons name="lock-closed" size={20} color={colors.secondary} style={{marginRight: sizes.sm}} />
          <Text size={sizes.p - 3} color={colors.text} style={{flex: 1}}>
            I tuoi dati sono protetti e crittografati. Non salviamo le informazioni della carta.
          </Text>
        </Block>

        {/* Botón de pago */}
        <Button
          color={colors.primary}
          onPress={handlePayment}
          disabled={isProcessing}
          style={{
            marginBottom: sizes.sm,
            borderRadius: 16,
            paddingVertical: sizes.md,
            backgroundColor: colors.primary,
          }}>
          {isProcessing ? (
            <Text white semibold>
              Elaborazione...
            </Text>
          ) : (
            <Text white semibold h5>
              Paga {planInfo.price}
            </Text>
          )}
        </Button>

        {/* Stripe badge */}
        <Block align="center" marginTop={sizes.md}>
          <Text size={sizes.p - 4} color={colors.text} opacity={0.5} center>
            Powered by
          </Text>
          <Text size={sizes.p - 2} color={colors.text} opacity={0.7} semibold center>
            Stripe
          </Text>
        </Block>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1.5,
  },
});

export default PaymentScreen;

