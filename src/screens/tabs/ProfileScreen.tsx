import { ReactNode, useState } from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
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
import { RootStackParamList } from '../../navigation/types';
import { useListings, useSaved } from '../../state/listings';
import { clearProfile, useProfile } from '../../state/profile';
import {
  refreshProfileLocation,
  requestLocationPermission,
} from '../../utils/location';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import packageJson from '../../../package.json';

const ICONS = {
  tag: require('../../assets/icons/profile/tag.png'),
  heart: require('../../assets/icons/profile/heart.png'),
  bell: require('../../assets/icons/profile/bell.png'),
  priceDrop: require('../../assets/icons/profile/pricedrop.png'),
  phone: require('../../assets/icons/profile/phone.png'),
  shield: require('../../assets/icons/profile/shield.png'),
  logout: require('../../assets/icons/profile/logout.png'),
  chevron: require('../../assets/icons/profile/chevron.png'),
};

const SAFETY_TIPS =
  '• Meet in a public place, or a building lobby with a guard.\n' +
  '• Check the item works before you pay.\n' +
  '• Never pay or send a deposit before seeing the item.\n' +
  '• Keep the conversation in Sahbi chat.';

type RowProps = {
  icon: ImageSourcePropType;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  onToggle?: (next: boolean) => void;
  danger?: boolean;
  last?: boolean;
};

function Row({
  icon,
  label,
  value,
  onPress,
  toggle,
  onToggle,
  danger,
  last,
}: RowProps) {
  const hasToggle = toggle !== undefined && onToggle !== undefined;
  const content = (
    <>
      <Image
        source={icon}
        style={[styles.rowIcon, danger && styles.rowIconDanger]}
      />
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {hasToggle ? (
        <Switch
          value={toggle}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.secondary }}
          thumbColor={colors.background}
          ios_backgroundColor={colors.border}
          accessibilityLabel={label}
        />
      ) : onPress && !danger ? (
        <Image source={ICONS.chevron} style={styles.chevron} />
      ) : null}
    </>
  );

  const rowStyle = [styles.row, !last && styles.rowDivider];

  if (!onPress) {
    return <View style={rowStyle}>{content}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      style={({ pressed }) => [...rowStyle, pressed && styles.rowPressed]}
    >
      {content}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

export function ProfileScreen() {
  const profile = useProfile();
  const listings = useListings();
  const saved = useSaved();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [notifications, setNotifications] = useState(true);
  const [priceDrops, setPriceDrops] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [locating, setLocating] = useState(false);

  const updateLocation = async () => {
    if (locating) {
      return;
    }
    setLocating(true);
    try {
      const permission = await requestLocationPermission();
      if (permission !== 'granted') {
        Alert.alert(
          'Location is off',
          'Allow location access for Sahbi in Settings to show where you are.',
        );
        return;
      }
      const result = await refreshProfileLocation();
      if (result.status === 'unavailable') {
        Alert.alert(
          'Couldn’t find you',
          'Make sure location services are on, then try again.',
        );
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setLocating(false);
    }
  };

  const name = profile.name ?? 'Your name';
  const mine = listings.filter(l => l.mine);
  const active = mine.filter(l => !l.sold).length;
  const sold = mine.length - active;

  const stats = [
    { label: 'Listed', value: active, view: 'selling' as const },
    { label: 'Sold', value: sold, view: 'selling' as const },
    { label: 'Wishlist', value: saved.size, view: 'saved' as const },
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
      <View style={[styles.header, scrolled && styles.headerScrolled]}>
        <Text style={styles.title} accessibilityRole="header">
          Profile
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={event => setScrolled(event.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={32}
      >
        <View style={styles.identity}>
          <Avatar name={name} size={96} />
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {profile.phone ? (
            <View style={styles.metaLine}>
              <Image source={ICONS.phone} style={styles.phoneIcon} />
              <Text style={styles.meta}>{profile.phone}</Text>
            </View>
          ) : null}
          <Pressable
            onPress={updateLocation}
            disabled={locating}
            accessibilityRole="button"
            accessibilityHint="Updates your location"
            hitSlop={8}
          >
            <Text style={[styles.meta, styles.address]} numberOfLines={2}>
              📍{' '}
              {locating
                ? 'Finding your location…'
                : profile.address ??
                  (profile.city
                    ? [profile.area, profile.city].filter(Boolean).join(', ')
                    : 'Tap to set your location')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.stats}>
          {stats.map(stat => (
            <Pressable
              key={stat.label}
              onPress={() => navigation.navigate('MyItems', { view: stat.view })}
              accessibilityRole="button"
              accessibilityLabel={`${stat.value} ${stat.label}`}
              style={({ pressed }) => [styles.stat, pressed && styles.rowPressed]}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Pressable>
          ))}
        </View>

        <Section title="Buying & selling">
          <Row
            icon={ICONS.tag}
            label="My listings"
            value={String(mine.length)}
            onPress={() => navigation.navigate('MyItems', { view: 'selling' })}
          />
          <Row
            icon={ICONS.heart}
            label="Wishlist"
            value={String(saved.size)}
            onPress={() => navigation.navigate('MyItems', { view: 'saved' })}
            last
          />
        </Section>

        <Section title="Settings">
          <Row
            icon={ICONS.bell}
            label="Notifications"
            toggle={notifications}
            onToggle={setNotifications}
          />
          <Row
            icon={ICONS.priceDrop}
            label="Price drop alerts"
            toggle={priceDrops}
            onToggle={setPriceDrops}
            last
          />
        </Section>

        <Section title="Help">
          <Row
            icon={ICONS.shield}
            label="Safety tips"
            onPress={() => Alert.alert('Stay safe on Sahbi', SAFETY_TIPS)}
            last
          />
        </Section>

        <View style={[styles.group, styles.logoutGroup]}>
          <Row icon={ICONS.logout} label="Log out" onPress={logOut} danger last />
        </View>

        <Text style={styles.version}>Sahbi v{packageJson.version}</Text>
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
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    paddingBottom: 32,
  },
  identity: {
    alignItems: 'center',
    paddingTop: 8,
  },
  name: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
    textAlign: 'center',
  },
  meta: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  metaLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  address: {
    marginTop: 4,
    textAlign: 'center',
  },
  phoneIcon: {
    width: 14,
    height: 14,
    tintColor: colors.textMuted,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fonts.extraBold,
    color: colors.secondary,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  group: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  logoutGroup: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  rowIcon: {
    width: 22,
    height: 22,
    tintColor: colors.secondary,
  },
  rowIconDanger: {
    tintColor: colors.error,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.secondary,
  },
  rowLabelDanger: {
    fontFamily: fonts.bold,
    color: colors.error,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  chevron: {
    width: 18,
    height: 18,
    tintColor: colors.textMuted,
  },
  version: {
    marginTop: 16,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
