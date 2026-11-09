export type CityEvent = {
  id: string;
  emoji: string;
  title: string;
  date: Date;
  time: string | null;
  place: string;
  details: string;
  going: number;
  attendees: string[];
};

export const CITY_EVENTS: CityEvent[] = [
  {
    id: 'dubai-run-2026',
    emoji: '🏃',
    title: 'Dubai Run',
    date: new Date(2026, 10, 22),
    time: '6:30 AM',
    place: 'Sheikh Zayed Road',
    details: '5K & 10K routes',
    going: 128,
    attendees: ['Omar', 'Aisha', 'Noor', 'Leo'],
  },
  {
    id: 'dubai-ride-2026',
    emoji: '🚴',
    title: 'Dubai Ride',
    date: new Date(2026, 10, 1),
    time: null,
    place: 'Sheikh Zayed Road',
    details: 'Car-free city ride',
    going: 86,
    attendees: ['Daniel', 'Sara', 'Rahul', 'Maria'],
  },
];

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

export function daysUntil(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function eventDateLabel(event: CityEvent) {
  const d = event.date;
  const base = `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return event.time ? `${base} · ${event.time}` : base;
}

export function sortedCityEvents() {
  return [...CITY_EVENTS].sort((a, b) => {
    const pastA = daysUntil(a.date) < 0;
    const pastB = daysUntil(b.date) < 0;
    if (pastA !== pastB) {
      return pastA ? 1 : -1;
    }
    return a.date.getTime() - b.date.getTime();
  });
}
