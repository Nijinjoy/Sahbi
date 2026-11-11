import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const RING_SIZE = 260;

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const spin = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    spinLoop.start();
    breatheLoop.start();
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return () => {
      spinLoop.stop();
      breatheLoop.stop();
    };
  }, [spin, breathe, enter]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const leafScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const glowOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.16, 0.28],
  });
  const contentStyle = {
    opacity: enter,
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  const goToLogin = () => navigation.navigate('Login');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.blob, styles.blobTop]} pointerEvents="none" />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Image
          source={require('../assets/app_icon.png')}
          style={styles.headerIcon}
          accessibilityLabel="Sahbi"
        />
        <Text style={styles.brand}>Sahbi</Text>
      </View>

      <View
        style={styles.hero}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={styles.ringBox}>
          <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
          <Animated.Image
            source={require('../assets/welcome_ring.png')}
            style={[styles.ring, { transform: [{ rotate }] }]}
          />
          <Animated.Image
            source={require('../assets/welcome_leaf.png')}
            style={[styles.leaf, { transform: [{ scale: leafScale }] }]}
          />
        </View>
      </View>

      <Animated.View
        style={[
          styles.content,
          contentStyle,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <Text style={styles.title} accessibilityRole="header">
          Give every item a{'\n'}
          <Text style={styles.titleAccent}>second life</Text>
        </Text>
        <Text style={styles.subtitle}>
          Buy, sell and exchange pre-loved things near you.
        </Text>

        <Pressable
          onPress={goToLogin}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Get started</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandNavy,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 420,
    height: 420,
    top: -160,
    right: -160,
    backgroundColor: colors.brandTurquoise,
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  headerIcon: {
    width: 32,
    height: 32,
  },
  brand: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.textOnSecondary,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBox: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: RING_SIZE * 0.62,
    height: RING_SIZE * 0.62,
    borderRadius: RING_SIZE,
    backgroundColor: colors.brandTurquoise,
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  leaf: {
    width: 104,
    height: 104,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fonts.extraBold,
    color: colors.textOnSecondary,
  },
  titleAccent: {
    color: colors.brandMint,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.72)',
  },
  button: {
    marginTop: 32,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandEmerald,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandEmerald,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonText: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.brandNavy,
  },
  pressed: {
    opacity: 0.8,
  },
});
