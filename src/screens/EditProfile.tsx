import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, Alert, View, Image as RNImage} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Block, Text, Input, Button} from '../components';
import {useData, useTheme} from '../hooks';
import {getCurrentAuthUser, upsertProfile} from '../services/supabaseAuth';

// Colección de avatares predefinidos usando imágenes locales
const getAvatars = (assets: any) => [
  {
    id: 'avatar1',
    source: assets.avatar3, // assets/avatars/1.webp
    name: 'Avatar 1',
  },
  {
    id: 'avatar2',
    source: assets.avatar4, // assets/avatars/2.webp
    name: 'Avatar 2',
  },
  {
    id: 'avatar3',
    source: assets.avatar5, // assets/avatars/3.webp
    name: 'Avatar 3',
  },
  {
    id: 'avatar4',
    source: assets.avatar6, // assets/avatars/4.webp
    name: 'Avatar 4',
  },
  {
    id: 'avatar5',
    source: assets.avatar7, // assets/avatars/5.webp
    name: 'Avatar 5',
  },
  {
    id: 'avatar6',
    source: assets.avatar8, // assets/avatars/6.webp
    name: 'Avatar 6',
  },
];

const EditProfile = () => {
  const {sizes, colors, assets} = useTheme();
  const navigation = useNavigation<any>();
  const {user, setUser} = useData();
  const styles = createStyles(sizes);

  const AVATARS = getAvatars(assets);

  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Inicializar con los datos del usuario actual
    if (user) {
      setFullName(user.name || '');
      // Si el usuario ya tiene un avatar guardado como ID (avatar1, avatar2, etc.)
      if (user.avatar && user.avatar.startsWith('avatar')) {
        setSelectedAvatar(user.avatar);
      } else {
        setSelectedAvatar(null);
      }
    }
  }, [user]);

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Errore', 'Il nome è obbligatorio.');
      return;
    }

    setIsSaving(true);
    try {
      const authUser = await getCurrentAuthUser();
      if (!authUser) {
        Alert.alert('Errore', 'Utente non autenticato.');
        return;
      }

      // Preparar datos para actualizar
      const updateData: {
        id: string;
        full_name: string;
        avatar_url?: string;
      } = {
        id: authUser.id,
        full_name: fullName.trim(),
      };

      // Guardar el ID del avatar seleccionado (o null si no hay selección)
      // Esto reemplazará cualquier avatar anterior
      updateData.avatar_url = selectedAvatar || null;

      // Intentar actualizar en Supabase
      // Si la columna avatar_url no existe, se guardará en AsyncStorage como respaldo
      try {
        await upsertProfile(updateData);
        // Si se guardó exitosamente, también guardar en AsyncStorage como respaldo
        if (selectedAvatar) {
          await AsyncStorage.setItem(`user_avatar_${authUser.id}`, selectedAvatar);
        } else {
          // Si no hay avatar seleccionado, limpiar el storage
          await AsyncStorage.removeItem(`user_avatar_${authUser.id}`);
        }
      } catch (error: any) {
        // Si el error es porque la columna no existe, intentar sin avatar_url
        if (error?.message?.includes('avatar_url') || error?.code === 'PGRST204') {
          console.warn('[EditProfile] Columna avatar_url no existe, guardando solo nombre y usando AsyncStorage');
          const {avatar_url, ...dataWithoutAvatar} = updateData;
          await upsertProfile(dataWithoutAvatar);
          
          // Guardar avatar en AsyncStorage como respaldo permanente
          if (selectedAvatar) {
            await AsyncStorage.setItem(`user_avatar_${authUser.id}`, selectedAvatar);
          } else {
            await AsyncStorage.removeItem(`user_avatar_${authUser.id}`);
          }
        } else {
          throw error;
        }
      }

      // Actualizar estado local
      // Para el estado local, necesitamos una forma de representar el avatar
      // Por ahora, guardamos el ID y luego lo mapeamos cuando se necesite mostrar
      const selectedAvatarData = selectedAvatar
        ? AVATARS.find(avatar => avatar.id === selectedAvatar)
        : null;
      
      // Convertir el source del avatar a una representación que podamos guardar
      // En este caso, guardamos el ID y luego lo mapeamos cuando se necesite
      setUser({
        name: fullName.trim(),
        avatar: selectedAvatar || user?.avatar || '',
      });

      Alert.alert('Successo', 'Profilo aggiornato con successo!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('[EditProfile] Error saving profile:', error);
      Alert.alert(
        'Errore',
        'Impossibile aggiornare il profilo. Riprova più tardi.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Block safe color="#F5F5F5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: sizes.padding * 2}}>
        {/* Header */}
        <Block
          row
          justify="space-between"
          align="center"
          paddingHorizontal={sizes.padding}
          paddingTop={sizes.md}
          marginBottom={sizes.md}>
          <Block row align="center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{marginRight: sizes.sm}}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text h4 semibold color={colors.text}>
              Modifica profilo
            </Text>
          </Block>
        </Block>

        {/* Selección de avatar */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Scegli il tuo avatar
          </Text>
          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.sectionCard}>
            {/* Vista previa del avatar seleccionado */}
            {selectedAvatar && (
              <Block align="center" marginBottom={sizes.md}>
                <RNImage
                  source={AVATARS.find(avatar => avatar.id === selectedAvatar)?.source}
                  style={[styles.previewAvatar, {width: 100, height: 100, borderRadius: 50}]}
                  resizeMode="cover"
                />
              </Block>
            )}

            {/* Galería de avatares - 3 arriba y 3 abajo */}
            <Block>
              {/* Primera fila - 3 avatares */}
              <Block row justify="space-around" marginBottom={sizes.sm}>
                {AVATARS.slice(0, 3).map(avatar => {
                  const isSelected = selectedAvatar === avatar.id;
                  return (
                    <TouchableOpacity
                      key={avatar.id}
                      onPress={() => handleSelectAvatar(avatar.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.avatarOption,
                        isSelected && styles.avatarOptionSelected,
                      ]}>
                      <RNImage
                        source={avatar.source}
                        style={styles.avatarImage}
                        resizeMode="contain"
                      />
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </Block>
              {/* Segunda fila - 3 avatares */}
              <Block row justify="space-around">
                {AVATARS.slice(3, 6).map(avatar => {
                  const isSelected = selectedAvatar === avatar.id;
                  return (
                    <TouchableOpacity
                      key={avatar.id}
                      onPress={() => handleSelectAvatar(avatar.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.avatarOption,
                        isSelected && styles.avatarOptionSelected,
                      ]}>
                      <RNImage
                        source={avatar.source}
                        style={styles.avatarImage}
                        resizeMode="contain"
                      />
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </Block>
            </Block>
          </Block>
        </Block>

        {/* Información personal */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Informazioni personali
          </Text>
          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.sectionCard}>
            <Input
              label="Nome completo"
              placeholder="Inserisci il tuo nome"
              value={fullName}
              onChangeText={setFullName}
              marginBottom={sizes.sm}
            />
          </Block>
        </Block>

        {/* Botón guardar */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.md}>
          <Button
            primary
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving || !fullName.trim()}>
            <Text white semibold>
              Salva modifiche
            </Text>
          </Button>
        </Block>
      </ScrollView>
    </Block>
  );
};

const createStyles = (sizes: any) => StyleSheet.create({
  previewAvatar: {
    borderWidth: 3,
    borderColor: '#0B3D4D',
  },
  avatarOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  avatarOptionSelected: {
    borderWidth: 3,
    borderColor: '#0B3D4D',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0B3D4D',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCard: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default EditProfile;

