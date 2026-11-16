import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '../strings';
import { color, font, space } from '../ui/theme';

interface Props {
  title?: string;
  /** Shows a back button that returns to the previous step. */
  back?: boolean;
  children: ReactNode;
}

export function Screen({ title, back, children }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      {(back || title) && (
        <View style={styles.header}>
          {back ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            >
              <Text style={styles.back}>← {t.back}</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
      )}
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.darkHigh },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  back: { fontSize: 16, fontWeight: '600', color: color.accentText },
  title: { fontFamily: font.heading, fontSize: 20, color: color.textPrimary },
});
