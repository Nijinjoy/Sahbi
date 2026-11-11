import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductCard } from '../../components/ProductCard';
import { categoryStyle } from '../../data/categoryStyles';
import {
  CATEGORIES,
  Condition,
  CONDITIONS,
  formatPrice,
  Listing,
} from '../../data/listings';
import { RootStackParamList } from '../../navigation/types';
import { addListing } from '../../state/listings';
import { useProfile } from '../../state/profile';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const TITLE_MAX = 50;
const DESCRIPTION_MAX = 500;
const PRICE_MAX = 1_000_000;
const GUTTER = 24;

const CONDITION_EMOJI: Record<Condition, string> = {
  New: '✨',
  'Like new': '🌟',
  Good: '👍',
  Fair: '🧰',
};

const STEPS = [
  {
    title: 'What are you selling?',
    subtitle: 'Brand, item and colour work best.',
  },
  { title: 'Pick a category', subtitle: 'So the right buyers find it.' },
  { title: 'What condition is it in?', subtitle: 'Honesty sells faster.' },
  {
    title: 'Set your price',
    subtitle: 'Check similar items for a fair price.',
  },
  {
    title: 'Where can buyers pick it up?',
    subtitle: 'Add a few details while you’re here.',
  },
  { title: 'Looks good?', subtitle: 'This is how buyers will see it.' },
] as const;

const LAST = STEPS.length - 1;

export function SellScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile();
  const { width } = useWindowDimensions();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number] | null>(
    null,
  );
  const [condition, setCondition] = useState<Condition | null>(null);
  const [price, setPrice] = useState('');
  const [free, setFree] = useState(false);
  const [negotiable, setNegotiable] = useState(false);
  const [description, setDescription] = useState('');
  const [area, setArea] = useState(profile.area ?? '');

  const priceNumber = free ? 0 : Number(price);
  const stepValid = [
    title.trim().length >= 3,
    category !== null,
    condition !== null,
    free || (price !== '' && priceNumber > 0),
    area.trim().length >= 2,
    true,
  ];
  const canContinue = stepValid[step];
  const allValid = stepValid.every(Boolean);

  const tileWidth = (width - GUTTER * 2 - 12) / 2;

  const next = () => setStep(s => Math.min(LAST, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const reset = () => {
    setStep(0);
    setTitle('');
    setCategory(null);
    setCondition(null);
    setPrice('');
    setFree(false);
    setNegotiable(false);
    setDescription('');
    setArea(profile.area ?? '');
  };

  const publish = () => {
    if (!allValid || !category || !condition) {
      return;
    }
    const listingId = addListing({
      emoji: category.emoji,
      title: title.trim(),
      price: priceNumber,
      category: category.name,
      condition,
      area: area.trim(),
      city: profile.city ?? 'UAE',
      distanceKm: 0,
      seller: profile.name ?? 'You',
      sellerRating: 5,
      sellerSales: 0,
      description: description.trim(),
      negotiable: !free && negotiable,
    });
    // Start fresh for the next item.
    reset();
    navigation.navigate('ListingDetail', { listingId });
  };

  // Listing shape used for the live preview on the review step.
  const preview: Listing = {
    id: 'sell-preview',
    emoji: category?.emoji ?? '📦',
    title: title.trim() || 'Your item',
    price: priceNumber,
    category: category?.name ?? 'Other',
    condition: condition ?? 'Good',
    area: area.trim() || 'Your area',
    city: profile.city ?? 'UAE',
    distanceKm: 0,
    seller: profile.name ?? 'You',
    sellerRating: 5,
    sellerSales: 0,
    postedHoursAgo: 0,
    description: description.trim(),
    negotiable: !free && negotiable,
    mine: true,
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View>
            <TextInput
              value={title}
              onChangeText={text => setTitle(text.slice(0, TITLE_MAX))}
              placeholder="e.g. IKEA bookshelf, white"
              placeholderTextColor={colors.border}
              autoFocus
              autoCapitalize="sentences"
              maxLength={TITLE_MAX}
              returnKeyType="next"
              onSubmitEditing={() => canContinue && next()}
              accessibilityLabel="Item title"
              style={styles.bigInput}
            />
            <View style={styles.underline} />
            <Text style={styles.counter}>
              {title.length}/{TITLE_MAX}
            </Text>
          </View>
        );

      case 1:
        return (
          <View style={styles.tileGrid}>
            {CATEGORIES.map(option => {
              const selected = category?.name === option.name;
              const tint = categoryStyle(option.name);
              return (
                <Pressable
                  key={option.name}
                  onPress={() => {
                    setCategory(option);
                    next();
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={option.name}
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.tile,
                    { width: tileWidth, height: tileWidth * 0.72 },
                    { backgroundColor: tint.bg },
                    selected && styles.tileOn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image
                    source={tint.photo}
                    resizeMode="cover"
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.tileShade} />
                  <Text style={styles.tileText} numberOfLines={1}>
                    {option.name}
                  </Text>
                  {selected ? (
                    <View style={styles.tileCheck}>
                      <Text style={styles.tileCheckText}>✓</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        );

      case 2:
        return (
          <View style={styles.optionList}>
            {CONDITIONS.map(option => {
              const selected = condition === option.name;
              return (
                <Pressable
                  key={option.name}
                  onPress={() => {
                    setCondition(option.name);
                    next();
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionOn,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.optionEmoji}>
                    <Text style={styles.optionEmojiText}>
                      {CONDITION_EMOJI[option.name]}
                    </Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.optionTitle}>{option.name}</Text>
                    <Text style={styles.optionHint}>{option.hint}</Text>
                  </View>
                  <Text style={styles.optionChevron}>›</Text>
                </Pressable>
              );
            })}
          </View>
        );

      case 3:
        return (
          <View>
            <View style={styles.priceStage}>
              <Text style={[styles.priceCurrency, free && styles.freeColor]}>
                AED
              </Text>
              {free ? (
                <Text style={[styles.priceBig, styles.freeColor]}>Free</Text>
              ) : (
                <TextInput
                  value={price}
                  onChangeText={text => {
                    const digits = text.replace(/\D/g, '').replace(/^0+/, '');
                    setPrice(
                      digits === '' || Number(digits) <= PRICE_MAX
                        ? digits
                        : price,
                    );
                  }}
                  autoFocus
                  placeholder="0"
                  placeholderTextColor={colors.border}
                  keyboardType="number-pad"
                  accessibilityLabel="Price in dirhams"
                  style={styles.priceBig}
                />
              )}
            </View>
            <View style={styles.pillRow}>
              <Pressable
                onPress={() => setFree(v => !v)}
                accessibilityRole="switch"
                accessibilityState={{ checked: free }}
                style={[styles.pill, free && styles.pillFree]}
              >
                <Text style={[styles.pillText, free && styles.pillTextOn]}>
                  🎁 Give it away free
                </Text>
              </Pressable>
              {free ? null : (
                <Pressable
                  onPress={() => setNegotiable(v => !v)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: negotiable }}
                  style={[styles.pill, negotiable && styles.pillOn]}
                >
                  <Text
                    style={[styles.pillText, negotiable && styles.pillTextOn]}
                  >
                    🤝 Open to offers
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.formGap}>
            <View>
              <Text style={styles.inputLabel}>Pickup area</Text>
              <TextInput
                value={area}
                onChangeText={setArea}
                placeholder={`e.g. Dubai Marina${
                  profile.city ? `, ${profile.city}` : ''
                }`}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                accessibilityLabel="Pickup area"
                style={styles.boxInput}
              />
            </View>
            <View>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Description</Text>
                <Text style={styles.optional}>
                  Optional · {description.length}/{DESCRIPTION_MAX}
                </Text>
              </View>
              <TextInput
                value={description}
                onChangeText={text =>
                  setDescription(text.slice(0, DESCRIPTION_MAX))
                }
                placeholder="Age, size, any marks or faults, why you’re selling…"
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                maxLength={DESCRIPTION_MAX}
                accessibilityLabel="Description"
                style={[styles.boxInput, styles.textArea]}
              />
            </View>
          </View>
        );

      default:
        return (
          <View>
            <View style={styles.previewWrap} pointerEvents="none">
              <ProductCard
                listing={preview}
                saved={false}
                width={Math.min(220, width - GUTTER * 2)}
                onPress={() => {}}
              />
            </View>
            <View style={styles.summary}>
              {[
                { label: 'Title', value: preview.title, to: 0 },
                { label: 'Category', value: preview.category, to: 1 },
                { label: 'Condition', value: preview.condition, to: 2 },
                {
                  label: 'Price',
                  value: `${formatPrice(priceNumber)}${
                    preview.negotiable ? ' · Open to offers' : ''
                  }`,
                  to: 3,
                },
                { label: 'Pickup', value: preview.area, to: 4 },
              ].map((row, i, rows) => (
                <Pressable
                  key={row.label}
                  onPress={() => setStep(row.to)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${row.label}: ${row.value}`}
                  style={({ pressed }) => [
                    styles.summaryRow,
                    i < rows.length - 1 && styles.summaryBorder,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.summaryLabel}>{row.label}</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {row.value}
                  </Text>
                  <Text style={styles.edit}>Edit</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top bar: back, step count, clear */}
      <View style={styles.topBar}>
        <Pressable
          onPress={back}
          disabled={step === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous step"
          hitSlop={10}
          style={[styles.backButton, step === 0 && styles.hidden]}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.stepCount}>
          {step === LAST ? 'Review' : `Step ${step + 1} of ${LAST}`}
        </Text>
        <Pressable
          onPress={reset}
          accessibilityRole="button"
          accessibilityLabel="Start over"
          hitSlop={10}
          style={[styles.clearButton, step === 0 && !title && styles.hidden]}
        >
          <Text style={styles.clearText}>Start over</Text>
        </Pressable>
      </View>

      {/* Segmented progress */}
      <View style={styles.segments}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < step && styles.segmentDone,
              i === step && styles.segmentCurrent,
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.question} accessibilityRole="header">
            {STEPS[step].title}
          </Text>
          <Text style={styles.subtitle}>{STEPS[step].subtitle}</Text>
          <View style={styles.stepBody}>{renderStep()}</View>
        </ScrollView>

        <View style={styles.actions}>
          {step === LAST ? (
            <Pressable
              onPress={publish}
              disabled={!allValid}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.cta,
                styles.ctaPost,
                !allValid && styles.ctaDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.ctaText, styles.ctaPostText]}>
                Post listing
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={next}
              disabled={!canContinue}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canContinue }}
              style={({ pressed }) => [
                styles.cta,
                !canContinue && styles.ctaDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.ctaText, !canContinue && styles.ctaTextOff]}>
                {step === LAST - 1 ? 'Review listing' : 'Continue'}
              </Text>
            </Pressable>
          )}
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
  pressed: {
    opacity: 0.85,
  },
  hidden: {
    opacity: 0,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 6,
    height: 50,
  },
  backButton: {
    width: 80,
    height: 40,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  backText: {
    fontSize: 36,
    lineHeight: 40,
    color: colors.secondary,
  },
  stepCount: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  clearButton: {
    width: 80,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  clearText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.accentTeal,
  },
  segments: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: GUTTER,
    paddingTop: 6,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  segmentDone: {
    backgroundColor: colors.secondary,
  },
  segmentCurrent: {
    backgroundColor: colors.primary,
  },

  content: {
    paddingHorizontal: GUTTER,
    paddingTop: 28,
    paddingBottom: 24,
  },
  question: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  stepBody: {
    marginTop: 28,
  },

  bigInput: {
    paddingVertical: 8,
    fontSize: 26,
    lineHeight: 34,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  underline: {
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  counter: {
    marginTop: 8,
    alignSelf: 'flex-end',
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },

  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  tileOn: {
    borderColor: colors.primary,
  },
  tileShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 44,
    backgroundColor: 'rgba(20,33,61,0.55)',
  },
  tileText: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  tileCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileCheckText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },

  optionList: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionEmojiText: {
    fontSize: 24,
  },
  optionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  optionHint: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  optionChevron: {
    fontSize: 26,
    color: colors.border,
  },

  priceStage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 28,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  priceCurrency: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  priceBig: {
    minWidth: 60,
    padding: 0,
    fontSize: 52,
    lineHeight: 64,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  freeColor: {
    color: colors.success,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
  },
  pill: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  pillOn: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  pillFree: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  pillText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  pillTextOn: {
    color: '#FFFFFF',
  },

  formGap: {
    gap: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  optional: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  boxInput: {
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.secondary,
  },
  textArea: {
    height: 130,
    paddingTop: 14,
    paddingBottom: 14,
    lineHeight: 22,
  },

  previewWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  summary: {
    marginTop: 24,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  summaryBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    width: 78,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  edit: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.accentTeal,
  },

  actions: {
    paddingHorizontal: GUTTER,
    paddingVertical: 12,
  },
  cta: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },
  ctaPost: {
    backgroundColor: colors.secondary,
  },
  ctaDisabled: {
    backgroundColor: colors.border,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textOnSecondary,
  },
  ctaPostText: {
    fontFamily: fonts.extraBold,
    color: colors.textOnSecondary,
  },
  ctaTextOff: {
    color: colors.textMuted,
  },
});
