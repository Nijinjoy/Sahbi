export type Chat = {
  id: string;
  name: string;
  groupEmoji?: string;
  members?: number;
  lastMessage: string;
  lastSender?: string;
  time: string;
  unread: number;
  online?: boolean;
  typing?: boolean;
};

export const SAMPLE_WAVES = ['Noor', 'Leo', 'Sara', 'Ali', 'Hana', 'Yusuf'];

export const CITY_EVENT_CHATS: Record<string, Chat> = {
  'dubai-run-2026': {
    id: 'group-dubai-run-2026',
    name: 'Dubai Run crew',
    groupEmoji: '🏃',
    members: 129,
    lastSender: 'Omar',
    lastMessage: 'Meeting at the Museum of the Future at 6 AM?',
    time: 'now',
    unread: 3,
  },
};

export const SAMPLE_CHATS: Chat[] = [
  {
    id: 'c1',
    name: 'Aisha',
    lastMessage: 'Found a café in Al Quoz with amazing flat whites ☕',
    time: '2m',
    unread: 2,
    online: true,
  },
  {
    id: 'c2',
    name: 'Friday padel doubles',
    groupEmoji: '🎾',
    members: 6,
    lastSender: 'Rahul',
    lastMessage: 'Court 3 is booked for 7 PM',
    time: '18m',
    unread: 5,
  },
  {
    id: 'c3',
    name: 'Rahul',
    lastMessage: 'typing…',
    time: '1h',
    unread: 0,
    online: true,
    typing: true,
  },
  {
    id: 'c4',
    name: 'Maria',
    lastMessage: 'You: Brunch on Saturday sounds perfect!',
    time: '9:41 AM',
    unread: 0,
  },
  {
    id: 'c5',
    name: 'Sunrise hike',
    groupEmoji: '🥾',
    members: 14,
    lastSender: 'Omar',
    lastMessage: 'Bring at least 2L of water each 💧',
    time: 'Yesterday',
    unread: 0,
  },
  {
    id: 'c6',
    name: 'Priya',
    lastMessage: 'That board game café was so much fun',
    time: 'Mon',
    unread: 0,
  },
  {
    id: 'c7',
    name: 'Daniel',
    lastMessage: 'You: Count me in for Tuesday ⚽',
    time: 'Sun',
    unread: 0,
  },
];

export type Message = {
  id: string;
  from: string;
  text: string;
  time: string;
};

export const ME = 'me';

export const SAMPLE_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      id: '1',
      from: 'Aisha',
      text: 'Hey! Saw we both love coffee 😄',
      time: '9:02 AM',
    },
    {
      id: '2',
      from: ME,
      text: 'Haha yes, it’s a problem. Where do you usually go?',
      time: '9:05 AM',
    },
    {
      id: '3',
      from: 'Aisha',
      text: 'Mostly around the Marina, but I want to explore more',
      time: '9:06 AM',
    },
    {
      id: '4',
      from: ME,
      text: 'Same, let me know if you find a good one',
      time: '9:10 AM',
    },
    {
      id: '5',
      from: 'Aisha',
      text: 'Found a café in Al Quoz with amazing flat whites ☕',
      time: '9:58 AM',
    },
    {
      id: '6',
      from: 'Aisha',
      text: 'Want to try it this weekend?',
      time: '9:58 AM',
    },
  ],
  c2: [
    { id: '1', from: 'Daniel', text: 'Who’s in for Friday?', time: '8:15 AM' },
    { id: '2', from: ME, text: 'Me! 🙋', time: '8:20 AM' },
    { id: '3', from: 'Sara', text: 'Count me in', time: '8:31 AM' },
    { id: '4', from: 'Ali', text: 'I’ll bring extra balls', time: '8:40 AM' },
    {
      id: '5',
      from: 'Rahul',
      text: 'Court 3 is booked for 7 PM',
      time: '9:42 AM',
    },
  ],
  c3: [
    { id: '1', from: 'Rahul', text: 'Good game yesterday!', time: '8:00 AM' },
    { id: '2', from: ME, text: 'Thanks, you were on fire 🔥', time: '8:12 AM' },
  ],
  c4: [
    {
      id: '1',
      from: 'Maria',
      text: 'Are you free on Saturday?',
      time: '9:30 AM',
    },
    {
      id: '2',
      from: 'Maria',
      text: 'Thinking brunch at Kite Beach',
      time: '9:30 AM',
    },
    {
      id: '3',
      from: ME,
      text: 'Brunch on Saturday sounds perfect!',
      time: '9:41 AM',
    },
  ],
  c5: [
    {
      id: '1',
      from: 'Omar',
      text: 'Meeting point is the Hatta Wadi Hub car park',
      time: '7:10 PM',
    },
    {
      id: '2',
      from: 'Noor',
      text: 'What time should we leave Dubai?',
      time: '7:22 PM',
    },
    {
      id: '3',
      from: 'Omar',
      text: 'Around 4 AM to make sunrise',
      time: '7:25 PM',
    },
    {
      id: '4',
      from: 'Omar',
      text: 'Bring at least 2L of water each 💧',
      time: '7:26 PM',
    },
  ],
  c6: [
    {
      id: '1',
      from: ME,
      text: 'Thanks for organising last night!',
      time: '10:15 PM',
    },
    {
      id: '2',
      from: 'Priya',
      text: 'That board game café was so much fun',
      time: '10:20 PM',
    },
  ],
  c7: [
    {
      id: '1',
      from: 'Daniel',
      text: 'We need one more for five-a-side on Tuesday',
      time: '6:00 PM',
    },
    { id: '2', from: ME, text: 'Count me in for Tuesday ⚽', time: '6:04 PM' },
  ],
  'group-dubai-run-2026': [
    {
      id: '1',
      from: 'Noor',
      text: 'Hi all! First Dubai Run for me 🙌',
      time: '7:30 AM',
    },
    {
      id: '2',
      from: 'Leo',
      text: 'Welcome! Doing the 10K or 5K?',
      time: '7:34 AM',
    },
    {
      id: '3',
      from: 'Aisha',
      text: '5K for me, happy to run together',
      time: '7:41 AM',
    },
    {
      id: '4',
      from: 'Omar',
      text: 'Meeting at the Museum of the Future at 6 AM?',
      time: '7:45 AM',
    },
  ],
};

const WAVE_PREFIX = 'wave-';

export function waveChatId(name: string) {
  return `${WAVE_PREFIX}${name}`;
}

export function findChat(id: string): Chat | undefined {
  if (id.startsWith(WAVE_PREFIX)) {
    const name = id.slice(WAVE_PREFIX.length);
    return { id, name, lastMessage: '', time: '', unread: 0 };
  }
  return (
    Object.values(CITY_EVENT_CHATS).find(chat => chat.id === id) ??
    SAMPLE_CHATS.find(chat => chat.id === id)
  );
}

export function isWaveChat(id: string) {
  return id.startsWith(WAVE_PREFIX);
}
