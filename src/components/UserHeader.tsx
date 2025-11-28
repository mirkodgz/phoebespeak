import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';

import {Block, Text, Image} from './';
import {useData, useTheme} from '../hooks';
import {type RolePlayLevelId} from '../roleplay';
import {getUserAvatarSource} from '../utils/avatarHelper';

interface UserHeaderProps {
  /**
   * Si es true, el header se posiciona de forma absoluta (para pantallas con ScrollView)
   * Si es false, el header se renderiza normalmente
   * @default true
   */
  absolute?: boolean;
  /**
   * Si es true, muestra el botón de settings
   * @default true
   */
  showSettings?: boolean;
}

// Definir levelLabels fuera del componente para evitar problemas de scope
const levelLabels: Record<RolePlayLevelId, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzato',
};

// Función helper para validar el nivel
const getValidLevel = (level: string | undefined): RolePlayLevelId => {
  if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
    return level as RolePlayLevelId;
  }
  return 'beginner';
};

const UserHeader: React.FC<UserHeaderProps> = ({
  absolute = true,
  showSettings = true,
}) => {
  const {user} = useData();
  const {sizes, colors, assets} = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const currentLevel = getValidLevel(user?.department);

  const headerContent = (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: Math.max(insets.top + 5, 15),
          paddingHorizontal: sizes.padding,
          paddingBottom: sizes.xs,
        },
        absolute && styles.absolute,
      ]}>
      <Block
        row
        justify="space-between"
        align="center"
        style={{minHeight: 80}}>
        <Block row align="center" flex={1}>
          <Image
            source={
              getUserAvatarSource(user?.avatar, assets) ||
              (user?.avatar ? {uri: user.avatar} : assets.avatar1)
            }
            width={60}
            height={60}
            radius={30}
            style={{marginRight: sizes.sm}}
          />
          <Block flex={1}>
            <Text h4 semibold color={colors.text}>
              {user?.name || ''}
            </Text>
            <Block row align="center" marginTop={2}>
              <Ionicons
                name="school"
                size={14}
                color={colors.primary}
                style={{marginRight: 4}}
              />
              <Text size={12} color={colors.text} opacity={0.7}>
                {levelLabels[currentLevel]}
              </Text>
            </Block>
          </Block>
        </Block>
        {showSettings && (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SettingsScreen');
            }}
            style={{padding: sizes.sm}}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </Block>
    </View>
  );

  return headerContent;
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#F5F5F5',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

export default UserHeader;

