import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { updateProfile } from '../state/profile';
import {
  refreshProfileLocation,
  requestLocationPermission,
} from '../utils/location';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const NAME_MAX = 30;

export function ProfileSetupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);
  const [locating, setLocating] = useState(false);

  const trimmedName = name.trim();
  const valid = trimmedName.length >= 2;

  const finish = async () => {
    if (!valid || locating) {
      return;
    }
    updateProfile({ name: trimmedName });

    // Wait only for the native permission prompt; the city lookup (GPS +
    // geocoding) runs in the background so onboarding never stalls on it.
    setLocating(true);
    let granted = false;
    try {
      granted = (await requestLocationPermission()) === 'granted';
    } catch (error) {
      console.warn(error);
    } finally {
      setLocating(false);
    }
    if (granted) {
      refreshProfileLocation().catch(error => console.warn(error));
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title} accessibilityRole="header">
            What should we call you?
          </Text>
          <Text style={styles.subtitle}>
            This is how buyers and sellers will see you on Sahbi.
          </Text>
          <TextInput
            value={name}
            onChangeText={text => setName(text.slice(0, NAME_MAX))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={finish}
            editable={!locating}
            placeholder="Your first name"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoComplete="name-given"
            textContentType="givenName"
            autoCorrect={false}
            autoFocus
            returnKeyType="done"
            accessibilityLabel="First name"
            style={[styles.textInput, focused && styles.inputFocused]}
          />
        </ScrollView>

        <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
          <PrimaryButton
            title={locating ? 'One moment…' : 'Start exploring'}
            onPress={finish}
            disabled={!valid || locating}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  subtitle: {
    marginTop: 2,
    marginBottom: 28,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  textInput: {
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  inputFocused: {
    borderColor: colors.brandEmerald,
    backgroundColor: colors.background,
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
