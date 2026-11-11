import { useState } from 'react';
import {
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MAX_PHOTOS } from '../data/listings';
import { fonts } from '../theme/fonts';
import { ItemImage } from './ItemImage';

type Props = {
  id: string;
  emoji: string;
  photos?: ImageSourcePropType[];
  width: number;
  height: number;
  /** Space kept clear at the bottom (e.g. for an overlapping sheet). */
  bottomInset?: number;
};

/** Swipeable full-width photo gallery with page dots and a counter. */
export function PhotoGallery({
  id,
  emoji,
  photos = [],
  width,
  height,
  bottomInset = 0,
}: Props) {
  const [index, setIndex] = useState(0);
  const shown = photos.slice(0, MAX_PHOTOS);

  // No photos: the emoji tile, same as before.
  if (shown.length === 0) {
    return (
      <ItemImage id={id} emoji={emoji} radius={0} style={{ width, height }} />
    );
  }

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(shown.length - 1, next)));
  };

  return (
    <View style={{ width, height }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        accessibilityLabel={`Photo ${index + 1} of ${shown.length}`}
      >
        {shown.map((photo, i) => (
          <ItemImage
            key={i}
            id={id}
            emoji={emoji}
            photo={photo}
            radius={0}
            style={{ width, height }}
          />
        ))}
      </ScrollView>

      {shown.length > 1 ? (
        <>
          <View
            pointerEvents="none"
            style={[styles.dots, { bottom: bottomInset + 14 }]}
          >
            {shown.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotOn]} />
            ))}
          </View>
          <View
            pointerEvents="none"
            style={[styles.counter, { bottom: bottomInset + 8 }]}
          >
            <Text style={styles.counterText}>
              {index + 1}/{shown.length}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  dotOn: {
    width: 20,
    backgroundColor: '#FFFFFF',
  },
  counter: {
    position: 'absolute',
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(20,33,61,0.7)',
  },
  counterText: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
});
