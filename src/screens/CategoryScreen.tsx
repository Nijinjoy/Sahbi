import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackButton } from '../components/BackButton';
import { ListingCard } from '../components/ListingCard';
import { CATEGORIES } from '../data/listings';
import { RootStackParamList } from '../navigation/types';
import { useListings, useSaved } from '../state/listings';
import { addRecentCategory } from '../state/recentCategories';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'Category'>;

const SORTS = ['Nearest', 'Newest', 'Lowest price', 'Highest price'] as const;
type Sort = (typeof SORTS)[number];

const GUTTER = 24;
const GAP = 14;

export function CategoryScreen({ navigation, route }: Props) {
  const { name, includes } = route.params;
  const emoji =
    route.params.emoji ??
    CATEGORIES.find(c => c.name === name)?.emoji ??
    '📦';
  const listings = useListings();
  const saved = useSaved();
  const { width } = useWindowDimensions();
  const cardWidth = (width - GUTTER * 2 - GAP) / 2;
  const [sort, setSort] = useState<Sort>('Nearest');

  useEffect(() => {
    addRecentCategory(name);
  }, [name]);

  const results = useMemo(() => {
    const categories = includes ?? [name];
    const items = listings.filter(
      l => categories.includes(l.category) && !l.mine && !l.sold,
    );
    const compare: Record<Sort, (a: typeof items[0], b: typeof items[0]) => number> = {
      Nearest: (a, b) => a.distanceKm - b.distanceKm,
      Newest: (a, b) => a.postedHoursAgo - b.postedHoursAgo,
      'Lowest price': (a, b) => a.price - b.price,
      'Highest price': (a, b) => b.price - a.price,
    };
    return [...items].sort(compare[sort]);
  }, [listings, name, includes, sort]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <BackButton variant="arrow" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle} accessibilityRole="header">
          {emoji} {name}
        </Text>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        ListHeaderComponent={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortRow}
          >
            {SORTS.map(option => {
              const selected = option === sort;
              return (
                <Pressable
                  key={option}
                  onPress={() => setSort(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.chip, selected && styles.chipOn]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        }
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            saved={saved.has(item.id)}
            width={cardWidth}
            onPress={() =>
              navigation.navigate('ListingDetail', { listingId: item.id })
            }
          />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>{emoji}</Text>
            <Text style={styles.emptyTitle}>No {name.toLowerCase()} yet</Text>
            <Text style={styles.emptyText}>
              Check back soon, or be the first to sell something here.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('MainTabs', { screen: 'Sell' })}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.emptyButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.emptyButtonText}>Sell an item</Text>
            </Pressable>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  list: {
    paddingBottom: 24,
  },
  column: {
    paddingHorizontal: GUTTER,
    gap: GAP,
  },
  sortRow: {
    paddingHorizontal: GUTTER,
    paddingTop: 4,
    paddingBottom: 18,
    gap: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  chipTextOn: {
    color: colors.textOnSecondary,
  },
  separator: {
    height: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 6,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 4,
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
