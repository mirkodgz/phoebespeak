import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';

import {useTheme} from '../hooks';
import Button from './Button';
import Text from './Text';

type BrandChipTone = 'brand' | 'accent' | 'neutral' | 'outline';

interface BrandChipProps {
  label: string;
  tone?: BrandChipTone;
  icon?: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// Chip/badge reutilizable con esquema cromático de la marca
const BrandChip = ({
  label,
  tone = 'brand',
  icon,
  active = false,
  onPress,
  style,
}: BrandChipProps) => {
  const {colors, gradients, sizes} = useTheme();

  const toneStyles: Record<
    BrandChipTone,
    {background: typeof gradients.primary; borderColor: string; textColor: string}
  > = {
    brand: {
      background: gradients.primary,
      borderColor: 'transparent',
      textColor: String(colors.white || '#FFFFFF'),
    },
    accent: {
      background: gradients.secondary,
      borderColor: 'transparent',
      textColor: String(colors.white || '#FFFFFF'),
    },
    neutral: {
      background: undefined,
      borderColor: 'rgba(255,255,255,0.18)',
      textColor: 'rgba(255,255,255,0.76)',
    },
    outline: {
      background: undefined,
      borderColor: 'rgba(11,61,77,0.45)',
      textColor: String(colors.primary || '#0B3D4D'),
    },
  };

  const {background, borderColor, textColor} = toneStyles[tone];
  const backgroundColor =
    !background && tone !== 'outline' ? 'rgba(255,255,255,0.12)' : 'transparent';

  return (
    <Button
      onPress={onPress}
      gradient={background}
      style={[
        {
          borderRadius: sizes.sm,
          paddingHorizontal: sizes.sm,
          paddingVertical: sizes.xs,
          borderWidth: 1,
          borderColor: active ? colors.white : borderColor,
          backgroundColor: background ? 'transparent' : backgroundColor,
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}>
      {icon ? <>{icon}</> : null}
      <Text
        semibold
        size={sizes.p - 2}
        color={active ? colors.white : textColor}
        marginLeft={icon ? sizes.xs : 0}>
        {label}
      </Text>
    </Button>
  );
};

export default BrandChip;

