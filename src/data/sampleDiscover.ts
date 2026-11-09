export type Person = {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  bio: string;
  interests: string[];
};

export const DISCOVER_FILTERS = [
  'All',
  'Coffee',
  'Padel',
  'Football',
  'Hiking',
  'Brunch',
  'Gaming',
  'Running',
  'Art',
];

export const SAMPLE_PEOPLE: Person[] = [
  {
    id: 'p1',
    name: 'Aisha',
    area: 'Dubai Marina',
    distanceKm: 1.2,
    bio: 'Product designer, always hunting for the best flat white in town.',
    interests: ['Coffee', 'Art', 'Running'],
  },
  {
    id: 'p2',
    name: 'Rahul',
    area: 'JLT',
    distanceKm: 2.4,
    bio: 'New to Dubai. Looking for a regular padel partner and weekend plans.',
    interests: ['Padel', 'Football', 'Gaming'],
  },
  {
    id: 'p3',
    name: 'Maria',
    area: 'Al Barsha',
    distanceKm: 3.1,
    bio: 'Nurse by day, brunch enthusiast by weekend.',
    interests: ['Brunch', 'Hiking', 'Coffee'],
  },
  {
    id: 'p4',
    name: 'Omar',
    area: 'Downtown',
    distanceKm: 4.0,
    bio: 'Runner training for my first half marathon. Join me on the canal!',
    interests: ['Running', 'Hiking', 'Football'],
  },
  {
    id: 'p5',
    name: 'Priya',
    area: 'Business Bay',
    distanceKm: 4.6,
    bio: 'Sketching cafés and collecting board games.',
    interests: ['Art', 'Coffee', 'Gaming'],
  },
  {
    id: 'p6',
    name: 'Daniel',
    area: 'Jumeirah',
    distanceKm: 5.3,
    bio: 'Five-a-side every Tuesday, always need one more player.',
    interests: ['Football', 'Padel', 'Brunch'],
  },
];
