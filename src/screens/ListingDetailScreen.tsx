import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '../components/Avatar';
import { BackButton } from '../components/BackButton';
import { PhotoGallery } from '../components/PhotoGallery';
import { Price } from '../components/Price';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProductCard } from '../components/ProductCard';
import { formatPrice, postedLabel } from '../data/listings';
import { listingChatId } from '../data/sampleChats';
import { RootStackParamList } from '../navigation/types';
import {
  deleteListing,
  setListingSold,
  toggleSaved,
  useListings,
  useSaved,
} from '../state/listings';
import { useProfile } from '../state/profile';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'ListingDetail'>;

const ICONS = {
  share: require('../assets/icons/share.png'),
  chat: require('../assets/icons/profile/chat.png'),
  shield: require('../assets/icons/profile/shield.png'),
  tag: require('../assets/icons/profile/tag.png'),
};

const GUTTER = 20;
const SHEET_OVERLAP = 28;
const SIMILAR_CARD = 156;

/** Stacked strips that fake a top gradient so the status bar stays legible. */
// 24 steps on an ease-out curve, fine enough that no banding shows.
const SCRIM_STEPS = Array.from({ length: 24 }, (_, i) =>
  Number((0.4 * (1 - i / 23) ** 2).toFixed(3)),
);

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function ListingDetailScreen({ navigation, route }: Props) {
  const { listingId } = route.params;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listings = useListings();
  const saved = useSaved();
  const profile = useProfile();
  const listing = listings.find(l => l.id === listingId);

  const photoHeight = Math.round(width * 0.95);
  const headerHeight = insets.top + 56;

  // A white header fades in behind the floating buttons once the photo has
  // scrolled away, so they never float over the text.
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeStart = photoHeight - headerHeight - 80;
  const fadeEnd = photoHeight - headerHeight - 20;
  const headerOpacity = scrollY.interpolate({
    inputRange: [fadeStart, fadeEnd],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  // The buttons' white circles fade out as the header fades in, leaving
  // plain icons in a single toolbar row.
  const circleOpacity = scrollY.interpolate({
    inputRange: [fadeStart, fadeEnd],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const circle = (
    <Animated.View
      pointerEvents="none"
      style={[styles.roundBg, { opacity: circleOpacity }]}
    />
  );
  const [solidHeader, setSolidHeader] = useState(false);
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (event: {
          nativeEvent: { contentOffset: { y: number } };
        }) => {
          const solid =
            event.nativeEvent.contentOffset.y > (fadeStart + fadeEnd) / 2;
          setSolidHeader(prev => (prev === solid ? prev : solid));
        },
      }),
    [scrollY, fadeStart, fadeEnd],
  );

  // Light status-bar text over the photo, dark once the white header shows.
  // Home re-applies its own style when it regains focus.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(solidHeader ? 'dark-content' : 'light-content');
      return () => StatusBar.setBarStyle('dark-content');
    }, [solidHeader]),
  );

  const similar = useMemo(
    () =>
      listing
        ? listings
            .filter(
              l =>
                l.id !== listing.id &&
                l.category === listing.category &&
                !l.mine &&
                !l.sold,
            )
            .slice(0, 6)
        : [],
    [listings, listing],
  );

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.missingBar}>
          <BackButton variant="arrow" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.missing}>
          <Text style={styles.missingText}>This item is no longer listed.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isSaved = saved.has(listing.id);
  const sellerName = listing.mine ? profile.name ?? 'You' : listing.seller;
  const free = listing.price === 0;

  const share = () =>
    Share.share({
      message: `${listing.title} – ${formatPrice(listing.price)} in ${
        listing.area
      }, on Sahbi`,
    }).catch(error => console.warn(error));

  const confirmDelete = () =>
    Alert.alert('Delete listing?', 'Buyers will no longer see this item.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          navigation.goBack();
          deleteListing(listing.id);
        },
      },
    ]);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Full-bleed swipeable photo gallery (up to 5) */}
        <View style={{ height: photoHeight }}>
          <PhotoGallery
            id={listing.id}
            emoji={listing.emoji}
            photos={listing.photos ?? (listing.photo ? [listing.photo] : [])}
            width={width}
            height={photoHeight}
            bottomInset={SHEET_OVERLAP}
          />
          <View pointerEvents="none" style={styles.scrim}>
            {SCRIM_STEPS.map((opacity, i) => (
              <View
                key={i}
                style={[
                  styles.scrimStep,
                  { backgroundColor: `rgba(20,33,61,${opacity})` },
                ]}
              />
            ))}
          </View>
          {listing.sold ? (
            <View style={[styles.soldBanner, { bottom: SHEET_OVERLAP + 16 }]}>
              <Text style={styles.soldBannerText}>SOLD</Text>
            </View>
          ) : null}
        </View>

        {/* Content sheet overlapping the photo */}
        <View style={styles.sheet}>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{listing.condition}</Text>
            </View>
            <View style={[styles.tag, styles.tagSoft]}>
              <Text style={styles.tagText}>{listing.category}</Text>
            </View>
            <View style={styles.flex} />
            <Text style={styles.posted}>
              {postedLabel(listing.postedHoursAgo)}
            </Text>
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {listing.title}
          </Text>

          <View style={styles.priceRow}>
            <Price
              amount={listing.price}
              style={styles.price}
              freeStyle={styles.priceFree}
            />
            {listing.negotiable && !free ? (
              <View style={styles.negotiable}>
                <Text style={styles.negotiableText}>Negotiable</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.location}>
            📍 {listing.area}, {listing.city}
            {listing.mine
              ? ''
              : `  ·  ${listing.distanceKm.toFixed(1)} km away`}
          </Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {listing.description || 'No description provided.'}
          </Text>

          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsCard}>
            <DetailRow label="Condition" value={listing.condition} />
            <DetailRow label="Category" value={listing.category} />
            <DetailRow
              label="Pickup area"
              value={`${listing.area}, ${listing.city}`}
            />
            <DetailRow
              label="Posted"
              value={postedLabel(listing.postedHoursAgo)}
              last
            />
          </View>

          <Text style={styles.sectionTitle}>
            {listing.mine ? 'Listed by you' : 'Seller'}
          </Text>
          <View style={styles.sellerCard}>
            <Avatar name={sellerName} size={54} />
            <View style={styles.flex}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName} numberOfLines={1}>
                  {sellerName}
                </Text>
                {listing.mine ? null : (
                  <View style={styles.verified}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>
              {listing.mine ? (
                <Text style={styles.sellerMeta}>Your listing</Text>
              ) : (
                <View style={styles.sellerStats}>
                  <Text style={styles.sellerStat}>
                    <Text style={styles.star}>★</Text>{' '}
                    {listing.sellerRating.toFixed(1)}
                  </Text>
                  <View style={styles.dot} />
                  <Text style={styles.sellerStat}>
                    {listing.sellerSales} sold
                  </Text>
                </View>
              )}
            </View>
          </View>

          {listing.mine ? null : (
            <View style={styles.safety}>
              <View style={styles.safetyIcon}>
                <Image source={ICONS.shield} style={styles.safetyImage} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.safetyTitle}>Stay safe</Text>
                <Text style={styles.safetyText}>
                  Meet in a public place, check the item before paying, and
                  never send money in advance.
                </Text>
              </View>
            </View>
          )}
        </View>

        {similar.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, styles.similarTitle]}>
              More in {listing.category}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarRow}
            >
              {similar.map(item => (
                <ProductCard
                  key={item.id}
                  listing={item}
                  saved={saved.has(item.id)}
                  width={SIMILAR_CARD}
                  onPress={() =>
                    navigation.push('ListingDetail', { listingId: item.id })
                  }
                />
              ))}
            </ScrollView>
          </>
        ) : null}
      </Animated.ScrollView>

      {/* White header that fades in once the photo scrolls away */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.solidHeader,
          {
            height: headerHeight,
            opacity: headerOpacity,
          },
        ]}
      />

      {/* Floating buttons over the photo */}
      <View
        style={[styles.floatingBar, { top: insets.top + 6 }]}
        pointerEvents="box-none"
      >
        <View style={styles.roundButton}>
          {circle}
          <BackButton variant="arrow" onPress={() => navigation.goBack()} />
        </View>
        {/* Title shares the row with the buttons so all stay aligned. */}
        <Animated.Text
          pointerEvents="none"
          numberOfLines={1}
          style={[styles.headerTitle, { opacity: headerOpacity }]}
        >
          {listing.title}
        </Animated.Text>
        <Pressable
          onPress={share}
          accessibilityRole="button"
          accessibilityLabel="Share"
          hitSlop={6}
          style={({ pressed }) => [
            styles.roundButton,
            pressed && styles.pressed,
          ]}
        >
          {circle}
          <Image source={ICONS.share} style={styles.roundIcon} />
        </Pressable>
        {listing.mine ? null : (
          <Pressable
            onPress={() => toggleSaved(listing.id)}
            accessibilityRole="button"
            accessibilityLabel={
              isSaved ? 'Remove from wishlist' : 'Add to wishlist'
            }
            accessibilityState={{ selected: isSaved }}
            hitSlop={6}
            style={({ pressed }) => [
              styles.roundButton,
              pressed && styles.pressed,
            ]}
          >
            {circle}
            <Text style={[styles.heart, isSaved && styles.heartOn]}>
              {isSaved ? '♥' : '♡'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Bottom action bar */}
      <View
        style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        {listing.mine ? (
          <View style={styles.actionRow}>
            <Pressable
              onPress={confirmDelete}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
            <PrimaryButton
              title={listing.sold ? 'Mark as available' : 'Mark as sold'}
              onPress={() => setListingSold(listing.id, !listing.sold)}
              style={styles.flex}
            />
          </View>
        ) : (
          <View style={styles.actionRow}>
            <View style={styles.actionPrice}>
              <Text style={styles.actionPriceLabel}>
                {listing.negotiable && !free ? 'Price · OBO' : 'Price'}
              </Text>
              <Price
                amount={listing.price}
                style={styles.actionPriceValue}
                freeStyle={styles.priceFree}
              />
            </View>
            <Pressable
              onPress={() =>
                navigation.navigate('Chat', {
                  chatId: listingChatId(listing.id),
                })
              }
              disabled={listing.sold}
              accessibilityRole="button"
              accessibilityState={{ disabled: listing.sold }}
              style={({ pressed }) => [
                styles.chatButton,
                listing.sold && styles.chatButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              {listing.sold ? null : (
                <Image source={ICONS.chat} style={styles.chatIcon} />
              )}
              <Text style={styles.chatText}>
                {listing.sold ? 'Sold' : 'Chat with seller'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
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
  pressed: {
    opacity: 0.85,
  },
  scroll: {
    paddingBottom: 28,
  },

  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  scrimStep: {
    flex: 1,
  },
  soldBanner: {
    position: 'absolute',
    left: GUTTER,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.secondary,
  },
  soldBannerText: {
    fontSize: 14,
    letterSpacing: 1.4,
    fontFamily: fonts.bold,
    color: colors.textOnSecondary,
  },

  solidHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    // Baloo 2 draws glyphs high in the line box; lower them to the icons.
    transform: [{ translateY: 3.5 }],
    fontSize: 19,
    lineHeight: 25,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  floatingBar: {
    position: 'absolute',
    left: GUTTER - 4,
    right: GUTTER - 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  roundIcon: {
    width: 20,
    height: 20,
    tintColor: colors.secondary,
  },
  heart: {
    fontSize: 22,
    lineHeight: 26,
    color: colors.secondary,
  },
  heartOn: {
    color: colors.accentCoral,
  },

  sheet: {
    marginTop: -SHEET_OVERLAP,
    paddingHorizontal: GUTTER,
    paddingTop: 22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.background,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
  },
  tagSoft: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  posted: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  title: {
    marginTop: 12,
    fontSize: 23,
    lineHeight: 29,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  price: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  priceFree: {
    color: colors.success,
  },
  negotiable: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#E3F0EF',
  },
  negotiableText: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fonts.bold,
    color: colors.accentTeal,
  },
  location: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },

  sectionTitle: {
    marginTop: 26,
    marginBottom: 10,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },

  detailsCard: {
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  detailRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },

  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sellerName: {
    flexShrink: 1,
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  sellerMeta: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  sellerStat: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  star: {
    color: colors.star,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.border,
  },
  verified: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: '#E3F4EC',
  },
  verifiedText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.bold,
    color: colors.success,
  },

  safety: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
  },
  safetyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyImage: {
    width: 18,
    height: 18,
    tintColor: colors.secondary,
  },
  safetyTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  safetyText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },

  similarTitle: {
    paddingHorizontal: GUTTER,
  },
  similarRow: {
    paddingHorizontal: GUTTER,
    paddingTop: 2,
    paddingBottom: 10,
    gap: 14,
  },

  actions: {
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    shadowColor: colors.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionPrice: {
    flexShrink: 1,
  },
  actionPriceLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  actionPriceValue: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  chatButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
  },
  chatButtonDisabled: {
    backgroundColor: colors.border,
  },
  chatIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primary,
  },
  chatText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textOnSecondary,
  },
  deleteButton: {
    height: 54,
    paddingHorizontal: 24,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.error,
  },

  missingBar: {
    paddingLeft: 8,
    paddingVertical: 8,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});
