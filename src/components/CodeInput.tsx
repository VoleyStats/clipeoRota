import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { color, font, radius, space } from '../ui/theme';

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Number of characters (one cell each). */
  length: number;
  /** Applied to every keystroke (e.g. uppercase + allowed characters). */
  normalize: (raw: string) => string;
  accessibilityLabel: string;
  /** Read only: the cells show the value and a tap calls `onLockedPress`. */
  locked?: boolean;
  onLockedPress?: () => void;
}

/**
 * One cell per character. A single transparent TextInput on top receives the
 * typing (so paste, delete and autofill work as in a normal field) and the
 * cells only render its value.
 */
export function CodeInput({ value, onChange, length, normalize, accessibilityLabel, locked, onLockedPress }: Props) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable
      onPress={() => (locked ? onLockedPress?.() : input.current?.focus())}
      accessible={locked}
      accessibilityRole={locked ? 'button' : undefined}
      accessibilityLabel={locked ? `${accessibilityLabel}: ${value}` : undefined}
      style={styles.root}
    >
      {Array.from({ length }, (_, i) => {
        const char = value[i] ?? '';
        const active = !locked && focused && i === activeIndex;
        return (
          <View key={i} style={[styles.cell, active && styles.cellActive, locked && styles.cellLocked]}>
            <Text style={[styles.char, locked && styles.charLocked]}>{char}</Text>
          </View>
        );
      })}
      {!locked && (
        <TextInput
          ref={input}
          value={value}
          onChangeText={(raw) => onChange(normalize(raw))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={length}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          caretHidden
          style={styles.hiddenInput}
          accessibilityLabel={accessibilityLabel}
        />
      )}
    </Pressable>
  );
}

const CELL = 44;

const styles = StyleSheet.create({
  root: { flexDirection: 'row', gap: space.sm },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: radius.control,
    backgroundColor: color.field,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: { borderColor: color.volt },
  // Fixed for the match: shown like the referee sees it, not as a field.
  cellLocked: { backgroundColor: 'transparent', borderColor: color.stroke },
  char: { fontFamily: font.headingBold, fontSize: 24, color: color.textPrimary },
  charLocked: { color: color.volt },
  // Covers the cells so taps reach it, but is invisible: the cells draw the value.
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    color: 'transparent',
    fontSize: 1,
  },
});
