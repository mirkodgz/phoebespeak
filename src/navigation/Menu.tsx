import React from 'react';
import {Platform, Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../hooks';
import {
  Home,
  RolePlay,
  RolePlayModeSelection,
  PracticeSession,
  ProgressOverview,
  Profile,
  SettingsScreen,
} from '../screens';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const PracticeStack = createStackNavigator();
const ChampionshipsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{headerShown: false}}>
    <HomeStack.Screen name="HomeMain" component={Home} />
    <HomeStack.Screen name="SettingsScreen" component={SettingsScreen} />
  </HomeStack.Navigator>
);

const PracticeStackNavigator = () => (
  <PracticeStack.Navigator screenOptions={{headerShown: false}}>
    <PracticeStack.Screen name="RolePlayMain" component={RolePlay} />
    <PracticeStack.Screen name="RolePlayModeSelection" component={RolePlayModeSelection} />
    <PracticeStack.Screen name="PracticeSession" component={PracticeSession} />
  </PracticeStack.Navigator>
);

const ChampionshipsStackNavigator = () => (
  <ChampionshipsStack.Navigator screenOptions={{headerShown: false}}>
    <ChampionshipsStack.Screen
      name="ProgressOverviewMain"
      component={ProgressOverview}
    />
  </ChampionshipsStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{headerShown: false}}>
    <ProfileStack.Screen name="ProfileMain" component={Profile} />
    <ProfileStack.Screen name="SettingsScreen" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

export default () => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  // Calcular la altura del tab bar considerando el safe area
  const tabBarHeight = Platform.OS === 'ios' 
    ? 60 + insets.bottom 
    : 60;
  
  const paddingBottom = Platform.OS === 'ios' 
    ? Math.max(insets.bottom, 8) 
    : 8;

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused}) => {
          let emoji: string;

          if (route.name === 'Home') {
            emoji = '🏠';
          } else if (route.name === 'RolePlays') {
            emoji = '🎭';
          } else if (route.name === 'AI tutor') {
            emoji = '🤖';
          } else if (route.name === 'Profilo') {
            emoji = '👤';
          } else {
            emoji = '❓';
          }

          return (
            <Text style={{fontSize: 24, opacity: focused ? 1 : 0.6}}>
              {emoji}
            </Text>
          );
        },
        tabBarActiveTintColor: String(colors.primary || '#4A90E2'),
        tabBarInactiveTintColor: String(colors.text || '#666'),
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: tabBarHeight,
          paddingBottom: paddingBottom,
          paddingTop: 8,
          paddingHorizontal: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      })}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="RolePlays"
        component={PracticeStackNavigator}
        options={{
          tabBarLabel: 'RolePlays',
        }}
      />
      <Tab.Screen
        name="AI tutor"
        component={ChampionshipsStackNavigator}
        options={{
          tabBarLabel: 'AI tutor',
        }}
      />
      <Tab.Screen
        name="Profilo"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profilo',
        }}
      />
    </Tab.Navigator>
  );
};
