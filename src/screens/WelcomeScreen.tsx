import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const CHIPS = [
  {
    label: '☕  Coffee',
    left: '6%',
    top: '22%',
    bg: colors.primary,
    fg: colors.secondary,
  },
  {
    label: '⚽  Football',
    left: '58%',
    top: '14%',
    bg: colors.accentCoral,
    fg: '#FFFFFF',
  },
  {
    label: '🎨  Art walks',
    left: '62%',
    top: '66%',
    bg: '#FFFFFF',
    fg: colors.secondary,
  },
  {
    label: '🌄  Weekend trips',
    left: '4%',
    top: '72%',
    bg: colors.accentTeal,
    fg: '#FFFFFF',
  },
] as const;

const DOTS = [
  { left: '24%', top: '40%', size: 12, color: colors.primary },
  { left: '78%', top: '42%', size: 10, color: '#FFFFFF' },
  { left: '44%', top: '84%', size: 14, color: colors.accentCoral },
  { left: '36%', top: '10%', size: 8, color: '#FFFFFF' },
] as const;

const RING_SIZES = [140, 230, 320];

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    floatLoop.start();
    return () => {
      pulseLoop.stop();
      floatLoop.stop();
    };
  }, [pulse, float]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 2.4],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });
  const floatY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const floatYReverse = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { paddingTop: insets.top }]}>
        <View style={styles.radar}>
          {RING_SIZES.map(size => (
            <View
              key={size}
              style={[
                styles.ring,
                { width: size, height: size, borderRadius: size / 2 },
              ]}
            />
          ))}
          <Animated.View
            style={[
              styles.pulse,
              { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
            ]}
          />
          <View style={styles.logoBadge}>
            <Image
              source={require('../assets/smile.png')}
              style={styles.smile}
              resizeMode="contain"
              accessibilityLabel="Sahbi"
            />
          </View>
        </View>

        {DOTS.map((dot, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                left: dot.left,
                top: dot.top,
                width: dot.size,
                height: dot.size,
                borderRadius: dot.size / 2,
                backgroundColor: dot.color,
              },
            ]}
          />
        ))}

        {CHIPS.map((chip, index) => (
          <Animated.View
            key={chip.label}
            style={[
              styles.chip,
              {
                left: chip.left,
                top: chip.top,
                backgroundColor: chip.bg,
                transform: [
                  { translateY: index % 2 === 0 ? floatY : floatYReverse },
                ],
              },
            ]}
          >
            <Text style={[styles.chipText, { color: chip.fg }]}>
              {chip.label}
            </Text>
          </Animated.View>
        ))}
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />

        <View style={styles.intro}>
          <View style={styles.badge}>
            <View style={styles.liveDot} />
            <Text style={styles.badgeText}>People nearby are making plans</Text>
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Make friends{'\n'}
            <Text style={styles.titleAccent}>around the corner</Text>
          </Text>
          <Text style={styles.subtitle}>
            Meet people who share your vibe — from morning coffee to weekend
            adventures.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Get started"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  hero: {
    flex: 11,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  radar: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  pulse: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
  },
  logoBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  smile: {
    width: 84,
    height: 68,
  },
  dot: {
    position: 'absolute',
  },
  chip: {
    position: 'absolute',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  sheet: {
    flex: 9,
    backgroundColor: colors.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  intro: {
    gap: 12,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  titleAccent: {
    color: colors.accentCoral,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  actions: {
    paddingBottom: 8,
  },
});
