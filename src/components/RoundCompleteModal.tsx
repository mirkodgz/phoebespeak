import React from 'react';
import {Modal, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';

import {Block, Text} from './';
import {useTheme} from '../hooks';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface RoundCompleteModalProps {
  visible: boolean;
  roundNumber: number;
  roundTitle: string;
  onContinue: () => void;
  isLastRound?: boolean;
}

const RoundCompleteModal = ({
  visible,
  roundNumber,
  roundTitle,
  onContinue,
  isLastRound = false,
}: RoundCompleteModalProps) => {
  const {sizes, colors} = useTheme();
  const insets = useSafeAreaInsets();
  
  const modalWidth = Math.min(SCREEN_WIDTH - sizes.padding * 2, 400);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinue}>
      <Block
        style={[styles.overlay, {paddingTop: insets.top, paddingBottom: insets.bottom}]}
        justify="center"
        align="center"
        paddingHorizontal={sizes.padding}>
        <Block
          color="#FFFFFF"
          radius={16}
          padding={sizes.md}
          style={[styles.modalContent, {width: modalWidth}]}>
          <Block align="center" marginBottom={sizes.md}>
            <Block
              color="#60CB58"
              radius={40}
              width={70}
              height={70}
              align="center"
              justify="center"
              marginBottom={sizes.sm}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </Block>
            <Text h5 semibold color={colors.text} center marginBottom={sizes.xs / 2}>
              Round {roundNumber} Completed!
            </Text>
            <Text size={sizes.p - 2} color={colors.text} opacity={0.7} center>
              {roundTitle}
            </Text>
          </Block>

          <Text 
            size={sizes.p - 1} 
            color={colors.text} 
            center 
            marginBottom={sizes.md}
            style={styles.descriptionText}>
            {isLastRound
              ? 'Congratulations! You have completed all rounds of the interview.'
              : 'Great job! Ready to continue with the next round?'}
          </Text>

          <TouchableOpacity
            onPress={onContinue}
            activeOpacity={0.8}
            style={styles.button}>
            <LinearGradient
              colors={['#0B3D4D', '#60CB58']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.gradient}>
              <Text h5 semibold white center>
                {isLastRound ? 'Finish Interview' : 'Continue to Next Round'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Block>
      </Block>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  descriptionText: {
    lineHeight: 20,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RoundCompleteModal;

