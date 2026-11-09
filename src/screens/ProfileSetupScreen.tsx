import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  KeyboardAvoidingView,
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
import { BackButton } from '../components/BackButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { updateProfile } from '../state/profile';
import {
  Coordinates,
  fetchCurrentCity,
  UAE_CITIES,
  UaeCity,
} from '../utils/location';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const TOTAL_STEPS = 3;
const BIO_MIN = 10;
const BIO_MAX = 150;
const MIN_INTERESTS = 3;
const MAX_INTERESTS = 10;

const GENDERS = ['Woman', 'Man', 'Prefer not to say'] as const;


const INTERESTS = [
  '☕ Coffee',
  '⚽ Football',
  '🎾 Padel',
  '🏋️ Gym',
  '🏃 Running',
  '🥾 Hiking',
  '🏖️ Beach',
  '🏜️ Desert trips',
  '🍳 Cooking',
  '🥞 Brunch',
  '🎮 Gaming',
  '🎬 Movies',
  '🎵 Music',
  '🎨 Art',
  '📷 Photography',
  '✈️ Travel',
  '📚 Reading',
  '🎲 Board games',
  '🧘 Yoga',
  '💻 Tech',
];

export function ProfileSetupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);

  const [bio, setBio] = useState('');
  const [bioFocused, setBioFocused] = useState(false);
  const [gender, setGender] = useState<(typeof GENDERS)[number] | null>(null);
  const [city, setCity] = useState<UaeCity | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationBlocked, setLocationBlocked] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  const [interests, setInterests] = useState<string[]>([]);

  const trimmedName = name.trim();
  const nameValid = trimmedName.length >= 2;

  const bioLength = bio.trim().length;
  const bioValid = bioLength >= BIO_MIN;

  const interestsValid = interests.length >= MIN_INTERESTS;

  const canContinue = [
    nameValid,
    bioValid && gender !== null && city !== null,
    interestsValid,
  ][
    step
  ];

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 0) {
        setStep(s => s - 1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [step]);

  const detectLocation = async () => {
    setLocating(true);
    setLocationMessage(null);
    setLocationBlocked(false);
    const result = await fetchCurrentCity();
    setLocating(false);

    if (result.status === 'ok') {
      setCity(result.city);
      setArea(result.area);
      setCoords(result.coords);
      setShowCityList(false);
      return;
    }

    setShowCityList(true);
    if (result.status === 'outside') {
      setLocationMessage(
        'You seem to be outside the UAE. Pick the city you live in below.',
      );
    } else if (result.status === 'denied') {
      setLocationBlocked(!result.canAskAgain);
      setLocationMessage(
        result.canAskAgain
          ? 'Location permission is needed to detect your city. You can also pick it below.'
          : 'Location is turned off for Sahbi. Turn it on in Settings, or pick your city below.',
      );
    } else {
      setLocationMessage(
        'We couldn’t get your location. Check that location services are on, or pick your city below.',
      );
    }
  };

  const chooseCity = (option: UaeCity) => {
    setCity(option);
    setArea(null);
    setCoords(null);
    setShowCityList(false);
    setLocationMessage(null);
  };

  const toggleInterest = (item: string) => {
    setInterests(current =>
      current.includes(item)
        ? current.filter(i => i !== item)
        : current.length < MAX_INTERESTS
        ? [...current, item]
        : current,
    );
  };

  const next = () => {
    if (!canContinue) {
      return;
    }
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      return;
    }
    updateProfile({
      name: trimmedName,
      bio: bio.trim(),
      gender,
      city,
      interests,
    });
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Discover' } }],
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBar}>
        <View style={styles.backSlot}>
          {step > 0 ? <BackButton onPress={() => setStep(step - 1)} /> : null}
        </View>
        <View
          style={styles.progress}
          accessible
          accessibilityLabel={`Step ${step + 1} of ${TOTAL_STEPS}`}
        >
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              style={[styles.progressBar, i <= step && styles.progressBarOn]}
            />
          ))}
        </View>
        <View style={styles.backSlot} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.stepLabel}>
            STEP {step + 1} OF {TOTAL_STEPS}
          </Text>

          {step === 0 ? (
            <>
              <Text style={styles.title} accessibilityRole="header">
                What should we call you?
              </Text>
              <Text style={styles.subtitle}>
                This is how you’ll appear to people on Sahbi.
              </Text>
              <TextInput
                key="name"
                value={name}
                onChangeText={text => setName(text.slice(0, 30))}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                placeholder="Your first name"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                autoComplete="name-given"
                textContentType="givenName"
                autoCorrect={false}
                autoFocus
                accessibilityLabel="First name"
                style={[styles.textInput, nameFocused && styles.inputFocused]}
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Text style={styles.title} accessibilityRole="header">
                A little about you
              </Text>
              <Text style={styles.subtitle}>
                Help people get to know you before you meet.
              </Text>

              <Text style={styles.fieldLabel}>About me</Text>
              <TextInput
                key="bio"
                value={bio}
                onChangeText={text => setBio(text.slice(0, BIO_MAX))}
                onFocus={() => setBioFocused(true)}
                onBlur={() => setBioFocused(false)}
                placeholder="e.g. New to Dubai, love padel and finding the best karak in town."
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={BIO_MAX}
                textAlignVertical="top"
                autoCapitalize="sentences"
                accessibilityLabel="About me"
                accessibilityHint={`At least ${BIO_MIN} characters`}
                style={[styles.bioInput, bioFocused && styles.inputFocused]}
              />
              <Text style={styles.bioCounter}>
                {bio.length} / {BIO_MAX}
              </Text>

              <Text style={[styles.fieldLabel, styles.fieldLabelTight]}>
                I am
              </Text>
              <View style={styles.chipWrap}>
                {GENDERS.map(option => {
                  const selected = gender === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setGender(option)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                I live in
              </Text>
              {city && !showCityList ? (
                <View style={styles.locationCard}>
                  <Text style={styles.locationPin}>📍</Text>
                  <View style={styles.flex}>
                    <Text style={styles.locationCity}>
                      {area ? `${area}, ` : ''}
                      {city}, UAE
                    </Text>
                    <Text style={styles.locationSub}>
                      {coords
                        ? 'Detected from your location'
                        : 'Chosen by you'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setShowCityList(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Change city"
                    hitSlop={8}
                  >
                    <Text style={styles.link}>Change</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={detectLocation}
                    disabled={locating}
                    accessibilityRole="button"
                    accessibilityState={{ busy: locating }}
                    style={({ pressed }) => [
                      styles.locationButton,
                      pressed && styles.locationButtonPressed,
                    ]}
                  >
                    {locating ? (
                      <>
                        <ActivityIndicator color={colors.secondary} />
                        <Text style={styles.locationButtonText}>
                          Finding your location…
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.locationButtonText}>
                        📍 Use my current location
                      </Text>
                    )}
                  </Pressable>

                  {locationMessage ? (
                    <Text style={styles.errorText}>{locationMessage}</Text>
                  ) : null}
                  {locationBlocked ? (
                    <Pressable
                      onPress={() => Linking.openSettings()}
                      accessibilityRole="button"
                      hitSlop={8}
                      style={styles.settingsLink}
                    >
                      <Text style={styles.link}>Open Settings</Text>
                    </Pressable>
                  ) : null}

                  {showCityList ? (
                    <View style={[styles.chipWrap, styles.cityList]}>
                      {UAE_CITIES.map(({ name: option }) => {
                        const selected = city === option;
                        return (
                          <Pressable
                            key={option}
                            onPress={() => chooseCity(option)}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            style={[
                              styles.chip,
                              selected && styles.chipSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                selected && styles.chipTextSelected,
                              ]}
                            >
                              {option}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => setShowCityList(true)}
                      accessibilityRole="button"
                      hitSlop={8}
                      style={styles.manualLink}
                    >
                      <Text style={styles.link}>Choose my city instead</Text>
                    </Pressable>
                  )}
                </>
              )}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text style={styles.title} accessibilityRole="header">
                What are you into?
              </Text>
              <Text style={styles.subtitle}>
                Pick at least {MIN_INTERESTS}. We’ll use these to find people
                you’ll get along with.
              </Text>
              <Text style={styles.counter}>
                {interests.length} / {MAX_INTERESTS} selected
              </Text>
              <View style={styles.chipWrap}>
                {INTERESTS.map(item => {
                  const selected = interests.includes(item);
                  return (
                    <Pressable
                      key={item}
                      onPress={() => toggleInterest(item)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </ScrollView>

        <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
          <PrimaryButton
            title={step === TOTAL_STEPS - 1 ? 'Finish' : 'Continue'}
            onPress={next}
            disabled={!canContinue}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
  },
  backSlot: {
    width: 44,
  },
  progress: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  progressBarOn: {
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  stepLabel: {
    fontSize: 13,
    letterSpacing: 1.2,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  title: {
    marginTop: 4,
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
    borderColor: colors.secondary,
    backgroundColor: colors.background,
  },
  fieldLabel: {
    marginBottom: 10,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  fieldLabelSpaced: {
    marginTop: 28,
  },
  fieldLabelTight: {
    marginTop: -2,
  },
  bioInput: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  bioCounter: {
    marginTop: 4,
    alignSelf: 'flex-end',
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  errorText: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.error,
  },
  counter: {
    marginTop: -12,
    marginBottom: 16,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  chipTextSelected: {
    fontFamily: fonts.bold,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  locationPin: {
    fontSize: 22,
  },
  locationCity: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  locationSub: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  locationButton: {
    flexDirection: 'row',
    gap: 10,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonPressed: {
    backgroundColor: colors.surface,
  },
  locationButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  link: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
  settingsLink: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  manualLink: {
    marginTop: 14,
    alignSelf: 'center',
  },
  cityList: {
    marginTop: 16,
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
