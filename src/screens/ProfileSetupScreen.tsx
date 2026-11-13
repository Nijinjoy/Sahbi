import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { updateProfile } from '../state/profile';
import {
  refreshProfileLocation,
  requestLocationPermission,
} from '../utils/location';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const NAME_MAX = 30;
const GOLD_DEEP = '#A87F3D';

type LocationState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'ok'; label: string }
  | { status: 'outside'; label: string | null }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable' };

function LocationPin({ color }: { color: string }) {
  return (
    <View style={[styles.pin, { backgroundColor: color }]}>
      <View style={styles.pinDot} />
    </View>
  );
}

export function ProfileSetupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    status: 'idle',
  });
  const mounted = useRef(true);

  const locate = useCallback(async () => {
    setLocation({ status: 'locating' });
    let permission: Awaited<ReturnType<typeof requestLocationPermission>>;
    try {
      permission = await requestLocationPermission();
    } catch (error) {
      console.warn(error);
      permission = 'denied';
    }
    if (permission !== 'granted') {
      if (mounted.current) {
        setLocation({ status: 'denied', canAskAgain: permission === 'denied' });
      }
      return;
    }

    let next: LocationState;
    try {
      const result = await refreshProfileLocation();
      if (result.status === 'ok') {
        next = {
          status: 'ok',
          label: result.area ? `${result.area}, ${result.city}` : result.city,
        };
      } else if (result.status === 'outside') {
        next = { status: 'outside', label: result.area ?? result.address };
      } else if (result.status === 'denied') {
        next = { status: 'denied', canAskAgain: result.canAskAgain };
      } else {
        next = { status: 'unavailable' };
      }
    } catch (error) {
      console.warn(error);
      next = { status: 'unavailable' };
    }
    if (mounted.current) {
      setLocation(next);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const trimmedName = name.trim();
  const valid = trimmedName.length >= 2;

  const finish = () => {
    if (!valid) {
      return;
    }
    // A lookup still in flight keeps running and saves to the profile itself.
    updateProfile({ name: trimmedName });
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  const disabled = !valid;

  const locationView = (() => {
    switch (location.status) {
      case 'idle':
        return {
          title: 'Use my current location',
          detail: 'Tap to find your area',
          action: { label: 'Locate', onPress: locate },
        };
      case 'locating':
        return {
          title: 'Finding your area…',
          detail: 'Used to show items near you',
          action: null,
        };
      case 'ok':
        return {
          title: location.label,
          detail: 'Used to show items near you',
          action: { label: 'Refresh', onPress: locate },
        };
      case 'outside':
        return {
          title: location.label ?? 'Outside the UAE',
          detail: 'Sahbi is only in the UAE for now',
          action: { label: 'Retry', onPress: locate },
        };
      case 'denied':
        return location.canAskAgain
          ? {
              title: 'Location is off',
              detail: 'Allow it to see items near you',
              action: { label: 'Allow', onPress: locate },
            }
          : {
              title: 'Location is off',
              detail: 'Turn it on in Settings to see items near you',
              action: { label: 'Settings', onPress: Linking.openSettings },
            };
      case 'unavailable':
        return {
          title: 'Couldn’t find your area',
          detail: 'Check your connection and try again',
          action: { label: 'Try again', onPress: locate },
        };
    }
  })();
  const located = location.status === 'ok';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={[styles.blob, styles.blobTop]} pointerEvents="none" />
      <View style={[styles.blob, styles.blobSide]} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.stepPill}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Last step</Text>
          </View>

          <Text style={styles.title} accessibilityRole="header">
            What should we{'\n'}
            <Text style={styles.titleAccent}>call you?</Text>
          </Text>
          <Text style={styles.subtitle}>
            This is how buyers and sellers will see you on Sahbi.
          </Text>

          <Text style={styles.inputLabel}>First name</Text>
          <TextInput
            value={name}
            onChangeText={text => setName(text.slice(0, NAME_MAX))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={finish}
            placeholder="e.g. Aisha"
            placeholderTextColor="#A39C8E"
            autoCapitalize="words"
            autoComplete="name-given"
            textContentType="givenName"
            autoCorrect={false}
            autoFocus
            returnKeyType="done"
            accessibilityLabel="First name"
            style={[styles.textInput, focused && styles.inputFocused]}
          />
          <View style={styles.hintRow}>
            <Text style={styles.hint}>A real name gets more replies.</Text>
            <Text style={styles.counter}>
              {name.length}/{NAME_MAX}
            </Text>
          </View>

          <Text style={styles.inputLabel}>Your area</Text>
          <Pressable
            onPress={locationView.action?.onPress}
            disabled={!locationView.action}
            accessibilityRole="button"
            accessibilityLabel={`${locationView.title}. ${locationView.detail}`}
            accessibilityHint={locationView.action?.label}
            accessibilityState={{ busy: location.status === 'locating' }}
            accessibilityLiveRegion="polite"
            style={({ pressed }) => [
              styles.locationCard,
              located && styles.locationCardOk,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[styles.locationIcon, located && styles.locationIconOk]}
            >
              {location.status === 'locating' ? (
                <ActivityIndicator size="small" color={colors.brandForest} />
              ) : (
                <LocationPin
                  color={located ? colors.brandIvory : colors.brandForest}
                />
              )}
            </View>
            <View style={styles.locationText}>
              <Text style={styles.locationTitle} numberOfLines={2}>
                {locationView.title}
              </Text>
              <Text style={styles.locationDetail} numberOfLines={2}>
                {locationView.detail}
              </Text>
            </View>
            {locationView.action && (
              <View style={styles.locationAction}>
                <Text style={styles.locationActionText}>
                  {locationView.action.label}
                </Text>
              </View>
            )}
          </Pressable>
        </ScrollView>

        <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={finish}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            style={({ pressed }) => [
              styles.button,
              disabled && styles.buttonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.buttonText, disabled && styles.buttonTextDisabled]}
            >
              Start exploring
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandIvory,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 340,
    height: 340,
    top: -170,
    right: -140,
    backgroundColor: colors.brandGold,
    opacity: 0.18,
  },
  blobSide: {
    width: 260,
    height: 260,
    top: '45%',
    left: -190,
    backgroundColor: colors.brandMint,
    opacity: 0.12,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  stepPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(15,63,46,0.08)',
    marginBottom: 14,
  },
  stepDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brandEmerald,
  },
  stepText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.brandForest,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: fonts.extraBold,
    color: colors.brandForest,
  },
  titleAccent: {
    color: GOLD_DEEP,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  pin: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderBottomRightRadius: 0,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  pinDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(168,127,61,0.3)',
    backgroundColor: '#FFFFFF',
  },
  locationCardOk: {
    borderColor: 'rgba(16,185,129,0.45)',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,63,46,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIconOk: {
    backgroundColor: colors.brandForest,
  },
  locationText: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fonts.bold,
    color: colors.brandForest,
  },
  locationDetail: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  locationAction: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(216,181,119,0.22)',
  },
  locationActionText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: GOLD_DEEP,
  },
  inputLabel: {
    marginTop: 28,
    marginBottom: 8,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.brandForest,
  },
  textInput: {
    height: 60,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(168,127,61,0.3)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.brandForest,
  },
  inputFocused: {
    borderColor: colors.brandForest,
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  hint: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  counter: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  button: {
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
  buttonDisabled: {
    backgroundColor: '#D9D2C3',
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.brandIvory,
  },
  buttonTextDisabled: {
    color: '#8A8372',
  },
});
