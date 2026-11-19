import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useT } from '../strings';
import { color, font, pressScale, radius, space } from '../ui/theme';

interface Props {
  title?: string;
  /** Shows a back button that returns to the previous step. */
  back?: boolean;
  /** Action shown on the right side of the header. */
  right?: ReactNode;
  children: ReactNode;
}

const BACK_SIZE = 40;

export function Screen({ title, back, right, children }: Props) {
  const t = useT();
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      {(back || title || right) && (
        <View style={styles.header}>
          {/* Title is centred on the whole header, independent of the side slots. */}
          {title ? (
            <View style={styles.titleBox} pointerEvents="none">
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            </View>
          ) : null}
          {back ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.back}
              hitSlop={8}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M15 5l-7 7 7 7"
                  stroke={color.textPrimary}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Pressable>
          ) : (
            <View />
          )}
          {right ?? <View />}
        </View>
      )}
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.darkHigh },
  header: {
    minHeight: BACK_SIZE + space.md * 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  titleBox: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 124, // keep clear of the side buttons
  },
  title: { fontFamily: font.heading, fontSize: 20, color: color.textPrimary },
  backButton: {
    width: BACK_SIZE,
    height: BACK_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: pressScale }] },
});
