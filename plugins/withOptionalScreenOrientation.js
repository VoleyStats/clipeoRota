// Las actividades del escáner de Google ML Kit (incluidas por expo-camera) declaran
// screenOrientation="portrait", y Google Play deduce de ahí que la app exige
// android.hardware.screen.portrait, lo que la oculta en tablets, Chromebooks y
// Android XR. La app funciona en las dos orientaciones, así que se declaran opcionales.
const { withAndroidManifest } = require('expo/config-plugins');

const FEATURES = ['android.hardware.screen.portrait', 'android.hardware.screen.landscape'];

module.exports = function withOptionalScreenOrientation(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const features = (manifest['uses-feature'] = manifest['uses-feature'] ?? []);
    for (const name of FEATURES) {
      const existing = features.find((f) => f.$?.['android:name'] === name);
      if (existing) existing.$['android:required'] = 'false';
      else features.push({ $: { 'android:name': name, 'android:required': 'false' } });
    }
    return config;
  });
};
