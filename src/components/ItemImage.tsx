import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { tileColor } from '../data/listings';

type Props = {
  id: string;
  emoji: string;
  /** Real product photo. Without one, the emoji tile is shown instead. */
  photo?: ImageSourcePropType;
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Product photo, or the item's emoji on a soft colored tile as a fallback. */
export function ItemImage({
  id,
  emoji,
  photo,
  size,
  radius = 16,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: tileColor(id), borderRadius: radius },
        size !== undefined && { width: size, height: size },
        style,
      ]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {photo ? (
        <Image source={photo} resizeMode="cover" style={styles.photo} />
      ) : (
        <Text style={{ fontSize: size ? size * 0.5 : 56 }}>{emoji}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
});
