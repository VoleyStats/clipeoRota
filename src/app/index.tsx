import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { loadPrefs, type Profile } from '../storage';
import { t } from '../strings';
import { color, font, pressScale, radius, space } from '../ui/theme';

// Only jump to the remembered view on a cold start, not when the user comes
// back here on purpose to change profile.
let resumed = false;

export default function ProfileScreen() {
  const [ready, setReady] = useState(resumed);

  useEffect(() => {
    if (resumed) return;
    resumed = true;
    loadPrefs().then((prefs) => {
      if (prefs) {
        // Build the stack (perfil → modalidad → vista) so "Cambiar" goes back one step.
        router.push({ pathname: '/modalidad', params: { perfil: prefs.profile } });
        router.push(`/${prefs.profile}/${prefs.mode}`);
      }
      setReady(true);
    });
  }, []);

  if (!ready) return <View style={styles.blank} />;

  const choose = (profile: Profile) =>
    router.push({ pathname: '/modalidad', params: { perfil: profile } });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Text style={styles.appName}>
            Clipeo <Text style={styles.appNameAccent}>Rota</Text>
          </Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>

        <Text style={styles.heading}>{t.chooseProfile}</Text>
        <ProfileCard title={t.coach} hint={t.coachHint} onPress={() => choose('entrenador')} />
        <ProfileCard title={t.referee} hint={t.refereeHint} onPress={() => choose('arbitro')} />
      </ScrollView>
    </Screen>
  );
}

function ProfileCard({ title, hint, onPress }: { title: string; hint: string; onPress: () => void }) {
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
    gap: space.lg,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  brand: { alignItems: 'center', marginBottom: space.xl },
  appName: { fontFamily: font.headingBold, fontSize: 40, color: color.textPrimary },
  appNameAccent: { color: color.volt },
  tagline: { fontSize: 16, color: color.textSecondary, marginTop: space.sm },
  heading: { fontFamily: font.heading, fontSize: 20, color: color.textPrimary },
  card: { padding: space.xl, borderRadius: radius.card, backgroundColor: color.card, gap: space.xs },
  cardPressed: { transform: [{ scale: pressScale }] },
  cardTitle: { fontFamily: font.heading, fontSize: 26, color: color.textPrimary },
  cardHint: { fontSize: 15, color: color.textSecondary },
});
