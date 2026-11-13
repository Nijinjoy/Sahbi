import { ImageSourcePropType } from 'react-native';
import { LISTING_GALLERIES } from './listingPhotos';

export type CategoryGroup = {
  name: string;
  emoji: string;
  subcategories: string[];
  /** Listing categories this group shows. */
  includes: string[];
  photo: ImageSourcePropType | null;
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: 'Fashion',
    emoji: '👗',
    subcategories: ['Men', 'Women', 'Shoes', 'Bags'],
    includes: ['Fashion'],
    photo: LISTING_GALLERIES.l6[0],
  },
  {
    name: 'Electronics',
    emoji: '📱',
    subcategories: ['Mobiles', 'Laptops', 'Tablets', 'Accessories'],
    includes: ['Electronics'],
    photo: LISTING_GALLERIES.l2[0],
  },
  {
    name: 'Home & Living',
    emoji: '🛋️',
    subcategories: ['Furniture', 'Appliances', 'Decor'],
    includes: ['Furniture', 'Home & kitchen'],
    photo: LISTING_GALLERIES.l1[0],
  },
  {
    name: 'Luxury',
    emoji: '💎',
    subcategories: ['Watches', 'Bags', 'Jewellery'],
    includes: ['Luxury'],
    photo: null,
  },
  {
    name: 'Kids & Baby',
    emoji: '🧸',
    subcategories: ['Toys', 'Clothing', 'Baby Gear'],
    includes: ['Kids & baby'],
    photo: LISTING_GALLERIES.l4[0],
  },
  {
    name: 'Sports',
    emoji: '🚲',
    subcategories: ['Fitness', 'Sportswear', 'Equipment'],
    includes: ['Sports'],
    photo: LISTING_GALLERIES.l3[0],
  },
];
