import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef } from 'react';
import { Linking, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useT } from '../strings';
import { color, font, radius, space } from '../ui/theme';
import { Button } from './Button';

interface Props {
  visible: boolean;
  title: string;
  onScanned: (data: string) => void;
  onClose: () => void;
}

/** Full-screen QR scanner. Camera permission is only requested here (RNF-05). */
export function Scanner({ visible, title, onScanned, onClose }: Props) {
  const t = useT();
  const [permission, requestPermission] = useCameraPermissions();
  // The camera fires many events per second; deliver only the first one per opening.
  const handled = useRef(false);

  useEffect(() => {
    if (visible) handled.current = false;
  }, [visible]);

  useEffect(() => {
    if (visible && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [visible, permission, requestPermission]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} supportedOrientations={['portrait', 'landscape']}>
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.viewport}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => {
                if (handled.current) return;
                handled.current = true;
                onScanned(data);
              }}
            />
          ) : (
            <View style={styles.permission}>
              <Text style={styles.permissionText}>
                {permission && !permission.canAskAgain ? t.cameraDenied : t.cameraNeeded}
              </Text>
              {permission && !permission.canAskAgain ? (
                // On the web the camera permission is changed from the browser's address bar.
                Platform.OS === 'web' ? null : <Button label={t.settings} variant="secondary" onPress={() => Linking.openSettings()} />
              ) : (
                <Button label={t.allowCamera} onPress={requestPermission} />
              )}
            </View>
          )}
          {permission?.granted && <View pointerEvents="none" style={styles.frame} />}
        </View>

        <Button label={t.close} variant="secondary" size="lg" onPress={onClose} style={styles.close} />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.darkHigh, padding: space.lg, gap: space.lg },
  title: { fontFamily: font.heading, fontSize: 22, color: color.textPrimary, textAlign: 'center' },
  viewport: {
    flex: 1,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.stroke,
    overflow: 'hidden',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    position: 'absolute',
    width: '70%',
    aspectRatio: 1,
    maxWidth: 360,
    borderWidth: 3,
    borderColor: color.volt,
    borderRadius: radius.card,
  },
  permission: { padding: space.xl, gap: space.lg, alignItems: 'center' },
  permissionText: { fontSize: 16, color: color.textBody, textAlign: 'center' },
  close: { alignSelf: 'stretch' },
});
