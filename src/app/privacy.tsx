import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LangSwitch } from '../components/LangSwitch';
import { Screen } from '../components/Screen';
import { PRIVACY_POLICY } from '../privacyPolicy';
import { isLang, useLang, type Lang } from '../strings';
import { color, font, space } from '../ui/theme';

/** Privacy policy (https://rota.clipeostats.com/privacy), the same page on the web and in the app. */
export default function PrivacyRoute() {
  const params = useLocalSearchParams<{ lang?: string }>();
  // `?lang=` (links from the store listings) wins over the app language.
  const appLang = useLang();
  const lang: Lang = isLang(params.lang) ? params.lang : appLang;
  const policy = PRIVACY_POLICY[lang];

  return (
    <Screen
      back
      title={lang === 'es' ? 'Privacidad' : 'Privacy'}
      right={<LangSwitch value={lang} onChange={(l) => router.setParams({ lang: l })} style={styles.langs} />}
    >
      <Head>
        <title>{`${policy.title} · Clipeo Rota`}</title>
      </Head>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.app}>
          Clipeo <Text style={styles.appAccent}>Rota</Text>
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {policy.title}
        </Text>
        <Text style={styles.updated}>{policy.updated}</Text>
        {policy.blocks.map((block, i) => {
          if ('h' in block) {
            return (
              <Text key={i} style={styles.heading} accessibilityRole="header">
                {block.h}
              </Text>
            );
          }
          if ('li' in block) {
            return (
              <View key={i} style={styles.list}>
                {block.li.map((item) => (
                  <View key={item} style={styles.item}>
                    <Text style={styles.paragraph}>•</Text>
                    <Text style={[styles.paragraph, styles.itemText]}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          }
          return (
            <Text key={i} style={styles.paragraph}>
              {block.p}
            </Text>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space.xl,
    paddingTop: space.md,
    gap: space.md,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  langs: { paddingHorizontal: space.sm },
  app: { fontFamily: font.headingBold, fontSize: 20, color: color.textPrimary },
  appAccent: { color: color.brandBlue },
  title: { fontFamily: font.headingBold, fontSize: 32, color: color.textPrimary },
  updated: { fontSize: 14, color: color.textMuted },
  heading: { fontFamily: font.heading, fontSize: 22, color: color.textPrimary, marginTop: space.lg },
  paragraph: { fontSize: 16, lineHeight: 24, color: color.textSecondary },
  list: { gap: space.xs },
  item: { flexDirection: 'row', gap: space.sm },
  itemText: { flex: 1 },
});
