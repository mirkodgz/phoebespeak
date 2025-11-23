import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useRoute} from '@react-navigation/native';

import {
  Dashboard,
  Home,
  PracticeSession,
  Profile,
  ProgressOverview,
  RolePlay,
  RolePlayModeSelection,
  SettingsScreen,
} from '../screens';
import {useScreenOptions, useTranslation} from '../hooks';

const Stack = createStackNavigator();

export default () => {
  const {t} = useTranslation();
  const screenOptions = useScreenOptions();
  const route = useRoute();
  const initialRoute =
    (route.params as {initialRoute?: string})?.initialRoute || 'Home';

  return (
    <Stack.Navigator
      screenOptions={screenOptions.stack}
      initialRouteName={initialRoute}>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="RolePlay"
        component={RolePlay}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="RolePlayModeSelection"
        component={RolePlayModeSelection}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="PracticeSession"
        component={PracticeSession}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="ProgressOverview"
        component={ProgressOverview}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};
