import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '../components/Avatar';
import { BackButton } from '../components/BackButton';
import { ItemImage } from '../components/ItemImage';
import { formatPrice } from '../data/listings';
import {
  findChat,
  isNewListingChat,
  listingIdFromChat,
  ME,
  Message,
  QUICK_REPLIES,
  SAMPLE_MESSAGES,
} from '../data/sampleChats';
import { RootStackParamList } from '../navigation/types';
import { useListings } from '../state/listings';
import { markChatRead } from '../state/readChats';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { Price } from '../components/Price';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const MAX_LENGTH = 1000;

function nowLabel() {
  const d = new Date();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${suffix}`;
}

function Bubble({
  message,
  showTime,
}: {
  message: Message;
  showTime: boolean;
}) {
  const mine = message.from === ME;
  return (
    <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubbleColumn, mine && styles.bubbleColumnMine]}>
        <View
          style={[
            styles.bubble,
            mine ? styles.bubbleMine : styles.bubbleTheirs,
            showTime && (mine ? styles.tailMine : styles.tailTheirs),
          ]}
        >
          <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
            {message.text}
          </Text>
        </View>
        {showTime ? (
          <Text style={[styles.time, mine && styles.timeMine]}>
            {message.time}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function ChatScreen({ navigation, route }: Props) {
  const { chatId } = route.params;
  const insets = useSafeAreaInsets();
  const listings = useListings();
  const isNew = isNewListingChat(chatId);
  const listingId = listingIdFromChat(chatId);
  const listing = listings.find(l => l.id === listingId);
  const chat = useMemo(() => findChat(chatId), [chatId]);

  const name = chat?.name ?? listing?.seller;
  const role = chat?.role ?? 'buying';

  const [messages, setMessages] = useState<Message[]>(
    () => SAMPLE_MESSAGES[chatId] ?? [],
  );
  const [draft, setDraft] = useState('');

  useEffect(() => {
    markChatRead(chatId);
  }, [chatId]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    setMessages(current => [
      ...current,
      { id: `local-${Date.now()}`, from: ME, text: trimmed, time: nowLabel() },
    ]);
    setDraft('');
  };

  if (!name) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton variant="arrow" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.missing}>
          <Text style={styles.missingText}>This chat isn’t available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = chat?.typing
    ? 'typing…'
    : chat?.online
    ? 'Online'
    : role === 'selling'
    ? 'Interested buyer'
    : 'Seller';

  const reversed = [...messages].reverse();
  const canSend = draft.trim().length > 0;
  const showQuickReplies = role === 'buying' && messages.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <BackButton variant="arrow" onPress={() => navigation.goBack()} />
        <Avatar name={name} size={42} />
        <View style={styles.headerText}>
          <Text style={styles.headerName} numberOfLines={1}>
            {name}
          </Text>
          <Text
            style={[
              styles.headerStatus,
              (chat?.online || chat?.typing) && styles.headerStatusActive,
            ]}
          >
            {status}
          </Text>
        </View>
      </View>

      {listing ? (
        <Pressable
          onPress={() =>
            navigation.navigate('ListingDetail', { listingId: listing.id })
          }
          accessibilityRole="button"
          accessibilityLabel={`View item: ${listing.title}, ${formatPrice(
            listing.price,
          )}`}
          style={({ pressed }) => [
            styles.itemBanner,
            pressed && styles.itemBannerPressed,
          ]}
        >
          <ItemImage
            id={listing.id}
            emoji={listing.emoji}
            photo={listing.photo}
            size={44}
            radius={12}
          />
          <View style={styles.headerText}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {listing.title}
            </Text>
            <Price
              amount={listing.price}
              style={styles.itemPrice}
              suffix={listing.sold ? ' · Sold' : undefined}
            />
          </View>
          <Text style={styles.itemChevron}>›</Text>
        </Pressable>
      ) : null}

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <FlatList
          data={reversed}
          inverted
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => {
            const newer = reversed[index - 1];
            return (
              <Bubble message={item} showTime={newer?.from !== item.from} />
            );
          }}
          ListHeaderComponent={
            chat?.typing ? (
              <View style={[styles.bubbleRow, styles.rowTheirs]}>
                <View
                  style={[styles.bubble, styles.bubbleTheirs, styles.typing]}
                >
                  <Text style={styles.typingText}>•••</Text>
                </View>
              </View>
            ) : undefined
          }
          ListFooterComponent={
            <View style={styles.thread}>
              {isNew && messages.length === 0 ? (
                <View style={styles.introCard}>
                  <Avatar name={name} size={64} />
                  <Text style={styles.introTitle}>Message {name}</Text>
                  <Text style={styles.introText}>
                    Ask about the item, agree on a price and pick a time to
                    meet.
                  </Text>
                </View>
              ) : (
                <Text style={styles.dayPill}>Today</Text>
              )}
            </View>
          }
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        />

        {showQuickReplies ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.quickRow}
            style={styles.quickScroll}
          >
            {QUICK_REPLIES.map(text => (
              <Pressable
                key={text}
                onPress={() => send(text)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.quickChip,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.quickText}>{text}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View
          style={[
            styles.composer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={MAX_LENGTH}
            accessibilityLabel={`Message ${name}`}
            style={styles.input}
          />
          <Pressable
            onPress={() => send(draft)}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send"
            accessibilityState={{ disabled: !canSend }}
            style={({ pressed }) => [
              styles.send,
              !canSend && styles.sendDisabled,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.sendArrow, !canSend && styles.sendArrowOff]} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  headerStatus: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  headerStatusActive: {
    color: colors.success,
  },
  messages: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  thread: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  dayPill: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
    backgroundColor: colors.surface,
  },
  itemBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemBannerPressed: {
    backgroundColor: colors.primarySoft,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  itemChevron: {
    fontSize: 28,
    color: colors.textMuted,
  },
  introCard: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  introTitle: {
    marginTop: 6,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  quickScroll: {
    flexGrow: 0,
  },
  quickRow: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  quickChip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
  },
  quickText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  bubbleColumn: {
    maxWidth: '78%',
    alignItems: 'flex-start',
  },
  bubbleColumnMine: {
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  bubbleMine: {
    backgroundColor: colors.secondary,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tailMine: {
    borderBottomRightRadius: 6,
  },
  tailTheirs: {
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  bubbleTextMine: {
    color: colors.textOnSecondary,
  },
  time: {
    marginTop: 3,
    marginLeft: 4,
    marginBottom: 6,
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  timeMine: {
    marginLeft: 0,
    marginRight: 4,
  },
  typing: {
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 20,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: colors.surface,
  },
  sendArrow: {
    width: 12,
    height: 12,
    marginTop: 4,
    borderLeftWidth: 2.5,
    borderTopWidth: 2.5,
    borderColor: colors.textOnSecondary,
    transform: [{ rotate: '45deg' }],
  },
  sendArrowOff: {
    borderColor: colors.textMuted,
  },
  pressed: {
    opacity: 0.85,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});
