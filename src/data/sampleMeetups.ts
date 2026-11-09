export type Meetup = {
  id: string;
  emoji: string;
  title: string;
  category: string;
  dayOffset: number;
  time: string;
  place: string;
  area: string;
  host: string;
  going: number;
  capacity: number | null;
  attendees: string[];
  hostedByMe?: boolean;
};

export const MEETUP_CATEGORIES = [
  { name: 'Sports', emoji: '⚽' },
  { name: 'Fitness', emoji: '🏃' },
  { name: 'Outdoors', emoji: '🥾' },
  { name: 'Food & drinks', emoji: '☕' },
  { name: 'Games', emoji: '🎲' },
  { name: 'Creative', emoji: '🎨' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Other', emoji: '✨' },
] as const;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function dateFromOffset(offset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

export function weekdayLabel(offset: number) {
  if (offset === 0) {
    return 'Today';
  }
  if (offset === 1) {
    return 'Tmrw';
  }
  return WEEKDAYS[dateFromOffset(offset).getDay()];
}

export function shortDate(offset: number) {
  const date = dateFromOffset(offset);
  return { day: date.getDate(), month: MONTHS[date.getMonth()] };
}

export function meetupWhen(meetup: Meetup) {
  return `${weekdayLabel(meetup.dayOffset)} · ${meetup.time}`;
}

export const SAMPLE_MEETUPS: Meetup[] = [
  {
    id: 'm1',
    emoji: '🎾',
    title: 'Evening padel doubles',
    category: 'Sports',
    dayOffset: 0,
    time: '7:00 PM',
    place: 'JLT Padel Club',
    area: 'JLT',
    host: 'Rahul',
    going: 6,
    capacity: 8,
    attendees: ['Rahul', 'Daniel', 'Sara', 'Ali'],
  },
  {
    id: 'm2',
    emoji: '☕',
    title: 'Karak & chill',
    category: 'Food & drinks',
    dayOffset: 1,
    time: '10:30 AM',
    place: 'Al Seef',
    area: 'Bur Dubai',
    host: 'Aisha',
    going: 9,
    capacity: 12,
    attendees: ['Aisha', 'Maria', 'Priya', 'Omar'],
  },
  {
    id: 'm3',
    emoji: '🥾',
    title: 'Sunrise hike',
    category: 'Outdoors',
    dayOffset: 1,
    time: '5:30 AM',
    place: 'Hatta Wadi Hub',
    area: 'Hatta',
    host: 'Omar',
    going: 14,
    capacity: 15,
    attendees: ['Omar', 'Maria', 'Leo', 'Noor'],
  },
  {
    id: 'm4',
    emoji: '🎲',
    title: 'Board game night',
    category: 'Games',
    dayOffset: 2,
    time: '8:00 PM',
    place: 'Alserkal Avenue',
    area: 'Al Quoz',
    host: 'Priya',
    going: 8,
    capacity: 10,
    attendees: ['Priya', 'Rahul', 'Aisha'],
  },
  {
    id: 'm5',
    emoji: '🥞',
    title: 'Weekend brunch club',
    category: 'Food & drinks',
    dayOffset: 3,
    time: '12:00 PM',
    place: 'Kite Beach',
    area: 'Jumeirah',
    host: 'Maria',
    going: 5,
    capacity: 10,
    attendees: ['Maria', 'Daniel', 'Sara'],
  },
  {
    id: 'm6',
    emoji: '⚽',
    title: 'Five-a-side football',
    category: 'Sports',
    dayOffset: 4,
    time: '9:00 PM',
    place: 'Al Barsha Pond Park',
    area: 'Al Barsha',
    host: 'Daniel',
    going: 10,
    capacity: 10,
    attendees: ['Daniel', 'Omar', 'Rahul', 'Ali'],
  },
  {
    id: 'm7',
    emoji: '🎨',
    title: 'Sketch & sip',
    category: 'Creative',
    dayOffset: 5,
    time: '6:30 PM',
    place: 'Dubai Design District',
    area: 'd3',
    host: 'Priya',
    going: 4,
    capacity: 12,
    attendees: ['Priya', 'Aisha'],
  },
  {
    id: 'm8',
    emoji: '🏃',
    title: 'Canal run club',
    category: 'Sports',
    dayOffset: 6,
    time: '6:00 AM',
    place: 'Dubai Water Canal',
    area: 'Business Bay',
    host: 'Omar',
    going: 11,
    capacity: 20,
    attendees: ['Omar', 'Noor', 'Leo', 'Sara'],
  },
];
