import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';

import {Block, Text, CrownIcon, Button} from '../components';
import {useTheme} from '../hooks';

const ProPlans = () => {
  const {sizes, colors} = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      {/* Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 5),
          paddingLeft: sizes.padding,
          paddingRight: sizes.padding / 4,
          paddingBottom: sizes.sm / 4,
          backgroundColor: '#F5F5F5',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            minHeight: 60,
          }}>
          <TouchableOpacity
            onPress={() => {
              console.log('[ProPlans] Close button pressed');
              if (navigation.canGoBack()) {
                console.log('[ProPlans] Can go back, calling goBack()');
                navigation.goBack();
              } else {
                console.log('[ProPlans] Cannot go back, navigating to ProfileMain');
                navigation.navigate('ProfileMain');
              }
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}>
            <Ionicons name="close" size={28} color={colors.text || '#334155'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sizes.padding,
          paddingTop: sizes.md,
          paddingBottom: sizes.padding,
        }}>
        {/* Header con icono y descripción */}
        <Block align="center" marginBottom={sizes.sm}>
          <Block
            color="rgba(96,203,88,0.15)"
            radius={20}
            width={100}
            height={100}
            align="center"
            justify="center"
            marginBottom={sizes.sm / 2}>
            <CrownIcon size={70} color={colors.secondary} />
          </Block>
          <Text h3 semibold color={colors.text} marginBottom={sizes.xs / 4}>
            Sblocca tutte le funzionalità
          </Text>
        </Block>

        {/* Opción Mensual */}
        <TouchableOpacity
          onPress={() => {
            // Procesar suscripción mensual
            console.log('Suscripción mensual seleccionada');
          }}
          activeOpacity={0.7}
          style={{marginBottom: sizes.sm / 2}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: sizes.md,
              borderWidth: 1.5,
              borderColor: 'rgba(11,61,77,0.15)',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(11,61,77,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: sizes.sm,
                }}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View style={{flex: 1}}>
                <Text style={{fontSize: sizes.p, fontWeight: '600', color: colors.text, marginBottom: 2}}>
                  Mensile
                </Text>
                <Text style={{fontSize: sizes.p - 3, color: colors.text, opacity: 0.6}}>
                  Fatturazione mensile
                </Text>
              </View>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={{fontSize: sizes.p * 1.3, fontWeight: '700', color: colors.primary}}>
                19 €
              </Text>
              <Text style={{fontSize: sizes.p - 4, color: colors.text, opacity: 0.5}}>
                /mese
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Opción 6 Meses - Destacada */}
        <TouchableOpacity
          onPress={() => {
            // Procesar suscripción 6 meses
            console.log('Suscripción 6 meses seleccionada');
          }}
          activeOpacity={0.7}
          style={{marginBottom: sizes.sm / 2}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(96,203,88,0.08)',
              borderRadius: 16,
              padding: sizes.md,
              borderWidth: 2,
              borderColor: colors.secondary,
              shadowColor: colors.secondary,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0}}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(96,203,88,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: sizes.sm,
                  flexShrink: 0,
                }}>
                <Ionicons name="trophy" size={20} color={colors.secondary} />
              </View>
              <View style={{flex: 1, minWidth: 0, marginRight: sizes.sm}}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap'}}>
                  <Text style={{fontSize: sizes.p, fontWeight: '600', color: colors.text, marginRight: 6}}>
                    6 Mesi
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.secondary,
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      flexShrink: 0,
                    }}>
                    <Text style={{fontSize: 9, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5}}>
                      POPOLARE
                    </Text>
                  </View>
                </View>
                <Text style={{fontSize: sizes.p - 3, color: colors.secondary, fontWeight: '500'}}>
                  Risparmia il 13%
                </Text>
              </View>
            </View>
            <View style={{alignItems: 'flex-end', flexShrink: 0, marginLeft: sizes.xs}}>
              <View style={{flexDirection: 'row', alignItems: 'baseline', marginBottom: 2}}>
                <Text
                  style={{
                    fontSize: sizes.p - 4,
                    color: colors.text,
                    opacity: 0.5,
                    textDecorationLine: 'line-through',
                    marginRight: 4,
                  }}>
                  114 €
                </Text>
                <Text style={{fontSize: sizes.p * 1.3, fontWeight: '700', color: colors.secondary}}>
                  99 €
                </Text>
              </View>
              <Text style={{fontSize: sizes.p - 4, color: colors.text, opacity: 0.6}}>
                16.50 €/mese
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Opción 1 Año */}
        <TouchableOpacity
          onPress={() => {
            // Procesar suscripción 1 año
            console.log('Suscripción 1 año seleccionada');
          }}
          activeOpacity={0.7}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: sizes.md,
              borderWidth: 1.5,
              borderColor: 'rgba(11,61,77,0.15)',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255,165,0,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: sizes.sm,
                }}>
                <Ionicons name="star" size={20} color="#FFA500" />
              </View>
              <View style={{flex: 1}}>
                <Text style={{fontSize: sizes.p, fontWeight: '600', color: colors.text, marginBottom: 2}}>
                  1 Anno
                </Text>
                <Text style={{fontSize: sizes.p - 3, color: colors.text, opacity: 0.6}}>
                  Risparmia il 17%
                </Text>
              </View>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <View style={{flexDirection: 'row', alignItems: 'baseline', marginBottom: 2}}>
                <Text
                  style={{
                    fontSize: sizes.p - 4,
                    color: colors.text,
                    opacity: 0.5,
                    textDecorationLine: 'line-through',
                    marginRight: 4,
                  }}>
                  228 €
                </Text>
                <Text style={{fontSize: sizes.p * 1.3, fontWeight: '700', color: colors.primary}}>
                  199 €
                </Text>
              </View>
              <Text style={{fontSize: sizes.p - 4, color: colors.text, opacity: 0.6}}>
                16.58 €/mese
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProPlans;

