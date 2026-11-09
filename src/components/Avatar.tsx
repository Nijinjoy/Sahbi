import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const PALETTE = [
  { bg: colors.primary, fg: colors.textOnPrimary },
  { bg: colors.accentTeal, fg: colors.textOnSecondary },
  { bg: colors.accentCoral, fg: colors.textOnSecondary },
  { bg: colors.secondary, fg: colors.textOnSecondary },
];

function paletteFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return PALETTE[hash % PALETTE.length];
}

type Props = {
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ name, size = 52, style }: Props) {
  const palette = paletteFor(name);
  return (
    <View
      accessibilityLabel={name}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.bg,
        },
        style,
      ]}
    >
      <Text
        style={[styles.text, { color: palette.fg, fontSize: size * 0.42 }]}
      >
        {name.charAt(0)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.extraBold,
  },
});
