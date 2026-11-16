import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Screen } from '../components/Screen';
import { FORMATS, MODES } from '../core/formats';
import { isProfile } from '../storage';
import { t } from '../strings';
import { color, font, pressScale, radius, space } from '../ui/theme';

export default function ModeScreen() {
  const { perfil } = useLocalSearchParams<{ perfil: string }>();
  if (!isProfile(perfil)) return <Redirect href="/" />;

  return (
    <Screen back title={perfil === 'entrenador' ? t.coach : t.referee}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{t.chooseMode}</Text>
        {MODES.map((mode) => (
          <Pressable
            key={mode}
            accessibilityRole="button"
            onPress={() => router.push(`/${perfil}/${mode}`)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <Text style={styles.mode}>{mode}</Text>
            <Text style={styles.zones}>{t.zones(FORMATS[mode].zones)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: space.xl,
    gap: space.lg,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  heading: { fontFamily: font.heading, fontSize: 20, color: color.textPrimary },
  card: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
    borderRadius: radius.card,
    backgroundColor: color.card,
  },
  cardPressed: { transform: [{ scale: pressScale }] },
  mode: { fontFamily: font.headingBold, fontSize: 40, color: color.textPrimary },
  zones: { fontSize: 16, color: color.textSecondary },
});
