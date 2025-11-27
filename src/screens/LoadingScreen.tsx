import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {useTheme} from '../hooks';
import {Text, BrandBackground} from '../components';

const LoadingScreen = () => {
  const {colors, sizes} = useTheme();

  return (
    <BrandBackground>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          h5
          semibold
          center
          color={colors.primary}
          marginTop={sizes.md}
          style={styles.text}>
          Caricamento...
        </Text>
      </View>
    </BrandBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    opacity: 0.8,
  },
});

export default LoadingScreen;

