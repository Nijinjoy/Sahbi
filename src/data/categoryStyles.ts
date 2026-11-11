import { ImageSourcePropType } from 'react-native';
import { colors } from '../theme/colors';

export type CategoryStyle = {
  icon: ImageSourcePropType;
  /** Real photo for the Home "Shop by category" circles. */
  photo: ImageSourcePropType;
  bg: string;
  fg: string;
};

const TEAL_SOFT = '#E0F4F1';
const BLUE_SOFT = '#E4EEF8';
const BLUE_DARK = '#1D4E89';
const NAVY_SOFT = '#E6E9F0';

/** Line icon and tint for each category, as in the Categories tab design. */
export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Furniture: {
    icon: require('../assets/icons/categories/furniture.png'),
    photo: require('../assets/categories/photos/furniture.jpg'),
    bg: colors.primarySoft,
    fg: colors.secondary,
  },
  Electronics: {
    icon: require('../assets/icons/categories/electronics.png'),
    photo: require('../assets/categories/photos/electronics.jpg'),
    bg: TEAL_SOFT,
    fg: colors.accentTeal,
  },
  'Home & kitchen': {
    icon: require('../assets/icons/categories/kitchen.png'),
    photo: require('../assets/categories/photos/kitchen.jpg'),
    bg: BLUE_SOFT,
    fg: BLUE_DARK,
  },
  Fashion: {
    icon: require('../assets/icons/categories/fashion.png'),
    photo: require('../assets/categories/photos/fashion.jpg'),
    bg: NAVY_SOFT,
    fg: colors.secondary,
  },
  'Kids & baby': {
    icon: require('../assets/icons/categories/kids.png'),
    photo: require('../assets/categories/photos/kids.jpg'),
    bg: colors.primarySoft,
    fg: colors.secondary,
  },
  Sports: {
    icon: require('../assets/icons/categories/sports.png'),
    photo: require('../assets/categories/photos/sports.jpg'),
    bg: TEAL_SOFT,
    fg: colors.accentTeal,
  },
  'Books & media': {
    icon: require('../assets/icons/categories/books.png'),
    photo: require('../assets/categories/photos/books.jpg'),
    bg: BLUE_SOFT,
    fg: BLUE_DARK,
  },
  Other: {
    icon: require('../assets/icons/categories/other.png'),
    photo: require('../assets/categories/photos/other.jpg'),
    bg: NAVY_SOFT,
    fg: colors.secondary,
  },
};

export const TRENDING_SEARCHES = [
  'iPhone',
  'Sofa',
  'Stroller',
  'PS5',
  'Bike',
  'Dining table',
];

export function categoryStyle(name: string): CategoryStyle {
  return CATEGORY_STYLES[name] ?? CATEGORY_STYLES.Other;
}
