import { Alert, Image, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function NotificationBell() {
  return (
    <Pressable
      onPress={() => Alert.alert('Notifications', 'You’re all caught up.')}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      style={({ pressed }) => [styles.bell, pressed && styles.pressed]}
    >
      <Image
        source={require('../assets/icons/profile/bell.png')}
        style={styles.icon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(168,127,61,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandForest,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: colors.brandForest,
  },
});
