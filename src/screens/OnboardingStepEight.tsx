import React, {useCallback, useMemo, useState, useEffect} from 'react';
import {StyleSheet, View, Platform, Pressable, Alert} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

import {useData, useTheme, useTranslation} from '../hooks/';
import {
  Block,
  BrandActionButton,
  BrandBackground,
  Text,
  Switch,
  Button,
} from '../components/';

const TOTAL_STEPS = 9;
const CURRENT_STEP = 8;

// Configurar cómo se manejan las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const OnboardingStepEight = () => {
  const {sizes, colors} = useTheme();
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const {preferences, updatePreferences} = useData();

  const [remindersEnabled, setRemindersEnabled] = useState(
    preferences.remindersEnabled ?? true,
  );
  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    // Hora por defecto: 9:00 AM
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    return defaultTime;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<boolean | null>(null);

  const progress = useMemo(
    () => Math.min((CURRENT_STEP / TOTAL_STEPS) * 100, 100),
    [],
  );

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    const hasPermission = existingStatus === 'granted';
    setNotificationPermission(hasPermission);

    if (!hasPermission) {
      // Solicitar permisos si no los tiene
      const {status} = await Notifications.requestPermissionsAsync();
      setNotificationPermission(status === 'granted');
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
    }
  };

  const scheduleNotification = async () => {
    if (!remindersEnabled || !notificationPermission) {
      return;
    }

    try {
      // Cancelar notificaciones anteriores
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Programar notificación diaria
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ È ora di praticare!',
          body: 'Non dimenticare di fare pratica oggi. Il tuo tutor ti aspetta!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: selectedTime.getHours(),
          minute: selectedTime.getMinutes(),
          repeats: true,
        } as any,
      });

      // Guardar preferencias
      await updatePreferences({
        remindersEnabled: true,
        reminderTime: `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`,
      });
    } catch (error) {
      console.error('[OnboardingStepEight] Error programando notificación:', error);
    }
  };

  const handleReminderToggle = async (enabled: boolean) => {
    setRemindersEnabled(enabled);

    if (enabled) {
      // Verificar permisos antes de activar
      if (!notificationPermission) {
        const {status} = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          setRemindersEnabled(false);
          Alert.alert(
            'Permessi necessari',
            'Per ricevere promemoria, devi consentire le notifiche nelle impostazioni del dispositivo.',
          );
          return;
        }
        setNotificationPermission(true);
      }
      // Programar notificación
      await scheduleNotification();
    } else {
      // Cancelar notificaciones
      await Notifications.cancelAllScheduledNotificationsAsync();
      await updatePreferences({
        remindersEnabled: false,
      });
    }
  };

  const handleContinue = useCallback(async () => {
    // Si los recordatorios están habilitados, programar la notificación
    if (remindersEnabled && notificationPermission) {
      await scheduleNotification();
    }

    // Navegar a la siguiente pantalla (selección de tutor)
    navigation.navigate('OnboardingStepNine');
  }, [navigation, remindersEnabled, notificationPermission, selectedTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <BrandBackground>
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={['#0B3D4D', '#60CB58']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[styles.progressFill, {width: `${progress}%`}]}>
            <View />
          </LinearGradient>
        </View>
      </View>

      <Block
        scroll
        color="transparent"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Block align="center" marginBottom={sizes.l}>
          <Block
            color="rgba(11,61,77,0.1)"
            radius={60}
            width={120}
            height={120}
            align="center"
            justify="center"
            marginBottom={sizes.md}>
            <Ionicons name="notifications" size={48} color={colors.primary} />
          </Block>
          <Text h4 center color="#334155" marginBottom={sizes.sm}>
            Promemoria quotidiani
          </Text>
          <Text center size={sizes.text} color="rgba(51,65,85,0.7)">
            Ricevi un promemoria ogni giorno per non dimenticare di praticare
          </Text>
        </Block>

        <Block
          color={colors.card}
          radius={sizes.cardRadius}
          padding={sizes.md}
          style={styles.settingsCard}>
          {/* Toggle de recordatorios */}
          <Block
            row
            justify="space-between"
            align="center"
            marginBottom={remindersEnabled ? sizes.md : 0}>
            <Block flex={1}>
              <Text h5 semibold color={colors.text} marginBottom={sizes.xs / 2}>
                Attiva promemoria
              </Text>
              <Text size={12} color={colors.text} opacity={0.6}>
                Ricevi notifiche per ricordarti di praticare
              </Text>
            </Block>
            <Switch
              checked={remindersEnabled}
              onPress={handleReminderToggle}
            />
          </Block>

          {/* Selector de hora (solo si los recordatorios están activados) */}
          {remindersEnabled && (
            <Block>
              <Text semibold color={colors.text} marginBottom={sizes.sm}>
                Orario del promemoria
              </Text>
              <Pressable
                onPress={() => setShowTimePicker(true)}
                style={[
                  styles.timeButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.primary,
                  },
                ]}>
                <Ionicons name="time-outline" size={24} color={colors.primary} />
                <Text h4 semibold color={colors.primary} marginLeft={sizes.sm}>
                  {formatTime(selectedTime)}
                </Text>
              </Pressable>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}

              {Platform.OS === 'ios' && showTimePicker && (
                <Block row justify="flex-end" marginTop={sizes.sm}>
                  <Button
                    onPress={() => setShowTimePicker(false)}
                    style={styles.doneButton}>
                    <Text semibold color={colors.primary}>
                      Fatto
                    </Text>
                  </Button>
                </Block>
              )}
            </Block>
          )}

          {!notificationPermission && remindersEnabled && (
            <Block
              color="rgba(255,193,7,0.1)"
              radius={8}
              padding={sizes.sm}
              marginTop={sizes.md}>
              <Block row align="center">
                <Ionicons name="warning-outline" size={20} color="#FFC107" />
                <Text size={12} color="#FFC107" marginLeft={sizes.xs}>
                  Abilita le notifiche nelle impostazioni del dispositivo
                </Text>
              </Block>
            </Block>
          )}
        </Block>

        <Block marginTop={sizes.xl} marginBottom={sizes.m}>
          <BrandActionButton
            label={t('common.continue') || 'Continua'}
            onPress={handleContinue}
          />
        </Block>
      </Block>
    </BrandBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  progressTrack: {
    height: 3,
    width: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  settingsCard: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default OnboardingStepEight;
