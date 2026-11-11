import { useMemo } from 'react';
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
import { SAMPLE_CHATS } from '../data/sampleChats';
import { CategoriesScreen } from '../screens/tabs/CategoriesScreen';
import { ChatsScreen } from '../screens/tabs/ChatsScreen';
import { HomeScreen } from '../screens/tabs/HomeScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';
import { SellScreen } from '../screens/tabs/SellScreen';
import { useReadChats } from '../state/readChats';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, ImageSourcePropType> = {
  Home: require('../assets/icons/home.png'),
  Categories: require('../assets/icons/categories.png'),
  Sell: require('../assets/icons/plus.png'),
  Chats: require('../assets/icons/chats.png'),
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
    <View style={styles.iconPill}>
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
  Home: makeTabBarIcon(ICONS.Home),
  Categories: makeTabBarIcon(ICONS.Categories),
  Sell: makeTabBarIcon(ICONS.Sell),
  Chats: makeTabBarIcon(ICONS.Chats),
  Profile: makeTabBarIcon(ICONS.Profile),
};

function TabBarButton({ href: _href, ...props }: BottomTabBarButtonProps) {
  return <Pressable {...props} />;
}

export function MainTabs() {
  const readIds = useReadChats();
  const unreadChats = useMemo(
    () => SAMPLE_CHATS.filter(c => c.unread > 0 && !readIds.has(c.id)).length,
    [readIds],
  );

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
        tabBarBadgeStyle: styles.badge,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Sell" component={SellScreen} />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{ tabBarBadge: unreadChats > 0 ? unreadChats : undefined }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tabItem: {
    gap: 4,
  },
  iconPill: {
    width: 52,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  badge: {
    backgroundColor: colors.accentCoral,
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
});
