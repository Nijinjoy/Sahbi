import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
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
import { CATEGORY_STYLES } from '../data/categoryStyles';
import { CATEGORIES } from '../data/listings';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const ORBIT_SIZE = 300;
const BUBBLE_SIZE = 66;
const ORBIT_RADIUS = (ORBIT_SIZE - BUBBLE_SIZE) / 2;
const CORE_SIZE = 128;
const SPIN_MS = 40000;
const GOLD_DEEP = '#A87F3D';

const BUBBLES = CATEGORIES.filter(c => c.name !== 'Other').map(c => ({
  name: c.name,
  photo: CATEGORY_STYLES[c.name].photo,
}));

const TRUST_POINTS = [
  {
    label: 'Verified sellers',
    icon: require('../assets/icons/profile/shield.png'),
  },
  { label: 'Chat & meet', icon: require('../assets/icons/profile/chat.png') },
  { label: 'Fair prices', icon: require('../assets/icons/profile/tag.png') },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then(reduceMotion => {
      if (cancelled || reduceMotion) {
        return;
      }
      loops.push(
        Animated.loop(
          Animated.timing(spin, {
            toValue: 1,
            duration: SPIN_MS,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, {
              toValue: 1,
              duration: 2400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(pulse, {
              toValue: 0,
              duration: 2400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ),
      );
      loops.forEach(loop => loop.start());
    });
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return () => {
      cancelled = true;
      loops.forEach(loop => loop.stop());
    };
  }, [spin, pulse, enter]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const counterRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  const knotScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.06],
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
      <StatusBar barStyle="dark-content" />
      <View style={[styles.blob, styles.blobTop]} pointerEvents="none" />
      <View style={[styles.blob, styles.blobBottom]} pointerEvents="none" />

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
        <View style={styles.orbitBox}>
          <View style={styles.orbitTrack} />

          <Animated.View style={[styles.orbit, { transform: [{ rotate }] }]}>
            {BUBBLES.map((bubble, i) => {
              const angle = (i / BUBBLES.length) * 2 * Math.PI - Math.PI / 2;
              const x = ORBIT_RADIUS * Math.cos(angle);
              const y = ORBIT_RADIUS * Math.sin(angle);
              return (
                <Animated.View
                  key={bubble.name}
                  style={[
                    styles.bubble,
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                        { rotate: counterRotate },
                      ],
                    },
                  ]}
                >
                  <Image source={bubble.photo} style={styles.bubblePhoto} />
                </Animated.View>
              );
            })}
          </Animated.View>

          <Animated.View
            style={[
              styles.halo,
              { opacity: haloOpacity, transform: [{ scale: haloScale }] },
            ]}
          />
          <View style={styles.core}>
            <Animated.Image
              source={require('../assets/welcome_knot.png')}
              style={[styles.knot, { transform: [{ scale: knotScale }] }]}
            />
          </View>
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

        <View style={styles.trustRow}>
          {TRUST_POINTS.map(point => (
            <View key={point.label} style={styles.trustChip}>
              <Image source={point.icon} style={styles.trustIcon} />
              <Text style={styles.trustText}>{point.label}</Text>
            </View>
          ))}
        </View>

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
    backgroundColor: colors.brandIvory,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 380,
    height: 380,
    top: -150,
    right: -150,
    backgroundColor: colors.brandGold,
    opacity: 0.18,
  },
  blobBottom: {
    width: 300,
    height: 300,
    top: '42%',
    left: -190,
    backgroundColor: colors.brandMint,
    opacity: 0.12,
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
    borderRadius: 8,
  },
  brand: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.brandForest,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitBox: {
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitTrack: {
    position: 'absolute',
    width: ORBIT_RADIUS * 2,
    height: ORBIT_RADIUS * 2,
    borderRadius: ORBIT_RADIUS,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(168,127,61,0.45)',
  },
  orbit: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: colors.surface,
    shadowColor: colors.brandForest,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  bubblePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: BUBBLE_SIZE / 2,
  },
  halo: {
    position: 'absolute',
    width: CORE_SIZE + 36,
    height: CORE_SIZE + 36,
    borderRadius: CORE_SIZE,
    backgroundColor: colors.brandForest,
  },
  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
    backgroundColor: colors.brandForest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandForest,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  knot: {
    width: 84,
    height: 84,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fonts.extraBold,
    color: colors.brandForest,
  },
  titleAccent: {
    color: GOLD_DEEP,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(168,127,61,0.45)',
  },
  trustIcon: {
    width: 14,
    height: 14,
    tintColor: GOLD_DEEP,
  },
  trustText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.brandForest,
  },
  button: {
    marginTop: 24,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandForest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandForest,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonText: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.brandIvory,
  },
  pressed: {
    opacity: 0.85,
  },
});
