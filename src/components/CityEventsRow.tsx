import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {
  CityEvent,
  daysUntil,
  eventDateLabel,
  sortedCityEvents,
} from '../data/cityEvents';
import {
  toggleCityEventGoing,
  useCityEventsGoing,
} from '../state/cityEventsGoing';
import { Avatar } from './Avatar';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

function countdownLabel(days: number) {
  if (days < 0) {
    return 'Ended';
  }
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Tomorrow';
  }
  return `In ${days} days`;
}

function CityEventCard({
  event,
  width,
}: {
  event: CityEvent;
  width: number;
}) {
  const days = daysUntil(event.date);
  const past = days < 0;
  const goingIds = useCityEventsGoing();
  const isGoing = goingIds.has(event.id);
  const goingCount = event.going + (isGoing ? 1 : 0);
  return (
    <View
      style={[styles.eventCard, past && styles.eventCardPast, { width }]}
      accessible={past}
      accessibilityLabel={
        past ? `${event.title}, ${eventDateLabel(event)}, ended` : undefined
      }
    >
      <View style={styles.eventTop}>
        <Text style={[styles.eventKicker, past && styles.eventKickerPast]}>
          CITY EVENT
        </Text>
        <View style={[styles.countdown, past && styles.countdownPast]}>
          <Text
            style={[styles.countdownText, past && styles.countdownTextPast]}
          >
            {countdownLabel(days)}
          </Text>
        </View>
      </View>

      <Text style={[styles.eventTitle, past && styles.eventTitlePast]}>
        {event.emoji} {event.title}
      </Text>
      <Text style={[styles.eventMeta, past && styles.eventMetaPast]}>
        {eventDateLabel(event)}
      </Text>
      <Text style={[styles.eventMeta, past && styles.eventMetaPast]}>
        📍 {event.place}
      </Text>
      <Text style={[styles.eventDetails, past && styles.eventMetaPast]}>
        {event.details}
      </Text>

      <View style={styles.peopleRow}>
        <View style={styles.avatarStack}>
          {isGoing ? (
            <Avatar name="You" size={28} style={styles.stacked} />
          ) : null}
          {event.attendees.slice(0, isGoing ? 3 : 4).map((name, i) => (
            <Avatar
              key={name}
              name={name}
              size={28}
              style={[
                styles.stacked,
                past && styles.stackedPast,
                (isGoing || i > 0) && styles.stackedOverlap,
              ]}
            />
          ))}
        </View>
        <Text
          style={[styles.peopleText, past && styles.eventMetaPast]}
          numberOfLines={2}
        >
          {past
            ? `${goingCount} Sahbis went`
            : isGoing
            ? `You + ${event.going} Sahbis going`
            : `${event.going} Sahbis going`}
        </Text>
      </View>

      {past ? null : (
        <Pressable
          onPress={() => toggleCityEventGoing(event.id)}
          accessibilityRole="button"
          accessibilityState={{ selected: isGoing }}
          accessibilityLabel={
            isGoing
              ? `You're going to ${event.title}. Tap to undo`
              : `I'm going to ${event.title}`
          }
          style={({ pressed }) => [
            styles.goingButton,
            isGoing && styles.goingButtonOn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.goingText, isGoing && styles.goingTextOn]}>
            {isGoing ? 'Going ✓' : "I'm going"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

type Props = {
  style?: StyleProp<ViewStyle>;
};

export function CityEventsRow({ style }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth * 0.78, 340);
  const events = useMemo(() => sortedCityEvents(), []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + 12}
      decelerationRate="fast"
      style={style}
      contentContainerStyle={styles.eventRow}
    >
      {events.map(event => (
        <CityEventCard key={event.id} event={event} width={cardWidth} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  eventRow: {
    paddingHorizontal: 24,
    gap: 12,
  },
  eventCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.secondary,
  },
  eventCardPast: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  eventKicker: {
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  eventKickerPast: {
    color: colors.textMuted,
  },
  countdown: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  countdownPast: {
    backgroundColor: colors.border,
  },
  countdownText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
  },
  countdownTextPast: {
    color: colors.textMuted,
  },
  eventTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fonts.extraBold,
    color: colors.textOnSecondary,
    marginBottom: 4,
  },
  eventTitlePast: {
    color: colors.textMuted,
  },
  eventMeta: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textOnSecondary,
    opacity: 0.85,
  },
  eventMetaPast: {
    color: colors.textMuted,
    opacity: 1,
  },
  eventDetails: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  stacked: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  stackedPast: {
    borderColor: colors.surface,
  },
  stackedOverlap: {
    marginLeft: -9,
  },
  peopleText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.semiBold,
    color: colors.textOnSecondary,
  },
  goingButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goingButtonOn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  goingText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
  },
  goingTextOn: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
});
