import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { color, pressScale, radius, space } from '../ui/theme';

/**
 * Clipeo buttons: volt for the main action (dark text), translucent white
 * chips for the rest, volt when selected, 0.97 press scale.
 */
type Variant = 'primary' | 'secondary' | 'accent';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  selected?: boolean;
  size?: 'md' | 'lg';
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  selected,
  size = 'md',
  pill,
  style,
  accessibilityLabel,
}: Props) {
  const onVolt = variant === 'primary' || selected;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' && styles.lg,
        pill && styles.pill,
        styles[variant],
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[styles.label, size === 'lg' && styles.labelLg, onVolt ? styles.labelOnVolt : styles.labelOnDark]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: { minHeight: 52, paddingHorizontal: space.xl },
  pill: { borderRadius: radius.pill },
  primary: { backgroundColor: color.volt },
  secondary: { backgroundColor: color.card },
  accent: { backgroundColor: color.accent },
  selected: { backgroundColor: color.volt },
  disabled: { opacity: 0.35 },
  pressed: { transform: [{ scale: pressScale }] },
  label: { fontSize: 16, fontWeight: '600' },
  labelLg: { fontSize: 17 },
  labelOnVolt: { color: color.darkHigh },
  labelOnDark: { color: color.textPrimary },
});
