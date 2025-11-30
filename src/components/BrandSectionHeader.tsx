import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';

import {useTheme} from '../hooks';
import Block from './Block';
import Text from './Text';

interface BrandSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

// Encabezado reutilizable para secciones con título, subtítulo e iconografía
const BrandSectionHeader = ({
  title,
  subtitle,
  icon,
  action,
  containerStyle,
}: BrandSectionHeaderProps) => {
  const {colors, sizes} = useTheme();

  return (
    <Block
      row
      align="center"
      justify="space-between"
      marginBottom={sizes.sm}
      style={containerStyle}>
      <Block row align="center" flex={1}>
        {icon ? (
          <Block
            flex={0}
            align="center"
            justify="center"
            width={36}
            height={36}
            radius={12}
            color="rgba(255,255,255,0.12)"
            marginRight={sizes.sm}>
            {icon}
          </Block>
        ) : null}
        <Block flex={1}>
          <Text h5 semibold color={colors.white}>
            {title}
          </Text>
          {subtitle ? (
            <Text size={sizes.p - 2} color="rgba(255,255,255,0.7)">
              {subtitle}
            </Text>
          ) : null}
        </Block>
      </Block>
      {action ? <Block flex={0}>{action}</Block> : null}
    </Block>
  );
};

export default BrandSectionHeader;

