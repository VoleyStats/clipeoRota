import { useKeepAwake } from 'expo-keep-awake';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { Court } from '../../components/Court';
import { Screen } from '../../components/Screen';
import { isMode, type Mode } from '../../core/formats';
import {
  duplicateZones,
  normalizeDorsal,
  normalizeTeamCode,
  rotate,
  validateLineup,
  type Direction,
} from '../../core/lineup';
import { encodeLineup } from '../../core/qr';
import {
  currentLineup,
  initialCoachState,
  isEmptyLineup,
  MAX_SETS,
  parseCoachState,
  setAction,
  type CoachState,
} from '../../core/sets';
import { savePrefs, usePersistentState } from '../../storage';
import { t } from '../../strings';
import { color, font, pressScale, radius, space } from '../../ui/theme';

export default function CoachRoute() {
  const { mod } = useLocalSearchParams<{ mod: string }>();
  if (!isMode(mod)) return <Redirect href="/" />;
  return <CoachScreen key={mod} mode={mod} />;
}

const SETS = Array.from({ length: MAX_SETS }, (_, i) => i + 1);

/**
 * Everything fits on one screen (no scroll): the court takes whatever space
 * is left after the controls. The QR opens full screen in its own view.
 */
function CoachScreen({ mode }: { mode: Mode }) {
  useKeepAwake();
  useEffect(() => {
    savePrefs({ profile: 'entrenador', mode });
  }, [mode]);

  const [state, setState] = usePersistentState<CoachState>(
    `coach:${mode}`,
    () => initialCoachState(),
    (raw) => parseCoachState(raw, mode),
  );
  const [showQr, setShowQr] = useState(false);

  const dorsales = currentLineup(state, mode);
  const duplicates = duplicateZones(dorsales);
  const valid = validateLineup(state.team, dorsales).length === 0;
  const payload = valid ? encodeLineup({ mode, team: state.team, set: state.active, dorsales }) : null;

  const setLineup = (next: string[]) =>
    setState((s) => ({ ...s, sets: { ...s.sets, [s.active]: next } }));

  const setDorsal = (zone: number, value: string) => {
    const next = [...dorsales];
    next[zone - 1] = normalizeDorsal(value);
    setLineup(next);
  };

  const onRotate = (direction: Direction) => setLineup(rotate(dorsales, direction));

  const onSetPress = (set: number) => {
    switch (setAction(state, mode, set)) {
      case 'advance':
        Keyboard.dismiss();
        setState((s) => ({ ...s, active: set }));
        return;
      case 'copy': {
        const source = state.sets[set];
        if (isEmptyLineup(dorsales)) return setLineup([...source]);
        Alert.alert(t.setInProgress(state.active), t.copyConfirm(set, state.active), [
          { text: t.cancel, style: 'cancel' },
          { text: t.replace, style: 'destructive', onPress: () => setLineup([...source]) },
        ]);
        return;
      }
    }
  };

  const onNewMatch = () =>
    Alert.alert(t.newMatch, t.newMatchConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => setState((s) => initialCoachState(s.team)) },
    ]);

  const openQr = () => {
    Keyboard.dismiss();
    setShowQr(true);
  };

  const { width, height } = useWindowDimensions();
  const wide = width > height;

  const controls = (
    <View style={styles.controls}>
      <View style={styles.line}>
        <Text style={styles.label}>{t.teamCodeShort}</Text>
        <TextInput
          value={state.team}
          onChangeText={(v) => setState((s) => ({ ...s, team: normalizeTeamCode(v) }))}
          placeholder={t.teamCodePlaceholder}
          placeholderTextColor={color.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={3}
          style={styles.teamInput}
          accessibilityLabel={t.teamCode}
        />
      </View>
      <View style={styles.line}>
        <Text style={styles.label}>{t.set}</Text>
        <View style={styles.setRow}>
          {SETS.map((set) => {
            const action = setAction(state, mode, set);
            return (
              <Button
                key={set}
                label={String(set)}
                variant="secondary"
                pill
                selected={action === 'current'}
                disabled={action === null}
                onPress={() => onSetPress(set)}
                style={styles.setButton}
                accessibilityLabel={`${t.set} ${set}`}
              />
            );
          })}
        </View>
      </View>
    </View>
  );

  const court = (
    <Court
      mode={mode}
      fit
      renderZone={(zone) => (
        <TextInput
          value={dorsales[zone - 1] ?? ''}
          onChangeText={(v) => setDorsal(zone, v)}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
          style={[styles.dorsalInput, duplicates.has(zone) && styles.dorsalDuplicate]}
          accessibilityLabel={`Dorsal ${t.zone(zone).toLowerCase()}`}
        />
      )}
    />
  );

  const rotateRow = (
    <View style={styles.row}>
      <Button label={t.rotateCcw} variant="secondary" onPress={() => onRotate('counterclockwise')} style={styles.flex} />
      <Button label={t.rotateCw} variant="secondary" onPress={() => onRotate('clockwise')} style={styles.flex} />
    </View>
  );

  const qrButton = <Button label={t.showQr} size="lg" disabled={!valid} onPress={openQr} />;

  const newMatchButton = (
    <Pressable
      accessibilityRole="button"
      onPress={onNewMatch}
      hitSlop={8}
      style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
    >
      <Text style={styles.headerActionText}>{t.newMatch}</Text>
    </Pressable>
  );

  return (
    <Screen back title={t.coach} right={newMatchButton}>
      <Pressable style={styles.flex} onPress={Keyboard.dismiss} accessible={false}>
        {wide ? (
          <View style={[styles.body, styles.bodyWide]}>
            {court}
            <View style={[styles.column, styles.sideColumn]}>
              {controls}
              {rotateRow}
              {qrButton}
            </View>
          </View>
        ) : (
          <View style={[styles.body, styles.column]}>
            {controls}
            {court}
            {rotateRow}
            {qrButton}
          </View>
        )}
      </Pressable>

      <Modal
        visible={showQr && !!payload}
        animationType="slide"
        onRequestClose={() => setShowQr(false)}
        supportedOrientations={['portrait', 'landscape']}
      >
        <SafeAreaView style={styles.qrView}>
          <View style={styles.qrContent}>
            <Text style={styles.qrCaption}>{t.qrCaption(state.team, state.active)}</Text>
            {payload && (
              <QRCode
                value={payload}
                size={Math.min(width - 48, height - 260, 560)}
                ecl="M"
                color={color.darkHigh}
                backgroundColor="#FFFFFF"
              />
            )}
          </View>
          <Button label={t.close} variant="accent" size="lg" onPress={() => setShowQr(false)} style={styles.qrClose} />
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, paddingHorizontal: space.lg, paddingBottom: space.md, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  bodyWide: { flexDirection: 'row', gap: space.xl },
  column: { gap: space.md },
  sideColumn: { width: 340, justifyContent: 'center' },
  row: { flexDirection: 'row', gap: space.md },
  label: { width: 72, fontSize: 14, fontWeight: '600', color: color.textSecondary },

  headerAction: {
    paddingHorizontal: space.md,
    height: 40,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: color.card,
  },
  headerActionText: { fontSize: 13, fontWeight: '600', color: color.textPrimary },
  pressed: { transform: [{ scale: pressScale }] },

  controls: { gap: space.sm },
  // One control per line: label on the left, control on the right.
  line: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  teamInput: {
    width: 96,
    height: 44,
    fontFamily: font.headingBold,
    fontSize: 24,
    letterSpacing: 4,
    textAlign: 'center',
    color: color.textPrimary,
    backgroundColor: color.field,
    borderRadius: radius.control,
    padding: 0,
  },
  setRow: { flex: 1, flexDirection: 'row', gap: space.xs },
  setButton: { flex: 1, paddingHorizontal: 0 },

  // Fills the whole cell so tapping anywhere in the zone edits it.
  dorsalInput: {
    flex: 1,
    alignSelf: 'stretch',
    fontFamily: font.headingBold,
    fontSize: 40,
    textAlign: 'center',
    color: color.textPrimary,
    padding: 0,
  },
  // Red text is unreadable on the blue court: paint the whole zone red instead.
  dorsalDuplicate: { color: '#FFFFFF', backgroundColor: color.danger, borderRadius: radius.court },

  // QR view: white background for the best contrast when scanning at 1–2 m.
  qrView: { flex: 1, backgroundColor: '#FFFFFF', padding: space.xl },
  qrContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl },
  qrCaption: { fontFamily: font.headingBold, fontSize: 34, color: color.darkHigh, letterSpacing: 2 },
  qrClose: { alignSelf: 'stretch', maxWidth: 560, width: '100%', marginHorizontal: 'auto' },
});
