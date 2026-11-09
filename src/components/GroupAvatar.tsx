import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  emoji: string;
  size?: number;
};

export function GroupAvatar({ emoji, size = 56 }: Props) {
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size * 0.32 },
      ]}
    >
      <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
