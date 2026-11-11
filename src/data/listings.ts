import { ImageSourcePropType } from 'react-native';
import { LISTING_GALLERIES } from './listingPhotos';

export type Condition = 'New' | 'Like new' | 'Good' | 'Fair';

export type Listing = {
  id: string;
  emoji: string;
  /** Cover photo, shown on cards; falls back to the emoji tile when missing. */
  photo?: ImageSourcePropType;
  /** All photos for the detail gallery, cover first. At most MAX_PHOTOS. */
  photos?: ImageSourcePropType[];
  title: string;
  price: number;
  category: string;
  condition: Condition;
  area: string;
  city: string;
  distanceKm: number;
  seller: string;
  sellerRating: number;
  sellerSales: number;
  postedHoursAgo: number;
  description: string;
  negotiable: boolean;
  mine?: boolean;
  sold?: boolean;
};

/** Most photos a listing can have. */
export const MAX_PHOTOS = 5;

export const CATEGORIES = [
  { name: 'Furniture', emoji: '🛋️' },
  { name: 'Electronics', emoji: '📱' },
  { name: 'Home & kitchen', emoji: '🍳' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Kids & baby', emoji: '🧸' },
  { name: 'Sports', emoji: '🚲' },
  { name: 'Books & media', emoji: '📚' },
  { name: 'Other', emoji: '📦' },
] as const;

export const CONDITIONS: { name: Condition; hint: string }[] = [
  { name: 'New', hint: 'Unused, may be in original box' },
  { name: 'Like new', hint: 'Used a few times, no signs of wear' },
  { name: 'Good', hint: 'Minor signs of use, works perfectly' },
  { name: 'Fair', hint: 'Visible wear, still fully usable' },
];

const TILE_COLORS = ['#FDF3DF', '#E3F0EF', '#FBE4DF', '#E6E9F0'];

export function tileColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 997;
  }
  return TILE_COLORS[hash % TILE_COLORS.length];
}

export function formatPrice(price: number) {
  if (price === 0) {
    return 'Free';
  }
  return `AED ${price.toLocaleString('en-US')}`;
}

export function postedLabel(hours: number) {
  if (hours < 1) {
    return 'Just now';
  }
  if (hours < 24) {
    return `${Math.round(hours)}h ago`;
  }
  const days = Math.round(hours / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

export const SAMPLE_LISTINGS: Listing[] = [
  {
    id: 'l1',
    photo: LISTING_GALLERIES.l1[0],
    photos: LISTING_GALLERIES.l1,
    emoji: '🛋️',
    title: 'IKEA 3-seater sofa, grey',
    price: 650,
    category: 'Furniture',
    condition: 'Good',
    area: 'Dubai Marina',
    city: 'Dubai',
    distanceKm: 1.2,
    seller: 'Aisha',
    sellerRating: 4.9,
    sellerSales: 23,
    postedHoursAgo: 2,
    description:
      'Moving out, so the sofa has to go. Washable covers, no stains or pets. You collect from the 12th floor (there’s a lift).',
    negotiable: true,
  },
  {
    id: 'l2',
    photo: LISTING_GALLERIES.l2[0],
    photos: LISTING_GALLERIES.l2,
    emoji: '📱',
    title: 'iPhone 14 Pro, 256GB',
    price: 2400,
    category: 'Electronics',
    condition: 'Like new',
    area: 'JLT',
    city: 'Dubai',
    distanceKm: 2.4,
    seller: 'Rahul',
    sellerRating: 4.7,
    sellerSales: 8,
    postedHoursAgo: 5,
    description:
      'Battery health 91%. Always used with a case and screen protector. Comes with the original box and cable.',
    negotiable: false,
  },
  {
    id: 'l3',
    photo: LISTING_GALLERIES.l3[0],
    photos: LISTING_GALLERIES.l3,
    emoji: '🚲',
    title: 'Hybrid city bike, size M',
    price: 450,
    category: 'Sports',
    condition: 'Good',
    area: 'Al Barsha',
    city: 'Dubai',
    distanceKm: 3.1,
    seller: 'Omar',
    sellerRating: 4.8,
    sellerSales: 12,
    postedHoursAgo: 20,
    description:
      '21 gears, serviced last month. New tyres. Great for Al Qudra or the canal track.',
    negotiable: true,
  },
  {
    id: 'l4',
    photo: LISTING_GALLERIES.l4[0],
    photos: LISTING_GALLERIES.l4,
    emoji: '🧸',
    title: 'Baby stroller + car seat',
    price: 300,
    category: 'Kids & baby',
    condition: 'Good',
    area: 'Jumeirah',
    city: 'Dubai',
    distanceKm: 5.3,
    seller: 'Maria',
    sellerRating: 5,
    sellerSales: 4,
    postedHoursAgo: 30,
    description:
      'Our little one has outgrown it. Folds flat, fits in any boot. Car seat clicks onto the frame.',
    negotiable: true,
  },
  {
    id: 'l5',
    photo: LISTING_GALLERIES.l5[0],
    photos: LISTING_GALLERIES.l5,
    emoji: '☕',
    title: 'Nespresso Vertuo coffee machine',
    price: 220,
    category: 'Home & kitchen',
    condition: 'Like new',
    area: 'Business Bay',
    city: 'Dubai',
    distanceKm: 4.6,
    seller: 'Priya',
    sellerRating: 4.6,
    sellerSales: 15,
    postedHoursAgo: 48,
    description:
      'Got a new one as a gift, so this is spare. Descaled and cleaned. Includes 10 pods.',
    negotiable: false,
  },
  {
    id: 'l6',
    photo: LISTING_GALLERIES.l6[0],
    photos: LISTING_GALLERIES.l6,
    emoji: '👗',
    title: 'Zara linen dress, size S',
    price: 60,
    category: 'Fashion',
    condition: 'Like new',
    area: 'Downtown',
    city: 'Dubai',
    distanceKm: 4.0,
    seller: 'Noor',
    sellerRating: 4.9,
    sellerSales: 31,
    postedHoursAgo: 3,
    description: 'Worn once to a wedding. Light beige, perfect for summer.',
    negotiable: false,
  },
  {
    id: 'l7',
    photo: LISTING_GALLERIES.l7[0],
    photos: LISTING_GALLERIES.l7,
    emoji: '📚',
    title: 'Box of 20 paperback novels',
    price: 0,
    category: 'Books & media',
    condition: 'Fair',
    area: 'Al Quoz',
    city: 'Dubai',
    distanceKm: 6.2,
    seller: 'Leo',
    sellerRating: 4.5,
    sellerSales: 6,
    postedHoursAgo: 12,
    description:
      'Clearing the shelves. Mix of thrillers and classics. Free to anyone who collects this week.',
    negotiable: false,
  },
  {
    id: 'l8',
    photo: LISTING_GALLERIES.l8[0],
    photos: LISTING_GALLERIES.l8,
    emoji: '🪑',
    title: 'Solid wood dining set, 4 chairs',
    price: 900,
    category: 'Furniture',
    condition: 'Good',
    area: 'Mirdif',
    city: 'Dubai',
    distanceKm: 14.5,
    seller: 'Daniel',
    sellerRating: 4.8,
    sellerSales: 9,
    postedHoursAgo: 72,
    description:
      'Teak table (160 × 90 cm) with four chairs. A few small marks on the tabletop. Can help load.',
    negotiable: true,
  },
  {
    id: 'l9',
    photo: LISTING_GALLERIES.l9[0],
    photos: LISTING_GALLERIES.l9,
    emoji: '🎮',
    title: 'PS5 + 2 controllers',
    price: 1500,
    category: 'Electronics',
    condition: 'Good',
    area: 'Al Nahda',
    city: 'Sharjah',
    distanceKm: 18,
    seller: 'Ali',
    sellerRating: 4.4,
    sellerSales: 3,
    postedHoursAgo: 8,
    description:
      'Disc edition. Works perfectly, just don’t have time to play. Includes FIFA and Spider-Man.',
    negotiable: true,
  },
  {
    id: 'l10',
    photo: LISTING_GALLERIES.l10[0],
    photos: LISTING_GALLERIES.l10,
    emoji: '🍳',
    title: 'Tefal non-stick pan set',
    price: 120,
    category: 'Home & kitchen',
    condition: 'New',
    area: 'Al Reem Island',
    city: 'Abu Dhabi',
    distanceKm: 120,
    seller: 'Sara',
    sellerRating: 4.9,
    sellerSales: 19,
    postedHoursAgo: 96,
    description:
      'Still in the box. 3 pans (20, 24, 28 cm). Duplicate wedding gift.',
    negotiable: false,
  },
  {
    id: 'l11',
    photo: LISTING_GALLERIES.l11[0],
    photos: LISTING_GALLERIES.l11,
    emoji: '💡',
    title: 'Adjustable desk lamp, black',
    price: 45,
    category: 'Home & kitchen',
    condition: 'Like new',
    area: 'Dubai Marina',
    city: 'Dubai',
    distanceKm: 0,
    seller: 'You',
    sellerRating: 5,
    sellerSales: 0,
    postedHoursAgo: 26,
    description:
      'LED, three brightness levels. Upgraded my desk setup so it’s spare.',
    negotiable: true,
    mine: true,
  },
];
