import React, {useMemo} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

import {useTheme} from '../hooks';
import Block from './Block';
import Text from './Text';

interface BrandProgressBarProps {
  value: number;
  total?: number;
  label?: string;
  showValue?: boolean;
  style?: StyleProp<ViewStyle>;
  gradient?: readonly string[];
}

// Barra de progreso con gradiente de marca y etiqueta opcional
const BrandProgressBar = ({
  value,
  total = 100,
  label,
  showValue = true,
  style,
  gradient,
}: BrandProgressBarProps) => {
  const {colors, gradients, sizes} = useTheme();
  const normalized = Math.min(1, Math.max(0, value / total));
  const percentage = Math.round(normalized * 100);
  const barGradient = useMemo(() => {
    const grad = gradient ?? gradients.primary ?? ['#0B3D4D', '#60CB58'];
    // Convertir a array mutable y asegurar que tenga al menos 2 elementos
    return grad ? [...grad] : ['#0B3D4D', '#60CB58'];
  }, [gradient, gradients.primary]);

  const progressWidth = useMemo(() => `${percentage}%`, [percentage]);

  return (
    <Block style={style}>
      {label ? (
        <Block row justify="space-between" marginBottom={sizes.xs}>
          <Text size={sizes.p - 2} color="rgba(255,255,255,0.76)">
            {label}
          </Text>
          {showValue ? (
            <Text semibold color={colors.white}>
              {percentage}%
            </Text>
          ) : null}
        </Block>
      ) : null}
      <Block
        height={10}
        radius={sizes.sm}
        color="rgba(255,255,255,0.12)"
        style={{overflow: 'hidden'}}>
        <LinearGradient
          colors={barGradient as [string, string, ...string[]]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={{
            width: progressWidth,
            height: '100%',
          } as ViewStyle}
        />
      </Block>
    </Block>
  );
};

export default BrandProgressBar;

