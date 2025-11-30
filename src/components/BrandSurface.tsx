import React from 'react';
import {StyleProp, ViewStyle, TouchableOpacity} from 'react-native';

import {useTheme} from '../hooks';
import Block from './Block';

type BrandSurfaceTone =
  | 'brand'
  | 'accent'
  | 'neutral'
  | 'glass'
  | 'success'
  | 'warning';

interface BrandSurfaceProps {
  children: React.ReactNode;
  tone?: BrandSurfaceTone;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
}

// Contenedor reutilizable con estilos coherentes para paneles y tarjetas
const BrandSurface = ({
  children,
  tone = 'brand',
  padding,
  style,
  onPress,
  disabled,
}: BrandSurfaceProps) => {
  const {colors, gradients, sizes} = useTheme();

  const basePadding = padding ?? sizes.md;

  const toneConfig: Record<
    BrandSurfaceTone,
    {gradient?: typeof gradients.primary; color?: string; borderColor?: string}
  > = {
    brand: {gradient: gradients.primary},
    accent: {gradient: gradients.secondary},
    neutral: {color: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)'},
    glass: {
      color: 'rgba(11,61,77,0.3)',
      borderColor: 'rgba(255,255,255,0.18)',
    },
    success: {gradient: gradients.success},
    warning: {gradient: gradients.warning},
  };

  const {gradient, color, borderColor} = toneConfig[tone];

  const content = (
    <Block
      card
      color={gradient ? 'transparent' : color ?? colors.card}
      gradient={gradient}
      padding={basePadding}
      style={[
        {
          borderRadius: sizes.cardRadius,
          borderWidth: borderColor ? 1 : 0,
          borderColor: borderColor ?? 'transparent',
          overflow: 'hidden',
        },
        style,
      ]}>
      {children}
    </Block>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled}
        onPress={onPress}
        style={{borderRadius: sizes.cardRadius}}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default BrandSurface;

