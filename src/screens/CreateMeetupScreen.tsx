import { ReactNode, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackButton } from '../components/BackButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { DateTimeField } from '../components/DateTimeField';
import { MEETUP_CATEGORIES } from '../data/sampleMeetups';
import { RootStackParamList } from '../navigation/types';
import { addMeetup } from '../state/meetups';
import { useProfile } from '../state/profile';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateMeetup'>;

const TITLE_MAX = 40;
const MAX_DAYS_AHEAD = 60;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date) {
  const offset = Math.round(
    (startOfDay(date).getTime() - startOfDay(new Date()).getTime()) /
      86400000,
  );
  const base = `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${
    MONTHS[date.getMonth()]
  }`;
  return offset === 0 ? `Today, ${base}` : offset === 1 ? `Tomorrow, ${base}` : base;
}

function formatTime(date: Date) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
}

function combine(date: Date, time: Date) {
  const d = new Date(date);
  d.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return d;
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      onFocus={e => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={e => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      placeholderTextColor={colors.textMuted}
      style={[styles.input, focused && styles.inputFocused, props.style]}
    />
  );
}

function Chip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={[
        styles.chip,
        selected && styles.chipOn,
        disabled && styles.chipDisabled,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          selected && styles.chipTextOn,
          disabled && styles.chipTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function CreateMeetupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const profile = useProfile();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<
    (typeof MEETUP_CATEGORIES)[number] | null
  >(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [place, setPlace] = useState('');
  const [area, setArea] = useState(profile.city ?? '');

  const today = startOfDay(new Date());
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);

  const timeInPast =
    date !== null &&
    time !== null &&
    combine(date, time).getTime() <= Date.now();

  const valid =
    title.trim().length >= 3 &&
    category !== null &&
    date !== null &&
    time !== null &&
    !timeInPast &&
    place.trim().length >= 2;

  const create = () => {
    if (!valid || !category || !date || !time) {
      return;
    }
    const dayOffset = Math.round(
      (startOfDay(date).getTime() - today.getTime()) / 86400000,
    );
    const host = profile.name ?? 'You';
    addMeetup({
      emoji: category.emoji,
      title: title.trim(),
      category: category.name,
      dayOffset,
      time: formatTime(time),
      place: place.trim(),
      area: area.trim() || 'UAE',
      host,
      going: 1,
      capacity: null,
      attendees: [host],
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <BackButton variant="arrow" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle} accessibilityRole="header">
          Host a meetup
        </Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Field label="What’s the plan?">
            <View>
              <Input
                value={title}
                onChangeText={text => setTitle(text.slice(0, TITLE_MAX))}
                placeholder="e.g. Sunset beach volleyball"
                autoCapitalize="sentences"
                maxLength={TITLE_MAX}
                accessibilityLabel="Meetup title"
                accessibilityHint={`Up to ${TITLE_MAX} characters`}
                style={styles.inputWithCounter}
              />
              <Text style={styles.counter} pointerEvents="none">
                {title.length}/{TITLE_MAX}
              </Text>
            </View>
          </Field>

          <Field label="Category" style={styles.fieldTight}>
            <View style={styles.chipWrap}>
              {MEETUP_CATEGORIES.map(option => (
                <Chip
                  key={option.name}
                  label={`${option.emoji} ${option.name}`}
                  selected={category?.name === option.name}
                  onPress={() => setCategory(option)}
                />
              ))}
            </View>
          </Field>

          <Field label="When?">
            <View style={styles.whenRow}>
              <DateTimeField
                mode="date"
                label="Date"
                icon="📅"
                placeholder="Pick a date"
                value={date}
                onChange={value => setDate(startOfDay(value))}
                format={formatDate}
                minimumDate={today}
                maximumDate={maxDate}
              />
              <DateTimeField
                mode="time"
                label="Time"
                icon="🕒"
                placeholder="Pick a time"
                value={time}
                onChange={setTime}
                format={formatTime}
                invalid={timeInPast}
              />
            </View>
            {timeInPast ? (
              <Text style={styles.errorText}>
                That time has already passed. Pick a later time.
              </Text>
            ) : null}
          </Field>

          <Field label="Where?">
            <Input
              value={place}
              onChangeText={setPlace}
              placeholder="Place, e.g. Kite Beach"
              autoCapitalize="words"
              accessibilityLabel="Place"
            />
            <Input
              value={area}
              onChangeText={setArea}
              placeholder="Area or city, e.g. Jumeirah"
              autoCapitalize="words"
              accessibilityLabel="Area or city"
            />
          </Field>
        </ScrollView>

        <View
          style={[
            styles.actions,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <PrimaryButton
            title="Create meetup"
            onPress={create}
            disabled={!valid}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 24,
  },
  field: {
    gap: 10,
  },
  fieldTight: {
    marginTop: -14,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.secondary,
  },
  inputFocused: {
    borderColor: colors.secondary,
    backgroundColor: colors.background,
  },
  inputWithCounter: {
    paddingRight: 64,
  },
  counter: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    lineHeight: 56,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  chipOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipDisabled: {
    backgroundColor: colors.surface,
    borderColor: colors.surface,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  chipTextOn: {
    fontFamily: fonts.bold,
  },
  chipTextDisabled: {
    color: colors.border,
  },
  whenRow: {
    flexDirection: 'row',
    gap: 10,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.error,
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
