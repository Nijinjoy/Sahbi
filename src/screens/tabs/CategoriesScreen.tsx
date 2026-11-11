import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { categoryStyle, TRENDING_SEARCHES } from '../../data/categoryStyles';
import { CATEGORIES } from '../../data/listings';
import { RootStackParamList } from '../../navigation/types';
import { useListings } from '../../state/listings';
import {
  clearRecentCategories,
  useRecentCategories,
} from '../../state/recentCategories';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const TRENDING_ICON = require('../../assets/icons/categories/trending.png');

export function CategoriesScreen() {
  const listings = useListings();
  const recent = useRecentCategories();
  const [scrolled, setScrolled] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    listings
      .filter(l => !l.mine && !l.sold)
      .forEach(l => {
        result[l.category] = (result[l.category] ?? 0) + 1;
      });
    return result;
  }, [listings]);

  const openCategory = (name: string) =>
    navigation.navigate('Category', { name });

  const search = (query: string) =>
    navigation.navigate('MainTabs', {
      screen: 'Home',
      params: { query },
    });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={[styles.header, scrolled && styles.headerScrolled]}>
        <Text style={styles.title} accessibilityRole="header">
          Categories
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={event => setScrolled(event.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={32}
      >

        {recent.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Recently viewed
              </Text>
              <Pressable
                onPress={clearRecentCategories}
                accessibilityRole="button"
                accessibilityLabel="Clear recently viewed"
                hitSlop={10}
              >
                <Text style={styles.link}>Clear</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.bleed}
              contentContainerStyle={styles.recentRow}
            >
              {recent.map(name => {
                const style = categoryStyle(name);
                return (
                  <Pressable
                    key={name}
                    onPress={() => openCategory(name)}
                    accessibilityRole="button"
                    accessibilityLabel={name}
                    style={({ pressed }) => [
                      styles.recentPill,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[styles.recentIcon, { backgroundColor: style.bg }]}
                    >
                      <Image
                        source={style.icon}
                        style={[styles.recentImage, { tintColor: style.fg }]}
                      />
                    </View>
                    <Text style={styles.recentText}>{name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            All categories
          </Text>
          <Text style={styles.sectionMeta}>
            {CATEGORIES.length} categories
          </Text>
        </View>
        <View style={styles.grid}>
          {CATEGORIES.map(({ name }) => {
            const style = categoryStyle(name);
            const count = counts[name] ?? 0;
            return (
              <Pressable
                key={name}
                onPress={() => openCategory(name)}
                accessibilityRole="button"
                accessibilityLabel={`${name}, ${count} item${count === 1 ? '' : 's'}`}
                style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
              >
                <View style={[styles.circle, { backgroundColor: style.bg }]}>
                  <Image
                    source={style.icon}
                    style={[styles.circleImage, { tintColor: style.fg }]}
                  />
                </View>
                <Text style={styles.cellName} numberOfLines={2}>
                  {name}
                </Text>
                <Text style={styles.cellCount}>
                  {count} item{count === 1 ? '' : 's'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={[styles.sectionTitle, styles.trendingTitle]}
          accessibilityRole="header"
        >
          Trending searches
        </Text>
        <View style={styles.chipWrap}>
          {TRENDING_SEARCHES.map(term => (
            <Pressable
              key={term}
              onPress={() => search(term)}
              accessibilityRole="button"
              accessibilityLabel={`Search for ${term}`}
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            >
              <Image source={TRENDING_ICON} style={styles.chipIcon} />
              <Text style={styles.chipText}>{term}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GUTTER = 24;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
  },
  headerScrolled: {
    borderBottomColor: colors.border,
  },
  content: {
    paddingHorizontal: GUTTER,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  sectionMeta: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  link: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.accentTeal,
    textDecorationLine: 'underline',
  },
  bleed: {
    marginHorizontal: -GUTTER,
  },
  recentRow: {
    paddingHorizontal: GUTTER,
    gap: 8,
  },
  recentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentImage: {
    width: 18,
    height: 18,
  },
  recentText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  cell: {
    width: '33.333%',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleImage: {
    width: 28,
    height: 28,
  },
  cellName: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  cellCount: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  trendingTitle: {
    marginTop: 24,
    marginBottom: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipPressed: {
    backgroundColor: colors.surface,
  },
  chipIcon: {
    width: 14,
    height: 14,
    tintColor: colors.textMuted,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  pressed: {
    opacity: 0.8,
  },
});
