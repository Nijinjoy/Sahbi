import { ImageSourcePropType } from 'react-native';

/**
 * Free-licence (CC0 / public domain) stock photos for the demo listings.
 * The first photo is the cover; the rest are extra angles and close-ups
 * cropped from the same original. See src/assets/listings/CREDITS.md.
 */
export const LISTING_GALLERIES: Record<string, ImageSourcePropType[]> = {
  l1: [
    require('../assets/listings/l1.jpg'),
    require('../assets/listings/l1_2.jpg'),
    require('../assets/listings/l1_3.jpg'),
    require('../assets/listings/l1_4.jpg'),
  ],
  l2: [
    require('../assets/listings/l2.jpg'),
    require('../assets/listings/l2_2.jpg'),
    require('../assets/listings/l2_3.jpg'),
    require('../assets/listings/l2_4.jpg'),
  ],
  l3: [
    require('../assets/listings/l3.jpg'),
    require('../assets/listings/l3_2.jpg'),
    require('../assets/listings/l3_3.jpg'),
  ],
  l4: [
    require('../assets/listings/l4.jpg'),
    require('../assets/listings/l4_2.jpg'),
    require('../assets/listings/l4_3.jpg'),
  ],
  l5: [
    require('../assets/listings/l5.jpg'),
    require('../assets/listings/l5_2.jpg'),
    require('../assets/listings/l5_3.jpg'),
    require('../assets/listings/l5_4.jpg'),
  ],
  l6: [
    require('../assets/listings/l6.jpg'),
    require('../assets/listings/l6_2.jpg'),
    require('../assets/listings/l6_3.jpg'),
  ],
  l7: [
    require('../assets/listings/l7.jpg'),
    require('../assets/listings/l7_2.jpg'),
    require('../assets/listings/l7_3.jpg'),
  ],
  l8: [
    require('../assets/listings/l8.jpg'),
    require('../assets/listings/l8_2.jpg'),
    require('../assets/listings/l8_3.jpg'),
  ],
  l9: [
    require('../assets/listings/l9.jpg'),
    require('../assets/listings/l9_2.jpg'),
    require('../assets/listings/l9_3.jpg'),
    require('../assets/listings/l9_4.jpg'),
  ],
  l10: [
    require('../assets/listings/l10.jpg'),
    require('../assets/listings/l10_2.jpg'),
    require('../assets/listings/l10_3.jpg'),
  ],
  l11: [
    require('../assets/listings/l11.jpg'),
    require('../assets/listings/l11_2.jpg'),
    require('../assets/listings/l11_3.jpg'),
  ],
};
