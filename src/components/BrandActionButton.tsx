import React from 'react';
import {ColorValue, StyleProp, ViewStyle} from 'react-native';

import {useTheme} from '../hooks/';
import Button from './Button';
import Text from './Text';

interface BrandActionButtonProps {
  label: string;
  onPress: () => void;
  backgroundColor?: ColorValue;
  disabledBackgroundColor?: ColorValue;
  textColor?: ColorValue;
  disabledTextColor?: ColorValue;
  disabled?: boolean;
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  shadow?: boolean;
}

// Botón de acción principal reutilizable para CTA de onboarding y autenticación
const BrandActionButton = ({
  label,
  onPress,
  backgroundColor,
  disabledBackgroundColor,
  textColor,
  disabledTextColor,
  disabled = false,
  uppercase = true,
  style,
  disabledStyle,
  shadow = true,
}: BrandActionButtonProps) => {
  const {sizes, colors} = useTheme();

  const baseColor = backgroundColor ?? colors.white;
  const disabledColor =
    disabledBackgroundColor ?? 'rgba(255,255,255,0.55)';
  const baseTextColor = textColor ?? colors.primary;
  const disabledLabelColor =
    disabledTextColor ?? 'rgba(11,61,77,0.55)';

  return (
    <Button
      color={disabled ? disabledColor : baseColor}
      disabled={disabled}
      onPress={onPress}
      shadow={shadow}
      style={[
        {
          borderRadius: sizes.sm * 1.4,
          paddingVertical: sizes.s,
        },
        style,
        disabled ? disabledStyle ?? {opacity: 0.85} : null,
      ]}>
      <Text
        bold
        color={disabled ? disabledLabelColor : baseTextColor}
        transform={uppercase ? 'uppercase' : undefined}>
        {label}
      </Text>
    </Button>
  );
};

export default BrandActionButton;

