import { useState } from 'react';
import {
  Image,
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

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const UAE_MOBILE_LENGTH = 9;

function formatUaeMobile(digits: string) {
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)];
  return parts.filter(Boolean).join(' ');
}

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState('');
  const [focused, setFocused] = useState(false);

  const isValid = digits.length === UAE_MOBILE_LENGTH && digits.startsWith('5');
  const showError = digits.length > 0 && !digits.startsWith('5');

  const onChangeText = (text: string) => {
    let next = text.replace(/\D/g, '');
    if (next === digits && text.length < formatUaeMobile(digits).length) {
      next = next.slice(0, -1);
    }
    if (next.startsWith('0')) {
      next = next.slice(1);
    }
    setDigits(next.slice(0, UAE_MOBILE_LENGTH));
  };

  const submit = () => {
    if (isValid) {
      navigation.navigate('Otp', {
        phone: `+971 ${formatUaeMobile(digits)}`,
      });
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={[styles.body, { paddingTop: insets.top + 40 }]}>
            <Image
              source={require('../assets/app_icon.png')}
              style={styles.badge}
              accessibilityLabel="Sahbi"
            />

            <Text style={styles.title} accessibilityRole="header">
              Welcome back
            </Text>
            <Text style={styles.subtitle}>
              Great finds are waiting. Enter your number to log in.
            </Text>

            <Text style={styles.label}>Mobile number</Text>
            <View
              style={[
                styles.inputRow,
                focused && styles.inputRowFocused,
                showError && styles.inputRowError,
              ]}
            >
              <Text style={styles.prefix}>🇦🇪 +971</Text>
              <View style={styles.divider} />
              <TextInput
                value={formatUaeMobile(digits)}
                onChangeText={onChangeText}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={submit}
                placeholder="50 123 4567"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                autoFocus
                accessibilityLabel="Mobile number, 9 digits, starting with 5"
                style={styles.input}
              />
            </View>

            {showError ? (
              <Text style={styles.helper}>UAE mobile numbers start with 5</Text>
            ) : null}
          </View>
          <View style={styles.bottom}>
            <PrimaryButton
              title="Get my code"
              onPress={submit}
              disabled={!isValid}
            />
          </View>
        </ScrollView>
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
  scroll: {
    flexGrow: 1,
  },
  badge: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  body: {
    alignItems: 'flex-start',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    maxWidth: 320,
  },
  label: {
    marginTop: 28,
    marginBottom: 4,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  inputRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  inputRowFocused: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brandEmerald,
  },
  inputRowError: {
    borderBottomColor: colors.error,
  },
  prefix: {
    fontSize: 28,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  divider: {
    width: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontSize: 28,
    letterSpacing: 1,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  helper: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.error,
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
});
