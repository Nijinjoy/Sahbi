import { useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CATEGORY_GROUPS, CategoryGroup } from '../../data/categoryGroups';
import { RootStackParamList } from '../../navigation/types';
import { useListings } from '../../state/listings';
import { NotificationBell } from '../../components/NotificationBell';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const GUTTER = 16;
const GAP = 12;
const CARD_HEIGHT = 210;
const SEARCH_ICON = require('../../assets/icons/search.png');

export function CategoriesScreen() {
  const { width } = useWindowDimensions();
  const listings = useListings();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cardWidth = (width - GUTTER * 2 - GAP) / 2;
  const [query, setQuery] = useState('');
  const trimmed = query.trim();

  const groups = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (!q) {
      return CATEGORY_GROUPS;
    }
    return CATEGORY_GROUPS.filter(
      group =>
        group.name.toLowerCase().includes(q) ||
        group.subcategories.some(sub => sub.toLowerCase().includes(q)),
    );
  }, [trimmed]);

  const searchItems = () =>
    navigation.navigate('MainTabs', {
      screen: 'Home',
      params: { query: trimmed },
    });

  const counts = useMemo(() => {
    const byCategory: Record<string, number> = {};
    listings
      .filter(l => !l.mine && !l.sold)
      .forEach(l => {
        byCategory[l.category] = (byCategory[l.category] ?? 0) + 1;
      });
    const result: Record<string, number> = {};
    CATEGORY_GROUPS.forEach(group => {
      result[group.name] = group.includes.reduce(
        (sum, name) => sum + (byCategory[name] ?? 0),
        0,
      );
    });
    return result;
  }, [listings]);

  const openGroup = (group: CategoryGroup) =>
    navigation.navigate('Category', {
      name: group.name,
      includes: group.includes,
      emoji: group.emoji,
    });

  const renderCard = ({ item }: { item: CategoryGroup }) => {
    const count = counts[item.name] ?? 0;
    const countLabel = `${count} ${count === 1 ? 'item' : 'items'}`;
    return (
      <Pressable
        onPress={() => openGroup(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}: ${item.subcategories.join(
          ', ',
        )}. ${countLabel}`}
        style={({ pressed }) => [
          styles.card,
          { width: cardWidth },
          !item.photo && styles.cardPlain,
          pressed && styles.pressed,
        ]}
      >
        {item.photo ? (
          <Image source={item.photo} style={styles.photo} />
        ) : (
          <Image
            source={require('../../assets/welcome_knot.png')}
            style={styles.knot}
          />
        )}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{countLabel}</Text>
        </View>
        <View style={styles.caption}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.subs} numberOfLines={2}>
            {item.subcategories.join(' · ')}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.blob} pointerEvents="none" />
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} accessibilityRole="header">
            Categories
          </Text>
          <NotificationBell />
        </View>
        <View style={styles.search}>
          <Image source={SEARCH_ICON} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search categories…"
            placeholderTextColor="#A39C8E"
            returnKeyType="search"
            onSubmitEditing={() => {
              if (trimmed && groups.length === 0) {
                searchItems();
              }
            }}
            autoCorrect={false}
            accessibilityLabel="Search categories"
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

      <FlatList
        data={groups}
        keyExtractor={group => group.name}
        extraData={counts}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={renderCard}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No categories match</Text>
            <Text style={styles.emptyText}>
              Try searching all items instead.
            </Text>
            <Pressable
              onPress={searchItems}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.emptyButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.emptyButtonText} numberOfLines={1}>
                Search items for “{trimmed}”
              </Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    marginTop: 10,
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
  empty: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
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
    maxWidth: '100%',
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
  container: {
    flex: 1,
    backgroundColor: colors.brandIvory,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 320,
    height: 320,
    top: -170,
    right: -130,
    borderRadius: 999,
    backgroundColor: colors.brandGold,
    opacity: 0.18,
  },
  header: {
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.extraBold,
    color: colors.brandForest,
  },
  list: {
    paddingHorizontal: GUTTER,
    paddingTop: 8,
    paddingBottom: 24,
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    justifyContent: 'flex-end',
  },
  cardPlain: {
    backgroundColor: colors.brandForest,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  photo: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  knot: {
    position: 'absolute',
    top: 34,
    width: 92,
    height: 92,
  },
  countBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.brandIvory,
  },
  countText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.brandForest,
  },
  caption: {
    alignSelf: 'stretch',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'rgba(15,63,46,0.82)',
  },
  name: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.extraBold,
    color: colors.brandIvory,
  },
  subs: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: 'rgba(251,246,236,0.8)',
  },
});
