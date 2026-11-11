export type Chat = {
  id: string;
  name: string;
  listingId: string;
  role: 'buying' | 'selling';
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
  typing?: boolean;
};

export const SAMPLE_CHATS: Chat[] = [
  {
    id: 'c1',
    name: 'Aisha',
    listingId: 'l1',
    role: 'buying',
    lastMessage: 'Sure, you can pick it up Saturday after 4 PM 🙂',
    time: '2m',
    unread: 2,
    online: true,
  },
  {
    id: 'c2',
    name: 'Rahul',
    listingId: 'l2',
    role: 'buying',
    lastMessage: 'typing…',
    time: '18m',
    unread: 0,
    online: true,
    typing: true,
  },
  {
    id: 'c3',
    name: 'Omar',
    listingId: 'l3',
    role: 'buying',
    lastMessage: 'You: Would you take AED 400?',
    time: '1h',
    unread: 0,
  },
  {
    id: 'c4',
    name: 'Priya',
    listingId: 'l5',
    role: 'buying',
    lastMessage: 'It’s still available, yes!',
    time: 'Yesterday',
    unread: 1,
  },
  {
    id: 'c5',
    name: 'Noor',
    listingId: 'l6',
    role: 'buying',
    lastMessage: 'You: Thanks, got it. Love it!',
    time: 'Mon',
    unread: 0,
  },
  {
    id: 'c6',
    name: 'Hana',
    listingId: 'l11',
    role: 'selling',
    lastMessage: 'Could I collect it tomorrow evening?',
    time: '3h',
    unread: 1,
  },
];

export type Message = {
  id: string;
  from: string;
  text: string;
  time: string;
};

export const ME = 'me';

export const QUICK_REPLIES = [
  'Hi! Is this still available?',
  'Is the price negotiable?',
  'When can I pick it up?',
  'Can you share more photos?',
];

export const SAMPLE_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      id: '1',
      from: ME,
      text: 'Hi! Is the sofa still available?',
      time: '9:02 AM',
    },
    { id: '2', from: 'Aisha', text: 'Yes it is!', time: '9:05 AM' },
    {
      id: '3',
      from: ME,
      text: 'Great. Could you do AED 600 if I collect this weekend?',
      time: '9:06 AM',
    },
    { id: '4', from: 'Aisha', text: 'Deal 🤝', time: '9:50 AM' },
    {
      id: '5',
      from: 'Aisha',
      text: 'Sure, you can pick it up Saturday after 4 PM 🙂',
      time: '9:58 AM',
    },
  ],
  c2: [
    {
      id: '1',
      from: ME,
      text: 'Hi, any scratches on the screen?',
      time: '8:15 AM',
    },
    {
      id: '2',
      from: 'Rahul',
      text: 'None at all, it’s had a protector since day one',
      time: '8:20 AM',
    },
  ],
  c3: [
    {
      id: '1',
      from: 'Omar',
      text: 'Thanks for your interest! It rides really smoothly.',
      time: '8:00 AM',
    },
    { id: '2', from: ME, text: 'Would you take AED 400?', time: '8:12 AM' },
  ],
  c4: [
    {
      id: '1',
      from: ME,
      text: 'Hi! Is this still available?',
      time: '6:30 PM',
    },
    {
      id: '2',
      from: 'Priya',
      text: 'It’s still available, yes!',
      time: '6:41 PM',
    },
  ],
  c5: [
    {
      id: '1',
      from: 'Noor',
      text: 'Left it with your building’s reception',
      time: '5:00 PM',
    },
    { id: '2', from: ME, text: 'Thanks, got it. Love it!', time: '6:04 PM' },
  ],
  c6: [
    {
      id: '1',
      from: 'Hana',
      text: 'Hi! Is the desk lamp still available?',
      time: '11:20 AM',
    },
    { id: '2', from: ME, text: 'Yes, it is 🙂', time: '11:32 AM' },
    {
      id: '3',
      from: 'Hana',
      text: 'Could I collect it tomorrow evening?',
      time: '11:35 AM',
    },
  ],
};

const LISTING_PREFIX = 'listing-';

/** Chat id used when a buyer starts a new conversation from a listing. */
export function listingChatId(listingId: string) {
  const existing = SAMPLE_CHATS.find(c => c.listingId === listingId);
  return existing ? existing.id : `${LISTING_PREFIX}${listingId}`;
}

export function isNewListingChat(id: string) {
  return id.startsWith(LISTING_PREFIX);
}

export function listingIdFromChat(id: string) {
  return isNewListingChat(id)
    ? id.slice(LISTING_PREFIX.length)
    : SAMPLE_CHATS.find(c => c.id === id)?.listingId;
}

export function findChat(id: string): Chat | undefined {
  return SAMPLE_CHATS.find(chat => chat.id === id);
}
