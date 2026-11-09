import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Props = {
  mode: 'date' | 'time';
  value: Date | null;
  onChange: (value: Date) => void;
  label: string;
  icon: string;
  placeholder: string;
  format: (value: Date) => string;
  minimumDate?: Date;
  maximumDate?: Date;
  invalid?: boolean;
};

export function DateTimeField({
  mode,
  value,
  onChange,
  label,
  icon,
  placeholder,
  format,
  minimumDate,
  maximumDate,
  invalid,
}: Props) {
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const open = () => {
    const initial = value ?? minimumDate ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode,
        value: initial,
        minimumDate: mode === 'date' ? minimumDate : undefined,
        maximumDate: mode === 'date' ? maximumDate : undefined,
        is24Hour: false,
        onValueChange: (_event, selected) => onChange(selected),
      });
      return;
    }
    setDraft(initial);
    setSheetOpen(true);
  };

  const confirm = () => {
    onChange(draft);
    setSheetOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? format(value) : 'not set'}`}
        accessibilityHint={`Opens the ${mode} picker`}
        style={({ pressed }) => [
          styles.field,
          value !== null && styles.fieldFilled,
          invalid && styles.fieldInvalid,
          pressed && styles.fieldPressed,
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.fieldText}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text
            style={[styles.fieldValue, value === null && styles.placeholder]}
            numberOfLines={1}
          >
            {value ? format(value) : placeholder}
          </Text>
        </View>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={sheetOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setSheetOpen(false)}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => setSheetOpen(false)}
            accessibilityLabel="Close picker"
          />
          <View
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          >
            <View style={styles.sheetBar}>
              <Pressable
                onPress={() => setSheetOpen(false)}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text style={styles.sheetCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable
                onPress={confirm}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text style={styles.sheetDone}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              mode={mode}
              value={draft}
              display={mode === 'date' ? 'inline' : 'spinner'}
              minimumDate={mode === 'date' ? minimumDate : undefined}
              maximumDate={mode === 'date' ? maximumDate : undefined}
              minuteInterval={mode === 'time' ? 5 : undefined}
              accentColor={colors.primary}
              textColor={colors.secondary}
              themeVariant="light"
              onValueChange={(_event, selected) => setDraft(selected)}
              style={styles.picker}
            />
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 64,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  fieldFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  fieldInvalid: {
    borderColor: colors.error,
    backgroundColor: colors.background,
  },
  fieldPressed: {
    opacity: 0.85,
  },
  icon: {
    fontSize: 20,
  },
  fieldText: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  fieldValue: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  placeholder: {
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 33, 61, 0.35)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.background,
    paddingTop: 8,
  },
  sheetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  sheetCancel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  sheetDone: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.secondary,
  },
  picker: {
    alignSelf: 'center',
  },
});
