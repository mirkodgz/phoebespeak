import React, {useState, useRef, useEffect} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View, Animated, Easing} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';

import {Block, Text, Button} from '../components';
import {useTheme, useData} from '../hooks';
import {canChooseFreeTrial, handleFreeTrialChoice, getTrialInfo} from '../services/subscription';
import {getCurrentAuthUser, fetchProfileById} from '../services/supabaseAuth';

type PlanType = 'free' | 'monthly' | 'quarterly' | 'yearly';

interface PlanOption {
  id: PlanType;
  title: string;
  subtitle: string;
  price: string;
  pricePerMonth: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor: string;
  isPopular?: boolean;
}

const ProPlans = () => {
  const {sizes, colors} = useTheme();
  const {completeOnboarding} = useData();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [canChooseFree, setCanChooseFree] = useState(true);
  const [trialInfo, setTrialInfo] = useState<ReturnType<typeof getTrialInfo> | null>(null);
  
  // Cargar perfil y verificar si puede elegir prova gratuita
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const authUser = await getCurrentAuthUser();
        if (authUser) {
          const profile = await fetchProfileById(authUser.id);
          if (profile) {
            setCanChooseFree(canChooseFreeTrial(profile));
            setTrialInfo(getTrialInfo(profile));
          }
        }
      } catch (error) {
        console.error('[ProPlans] Error cargando perfil:', error);
      }
    };
    loadProfile();
  }, []);
  
  // Detectar de dónde viene
  const routeParams = route.params as {
    fromOnboarding?: boolean;
    fromRoundComplete?: boolean;
    roundNumber?: number;
    fromAITutor?: boolean;
    fromFreeMode?: boolean;
    scenarioId?: string;
    levelId?: string;
  };
  const fromOnboarding = routeParams?.fromOnboarding || false;
  const fromRoundComplete = routeParams?.fromRoundComplete || false;
  const fromAITutor = routeParams?.fromAITutor || false;
  const fromFreeMode = routeParams?.fromFreeMode || false;

  // Animación para el icono del header (efecto latido)
  const trophyScale = useRef(new Animated.Value(1)).current;

  // Planes disponibles
  const plans: PlanOption[] = [
    {
      id: 'free',
      title: 'Prova Gratuita',
      subtitle: 'Primi 5 giorni gratis',
      price: 'Gratis',
      pricePerMonth: '',
      icon: 'gift-outline',
      iconColor: String(colors.secondary),
      backgroundColor: 'rgba(96,203,88,0.1)',
    },
    {
      id: 'monthly',
      title: 'Mensile',
      subtitle: 'Fatturazione mensile',
      price: '19,99 €',
      pricePerMonth: '/mese',
      icon: 'calendar-outline',
      iconColor: String(colors.primary),
      backgroundColor: 'rgba(11,61,77,0.1)',
    },
    {
      id: 'quarterly',
      title: '3 Mesi',
      subtitle: 'Solo 15,99 €/mese',
      price: '47,99 €',
      pricePerMonth: '15,99 €/mese',
      icon: 'trophy',
      iconColor: String(colors.secondary),
      backgroundColor: 'rgba(96,203,88,0.08)',
      isPopular: true,
    },
    {
      id: 'yearly',
      title: '1 Anno',
      subtitle: 'Solo 9,49 €/mese',
      price: '113,88 €',
      pricePerMonth: '9,49 €/mese',
      icon: 'star',
      iconColor: '#FFA500',
      backgroundColor: 'rgba(255,165,0,0.15)',
    },
  ];

  // Animación del icono del header (efecto latido)
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(trophyScale, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(trophyScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const handlePlanSelect = async (planId: PlanType) => {
    // Si es "prova gratuita" y ya pasaron los 5 días, no permitir seleccionarla
    if (planId === 'free') {
      try {
        const authUser = await getCurrentAuthUser();
        if (authUser) {
          const profile = await fetchProfileById(authUser.id);
          if (profile) {
            const choice = handleFreeTrialChoice(profile);
            if (choice === 'must_subscribe') {
              // Ya pasaron los 5 días, debe elegir un plan de pago
              // No hacer nada, el usuario debe elegir otro plan
              return;
            }
          }
        }
      } catch (error) {
        console.error('[ProPlans] Error verificando prova gratuita:', error);
      }
    }
    
    setSelectedPlan(planId);
    
    // Navegar a la pantalla de pago después de un pequeño delay para el efecto visual
    setTimeout(() => {
      navigation.navigate('PaymentScreen', {
        planId,
        plan: plans.find(p => p.id === planId),
        fromOnboarding,
        fromRoundComplete,
        roundNumber: routeParams?.roundNumber,
        fromAITutor,
        fromFreeMode,
        scenarioId: routeParams?.scenarioId,
        levelId: routeParams?.levelId,
      });
    }, 300);
  };

  const handleClose = async () => {
    // Si viene del onboarding y cierra sin seleccionar, completar el onboarding
    if (fromOnboarding) {
      await completeOnboarding();
      // El cambio de hasOnboarded hará que App.tsx muestre Main automáticamente
    } else if (fromRoundComplete || fromAITutor || fromFreeMode) {
      // Si viene de una funcionalidad restringida y cierra sin seleccionar, volver atrás
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Home');
      }
    } else {
      // Si no viene del onboarding, solo volver atrás
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('ProfileMain');
      }
    }
  };

  const PlanCard = ({plan, index}: {plan: PlanOption; index: number}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const iconScale = useRef(new Animated.Value(1)).current;
    const isSelected = selectedPlan === plan.id;
    
    // Verificar si el plan "prova gratuita" está deshabilitado
    const isDisabled = plan.id === 'free' && !canChooseFree;

    // Animación de latido para el icono
    useEffect(() => {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(iconScale, {
            toValue: 1.2,
            duration: 1000 + index * 200, // Diferentes velocidades para cada icono
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(iconScale, {
            toValue: 1,
            duration: 1000 + index * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    }, [index]);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    return (
      <TouchableOpacity
        onPress={() => !isDisabled && handlePlanSelect(plan.id)}
        onPressIn={() => !isDisabled && handlePressIn()}
        onPressOut={() => !isDisabled && handlePressOut()}
        activeOpacity={isDisabled ? 1 : 0.9}
        disabled={isDisabled}
        style={{marginBottom: sizes.sm / 2, opacity: isDisabled ? 0.5 : 1}}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: plan.isPopular ? plan.backgroundColor : '#FFFFFF',
              borderRadius: 16,
              padding: sizes.md,
              borderWidth: plan.isPopular ? 2 : 1.5,
              borderColor: isSelected
                ? colors.secondary
                : plan.isPopular
                ? colors.secondary
                : isDisabled
                ? 'rgba(11,61,77,0.1)'
                : 'rgba(11,61,77,0.15)',
              shadowColor: isSelected || plan.isPopular ? colors.secondary : '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: isSelected || plan.isPopular ? 0.2 : 0.1,
              shadowRadius: isSelected || plan.isPopular ? 8 : 4,
              elevation: isSelected || plan.isPopular ? 5 : 3,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0}}>
            <Animated.View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: plan.backgroundColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: sizes.sm,
                flexShrink: 0,
                transform: [{scale: iconScale}],
              }}>
              <Ionicons name={plan.icon} size={20} color={plan.iconColor} />
            </Animated.View>
            <View style={{flex: 1, minWidth: 0, marginRight: sizes.sm}}>
              {plan.isPopular && (
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap'}}>
                  <Text style={{fontSize: sizes.p, fontWeight: '600', color: colors.text, marginRight: 6}}>
                    {plan.title}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.secondary,
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      flexShrink: 0,
                    }}>
                    <Text style={{fontSize: 9, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5}}>
                      POPOLARE
                    </Text>
                  </View>
                </View>
              )}
              {!plan.isPopular && (
                <Text style={{fontSize: sizes.p, fontWeight: '600', color: isDisabled ? 'rgba(51,65,85,0.5)' : colors.text, marginBottom: 2}}>
                  {plan.title}
                </Text>
              )}
              <Text style={{fontSize: sizes.p - 3, color: plan.isPopular ? colors.secondary : (isDisabled ? 'rgba(51,65,85,0.4)' : colors.text), opacity: plan.isPopular ? 1 : (isDisabled ? 0.4 : 0.6), fontWeight: plan.isPopular ? '500' : '400'}}>
                {isDisabled && plan.id === 'free' 
                  ? 'Prova scaduta - Scegli un piano di pagamento' 
                  : plan.subtitle}
              </Text>
            </View>
          </View>
          <View style={{alignItems: 'flex-end', flexShrink: 0, marginLeft: sizes.xs}}>
            <Text style={{fontSize: sizes.p * 1.3, fontWeight: '700', color: plan.isPopular ? colors.secondary : colors.primary}}>
              {plan.price}
            </Text>
            {plan.pricePerMonth && (
              <Text style={{fontSize: sizes.p - 4, color: colors.text, opacity: 0.6}}>
                {plan.pricePerMonth}
              </Text>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      {/* Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top / 2, 5),
          paddingLeft: sizes.padding,
          paddingRight: sizes.padding / 4,
          paddingBottom: sizes.xs / 2,
          backgroundColor: '#F5F5F5',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            minHeight: 50,
          }}>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}>
            <Ionicons name="close" size={28} color={colors.text || '#334155'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sizes.padding,
          paddingTop: sizes.md,
          paddingBottom: sizes.padding,
        }}>
        {/* Header con icono animado y descripción */}
        <Block align="center" marginBottom={sizes.md}>
          <Animated.View
            style={{
              transform: [{scale: trophyScale}],
            }}>
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 14,
                backgroundColor: 'rgba(96,203,88,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: sizes.sm,
                padding: sizes.xs,
              }}>
              <Ionicons name="trophy" size={45} color={colors.secondary} />
            </View>
          </Animated.View>
          <Text h5 semibold color={colors.text} marginBottom={sizes.xs}>
            Sblocca tutte le funzionalità
          </Text>
        </Block>

        {/* Planes */}
        {plans.map((plan, index) => (
          <PlanCard key={plan.id} plan={plan} index={index} />
        ))}
      </ScrollView>
    </View>
  );
};

export default ProPlans;
