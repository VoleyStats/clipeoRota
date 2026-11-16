import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Dropdown } from '../components/Dropdown';
import { Screen } from '../components/Screen';
import { MODES, type Mode } from '../core/formats';
import { loadPrefs, savePrefs, type Profile } from '../storage';
import { t } from '../strings';
import { color, font, pressScale, radius, space } from '../ui/theme';

const DEFAULT_MODE: Mode = '6x6';
const MODE_OPTIONS = MODES.map((m) => ({ value: m, label: t.modeName(m), detail: m }));

// Only jump to the remembered view on a cold start, not when the user comes
// back here on purpose to change role or modality.
let resumed = false;

/** Home: global modality (dropdown) + role, on one screen. */
export default function HomeScreen() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);

  useEffect(() => {
    loadPrefs().then((prefs) => {
      const savedMode = prefs.mode ?? DEFAULT_MODE;
      setMode(savedMode);
      if (!resumed && prefs.profile) router.push(`/${prefs.profile}/${savedMode}`);
      resumed = true;
      setReady(true);
    });
  }, []);

  if (!ready) return <View style={styles.blank} />;

  const changeMode = (m: Mode) => {
    setMode(m);
    savePrefs({ mode: m });
  };
  const open = (profile: Profile) => router.push(`/${profile}/${mode}`);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Image
            source={require('../../assets/splash-icon.png')}
            style={styles.logo}
            accessibilityIgnoresInvertColors
            accessible={false}
          />
          <Text style={styles.appName}>
            Clipeo <Text style={styles.appNameAccent}>Rota</Text>
          </Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>

        <Dropdown label={t.mode} value={mode} options={MODE_OPTIONS} onChange={changeMode} />

        <View style={styles.roles}>
          <Text style={styles.label}>{t.chooseProfile}</Text>
          <RoleCard title={t.coach} hint={t.coachHint} onPress={() => open('entrenador')} />
          <RoleCard title={t.referee} hint={t.refereeHint} onPress={() => open('arbitro')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function RoleCard({ title, hint, onPress }: { title: string; hint: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardHint}>{hint}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  blank: { flex: 1, backgroundColor: color.darkHigh },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: space.xl,
    gap: space.xl,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  brand: { alignItems: 'center', marginBottom: space.lg },
  // splash-icon.png is the app symbol on a transparent background (scripts/render-icons.mjs).
  logo: { width: 112, height: 112, marginBottom: space.md },
  appName: { fontFamily: font.headingBold, fontSize: 40, color: color.textPrimary },
  appNameAccent: { color: color.brandBlue },
  tagline: { fontSize: 16, color: color.textSecondary, marginTop: space.sm },
  roles: { gap: space.md },
  label: { fontSize: 14, fontWeight: '600', color: color.textSecondary },
  card: { padding: space.xl, borderRadius: radius.card, backgroundColor: color.card, gap: space.xs },
  cardPressed: { transform: [{ scale: pressScale }] },
  cardTitle: { fontFamily: font.heading, fontSize: 26, color: color.textPrimary },
  cardHint: { fontSize: 15, color: color.textSecondary },
});
