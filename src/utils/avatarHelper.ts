import {ImageSourcePropType} from 'react-native';

// Función helper para obtener el source del avatar desde su ID
export const getAvatarSource = (
  avatarId: string | null | undefined,
  assets: any,
): ImageSourcePropType | null => {
  if (!avatarId) {
    return null;
  }

  // Mapeo de IDs de avatar a sus sources
  const avatarMap: Record<string, keyof typeof assets> = {
    avatar1: 'avatar3',
    avatar2: 'avatar4',
    avatar3: 'avatar5',
    avatar4: 'avatar6',
    avatar5: 'avatar7',
    avatar6: 'avatar8',
  };

  const assetKey = avatarMap[avatarId];
  if (assetKey && assets[assetKey]) {
    return assets[assetKey] as ImageSourcePropType;
  }

  return null;
};

// Función para obtener el avatar del usuario (maneja tanto IDs como URIs)
export const getUserAvatarSource = (
  userAvatar: string | null | undefined,
  assets: any,
): ImageSourcePropType | null => {
  if (!userAvatar) {
    return null;
  }

  // Si es un ID de avatar (avatar1, avatar2, etc.), mapearlo al source
  if (userAvatar.startsWith('avatar')) {
    return getAvatarSource(userAvatar, assets);
  }

  // Si es una URI, retornar null para que se use como URI
  return null;
};


