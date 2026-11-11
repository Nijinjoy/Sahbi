import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatPrice, Listing, postedLabel } from '../data/listings';
import { toggleSaved } from '../state/listings';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { ItemImage } from './ItemImage';
import { Price } from './Price';

type Props = {
  listing: Listing;
  saved: boolean;
  width: number;
  onPress: () => void;
};

/** Elevated shop-style card: photo on top, details inside a white card. */
export function ProductCard({ listing, saved, width, onPress }: Props) {
  const free = listing.price === 0;
  const posted = postedLabel(listing.postedHoursAgo);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.price)}, ${
        listing.condition
      }, ${listing.area}, posted ${posted}`}
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && styles.pressed,
      ]}
    >
      <View>
        <ItemImage
          id={listing.id}
          emoji={listing.emoji}
          photo={listing.photo}
          radius={0}
          style={[styles.image, { height: width * 0.9 }]}
        />
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{posted}</Text>
        </View>
        {listing.mine ? null : (
          <Pressable
            onPress={() => toggleSaved(listing.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              saved ? 'Remove from wishlist' : 'Add to wishlist'
            }
            accessibilityState={{ selected: saved }}
            style={styles.heart}
          >
            <Text style={[styles.heartText, saved && styles.heartOn]}>
              {saved ? '♥' : '♡'}
            </Text>
          </Pressable>
        )}
        <View style={styles.conditionPill}>
          <Text style={styles.conditionText}>{listing.condition}</Text>
        </View>
      </View>

      {/* Every line is single-line so all cards share identical spacing. */}
      <View style={styles.body}>
        <View style={styles.priceRow}>
          <Price
            amount={listing.price}
            style={styles.price}
            freeStyle={styles.priceFree}
          />
          {listing.negotiable && !free ? (
            <Text style={styles.negotiable}>OBO</Text>
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          📍 {listing.area}
          {listing.mine ? '' : ` · ${listing.distanceKm.toFixed(1)} km`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    shadowColor: colors.secondary,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    // 1px inside the card's 18px corner so the photo sits within the border.
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  timeBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(20,33,61,0.78)',
  },
  timeText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.bold,
    color: colors.textOnSecondary,
  },
  heart: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartText: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.secondary,
  },
  heartOn: {
    color: colors.accentCoral,
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  title: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  conditionPill: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  conditionText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  priceFree: {
    color: colors.success,
  },
  negotiable: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.accentTeal,
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
