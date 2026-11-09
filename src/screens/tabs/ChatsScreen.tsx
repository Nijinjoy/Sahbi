import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '../../components/Avatar';
import { GroupAvatar } from '../../components/GroupAvatar';
import {
  Chat,
  CITY_EVENT_CHATS,
  SAMPLE_CHATS,
  SAMPLE_WAVES,
  waveChatId,
} from '../../data/sampleChats';
import { RootStackParamList } from '../../navigation/types';
import { useReadChats } from '../../state/readChats';
import { useCityEventsGoing } from '../../state/cityEventsGoing';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const FILTERS = ['All', 'Unread', 'Groups'] as const;
type Filter = (typeof FILTERS)[number];

function ChatRow({ chat, onPress }: { chat: Chat; onPress: () => void }) {
  const isGroup = Boolean(chat.groupEmoji);
  const hasUnread = chat.unread > 0;
  const preview = chat.lastSender
    ? `${chat.lastSender}: ${chat.lastMessage}`
    : chat.lastMessage;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${chat.name}${isGroup ? `, group of ${chat.members}` : ''}. ${preview}. ${chat.time}${hasUnread ? `. ${chat.unread} unread` : ''}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View>
        {isGroup ? (
          <GroupAvatar emoji={chat.groupEmoji as string} />
        ) : (
          <Avatar name={chat.name} size={56} />
        )}
        {chat.online ? <View style={styles.onlineDot} /> : null}
      </View>

      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text
            style={[styles.rowName, hasUnread && styles.rowNameUnread]}
            numberOfLines={1}
          >
            {chat.name}
          </Text>
          <Text style={[styles.rowTime, hasUnread && styles.rowTimeUnread]}>
            {chat.time}
          </Text>
        </View>
        <View style={styles.rowBottom}>
          <Text
            style={[
              styles.rowPreview,
              hasUnread && styles.rowPreviewUnread,
              chat.typing && styles.rowTyping,
            ]}
            numberOfLines={1}
          >
            {preview}
          </Text>
          {hasUnread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chat.unread}</Text>
            </View>
          ) : null}
        </View>
        {isGroup ? (
          <Text style={styles.rowMembers}>{chat.members} members</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function ChatsScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const goingIds = useCityEventsGoing();
  const readIds = useReadChats();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const openChat = (chatId: string) => navigation.navigate('Chat', { chatId });

  const allChats = useMemo(() => {
    const eventChats = Object.entries(CITY_EVENT_CHATS)
      .filter(([eventId]) => goingIds.has(eventId))
      .map(([, chat]) => chat);
    return [...eventChats, ...SAMPLE_CHATS].map(chat =>
      readIds.has(chat.id) ? { ...chat, unread: 0 } : chat,
    );
  }, [goingIds, readIds]);

  const chats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allChats.filter(chat => {
      if (filter === 'Unread' && chat.unread === 0) {
        return false;
      }
      if (filter === 'Groups' && !chat.groupEmoji) {
        return false;
      }
      return q === '' || chat.name.toLowerCase().includes(q);
    });
  }, [allChats, query, filter]);

  const unreadTotal = allChats.filter(c => c.unread > 0).length;

  const fixedHeader = (
    <View style={[styles.fixedHeader, scrolled && styles.fixedHeaderScrolled]}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Chats
        </Text>
      </View>

      <View style={[styles.search, searchFocused && styles.searchFocused]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search chats"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search chats"
          style={styles.searchInput}
        />
      </View>
    </View>
  );

  const header = (
    <View>
      {query === '' ? (
        <>
          <Text style={styles.sectionTitle}>New waves 👋</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wavesRow}
          >
            {SAMPLE_WAVES.map(name => (
              <Pressable
                key={name}
                onPress={() => openChat(waveChatId(name))}
                accessibilityRole="button"
                accessibilityLabel={`${name} waved at you`}
                style={({ pressed }) => [
                  styles.wave,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.waveRing}>
                  <Avatar name={name} size={56} />
                </View>
                <Text style={styles.waveName} numberOfLines={1}>
                  {name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}

      <View style={styles.filterRow}>
        {FILTERS.map(option => {
          const selected = option === filter;
          return (
            <Pressable
              key={option}
              onPress={() => setFilter(option)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.filterChip, selected && styles.filterChipOn]}
            >
              <Text
                style={[styles.filterText, selected && styles.filterTextOn]}
              >
                {option === 'Unread' && unreadTotal > 0
                  ? `Unread · ${unreadTotal}`
                  : option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {fixedHeader}
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <ChatRow chat={item} onPress={() => openChat(item.id)} />
        )}
        ItemSeparatorComponent={Separator}
        onScroll={event =>
          setScrolled(event.nativeEvent.contentOffset.y > 4)
        }
        scrollEventThrottle={32}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>
              {query !== ''
                ? `No chats matching “${query.trim()}”`
                : filter === 'Unread'
                ? 'You’re all caught up'
                : 'No group chats yet'}
            </Text>
            <Text style={styles.emptyText}>
              {query !== ''
                ? 'Try a different name.'
                : filter === 'Unread'
                ? 'New messages will show up here.'
                : 'Join a meetup or city event to get its group chat.'}
            </Text>
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
  fixedHeader: {
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
  },
  fixedHeaderScrolled: {
    borderBottomColor: colors.border,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
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
    marginHorizontal: 24,
    marginTop: 12,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 8,
  },
  searchFocused: {
    borderColor: colors.secondary,
    backgroundColor: colors.background,
  },
  searchIcon: {
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  sectionTitle: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  wavesRow: {
    paddingHorizontal: 24,
    gap: 14,
  },
  wave: {
    width: 64,
    alignItems: 'center',
    gap: 6,
  },
  waveRing: {
    padding: 2,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  waveName: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  filterChipOn: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  filterTextOn: {
    color: colors.textOnSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2.5,
    borderColor: colors.background,
  },
  rowBody: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowName: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  rowNameUnread: {
    fontFamily: fonts.bold,
  },
  rowTime: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  rowTimeUnread: {
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowPreview: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  rowPreviewUnread: {
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  rowTyping: {
    fontFamily: fonts.semiBold,
    color: colors.accentTeal,
  },
  rowMembers: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 94,
    marginRight: 24,
    backgroundColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
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
});
