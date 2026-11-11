import { useCallback } from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { CategoryScreen } from '../screens/CategoryScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ListingDetailScreen } from '../screens/ListingDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MyItemsScreen } from '../screens/MyItemsScreen';
import { OtpScreen } from '../screens/OtpScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Match the app background so nothing grey shows through during transitions.
const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
  },
};

function SplashRoute({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Splash'>) {
  const goToWelcome = useCallback(
    () => navigation.replace('Welcome'),
    [navigation],
  );
  return <SplashScreen onFinish={goToWelcome} />;
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashRoute} />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetupScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen name="MyItems" component={MyItemsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
