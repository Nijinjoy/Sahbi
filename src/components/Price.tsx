import { StyleProp, Text, TextStyle } from 'react-native';
import { formatPrice } from '../data/listings';

type Props = {
  amount: number;
  style?: StyleProp<TextStyle>;
  /** Style for "Free" (price 0). Defaults to `style`. */
  freeStyle?: StyleProp<TextStyle>;
  /** Text appended after the amount, e.g. " · Sold". */
  suffix?: string;
  numberOfLines?: number;
};

/** A price as "AED 1,500", or "Free" when the amount is 0. */
export function Price({
  amount,
  style,
  freeStyle,
  suffix,
  numberOfLines = 1,
}: Props) {
  return (
    <Text
      style={[style, amount === 0 && freeStyle]}
      numberOfLines={numberOfLines}
    >
      {formatPrice(amount)}
      {suffix ?? ''}
    </Text>
  );
}
