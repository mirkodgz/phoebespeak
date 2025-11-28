import React, {useEffect} from 'react';
import {Platform, StatusBar} from 'react-native';
import {useFonts} from 'expo-font';
import {NavigationContainer, DefaultTheme, LinkingOptions} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import Menu from './Menu';
import {useData, ThemeProvider, TranslationProvider} from '../hooks';
import {
  Login,
  Register,
  VerifyCode,
  ResetPassword,
  PremiumUpsell,
  Onboarding,
  OnboardingStepTwo,
  OnboardingStepThree,
  OnboardingStepFour,
  OnboardingStepFive,
  OnboardingStepSix,
  OnboardingStepSeven,
  OnboardingStepEight,
  OnboardingStepNine,
  LoadingScreen,
} from '../screens';

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
const OnboardingStack = createStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{headerShown: false}}>
    <AuthStack.Screen name="Login" component={Login} />
    <AuthStack.Screen name="Register" component={Register} />
    <AuthStack.Screen name="VerifyCode" component={VerifyCode} />
    <AuthStack.Screen name="ResetPassword" component={ResetPassword} />
    <AuthStack.Screen name="PremiumUpsell" component={PremiumUpsell} />
  </AuthStack.Navigator>
);

const OnboardingNavigator = () => (
  <OnboardingStack.Navigator screenOptions={{headerShown: false}}>
    <OnboardingStack.Screen
      name="OnboardingStepOne"
      component={Onboarding}
    />
    <OnboardingStack.Screen
      name="OnboardingStepTwo"
      component={OnboardingStepTwo}
    />
    <OnboardingStack.Screen
      name="OnboardingStepThree"
      component={OnboardingStepThree}
    />
    <OnboardingStack.Screen
      name="OnboardingStepFour"
      component={OnboardingStepFour}
    />
    <OnboardingStack.Screen
      name="OnboardingStepFive"
      component={OnboardingStepFive}
    />
    <OnboardingStack.Screen
      name="OnboardingStepSix"
      component={OnboardingStepSix}
    />
    <OnboardingStack.Screen
      name="OnboardingStepSeven"
      component={OnboardingStepSeven}
    />
    <OnboardingStack.Screen
      name="OnboardingStepEight"
      component={OnboardingStepEight}
    />
    <OnboardingStack.Screen
      name="OnboardingStepNine"
      component={OnboardingStepNine}
    />
  </OnboardingStack.Navigator>
);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
export default () => {
  const {isDark, theme, setTheme, isAuthenticated, hasOnboarded, isProfileLoading} = useData();

  /* set the status bar based on isDark constant */
  useEffect(() => {
    Platform.OS === 'android' && StatusBar.setTranslucent(true);
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, [isDark]);

  // load custom fonts - Urbanist
  const [fontsLoaded] = useFonts({
    'Urbanist-Light': theme.assets.UrbanistLight,
    'Urbanist-Regular': theme.assets.UrbanistRegular,
    'Urbanist-SemiBold': theme.assets.UrbanistSemiBold,
    'Urbanist-ExtraBold': theme.assets.UrbanistExtraBold,
    'Urbanist-Bold': theme.assets.UrbanistBold,
  });

  if (fontsLoaded) {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }

  if (!fontsLoaded) {
    return null;
  }

  const navigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      border: 'rgba(0,0,0,0)',
      text: String(theme.colors.text),
      card: String(theme.colors.card),
      primary: String(theme.colors.primary),
      notification: String(theme.colors.primary),
      background: String(theme.colors.background),
    },
  };

  // Configuración de deep linking
  const linking: LinkingOptions<ReactNavigation.RootParamList> = {
    prefixes: ['phoebe://'],
    config: {
      screens: {
        Auth: {
          screens: {
            ResetPassword: 'reset-password',
            Login: 'login',
            Register: 'register',
            // auth/callback será manejado por WebBrowser.openAuthSessionAsync
            // No necesita una pantalla específica
          },
        },
      },
    },
  };

  return (
    <TranslationProvider>
      <ThemeProvider theme={theme} setTheme={setTheme}>
        <NavigationContainer linking={linking} theme={navigationTheme}>
          <RootStack.Navigator screenOptions={{headerShown: false}}>
            {!isAuthenticated ? (
              <RootStack.Screen name="Auth" component={AuthNavigator} />
            ) : isProfileLoading || hasOnboarded === null ? (
              // Mostrar pantalla de carga mientras se sincroniza el perfil
              // También mostrar loading si hasOnboarded aún no se ha determinado
              <RootStack.Screen name="Loading" component={LoadingScreen} />
            ) : !hasOnboarded ? (
              <RootStack.Screen
                name="Onboarding"
                component={OnboardingNavigator}
              />
            ) : (
              <RootStack.Screen name="Main" component={Menu} />
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </TranslationProvider>
  );
};
