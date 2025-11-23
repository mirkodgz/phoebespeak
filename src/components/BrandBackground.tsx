import React from 'react';
import {StyleSheet, View} from 'react-native';

import Block from './Block';

interface BrandBackgroundProps {
  children: React.ReactNode;
}

// Contenedor de fondo global con color sólido
const BrandBackground = ({children}: BrandBackgroundProps) => {
  return (
    <View style={styles.container}>
      <Block safe color="transparent" style={{flex: 1}}>
        {children}
      </Block>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
});

export default BrandBackground;

