import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatPrice, Listing } from '../data/listings';
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

export function ListingCard({ listing, saved, width, onPress }: Props) {
  const free = listing.price === 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.price)}, ${
        listing.condition
      }, ${listing.area}${listing.sold ? ', sold' : ''}`}
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
          style={[styles.image, { height: width }]}
        />
        {listing.sold ? (
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>SOLD</Text>
          </View>
        ) : free ? (
          <View style={[styles.soldBadge, styles.freeBadge]}>
            <Text style={[styles.soldText, styles.freeText]}>FREE</Text>
          </View>
        ) : null}
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
      </View>
      <Price amount={listing.price} style={styles.price} />
      <Text style={styles.title} numberOfLines={2}>
        {listing.title}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        📍 {listing.area} · {listing.condition}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    marginBottom: 8,
  },
  soldBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  soldText: {
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: fonts.bold,
    color: colors.textOnSecondary,
  },
  freeBadge: {
    backgroundColor: colors.success,
  },
  freeText: {
    color: '#FFFFFF',
  },
  heart: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartText: {
    fontSize: 20,
    lineHeight: 24,
    color: colors.secondary,
  },
  heartOn: {
    color: colors.accentCoral,
  },
  price: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    minHeight: 36,
    fontFamily: fonts.medium,
    color: colors.secondary,
  },
  meta: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
