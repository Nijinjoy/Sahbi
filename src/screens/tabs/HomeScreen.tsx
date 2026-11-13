import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ItemImage } from '../../components/ItemImage';
import { categoryStyle } from '../../data/categoryStyles';
import {
  CATEGORIES,
  Condition,
  formatPrice,
  Listing,
  postedLabel,
} from '../../data/listings';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { toggleSaved, useListings, useSaved } from '../../state/listings';
import { useProfile } from '../../state/profile';
import { NotificationBell } from '../../components/NotificationBell';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const GUTTER = 16;
const GAP = 12;
const ALL = 'All';
const GOLD_DEEP = '#A87F3D';
const BUBBLE = 62;
const SPOTLIGHT_WIDTH = 236;
type Section =
  | 'header'
  | 'search'
  | 'bubbles'
  | 'justListed'
  | 'condition'
  | 'nearby'
  | 'sell'
  | 'exploreTitle'
  | 'grid'
  | 'empty';

const SEARCH_ICON = require('../../assets/icons/search.png');

const CONDITION_CARDS: {
  name: Condition;
  hint: string;
  level: number;
  tint: string;
}[] = [
  { name: 'New', hint: 'Unused, often boxed', level: 4, tint: '#10B981' },
  { name: 'Like new', hint: 'Barely used', level: 3, tint: '#2DD4BF' },
  { name: 'Good', hint: 'Light signs of use', level: 2, tint: '#D8B577' },
  { name: 'Fair', hint: 'Worn, works well', level: 1, tint: '#E2A06B' },
];

type HeartProps = { id: string; saved: boolean; small?: boolean };

function HeartButton({ id, saved, small }: HeartProps) {
  return (
    <Pressable
      onPress={() => toggleSaved(id)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      accessibilityState={{ selected: saved }}
      style={[styles.heart, small && styles.heartSmall]}
    >
      <Text style={[styles.heartText, saved && styles.heartOn]}>
        {saved ? '♥' : '♡'}
      </Text>
    </Pressable>
  );
}

type SpotlightProps = {
  listing: Listing;
  saved: boolean;
  badge: string;
  meta: string;
  onPress: () => void;
};

function SpotlightCard({
  listing,
  saved,
  badge,
  meta,
  onPress,
}: SpotlightProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${a11yLabel(listing)}, ${badge}`}
      style={({ pressed }) => [styles.spotlight, pressed && styles.pressed]}
    >
      <ItemImage
        id={listing.id}
        emoji={listing.emoji}
        photo={listing.photo}
        radius={18}
        style={styles.spotlightPhoto}
      />
      <View style={styles.timeBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.timeText}>{badge}</Text>
      </View>
      <HeartButton id={listing.id} saved={saved} />
      <View style={styles.spotlightBody}>
        <Text style={styles.spotlightTitle} numberOfLines={1}>
          {listing.title}
        </Text>
        <View style={styles.spotlightRowInfo}>
          <Text
            style={[
              styles.spotlightPrice,
              listing.price === 0 && styles.priceFree,
            ]}
          >
            {formatPrice(listing.price)}
          </Text>
          <Text style={styles.spotlightMeta} numberOfLines={1}>
            {meta}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  return hour < 17 ? 'Good afternoon' : 'Good evening';
}

function a11yLabel(listing: Listing) {
  return `${listing.title}, ${formatPrice(listing.price)}, ${
    listing.condition
  }, ${listing.area}, posted ${postedLabel(listing.postedHoursAgo)}`;
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Home'>>();
  const listings = useListings();
  const saved = useSaved();
  const profile = useProfile();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(ALL);
  const [condition, setCondition] = useState<Condition | null>(null);

  const incomingQuery = route.params?.query;
  useEffect(() => {
    if (incomingQuery !== undefined) {
      setQuery(incomingQuery);
      setCategory(ALL);
      setCondition(null);
    }
  }, [incomingQuery]);

  const available = useMemo(
    () => listings.filter(l => !l.mine && !l.sold),
    [listings],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return available.filter(
      l =>
        (category === ALL || l.category === category) &&
        (condition === null || l.condition === condition) &&
        (q === '' ||
          l.title.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)),
    );
  }, [available, query, category, condition]);

  const conditionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    available.forEach(l => {
      if (category === ALL || l.category === category) {
        counts[l.condition] = (counts[l.condition] ?? 0) + 1;
      }
    });
    return counts;
  }, [available, category]);

  const justListed = useMemo(
    () =>
      [...available]
        .sort((a, b) => a.postedHoursAgo - b.postedHoursAgo)
        .slice(0, 5),
    [available],
  );

  const nearby = useMemo(
    () =>
      [...available].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 6),
    [available],
  );

  const columnWidth = (width - GUTTER * 2 - GAP) / 2;
  const columns = useMemo(() => {
    const left: Listing[] = [];
    const right: Listing[] = [];
    results.forEach((item, i) => (i % 2 === 0 ? left : right).push(item));
    return [left, right];
  }, [results]);

  const place = profile.area ?? profile.city ?? 'the UAE';
  const searching = query.trim() !== '';
  const filtering = searching || category !== ALL || condition !== null;

  const openListing = (id: string) =>
    navigation.navigate('ListingDetail', { listingId: id });
  const openSell = () => navigation.navigate('MainTabs', { screen: 'Sell' });
  const clearFilters = () => {
    setQuery('');
    setCategory(ALL);
    setCondition(null);
  };

  const bubbleNames = [ALL, ...CATEGORIES.map(c => c.name)];

  const sections: Section[] = [
    'header',
    'search',
    'bubbles',
    ...(!filtering ? (['justListed'] as const) : []),
    ...(!searching ? (['condition'] as const) : []),
    ...(!filtering ? (['nearby', 'sell'] as const) : []),
    'exploreTitle',
    results.length > 0 ? 'grid' : 'empty',
  ];

  const renderTile = (item: Listing, index: number, col: number) => {
    const tall = (index + col) % 2 === 0;
    return (
      <Pressable
        onPress={() => openListing(item.id)}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel(item)}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      >
        <View>
          <ItemImage
            id={item.id}
            emoji={item.emoji}
            photo={item.photo}
            radius={18}
            style={[
              styles.tilePhoto,
              { height: columnWidth * (tall ? 1.3 : 0.95) },
            ]}
          />
          <HeartButton id={item.id} saved={saved.has(item.id)} small />
          <View style={styles.priceTag}>
            <Text
              style={[
                styles.priceTagText,
                item.price === 0 && styles.priceFree,
              ]}
            >
              {formatPrice(item.price)}
            </Text>
          </View>
        </View>
        <Text style={styles.tileTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.metaText} numberOfLines={1}>
          {item.condition} · {item.area}
        </Text>
      </Pressable>
    );
  };

  const renderSection = (section: Section) => {
    switch (section) {
      case 'header':
        return (
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{greeting()} 👋</Text>
              <Text style={styles.headline} accessibilityRole="header">
                Discover <Text style={styles.headlineAccent}>pre-loved</Text>
              </Text>
            </View>
            <NotificationBell />
          </View>
        );

      case 'search':
        return (
          <View style={styles.searchWrap}>
            <View style={styles.search}>
              <Image source={SEARCH_ICON} style={styles.searchIcon} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search sofas, phones, bikes…"
                placeholderTextColor="#A39C8E"
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel="Search items"
                style={styles.searchInput}
              />
              {query ? (
                <Pressable
                  onPress={() => setQuery('')}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  style={styles.clearButton}
                >
                  <Text style={styles.clear}>✕</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );

      case 'bubbles':
        return (
          <FlatList
            horizontal
            data={bubbleNames}
            keyExtractor={name => name}
            extraData={category}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bubbles}
            renderItem={({ item: name }) => {
              const on = category === name;
              return (
                <Pressable
                  onPress={() => setCategory(on && name !== ALL ? ALL : name)}
                  accessibilityRole="button"
                  accessibilityLabel={name}
                  accessibilityState={{ selected: on }}
                  style={({ pressed }) => [
                    styles.bubbleItem,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.bubbleRing, on && styles.bubbleRingOn]}>
                    {name === ALL ? (
                      <View style={[styles.bubble, styles.bubbleAll]}>
                        <Image
                          source={require('../../assets/welcome_knot.png')}
                          style={styles.bubbleKnot}
                        />
                      </View>
                    ) : (
                      <Image
                        source={categoryStyle(name).photo}
                        style={styles.bubble}
                      />
                    )}
                  </View>
                  <Text
                    style={[styles.bubbleLabel, on && styles.bubbleLabelOn]}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                </Pressable>
              );
            }}
          />
        );

      case 'justListed':
        return (
          <View>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Just listed
              </Text>
              <Text style={styles.sectionHint}>Fresh finds</Text>
            </View>
            <FlatList
              horizontal
              data={justListed}
              keyExtractor={item => item.id}
              extraData={saved}
              showsHorizontalScrollIndicator={false}
              snapToInterval={SPOTLIGHT_WIDTH + GAP}
              decelerationRate="fast"
              contentContainerStyle={styles.spotlightRow}
              renderItem={({ item }) => (
                <SpotlightCard
                  listing={item}
                  saved={saved.has(item.id)}
                  badge={postedLabel(item.postedHoursAgo)}
                  meta={`${item.distanceKm.toFixed(1)} km`}
                  onPress={() => openListing(item.id)}
                />
              )}
            />
          </View>
        );

      case 'condition':
        return (
          <View>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Shop by condition
              </Text>
              {condition && (
                <Pressable
                  onPress={() => setCondition(null)}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <Text style={styles.sectionHint}>Clear</Text>
                </Pressable>
              )}
            </View>
            <FlatList
              horizontal
              data={CONDITION_CARDS}
              keyExtractor={card => card.name}
              extraData={[condition, conditionCounts]}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.conditionRow}
              renderItem={({ item: card }) => {
                const on = condition === card.name;
                const count = conditionCounts[card.name] ?? 0;
                return (
                  <Pressable
                    onPress={() => setCondition(on ? null : card.name)}
                    accessibilityRole="button"
                    accessibilityLabel={`${card.name}, ${card.hint}, ${count} ${
                      count === 1 ? 'item' : 'items'
                    }`}
                    accessibilityState={{ selected: on }}
                    style={({ pressed }) => [
                      styles.conditionCard,
                      on && styles.conditionCardOn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.levelRow}>
                      {[1, 2, 3, 4].map(n => (
                        <View
                          key={n}
                          style={[
                            styles.levelBar,
                            {
                              backgroundColor:
                                n <= card.level
                                  ? card.tint
                                  : on
                                  ? 'rgba(251,246,236,0.2)'
                                  : 'rgba(15,63,46,0.1)',
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text
                      style={[
                        styles.conditionName,
                        on && styles.conditionNameOn,
                      ]}
                    >
                      {card.name}
                    </Text>
                    <Text
                      style={[
                        styles.conditionHint,
                        on && styles.conditionHintOn,
                      ]}
                      numberOfLines={1}
                    >
                      {card.hint}
                    </Text>
                    <Text
                      style={[
                        styles.conditionCount,
                        on && styles.conditionCountOn,
                      ]}
                    >
                      {count} {count === 1 ? 'item' : 'items'}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        );

      case 'nearby':
        return (
          <View>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Nearby finds
              </Text>
              <Text style={styles.sectionHint}>Closest first</Text>
            </View>
            <FlatList
              horizontal
              data={nearby}
              keyExtractor={item => item.id}
              extraData={saved}
              showsHorizontalScrollIndicator={false}
              snapToInterval={SPOTLIGHT_WIDTH + GAP}
              decelerationRate="fast"
              contentContainerStyle={styles.spotlightRow}
              renderItem={({ item }) => (
                <SpotlightCard
                  listing={item}
                  saved={saved.has(item.id)}
                  badge={`${item.distanceKm.toFixed(1)} km away`}
                  meta={item.area}
                  onPress={() => openListing(item.id)}
                />
              )}
            />
          </View>
        );

      case 'sell':
        return (
          <Pressable
            onPress={openSell}
            accessibilityRole="button"
            accessibilityLabel="Sell something. Turn clutter into cash."
            style={({ pressed }) => [
              styles.sellBanner,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.sellBlob} />
            <View style={styles.flex}>
              <Text style={styles.sellTitle}>Turn clutter into cash</Text>
              <Text style={styles.sellText}>
                List an item in under a minute.
              </Text>
            </View>
            <View style={styles.sellButton}>
              <Text style={styles.sellButtonText}>Sell</Text>
            </View>
          </Pressable>
        );

      case 'exploreTitle':
        return (
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {filtering ? 'Results' : `Explore ${place}`}
            </Text>
            <Text style={styles.sectionHint}>
              {results.length} {results.length === 1 ? 'item' : 'items'}
            </Text>
          </View>
        );

      case 'empty':
        return (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              Try another search or category.
            </Text>
            <Pressable
              onPress={clearFilters}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.emptyButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.emptyButtonText}>Show everything</Text>
            </Pressable>
          </View>
        );

      case 'grid':
        return (
          <View style={styles.masonry}>
            {columns.map((column, col) => (
              <FlatList
                key={col}
                data={column}
                keyExtractor={item => item.id}
                extraData={saved}
                scrollEnabled={false}
                style={{ width: columnWidth }}
                contentContainerStyle={styles.column}
                renderItem={({ item, index }) => renderTile(item, index, col)}
              />
            ))}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.blob, styles.blobTop]} pointerEvents="none" />

      <FlatList
        data={sections}
        keyExtractor={section => section}
        renderItem={({ item }) => renderSection(item)}
        extraData={[query, category, condition, saved, results, place]}
        style={{ marginTop: insets.top }}
        contentContainerStyle={styles.scroll}
        stickyHeaderIndices={[1]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandIvory,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 320,
    height: 320,
    top: -170,
    right: -130,
    backgroundColor: colors.brandGold,
    opacity: 0.18,
  },
  scroll: {
    paddingTop: 4,
    paddingBottom: 16,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: GUTTER,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  headline: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fonts.extraBold,
    color: colors.brandForest,
  },
  headlineAccent: {
    color: GOLD_DEEP,
  },

  searchWrap: {
    paddingHorizontal: GUTTER,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: colors.brandIvory,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(168,127,61,0.3)',
    shadowColor: colors.brandForest,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchIcon: {
    width: 18,
    height: 18,
    tintColor: colors.brandForest,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.brandForest,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15,63,46,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clear: {
    fontSize: 11,
    color: colors.brandForest,
  },

  bubbles: {
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingTop: 4,
  },
  bubbleItem: {
    width: BUBBLE + 10,
    alignItems: 'center',
  },
  bubbleRing: {
    padding: 2,
    borderRadius: (BUBBLE + 10) / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bubbleRingOn: {
    borderColor: colors.brandForest,
  },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    backgroundColor: colors.surface,
  },
  bubbleAll: {
    backgroundColor: colors.brandForest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleKnot: {
    width: 38,
    height: 38,
  },
  bubbleLabel: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  bubbleLabelOn: {
    fontFamily: fonts.bold,
    color: colors.brandForest,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    flexShrink: 1,
    fontSize: 20,
    fontFamily: fonts.extraBold,
    color: colors.brandForest,
  },
  sectionHint: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: GOLD_DEEP,
  },

  spotlightRow: {
    gap: GAP,
    paddingHorizontal: GUTTER,
    paddingBottom: 4,
  },
  spotlight: {
    width: SPOTLIGHT_WIDTH,
    padding: 6,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.brandForest,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  spotlightPhoto: {
    width: '100%',
    height: 150,
  },
  spotlightBody: {
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 4,
  },
  spotlightTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.brandForest,
  },
  spotlightRowInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  spotlightMeta: {
    flexShrink: 1,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  spotlightPrice: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.brandForest,
  },
  timeBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(15,63,46,0.85)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brandMint,
  },
  timeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.textOnSecondary,
  },

  heart: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartSmall: {
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  heartText: {
    fontSize: 17,
    lineHeight: 21,
    color: colors.brandForest,
  },
  heartOn: {
    color: colors.accentCoral,
  },

  conditionRow: {
    gap: 10,
    paddingHorizontal: GUTTER,
    paddingBottom: 4,
  },
  conditionCard: {
    width: 138,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(168,127,61,0.22)',
  },
  conditionCardOn: {
    backgroundColor: colors.brandForest,
    borderColor: colors.brandForest,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  levelBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  conditionName: {
    fontSize: 17,
    fontFamily: fonts.extraBold,
    color: colors.brandForest,
  },
  conditionNameOn: {
    color: colors.brandIvory,
  },
  conditionHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  conditionHintOn: {
    color: 'rgba(251,246,236,0.75)',
  },
  conditionCount: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.bold,
    color: GOLD_DEEP,
  },
  conditionCountOn: {
    color: colors.brandGold,
  },
  sellBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: GUTTER,
    marginTop: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.brandForest,
    overflow: 'hidden',
  },
  sellBlob: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    right: -50,
    top: -70,
    backgroundColor: colors.brandGold,
    opacity: 0.18,
  },
  sellTitle: {
    fontSize: 17,
    fontFamily: fonts.extraBold,
    color: colors.brandIvory,
  },
  sellText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: 'rgba(251,246,236,0.75)',
  },
  sellButton: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brandGold,
    justifyContent: 'center',
  },
  sellButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.brandForest,
  },

  masonry: {
    flexDirection: 'row',
    gap: GAP,
    paddingHorizontal: GUTTER,
  },
  column: {
    gap: 12,
  },
  tile: {
    gap: 2,
  },
  tilePhoto: {
    width: '100%',
  },
  priceTag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.brandIvory,
  },
  priceTagText: {
    fontSize: 13,
    fontFamily: fonts.extraBold,
    color: colors.brandForest,
  },
  priceFree: {
    color: colors.accentTeal,
  },
  tileTitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.semiBold,
    color: colors.brandForest,
  },
  metaText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },

  empty: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.brandForest,
  },
  emptyText: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: colors.brandForest,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.brandIvory,
  },
});
