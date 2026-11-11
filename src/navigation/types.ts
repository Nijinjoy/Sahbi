import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: { query?: string } | undefined;
  Categories: undefined;
  Sell: undefined;
  Chats: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Otp: { phone: string };
  ProfileSetup: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ListingDetail: { listingId: string };
  Category: { name: string };
  MyItems: { view?: 'selling' | 'saved' } | undefined;
  Chat: { chatId: string };
};
