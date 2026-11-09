import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Discover: undefined;
  Chats: undefined;
  Meetups: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Otp: { phone: string };
  ProfileSetup: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Chat: { chatId: string };
  CreateMeetup: undefined;
};
