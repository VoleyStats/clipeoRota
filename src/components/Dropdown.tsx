import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, radius, space } from '../ui/theme';

interface Option<T extends string> {
  value: T;
  label: string;
  detail?: string;
}

interface Props<T extends string> {
  label?: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
}

/**
 * Same look as Clipeo's Dropdown.swift: 44 pt translucent field with radius 8
 * and a chevron; the options unfold as an overlay right below it (without
 * pushing the rest of the UI) with a checkmark on the selected one.
 */
export function Dropdown<T extends string>({ label, value, options, onChange }: Props<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.root, open && styles.rootOpen]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={label ? `${label}: ${selected?.label}` : selected?.label}
          onPress={() => setOpen((o) => !o)}
          style={styles.field}
        >
          <Text style={styles.value} numberOfLines={1}>
            {selected?.label}
            {selected?.detail ? <Text style={styles.detail}>{`  ·  ${selected.detail}`}</Text> : null}
          </Text>
          <Text style={[styles.chevron, open && styles.chevronOpen]}>›</Text>
        </Pressable>

        {open && (
          <View style={styles.list}>
            {options.map((option, i) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, i > 0 && styles.divider, pressed && styles.optionPressed]}
                >
                  <Text style={[styles.check, !isSelected && styles.hidden]}>✓</Text>
                  <Text style={[styles.value, isSelected && styles.valueSelected]}>{option.label}</Text>
                  {option.detail ? <Text style={styles.detail}>{option.detail}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.sm },
  // Lift the whole dropdown above the following siblings while the list is open.
  rootOpen: { zIndex: 10, elevation: 10 },
  label: { fontSize: 14, fontWeight: '600', color: color.textSecondary },
  field: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: radius.control,
    backgroundColor: color.field,
  },
  value: { flex: 1, fontSize: 17, fontWeight: '600', color: color.textPrimary },
  valueSelected: { color: color.volt },
  detail: { fontSize: 15, fontWeight: '400', color: color.textSecondary },
  chevron: { fontSize: 24, lineHeight: 26, color: color.textPrimary, transform: [{ rotate: '90deg' }] },
  chevronOpen: { transform: [{ rotate: '-90deg' }] },
  list: {
    position: 'absolute',
    top: 44 + space.xs,
    left: 0,
    right: 0,
    borderRadius: radius.control,
    backgroundColor: color.darkMid,
    borderWidth: 1,
    borderColor: color.stroke,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: 15, height: 48 },
  optionPressed: { backgroundColor: color.card },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.stroke },
  check: { width: 18, fontSize: 16, fontWeight: '700', color: color.volt },
  hidden: { opacity: 0 },
});
