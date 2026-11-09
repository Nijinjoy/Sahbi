import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  BottomTabBarButtonProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { ChatsScreen } from '../screens/tabs/ChatsScreen';
import { DiscoverScreen } from '../screens/tabs/DiscoverScreen';
import { MeetupsScreen } from '../screens/tabs/MeetupsScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, ImageSourcePropType> = {
  Discover: require('../assets/icons/discover.png'),
  Chats: require('../assets/icons/chats.png'),
  Meetups: require('../assets/icons/meetups.png'),
  Profile: require('../assets/icons/profile.png'),
};

function TabIcon({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Image
        source={source}
        style={[
          styles.icon,
          { tintColor: focused ? colors.secondary : colors.textMuted },
        ]}
      />
    </View>
  );
}

function makeTabBarIcon(source: ImageSourcePropType) {
  return function TabBarIcon({ focused }: { focused: boolean }) {
    return <TabIcon source={source} focused={focused} />;
  };
}

const TAB_BAR_ICONS = {
  Discover: makeTabBarIcon(ICONS.Discover),
  Chats: makeTabBarIcon(ICONS.Chats),
  Meetups: makeTabBarIcon(ICONS.Meetups),
  Profile: makeTabBarIcon(ICONS.Profile),
};

function TabBarButton({ href: _href, ...props }: BottomTabBarButtonProps) {
  return <Pressable {...props} />;
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: TAB_BAR_ICONS[route.name],
        tabBarButton: TabBarButton,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Meetups" component={MeetupsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: '#ECEEF2',
    paddingTop: 8,
  },
  tabItem: {
    gap: 4,
  },
  iconPill: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: colors.primary,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
});
