import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  Dashboard,
  PracticeSession,
  Profile,
  ProgressOverview,
  RolePlay,
  SettingsScreen,
} from '../screens';
import {useScreenOptions, useTranslation} from '../hooks';

const Stack = createStackNavigator();

export default () => {
  const {t} = useTranslation();
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions.stack}>
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
