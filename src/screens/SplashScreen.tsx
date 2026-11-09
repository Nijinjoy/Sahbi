import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
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
      <Image
        source={require('../assets/splash_logo.png')}
        style={styles.logo}
        accessibilityLabel="Sahbi"
      />
      <Text style={[styles.tagline, { bottom: insets.bottom + 40 }]}>
        Find your people in the UAE
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 240,
    height: 280,
  },
  tagline: {
    position: 'absolute',
    left: 24,
    right: 24,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textOnPrimary,
  },
});
