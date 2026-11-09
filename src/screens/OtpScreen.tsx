import { ComponentRef, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackButton } from '../components/BackButton';
import { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { updateProfile } from '../state/profile';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export function OtpScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  
  useEffect(
    () =>
      navigation.addListener('transitionEnd', e => {
        if (!e.data.closing) {
          inputRef.current?.focus();
        }
      }),
    [navigation],
  );

  useEffect(() => {
    if (secondsLeft === 0) {
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const isComplete = code.length === CODE_LENGTH;
  const activeIndex = Math.min(code.length, CODE_LENGTH - 1);

  const onChangeText = (text: string) =>
    setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH));

  const resend = () => {
    setCode('');
    setSecondsLeft(RESEND_SECONDS);
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Text style={styles.title} accessibilityRole="header">
              Enter the code
            </Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{' '}
              <Text style={styles.phone}>{phone}</Text>
            </Text>
          </View>

          <Pressable
            onPress={() => inputRef.current?.focus()}
            accessible={false}
            style={styles.boxes}
          >
            {Array.from({ length: CODE_LENGTH }, (_, index) => {
              const digit = code[index] ?? '';
              const isActive = focused && index === activeIndex;
              return (
                <View
                  key={index}
                  style={[
                    styles.box,
                    digit !== '' && styles.boxFilled,
                    isActive && styles.boxActive,
                  ]}
                >
                  <Text style={styles.boxText}>{digit}</Text>
                </View>
              );
            })}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={onChangeText}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={CODE_LENGTH}
              caretHidden
              accessibilityLabel="6-digit verification code"
              style={styles.hiddenInput}
            />
          </Pressable>

          <View style={styles.resendRow}>
            {secondsLeft > 0 ? (
              <Text style={styles.resendText}>
                Resend code in 0:{String(secondsLeft).padStart(2, '0')}
              </Text>
            ) : (
              <>
                <Text style={styles.resendText}>Didn't get it? </Text>
                <Pressable
                  onPress={resend}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Text style={styles.resendLink}>Resend code</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <PrimaryButton
            title="Verify"
            disabled={!isComplete}
            onPress={() => {
              updateProfile({ phone });
              navigation.reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 32,
  },
  intro: {
    gap: 12,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 24,
    color: colors.textMuted,
  },
  phone: {
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  boxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  box: {
    flex: 1,
    maxWidth: 52,
    aspectRatio: 0.85,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D5D9E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: colors.secondary,
  },
  boxActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  boxText: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  resendLink: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
});
