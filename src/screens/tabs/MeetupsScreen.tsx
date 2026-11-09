import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '../../components/Avatar';
import { CityEventsRow } from '../../components/CityEventsRow';
import {
  Meetup,
  shortDate,
  weekdayLabel,
} from '../../data/sampleMeetups';
import { RootStackParamList } from '../../navigation/types';
import { useMeetups } from '../../state/meetups';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type MeetupsView = 'explore' | 'going';

const DAYS = Array.from({ length: 7 }, (_, i) => i);

function MeetupRow({
  meetup,
  joined,
  onToggle,
}: {
  meetup: Meetup;
  joined: boolean;
  onToggle: () => void;
}) {
  const hosting = Boolean(meetup.hostedByMe);
  const going = meetup.going + (joined ? 1 : 0);
  const capacity = meetup.capacity;
  const spotsLeft =
    capacity === null ? null : Math.max(capacity - going, 0);
  const isFull = spotsLeft === 0 && !joined && !hosting;
  const fill = capacity === null ? 0 : Math.min(going / capacity, 1);
  const almostFull = spotsLeft !== null && spotsLeft <= 2;
  const { day, month } = shortDate(meetup.dayOffset);
  const extra = Math.max(going - meetup.attendees.length, 0);

  return (
    <View style={[styles.card, (joined || hosting) && styles.cardJoined]}>
      <View style={styles.cardTop}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateMonth}>{month.toUpperCase()}</Text>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateWeekday}>
            {weekdayLabel(meetup.dayOffset)}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>
              {meetup.emoji} {meetup.category}
            </Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {meetup.title}
          </Text>
          <Text style={styles.cardMeta}>🕒 {meetup.time}</Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            📍 {meetup.place}, {meetup.area}
          </Text>
        </View>
      </View>

      {spotsLeft === null ? (
        <Text style={styles.capacityText}>
          Open to everyone · {going} going
        </Text>
      ) : (
        <View style={styles.capacity}>
          <View style={styles.capacityTrack}>
            <View
              style={[
                styles.capacityFill,
                { width: `${fill * 100}%` },
                almostFull && styles.capacityFillHot,
              ]}
            />
          </View>
          <Text style={[styles.capacityText, almostFull && styles.hotText]}>
            {spotsLeft === 0
              ? 'Full'
              : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
          </Text>
        </View>
      )}

      <View style={styles.cardBottom}>
        <View style={styles.attendees}>
          {meetup.attendees.slice(0, 4).map((name, i) => (
            <Avatar
              key={name}
              name={name}
              size={30}
              style={[styles.stacked, i > 0 && styles.stackedOverlap]}
            />
          ))}
          <Text style={styles.attendeeText}>
            {extra > 0 ? `+${extra} · ` : ''}
            {hosting ? 'hosted by you' : `hosted by ${meetup.host}`}
          </Text>
        </View>

        {hosting ? (
          <View style={styles.hostingPill} accessibilityLabel="You're hosting">
            <Text style={styles.hostingText}>Hosting ★</Text>
          </View>
        ) : (
          <Pressable
            onPress={onToggle}
            disabled={isFull}
            accessibilityRole="button"
            accessibilityLabel={
              joined
                ? `Leave ${meetup.title}`
                : isFull
                ? `${meetup.title} is full`
                : `Join ${meetup.title}`
            }
            accessibilityState={{ disabled: isFull, selected: joined }}
            style={({ pressed }) => [
              styles.joinButton,
              joined && styles.joinButtonJoined,
              isFull && styles.joinButtonFull,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.joinText,
                joined && styles.joinTextJoined,
                isFull && styles.joinTextFull,
              ]}
            >
              {joined ? 'Going ✓' : isFull ? 'Full' : 'Join'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function MeetupsScreen() {
  const [view, setView] = useState<MeetupsView>('explore');
  const [day, setDay] = useState<number | null>(null);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const allMeetups = useMeetups();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const toggle = (id: string) =>
    setJoined(current => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const goingCount =
    joined.size + allMeetups.filter(m => m.hostedByMe).length;

  const meetups = useMemo(() => {
    const base =
      view === 'going'
        ? allMeetups.filter(m => joined.has(m.id) || m.hostedByMe)
        : allMeetups;
    return day === null ? base : base.filter(m => m.dayOffset === day);
  }, [view, day, joined, allMeetups]);

  const header = (
    <View>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Meetups
        </Text>
        <Pressable
          onPress={() => navigation.navigate('CreateMeetup')}
          accessibilityRole="button"
          accessibilityLabel="Host a meetup"
          hitSlop={6}
          style={({ pressed }) => [
            styles.hostButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.hostButtonText}>+ Host</Text>
        </Pressable>
      </View>

      {view === 'explore' ? (
        <CityEventsRow style={styles.cityEvents} />
      ) : null}

      <View style={styles.segment} accessibilityRole="tablist">
        {(['explore', 'going'] as const).map(option => {
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
                {option === 'explore' ? 'Explore' : `Going · ${goingCount}`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayRow}
      >
        <Pressable
          onPress={() => setDay(null)}
          accessibilityRole="button"
          accessibilityState={{ selected: day === null }}
          style={[styles.dayChip, day === null && styles.dayChipOn]}
        >
          <Text
            style={[styles.dayWeek, day === null && styles.dayTextOn]}
          >
            All
          </Text>
          <Text style={[styles.dayNum, day === null && styles.dayTextOn]}>
            7d
          </Text>
        </Pressable>
        {DAYS.map(offset => {
          const selected = day === offset;
          const hasEvents = allMeetups.some(m => m.dayOffset === offset);
          return (
            <Pressable
              key={offset}
              onPress={() => setDay(offset)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.dayChip, selected && styles.dayChipOn]}
            >
              <Text style={[styles.dayWeek, selected && styles.dayTextOn]}>
                {weekdayLabel(offset)}
              </Text>
              <Text style={[styles.dayNum, selected && styles.dayTextOn]}>
                {shortDate(offset).day}
              </Text>
              <View
                style={[
                  styles.dayDot,
                  !hasEvents && styles.dayDotHidden,
                  selected && styles.dayDotOn,
                ]}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const emptyTitle =
    view === 'going' ? 'No plans yet' : 'Nothing on this day';
  const emptyText =
    view === 'going'
      ? 'Tap Join on a meetup and it will show up here.'
      : 'Try another day, or check back soon.';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={meetups}
        keyExtractor={item => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <MeetupRow
            meetup={item}
            joined={joined.has(item.id)}
            onToggle={() => toggle(item.id)}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🗓️</Text>
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyText}>{emptyText}</Text>
            {view === 'going' ? (
              <Pressable
                onPress={() => setView('explore')}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.emptyButtonText}>Explore meetups</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  hostButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  hostButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
  },
  hostingPill: {
    height: 38,
    minWidth: 84,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostingText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  cityEvents: {
    marginTop: 16,
  },
  segment: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 20,
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
  dayRow: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 8,
  },
  dayChip: {
    width: 56,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dayChipOn: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  dayWeek: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  dayNum: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  dayTextOn: {
    color: colors.textOnSecondary,
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
    backgroundColor: colors.primary,
  },
  dayDotHidden: {
    opacity: 0,
  },
  dayDotOn: {
    backgroundColor: colors.primary,
  },
  card: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 14,
  },
  cardJoined: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 14,
  },
  dateBlock: {
    width: 60,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  dateMonth: {
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  dateDay: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: fonts.extraBold,
    color: colors.textOnSecondary,
  },
  dateWeekday: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textOnSecondary,
    opacity: 0.75,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  cardMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  capacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  capacityTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accentTeal,
  },
  capacityFillHot: {
    backgroundColor: colors.accentCoral,
  },
  capacityText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  hotText: {
    color: colors.error,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  attendees: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stacked: {
    borderWidth: 2,
    borderColor: colors.background,
  },
  stackedOverlap: {
    marginLeft: -10,
  },
  attendeeText: {
    flexShrink: 1,
    marginLeft: 8,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  joinButton: {
    height: 38,
    minWidth: 84,
    paddingHorizontal: 18,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonJoined: {
    backgroundColor: colors.secondary,
  },
  joinButtonFull: {
    backgroundColor: colors.surface,
  },
  joinText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
  },
  joinTextJoined: {
    color: colors.textOnSecondary,
  },
  joinTextFull: {
    color: colors.textMuted,
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
  },
});
