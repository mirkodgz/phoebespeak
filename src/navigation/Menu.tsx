import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, Animated, StyleSheet} from 'react-native';

import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  useDrawerStatus,
} from '@react-navigation/drawer';

import Screens from './Screens';
import {Block, Text, Switch, Button, Image} from '../components';
import {useData, useTheme, useTranslation} from '../hooks';

const Drawer = createDrawerNavigator();

/* drawer menu screens navigation */
const ScreensStack = () => {
  const {colors} = useTheme();
  const isDrawerOpen = useDrawerStatus() === 'open';
  const animation = useRef(new Animated.Value(0)).current;

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.88],
  });

  const borderRadius = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  const animatedStyle = {
    borderRadius: borderRadius,
    transform: [{scale: scale}],
  };

  useEffect(() => {
    Animated.timing(animation, {
      duration: 200,
      useNativeDriver: true,
      toValue: isDrawerOpen ? 1 : 0,
    }).start();
  }, [isDrawerOpen, animation]);

  return (
    <Animated.View
      style={StyleSheet.flatten([
        animatedStyle,
        {
          flex: 1,
          overflow: 'hidden',
          borderColor: colors.card,
          borderWidth: isDrawerOpen ? 1 : 0,
        },
      ])}>
      {/*  */}
      <Screens />
    </Animated.View>
  );
};

/* custom drawer menu */
const DrawerContent = (
  props: DrawerContentComponentProps,
) => {
  const {navigation} = props;
  const {t} = useTranslation();
  const {isDark, handleIsDark, signOut} = useData();
  const [active, setActive] = useState('Dashboard');
  const {assets, colors, gradients, sizes} = useTheme();
  const labelColor = colors.text;
  const navigateHome = useCallback(() => {
    navigation.navigate('Screens', {screen: 'Dashboard'});
    setActive('Dashboard');
  }, [navigation]);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      t('common.signoutTitle') || 'Cerrar sesión',
      '¿Seguro que deseas salir de la aplicación?',
      [
        {text: t('common.cancel') || 'Cancelar', style: 'cancel'},
        {
          text: t('common.signout') || 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigateHome();
            } catch (error) {
              if (__DEV__) {
                console.warn('Sign out failed', error);
              }
            }
          },
        },
      ],
    );
  }, [navigateHome, signOut, t]);

  const handleNavigation = useCallback(
    (to: string) => {
      setActive(to);
      // Properly navigate to screens in the stack
      navigation.navigate('Screens', { screen: to });
    },
    [navigation, setActive],
  );

  // screen list for Drawer menu
  const screens = [
    {name: 'Dashboard', to: 'Dashboard', icon: assets.home},
    {name: 'Role Play', to: 'RolePlay', icon: assets.chat},
    {name: 'Progressi', to: 'ProgressOverview', icon: assets.star},
    {name: 'Profilo', to: 'Profile', icon: assets.profile},
    {name: 'Impostazioni', to: 'SettingsScreen', icon: assets.settings},
  ];

  return (
    <DrawerContentScrollView
      {...props}
      scrollEnabled
      removeClippedSubviews
      renderToHardwareTextureAndroid
      contentContainerStyle={{paddingBottom: sizes.padding}}>
      <Block paddingHorizontal={sizes.padding}>
        <Block flex={0} row align="center" marginBottom={sizes.l}>
          <Image
            radius={0}
            width={33}
            height={33}
            color={colors.text}
            source={assets.logo}
            marginRight={sizes.sm}
          />
          <Block>
            <Text size={12} semibold>
              {t('app.name')}
            </Text>
            <Text size={12} semibold>
              {t('app.native')}
            </Text>
          </Block>
        </Block>

        {screens?.map((screen, index) => {
          const isActive = active === screen.to;
          return (
            <Button
              row
              justify="flex-start"
              marginBottom={sizes.s}
              key={`menu-screen-${screen.name}-${index}`}
              onPress={() => handleNavigation(screen.to)}>
              <Block
                flex={0}
                radius={6}
                align="center"
                justify="center"
                width={sizes.md}
                height={sizes.md}
                marginRight={sizes.s}
                gradient={gradients[isActive ? 'primary' : 'white']}>
                <Image
                  radius={0}
                  width={14}
                  height={14}
                  source={screen.icon}
                  color={colors[isActive ? 'white' : 'black']}
                />
              </Block>
              <Text p semibold={isActive} color={labelColor}>
                {screen.name}
              </Text>
            </Button>
          );
        })}

        <Block
          flex={0}
          height={1}
          marginRight={sizes.md}
          marginVertical={sizes.sm}
          gradient={gradients.menu}
        />
          <Block row justify="space-between" marginTop={sizes.sm}>
            <Text color={labelColor}>{t('darkMode')}</Text>
            <Switch
              checked={isDark}
              onPress={(checked) => {
                handleIsDark(checked);
                Alert.alert(t('pro.title'), t('pro.alert'));
              }}
            />
          </Block>
          <Button
            row
            justify="flex-start"
            marginTop={sizes.l}
            onPress={handleSignOut}>
            <Block
              flex={0}
              radius={6}
              align="center"
              justify="center"
              width={sizes.md}
              height={sizes.md}
              marginRight={sizes.s}
              color="rgba(11,61,77,0.18)">
              <Text color={colors.primary} semibold>
                ⎋
              </Text>
            </Block>
            <Text p semibold color={labelColor}>
              {t('common.signoutLabel') || 'Cerrar sesión'}
            </Text>
          </Button>
      </Block>
    </DrawerContentScrollView>
  );
};

/* drawer menu navigation */
export default () => {
  const {gradients} = useTheme();

  return (
    <Block gradient={gradients.light}>
      <Drawer.Navigator
        screenOptions={{
          drawerStyle: {
            flex: 1,
            width: '60%',
            borderRightWidth: 0,
            backgroundColor: 'transparent',
          },
          drawerType: 'slide',
          overlayColor: 'transparent',
        }}
        drawerContent={(props) => <DrawerContent {...props} />}>
        <Drawer.Screen 
          name="Screens" 
          component={ScreensStack}
          options={{
            headerShown: false
          }} 
        />
      </Drawer.Navigator>
    </Block>
  );
};
