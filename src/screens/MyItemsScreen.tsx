import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackButton } from '../components/BackButton';
import { ItemImage } from '../components/ItemImage';
import { formatPrice, Listing, postedLabel } from '../data/listings';
import { RootStackParamList } from '../navigation/types';
import {
  setListingSold,
  toggleSaved,
  useListings,
  useSaved,
} from '../state/listings';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { Price } from '../components/Price';

type ItemsView = 'selling' | 'saved';

function ItemRow({
  listing,
  mode,
  onPress,
}: {
  listing: Listing;
  mode: ItemsView;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.price)}${
        listing.sold ? ', sold' : ''
      }`}
      style={({ pressed }) => [
        styles.card,
        listing.sold && styles.cardSold,
        pressed && styles.pressed,
      ]}
    >
      <ItemImage
        id={listing.id}
        emoji={listing.emoji}
        photo={listing.photo}
        size={76}
      />
      <View style={styles.cardBody}>
        <Price amount={listing.price} style={styles.cardPrice} />
        <Text style={styles.cardTitle} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {mode === 'selling'
            ? `${listing.condition} · posted ${postedLabel(
                listing.postedHoursAgo,
              ).toLowerCase()}`
            : `📍 ${listing.area} · ${listing.seller}`}
        </Text>
      </View>

      {mode === 'selling' ? (
        <Pressable
          onPress={() => setListingSold(listing.id, !listing.sold)}
          accessibilityRole="button"
          accessibilityLabel={
            listing.sold
              ? `Mark ${listing.title} as available`
              : `Mark ${listing.title} as sold`
          }
          style={({ pressed }) => [
            styles.statusButton,
            listing.sold && styles.statusButtonSold,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[styles.statusText, listing.sold && styles.statusTextSold]}
          >
            {listing.sold ? 'Sold ✓' : 'Mark sold'}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => toggleSaved(listing.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${listing.title} from wishlist`}
          style={styles.heartButton}
        >
          <Text style={styles.heart}>♥</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'MyItems'>;

export function MyItemsScreen({ navigation, route }: Props) {
  const [view, setView] = useState<ItemsView>(route.params?.view ?? 'selling');
  const listings = useListings();
  const saved = useSaved();

  const mine = useMemo(() => listings.filter(l => l.mine), [listings]);
  const savedItems = useMemo(
    () => listings.filter(l => saved.has(l.id)),
    [listings, saved],
  );
  const data = view === 'selling' ? mine : savedItems;

  const active = mine.filter(l => !l.sold).length;
  const sold = mine.length - active;
  const earned = mine.filter(l => l.sold).reduce((sum, l) => sum + l.price, 0);

  const header = (
    <View>
      <View style={styles.header}>
        <BackButton variant="arrow" onPress={() => navigation.goBack()} />
        <Text style={styles.title} accessibilityRole="header">
          My items
        </Text>
        <Pressable
          onPress={() => navigation.navigate('MainTabs', { screen: 'Sell' })}
          accessibilityRole="button"
          accessibilityLabel="Sell an item"
          hitSlop={6}
          style={({ pressed }) => [
            styles.sellButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.sellButtonText}>+ Sell</Text>
        </Pressable>
      </View>

      <View style={styles.summary}>
        {[
          { label: 'Active', value: String(active) },
          { label: 'Sold', value: String(sold) },
          {
            label: 'Earned',
            value: formatPrice(earned).replace('Free', 'AED 0'),
          },
        ].map((stat, i) => (
          <View
            key={stat.label}
            style={[styles.summaryItem, i > 0 && styles.summaryDivider]}
            accessible
            accessibilityLabel={`${stat.label}: ${stat.value}`}
          >
            <Text style={styles.summaryValue} numberOfLines={1}>
              {stat.value}
            </Text>
            <Text style={styles.summaryLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.segment} accessibilityRole="tablist">
        {(['selling', 'saved'] as const).map(option => {
          const selected = view === option;
          return (
            <Pressable
              key={option}
              onPress={() => setView(option)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[styles.segmentItem, selected && styles.segmentItemOn]}
            >
              <Text
                style={[styles.segmentText, selected && styles.segmentTextOn]}
              >
                {option === 'selling'
                  ? `Selling · ${mine.length}`
                  : `Wishlist · ${savedItems.length}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <ItemRow
            listing={item}
            mode={view}
            onPress={() =>
              navigation.navigate('ListingDetail', { listingId: item.id })
            }
          />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>
              {view === 'selling' ? '🏷️' : '♡'}
            </Text>
            <Text style={styles.emptyTitle}>
              {view === 'selling'
                ? 'Nothing listed yet'
                : 'Your wishlist is empty'}
            </Text>
            <Text style={styles.emptyText}>
              {view === 'selling'
                ? 'Turn things you no longer use into cash. It takes less than a minute.'
                : 'Tap the heart on any item to keep it here for later.'}
            </Text>
            {view === 'selling' ? (
              <Pressable
                onPress={() =>
                  navigation.navigate('MainTabs', { screen: 'Sell' })
                }
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.emptyButtonText}>Sell your first item</Text>
              </Pressable>
            ) : null}
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
    paddingRight: 24,
    paddingTop: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  sellButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
  },
  sellButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textOnSecondary,
  },
  summary: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: colors.secondary,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  summaryDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(255,255,255,0.25)',
  },
  summaryValue: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fonts.extraBold,
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textOnSecondary,
    opacity: 0.8,
  },
  segment: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
    padding: 4,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemOn: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  segmentTextOn: {
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  cardSold: {
    backgroundColor: colors.surface,
  },
  cardBody: {
    flex: 1,
  },
  cardPrice: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  cardMeta: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  statusButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  statusButtonSold: {
    backgroundColor: colors.secondary,
  },
  statusText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
  },
  statusTextSold: {
    color: colors.textOnSecondary,
  },
  heartButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    fontSize: 24,
    color: colors.accentCoral,
  },
  separator: {
    height: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
    gap: 6,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 4,
    color: colors.accentCoral,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.secondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 12,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textOnSecondary,
  },
});
