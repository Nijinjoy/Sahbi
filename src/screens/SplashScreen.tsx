import { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Props = {
  onFinish?: () => void;
  duration?: number;
};

export function SplashScreen({ onFinish, duration = 3000 }: Props) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!onFinish) {
      return;
    }
    const timer = setTimeout(onFinish, duration);
    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require('../assets/splash_logo.png')}
        style={styles.logo}
        accessibilityIgnoresInvertColors
      />
      <Text style={styles.appName} accessibilityRole="header">
        Sahbi
      </Text>
      <Text style={[styles.tagline, { bottom: insets.bottom + 40 }]}>
        Buy & sell pre-loved items in the UAE
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandForest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
  appName: {
    marginTop: 20,
    fontSize: 40,
    lineHeight: 52,
    letterSpacing: 0.5,
    fontFamily: fonts.extraBold,
    color: colors.textOnSecondary,
  },
  tagline: {
    position: 'absolute',
    left: 24,
    right: 24,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textOnSecondary,
  },
});
