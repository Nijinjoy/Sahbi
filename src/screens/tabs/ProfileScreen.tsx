import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '../../components/Avatar';
import {
  CITY_EVENTS,
  daysUntil,
  eventDateLabel,
} from '../../data/cityEvents';
import { SAMPLE_CHATS, SAMPLE_WAVES } from '../../data/sampleChats';
import { RootStackParamList } from '../../navigation/types';
import { useCityEventsGoing } from '../../state/cityEventsGoing';
import { clearProfile, useProfile } from '../../state/profile';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import packageJson from '../../../package.json';

function SettingRow({
  label,
  value,
  toggle,
  onToggle,
  last,
}: {
  label: string;
  value?: string;
  toggle?: boolean;
  onToggle?: (next: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.settingRow, !last && styles.settingRowDivider]}>
      <Text style={styles.settingLabel}>{label}</Text>
      {toggle !== undefined && onToggle ? (
        <Switch
          value={toggle}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.background}
          ios_backgroundColor={colors.border}
          accessibilityLabel={label}
        />
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
  );
}

export function ProfileScreen() {
  const profile = useProfile();
  const goingIds = useCityEventsGoing();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [notifications, setNotifications] = useState(true);
  const [showDistance, setShowDistance] = useState(true);

  const name = profile.name ?? 'Your name';
  const goingEvents = CITY_EVENTS.filter(
    event => goingIds.has(event.id) && daysUntil(event.date) >= 0,
  );

  const stats = [
    { label: 'Events', value: goingEvents.length },
    { label: 'Waves', value: SAMPLE_WAVES.length },
    { label: 'Chats', value: SAMPLE_CHATS.length },
  ];

  const logOut = () =>
    Alert.alert('Log out?', 'You’ll need your phone number to log back in.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          clearProfile();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Profile
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardBand} />
          <View style={styles.avatarRing}>
            <Avatar name={name} size={92} />
          </View>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.cityPill}>
            <Text style={styles.cityText}>
              📍 {profile.city ? `${profile.city}, UAE` : 'City not set'}
            </Text>
          </View>
          {profile.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : (
            <Text style={[styles.bio, styles.muted]}>No bio yet.</Text>
          )}

          <View style={styles.stats}>
            {stats.map((stat, i) => (
              <View
                key={stat.label}
                style={[styles.stat, i > 0 && styles.statDivider]}
                accessible
                accessibilityLabel={`${stat.value} ${stat.label}`}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Interests</Text>
        {profile.interests.length > 0 ? (
          <View style={styles.chipWrap}>
            {profile.interests.map(item => (
              <View key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No interests added yet.</Text>
        )}

        <Text style={styles.sectionTitle}>Going to</Text>
        {goingEvents.length > 0 ? (
          <View style={styles.group}>
            {goingEvents.map((event, i) => {
              const days = daysUntil(event.date);
              return (
                <View
                  key={event.id}
                  style={[
                    styles.eventRow,
                    i < goingEvents.length - 1 && styles.settingRowDivider,
                  ]}
                >
                  <Text style={styles.eventEmoji}>{event.emoji}</Text>
                  <View style={styles.eventBody}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventMeta}>
                      {eventDateLabel(event)}
                    </Text>
                  </View>
                  <View style={styles.countdown}>
                    <Text style={styles.countdownText}>
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            Tap “I’m going” on a city event to see it here.
          </Text>
        )}

        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.group}>
          <SettingRow label="Phone" value={profile.phone ?? 'Not set'} />
          <SettingRow
            label="Notifications"
            toggle={notifications}
            onToggle={setNotifications}
          />
          <SettingRow
            label="Show my distance"
            toggle={showDistance}
            onToggle={setShowDistance}
            last
          />
        </View>

        <Pressable
          onPress={logOut}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.logout,
            pressed && styles.logoutPressed,
          ]}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        <Text style={styles.version}>Sahbi v{packageJson.version}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  card: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  cardBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: colors.primary,
  },
  avatarRing: {
    marginTop: 16,
    padding: 4,
    borderRadius: 52,
    backgroundColor: colors.background,
  },
  name: {
    marginTop: 10,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
    textAlign: 'center',
  },
  cityPill: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  cityText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  bio: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: colors.secondary,
    textAlign: 'center',
  },
  muted: {
    color: colors.textMuted,
  },
  stats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  group: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  eventEmoji: {
    fontSize: 26,
  },
  eventBody: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  eventMeta: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  countdown: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  countdownText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textOnPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 54,
    gap: 12,
  },
  settingRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.secondary,
  },
  settingValue: {
    flexShrink: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  logout: {
    marginTop: 24,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutPressed: {
    backgroundColor: colors.surface,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.error,
  },
  version: {
    marginTop: 16,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
