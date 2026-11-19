import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { loadPrefs } from '../storage';
import { setLang, useLang } from '../strings';
import { color } from '../ui/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  // The saved language is applied before the first screen, so the texts don't flash.
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  useEffect(() => {
    loadPrefs().then(({ lang }) => {
      if (lang) setLang(lang);
      setPrefsLoaded(true);
    });
  }, []);
  const lang = useLang();
  useEffect(() => {
    if (Platform.OS === 'web') document.documentElement.lang = lang;
  }, [lang]);

  // Fonts are bundled, so this resolves almost instantly; on error fall back to system fonts.
  if ((!fontsLoaded && !fontError) || !prefsLoaded) {
    return <View style={{ flex: 1, backgroundColor: color.darkHigh }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.darkHigh },
          animation: 'fade',
        }}
      />
    </SafeAreaProvider>
  );
}
