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
import {
  DISCOVER_FILTERS,
  Person,
  SAMPLE_PEOPLE,
} from '../../data/sampleDiscover';
import {
  Meetup,
  meetupWhen,
} from '../../data/sampleMeetups';
import { Avatar } from '../../components/Avatar';
import { CityEventsRow } from '../../components/CityEventsRow';
import { useMeetups } from '../../state/meetups';
import { useProfile } from '../../state/profile';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

function MeetupCard({ meetup, index }: { meetup: Meetup; index: number }) {
  const dark = index % 2 === 1;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${meetup.title}, ${meetupWhen(meetup)}, ${meetup.place}, ${meetup.going} going`}
      style={({ pressed }) => [
        styles.meetupCard,
        dark && styles.meetupCardDark,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.meetupEmoji}>{meetup.emoji}</Text>
      <Text
        style={[styles.meetupTitle, dark && styles.textLight]}
        numberOfLines={2}
      >
        {meetup.title}
      </Text>
      <Text style={[styles.meetupMeta, dark && styles.textLightMuted]}>
        {meetupWhen(meetup)}
      </Text>
      <Text
        style={[styles.meetupMeta, dark && styles.textLightMuted]}
        numberOfLines={1}
      >
        📍 {meetup.place}
      </Text>
      <View style={[styles.goingPill, dark && styles.goingPillDark]}>
        <Text style={[styles.goingText, dark && styles.goingTextDark]}>
          {meetup.going} going
        </Text>
      </View>
    </Pressable>
  );
}

function PersonCard({
  person,
  activeFilter,
  waved,
  onWave,
}: {
  person: Person;
  activeFilter: string;
  waved: boolean;
  onWave: () => void;
}) {
  return (
    <View style={styles.personCard}>
      <View style={styles.personTop}>
        <Avatar name={person.name} />
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          <Text style={styles.personMeta}>
            {person.area} · {person.distanceKm.toFixed(1)} km away
          </Text>
        </View>
        <Pressable
          onPress={onWave}
          disabled={waved}
          accessibilityRole="button"
          accessibilityLabel={waved ? `Waved at ${person.name}` : `Say hi to ${person.name}`}
          accessibilityState={{ disabled: waved }}
          style={({ pressed }) => [
            styles.waveButton,
            waved && styles.waveButtonDone,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.waveText, waved && styles.waveTextDone]}>
            {waved ? 'Waved 👋' : 'Say hi'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.personBio}>{person.bio}</Text>

      <View style={styles.tagRow}>
        {person.interests.map(tag => {
          const highlight = tag === activeFilter;
          return (
            <View key={tag} style={[styles.tag, highlight && styles.tagOn]}>
              <Text style={[styles.tagText, highlight && styles.tagTextOn]}>
                {tag}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function DiscoverScreen() {
  const [filter, setFilter] = useState('All');
  const profile = useProfile();
  const allMeetups = useMeetups();
  const [waved, setWaved] = useState<Set<string>>(new Set());

  const people = useMemo(
    () =>
      filter === 'All'
        ? SAMPLE_PEOPLE
        : SAMPLE_PEOPLE.filter(p => p.interests.includes(filter)),
    [filter],
  );

  const wave = (id: string) =>
    setWaved(current => new Set(current).add(id));

  const header = (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.title} accessibilityRole="header">
            Discover
          </Text>
          <View style={styles.locationPill}>
            <Text style={styles.locationText}>
              📍 Near you · {profile.city ?? 'UAE'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {DISCOVER_FILTERS.map(option => {
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
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>City events</Text>
      </View>
      <CityEventsRow />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Happening this week</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.meetupRow}
      >
        {allMeetups.slice(0, 5).map((meetup, i) => (
          <MeetupCard key={meetup.id} meetup={meetup} index={i} />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>People near you</Text>
        <Text style={styles.sectionCount}>{people.length}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={people}
        keyExtractor={item => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <PersonCard
            person={item}
            activeFilter={filter}
            waved={waved.has(item.id)}
            onWave={() => wave(item.id)}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No one into {filter} nearby yet</Text>
            <Text style={styles.emptyText}>
              Try another interest, or check back later.
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
  locationPill: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  locationText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  filterRow: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 8,
  },
  filterChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  sectionCount: {
    minWidth: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
    backgroundColor: colors.primary,
  },
  meetupRow: {
    paddingHorizontal: 24,
    gap: 12,
  },
  meetupCard: {
    width: 168,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  meetupCardDark: {
    backgroundColor: colors.secondary,
  },
  meetupEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  meetupTitle: {
    fontSize: 16,
    lineHeight: 20,
    minHeight: 40,
    fontFamily: fonts.bold,
    color: colors.secondary,
    marginBottom: 6,
  },
  meetupMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.secondary,
    opacity: 0.8,
  },
  textLight: {
    color: colors.textOnSecondary,
  },
  textLightMuted: {
    color: colors.textOnSecondary,
    opacity: 0.75,
  },
  goingPill: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: colors.secondary,
  },
  goingPillDark: {
    backgroundColor: colors.primary,
  },
  goingText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textOnSecondary,
  },
  goingTextDark: {
    color: colors.textOnPrimary,
  },
  personCard: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 12,
  },
  personTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  personMeta: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  waveButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  waveButtonDone: {
    backgroundColor: colors.primarySoft,
  },
  waveText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
  },
  waveTextDone: {
    color: colors.secondary,
  },
  personBio: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  tagOn: {
    backgroundColor: colors.primarySoft,
  },
  tagText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  tagTextOn: {
    color: colors.secondary,
  },
  separator: {
    height: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.secondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
