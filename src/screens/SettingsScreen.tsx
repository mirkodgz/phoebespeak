import React, {useState, useEffect, useRef} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, Alert, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';

import {
  Block,
  Text,
  Switch,
  Image,
} from '../components';
import {useData, useTheme} from '../hooks';
import {getCurrentAuthUser, upsertProfile} from '../services/supabaseAuth';

type TutorOption = {
  id: 'davide' | 'phoebe';
  name: string;
  characteristics: string[];
  avatar: ReturnType<typeof require>;
};

const TUTORS: TutorOption[] = [
  {
    id: 'davide',
    name: 'DAVIDE',
    characteristics: ['Amable', 'Voz clara', 'Paciente'],
    avatar: require('../../assets/uomofrontew.webp'),
  },
  {
    id: 'phoebe',
    name: 'PHOEBE',
    characteristics: ['Empática', 'Voz suave', 'Motivadora'],
    avatar: require('../../assets/donnafrontew.webp'),
  },
];

// Componente animado para las imágenes de los tutores
const AnimatedTutorAvatar = ({
  source,
  width,
  height,
  radius,
}: {
  source: any;
  width: number;
  height: number;
  radius: number;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [scale]);

  return (
    <Animated.View
      style={{
        transform: [{scale}],
        width,
        height,
        overflow: 'hidden',
        borderRadius: radius,
      }}>
      <Image source={source} width={width} height={height} radius={radius} />
    </Animated.View>
  );
};

type LevelOption = 'beginner' | 'intermediate' | 'advanced';

const levelLabels: Record<LevelOption, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzato',
};

const SettingsScreen = () => {
  const {sizes, colors} = useTheme();
  const navigation = useNavigation<any>();
  const {
    isDark,
    handleIsDark,
    preferences,
    updatePreferences,
    user,
    setUser,
    signOut,
  } = useData();

  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const styles = createStyles(sizes);

  const currentLevel = (user?.department || 'beginner') as LevelOption;
  const selectedTutor = preferences.selectedTutor || 'davide';

  const handleTutorSelect = (tutorId: 'davide' | 'phoebe') => {
    updatePreferences({selectedTutor: tutorId});
  };

  const handleLevelChange = async (newLevel: LevelOption) => {
    if (newLevel === currentLevel || isUpdatingLevel) {
      return;
    }

    setIsUpdatingLevel(true);
    try {
      const authUser = await getCurrentAuthUser();
      if (authUser) {
        // Actualizar en Supabase
        await upsertProfile({
          id: authUser.id,
          level: newLevel,
        });
        // Actualizar estado local
        setUser({department: newLevel});
      } else {
        // Si no hay usuario autenticado, solo actualizar estado local
        setUser({department: newLevel});
      }
    } catch (error) {
      console.error('[SettingsScreen] Error updating level:', error);
      Alert.alert(
        'Errore',
        'Impossibile aggiornare il livello. Riprova più tardi.',
      );
    } finally {
      setIsUpdatingLevel(false);
    }
  };

  const handleSignOut = () => {
    if (isSigningOut) {
      return; // Prevenir múltiples llamadas
    }

    Alert.alert(
      'Esci',
      'Sei sicuro di voler uscire?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              // signOut ahora actualiza el estado inmediatamente
              // No esperamos a que termine para navegar
              await signOut();
              // La navegación se manejará automáticamente por el estado de autenticación
              // El listener onAuthStateChange también actualizará el estado
              // Resetear el estado después de un breve delay para permitir la navegación
              setTimeout(() => {
                setIsSigningOut(false);
              }, 500);
            } catch (error) {
              console.error('[SettingsScreen] Error signing out:', error);
              // Aún así, el estado ya debería estar limpio
              setIsSigningOut(false);
              // No mostramos error porque el signOut limpia el estado local incluso si falla
            }
          },
        },
      ],
    );
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
              Impostazioni
            </Text>
          </Block>
        </Block>

        {/* Cambio de Nivel - Sección destacada */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Il tuo livello di inglese
          </Text>
          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.sectionCard}>
            <Text size={sizes.p - 2} color={colors.text} opacity={0.7} marginBottom={sizes.sm}>
              Seleziona il tuo livello attuale per personalizzare la tua esperienza
            </Text>
            <Block row justify="space-between">
              {(['beginner', 'intermediate', 'advanced'] as LevelOption[]).map(
                (level) => {
                  const isSelected = level === currentLevel;
                  return (
                    <TouchableOpacity
                      key={level}
                      onPress={() => handleLevelChange(level)}
                      disabled={isUpdatingLevel}
                      style={[
                        styles.levelButton,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.card,
                          borderColor: isSelected ? colors.primary : '#E0E0E0',
                          borderWidth: 1,
                          opacity: isUpdatingLevel ? 0.6 : 1,
                        },
                      ]}>
                      <Text
                        semibold
                        color={isSelected ? '#FFFFFF' : colors.text}
                        center>
                        {levelLabels[level]}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </Block>
          </Block>
        </Block>

        {/* Selección de Tutor */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Scegli il tuo Tutor
          </Text>
          <Block row justify="space-between">
            {TUTORS.map(tutor => {
              const isSelected = selectedTutor === tutor.id;
              return (
                <TouchableOpacity
                  key={tutor.id}
                  onPress={() => handleTutorSelect(tutor.id)}
                  activeOpacity={0.8}
                  style={styles.tutorCardContainer}>
                  <Block
                    color={colors.card}
                    radius={sizes.cardRadius}
                    padding={sizes.md}
                    style={[
                      styles.sectionCard,
                      styles.tutorCard,
                      isSelected && styles.tutorCardSelected,
                    ]}>
                    <Block align="center" marginBottom={sizes.sm}>
                      <AnimatedTutorAvatar
                        source={tutor.avatar}
                        width={120}
                        height={150}
                        radius={8}
                      />
                    </Block>
                    <Text
                      h5
                      semibold
                      color={isSelected ? colors.primary : colors.text}
                      center>
                      {tutor.name}
                    </Text>
                    {isSelected && (
                      <Block
                        absolute
                        style={{
                          top: sizes.sm,
                          right: sizes.sm,
                        }}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.secondary}
                        />
                      </Block>
                    )}
                  </Block>
                </TouchableOpacity>
              );
            })}
          </Block>
        </Block>

        {/* Editar perfil */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Profilo
          </Text>
          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                navigation.navigate('EditProfile');
              }}>
              <Block row align="center" flex={1}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.text}
                  style={{marginRight: sizes.sm}}
                />
                <Text semibold color={colors.text}>
                  Modifica profilo
                </Text>
              </Block>
            </TouchableOpacity>
          </Block>
        </Block>

        {/* Preferencias generales */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Preferenze generali
          </Text>
          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.sectionCard}>
            <Block
              row
              justify="space-between"
              align="center"
              marginBottom={sizes.sm}
              style={styles.settingRow}>
              <Block flex={1}>
                <Text semibold color={colors.text} marginBottom={4}>
                  Tema scuro
                </Text>
                <Text size={sizes.p - 2} color={colors.text} opacity={0.6}>
                  Attiva modalità scura
                </Text>
              </Block>
              <Switch checked={isDark} onPress={handleIsDark} />
            </Block>

            <Block
              row
              justify="space-between"
              align="center"
              style={styles.settingRow}>
              <Block flex={1}>
                <Text semibold color={colors.text} marginBottom={4}>
                  Promemoria quotidiani
                </Text>
                <Text size={sizes.p - 2} color={colors.text} opacity={0.6}>
                  Ricevi notifiche sulle sessioni pianificate
                </Text>
              </Block>
              <Switch
                checked={preferences.remindersEnabled}
                onPress={(checked) =>
                  updatePreferences({remindersEnabled: checked})
                }
              />
            </Block>
          </Block>
        </Block>

        {/* Información de la app */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.md}>
          <Text h5 semibold color={colors.text} marginBottom={sizes.sm}>
            Informazioni
          </Text>
          <Block
            color={colors.card}
            radius={sizes.cardRadius}
            padding={sizes.md}
            style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                // Navegar a pantalla de ayuda o términos
              }}>
              <Block row align="center" flex={1}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={colors.text}
                  style={{marginRight: sizes.sm}}
                />
                <Text semibold color={colors.text}>
                  Aiuto e supporto
                </Text>
              </Block>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, {marginTop: sizes.sm}]}
              onPress={() => {
                // Navegar a términos y condiciones
              }}>
              <Block row align="center" flex={1}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={colors.text}
                  style={{marginRight: sizes.sm}}
                />
                <Text semibold color={colors.text}>
                  Termini e condizioni
                </Text>
              </Block>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, {marginTop: sizes.sm}]}
              onPress={() => {
                // Navegar a política de privacidad
              }}>
              <Block row align="center" flex={1}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.text}
                  style={{marginRight: sizes.sm}}
                />
                <Text semibold color={colors.text}>
                  Politica sulla privacy
                </Text>
              </Block>
            </TouchableOpacity>
          </Block>
        </Block>

        {/* Cerrar sesión */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.md}>
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={isSigningOut}
            style={[
              styles.signOutButton,
              {
                backgroundColor: colors.card,
                borderRadius: sizes.cardRadius,
                opacity: isSigningOut ? 0.6 : 1,
              },
            ]}>
            <Block row align="center" justify="center">
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#FF4444"
                style={{marginRight: sizes.sm}}
              />
              <Text semibold color="#FF4444">
                {isSigningOut ? 'Uscita in corso...' : 'Esci'}
              </Text>
            </Block>
          </TouchableOpacity>
        </Block>

        {/* Versión de la app */}
        <Block paddingHorizontal={sizes.padding} marginBottom={sizes.sm}>
          <Text size={sizes.p - 3} color={colors.text} opacity={0.5} center>
            Versione 1.0.0
          </Text>
        </Block>
      </ScrollView>
    </Block>
  );
};

const createStyles = (sizes: any) => StyleSheet.create({
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
  settingRow: {
    paddingVertical: sizes.xs,
  },
  levelButton: {
    flex: 1,
    paddingVertical: sizes.sm,
    paddingHorizontal: sizes.xs,
    borderRadius: 8,
    marginHorizontal: sizes.xs / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButton: {
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.md,
  },
  tutorCardContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  tutorCard: {
    position: 'relative',
    minHeight: 200,
  },
  tutorCardSelected: {
    borderWidth: 2,
    borderColor: '#60CB58',
  },
});

export default SettingsScreen;
