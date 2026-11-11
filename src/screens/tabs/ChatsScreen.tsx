import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '../../components/Avatar';
import { formatPrice, Listing } from '../../data/listings';
import { Chat, SAMPLE_CHATS } from '../../data/sampleChats';
import { RootStackParamList } from '../../navigation/types';
import { useListings } from '../../state/listings';
import { useReadChats } from '../../state/readChats';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const FILTERS = ['All', 'Unread', 'Buying', 'Selling'] as const;
type Filter = (typeof FILTERS)[number];

const SEARCH_ICON = require('../../assets/icons/search.png');

function ChatRow({
  chat,
  listing,
  onPress,
}: {
  chat: Chat;
  listing: Listing | undefined;
  onPress: () => void;
}) {
  const unread = chat.unread > 0;
  const subject = listing
    ? `${listing.title} · ${listing.sold ? 'Sold' : formatPrice(listing.price)}`
    : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${chat.name}${subject ? `, ${subject}` : ''}. ${chat.lastMessage}. ${chat.time}${unread ? `. ${chat.unread} unread` : ''}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar name={chat.name} size={48} />

      <View style={styles.rowBody}>
        <View style={styles.rowLine}>
          <Text
            style={[styles.name, unread && styles.nameUnread]}
            numberOfLines={1}
          >
            {chat.name}
          </Text>
          <Text style={[styles.time, unread && styles.timeUnread]}>
            {chat.time}
          </Text>
        </View>
        {subject ? (
          <Text style={styles.subject} numberOfLines={1}>
            {subject}
          </Text>
        ) : null}
        <View style={styles.rowLine}>
          <Text
            style={[
              styles.preview,
              unread && styles.previewUnread,
              chat.typing && styles.typing,
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage}
          </Text>
          {unread ? <View style={styles.dot} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

export function ChatsScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [searchFocused, setSearchFocused] = useState(false);
  const readIds = useReadChats();
  const listings = useListings();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const listingFor = (chat: Chat) =>
    listings.find(l => l.id === chat.listingId);

  const allChats = useMemo(
    () =>
      SAMPLE_CHATS.map(chat =>
        readIds.has(chat.id) ? { ...chat, unread: 0 } : chat,
      ),
    [readIds],
  );

  const chats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allChats.filter(chat => {
      if (filter === 'Unread' && chat.unread === 0) {
        return false;
      }
      if (filter === 'Buying' && chat.role !== 'buying') {
        return false;
      }
      if (filter === 'Selling' && chat.role !== 'selling') {
        return false;
      }
      if (q === '') {
        return true;
      }
      const title =
        listings.find(l => l.id === chat.listingId)?.title.toLowerCase() ?? '';
      return chat.name.toLowerCase().includes(q) || title.includes(q);
    });
  }, [allChats, query, filter, listings]);

  const emptyText =
    query !== ''
      ? `No chats match “${query.trim()}”.`
      : filter === 'Unread'
      ? 'You’re all caught up.'
      : filter === 'Selling'
      ? 'Messages from buyers will appear here.'
      : 'Message a seller from any item to start a chat.';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Chats
        </Text>

        <View style={[styles.search, searchFocused && styles.searchFocused]}>
          <Image source={SEARCH_ICON} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search chats"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.tabs} accessibilityRole="tablist">
          {FILTERS.map(option => {
            const selected = option === filter;
            return (
              <Pressable
                key={option}
                onPress={() => setFilter(option)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                hitSlop={8}
                style={styles.tab}
              >
                <Text style={[styles.tabText, selected && styles.tabTextOn]}>
                  {option}
                </Text>
                <View
                  style={[styles.tabLine, selected && styles.tabLineOn]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatRow
            chat={item}
            listing={listingFor(item)}
            onPress={() => navigation.navigate('Chat', { chatId: item.id })}
          />
        )}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchFocused: {
    borderColor: colors.secondary,
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
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  tabs: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },
  tab: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  tabTextOn: {
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  tabLine: {
    alignSelf: 'stretch',
    height: 2,
    marginTop: 6,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  tabLineOn: {
    backgroundColor: colors.secondary,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingVertical: 12,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  rowBody: {
    flex: 1,
  },
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  nameUnread: {
    fontFamily: fonts.bold,
  },
  time: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  timeUnread: {
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  subject: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  preview: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  previewUnread: {
    fontFamily: fonts.medium,
    color: colors.secondary,
  },
  typing: {
    color: colors.accentTeal,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentCoral,
  },
  empty: {
    paddingHorizontal: GUTTER,
    paddingVertical: 40,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
