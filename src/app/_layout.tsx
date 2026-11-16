import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { color } from '../ui/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  // Fonts are bundled, so this resolves almost instantly; on error fall back to system fonts.
  if (!fontsLoaded && !fontError) {
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
