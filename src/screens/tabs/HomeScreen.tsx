import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
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
import { ProductCard } from '../../components/ProductCard';
import { CATEGORIES } from '../../data/listings';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useListings, useSaved } from '../../state/listings';
import { useProfile } from '../../state/profile';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const GUTTER = 16;
const GAP = 12;
const ALL = 'All';
const SEARCH_ICON = require('../../assets/icons/search.png');

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

  // The Categories tab can open Home with a search already filled in.
  const incomingQuery = route.params?.query;
  useEffect(() => {
    if (incomingQuery !== undefined) {
      setQuery(incomingQuery);
      setCategory(ALL);
    }
  }, [incomingQuery]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter(
      l =>
        !l.mine &&
        !l.sold &&
        (category === ALL || l.category === category) &&
        (q === '' ||
          l.title.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)),
    );
  }, [listings, query, category]);

  const cardWidth = (width - GUTTER * 2 - GAP) / 2;
  const firstName = profile.name?.split(' ')[0];
  const place = profile.area ?? profile.city ?? 'the UAE';
  const filtering = query.trim() !== '' || category !== ALL;

  const clearFilters = () => {
    setQuery('');
    setCategory(ALL);
  };

  const header = (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {[{ name: ALL, emoji: '✨' }, ...CATEGORIES].map(c => {
          const on = category === c.name;
          return (
            <Pressable
              key={c.name}
              onPress={() => setCategory(c.name)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [
                styles.chip,
                on && styles.chipOn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.chipEmoji}>{c.emoji}</Text>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {filtering ? 'Results' : 'Fresh near you'}
        </Text>
        <Text style={styles.sectionCount}>
          {results.length} {results.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroRow}>
          <View style={styles.flex}>
            <Text style={styles.greeting}>
              {firstName ? `Hi, ${firstName} 👋` : 'Hi there 👋'}
            </Text>
            <Text style={styles.location} numberOfLines={1}>
              📍 {place}
            </Text>
          </View>
          <Image
            source={require('../../assets/app_icon.png')}
            style={styles.logo}
            accessibilityLabel="Sahbi"
          />
        </View>

        <View style={styles.search}>
          <Image source={SEARCH_ICON} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search sofas, phones, bikes…"
            placeholderTextColor={colors.textMuted}
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
            >
              <Text style={styles.clear}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        numColumns={2}
        ListHeaderComponent={header}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard
            listing={item}
            saved={saved.has(item.id)}
            width={cardWidth}
            onPress={() =>
              navigation.navigate('ListingDetail', { listingId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
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
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },

  hero: {
    backgroundColor: colors.secondary,
    paddingHorizontal: GUTTER,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fonts.extraBold,
    color: colors.textOnSecondary,
  },
  location: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.75)',
  },
  logo: {
    width: 40,
    height: 40,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  searchIcon: {
    width: 18,
    height: 18,
    tintColor: colors.textMuted,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  clear: {
    fontSize: 14,
    color: colors.textMuted,
  },

  chips: {
    gap: 8,
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  chipTextOn: {
    color: colors.textOnSecondary,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: GUTTER,
    paddingTop: 18,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.accentTeal,
  },

  list: {
    paddingBottom: 24,
  },
  row: {
    gap: GAP,
    paddingHorizontal: GUTTER,
    marginBottom: GAP,
  },

  empty: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.secondary,
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
    backgroundColor: colors.secondary,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textOnSecondary,
  },
});
