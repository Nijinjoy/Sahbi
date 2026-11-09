import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  onPress: () => void;
  variant?: 'circle' | 'arrow';
};

export function BackButton({ onPress, variant = 'circle' }: Props) {
  if (variant === 'arrow') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        style={({ pressed }) => [
          styles.arrowButton,
          pressed && styles.arrowButtonPressed,
        ]}
      >
        <View style={styles.arrow}>
          <View style={styles.arrowHead} />
          <View style={styles.arrowShaft} />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      style={styles.button}
    >
      <View style={styles.chevron} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  chevron: {
    width: 12,
    height: 12,
    marginLeft: 4,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.background,
    transform: [{ rotate: '45deg' }],
  },
  arrowButton: {
    width: 40,
    height: 44,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonPressed: {
    backgroundColor: colors.surface,
  },
  arrow: {
    width: 20,
    height: 16,
    justifyContent: 'center',
  },
  arrowShaft: {
    position: 'absolute',
    top: 6.75,
    left: 1,
    right: 0,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: colors.secondary,
  },
  arrowHead: {
    position: 'absolute',
    top: 2.5,
    left: 2,
    width: 11,
    height: 11,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.secondary,
    transform: [{ rotate: '45deg' }],
  },
});
