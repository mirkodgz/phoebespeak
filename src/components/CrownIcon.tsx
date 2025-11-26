import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Path, Text as SvgText} from 'react-native-svg';

interface CrownIconProps {
  size?: number;
  color?: string;
}

export const CrownIcon: React.FC<CrownIconProps> = ({
  size = 24,
  color = '#FFFFFF',
}) => {
  // Calcular el tamaño del texto basado en el tamaño del icono
  const textSize = size * 0.4;
  const crownHeight = size * 0.6; // Reducido para acercar el texto
  const strokeWidth = size * 0.08; // Stroke más grueso para hacerlo más llamativo
  
  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      <Svg width={size} height={crownHeight} viewBox="0 0 24 24" fill="none">
        {/* Corona estilizada */}
        <Path
          d="M12 2L9 8L2 7L4 13L12 11L20 13L22 7L15 8L12 2Z"
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Base de la corona */}
        <Path
          d="M4 13L12 11L20 13"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      {/* Texto PRO */}
      <Text
        style={{
          fontSize: textSize,
          fontWeight: '800',
          color: color,
          marginTop: -size * 0.05, // Espacio negativo para acercar más
          letterSpacing: 1,
          lineHeight: textSize * 1.1,
        }}>
        PRO
      </Text>
    </View>
  );
};

export default CrownIcon;

