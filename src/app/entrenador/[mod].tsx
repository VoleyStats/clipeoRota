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
import { CodeInput } from '../../components/CodeInput';
import { Court } from '../../components/Court';
import { Screen } from '../../components/Screen';
import { isMode, type Mode } from '../../core/formats';
import {
  duplicateZones,
  normalizeDorsal,
  normalizeTeamCode,
  rotate,
  TEAM_CODE_LENGTH,
  validateLineup,
  type Direction,
} from '../../core/lineup';
import { encodeLineup } from '../../core/qr';
import {
  adoptViewedLineup,
  canOpenSet,
  wouldReplaceCurrent,
  editLineup,
  initialCoachState,
  MAX_SETS,
  openSet,
  parseCoachState,
  viewedLineup,
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
  const [activeZone, setActiveZone] = useState<number | null>(null);

  // The set on screen may be an earlier one; any edit, and the QR, go to the current set.
  const dorsales = viewedLineup(state, mode);
  const duplicates = duplicateZones(dorsales);
  const valid = validateLineup(state.team, dorsales).length === 0;
  const payload = valid ? encodeLineup({ mode, team: state.team, set: state.current, dorsales }) : null;

  /** Runs `apply` right away, or after confirming when it would replace the current set's rotation. */
  const confirmReplace = (apply: () => void) => {
    if (!wouldReplaceCurrent(state, mode)) return apply();
    Keyboard.dismiss();
    Alert.alert(t.replaceTitle, t.replaceConfirm(state.viewing, state.current), [
      { text: t.cancel, style: 'cancel' },
      { text: t.replace, style: 'destructive', onPress: apply },
    ]);
  };

  const setLineup = (next: string[]) => confirmReplace(() => setState((s) => editLineup(s, next)));

  const setDorsal = (zone: number, value: string) => {
    const next = [...dorsales];
    next[zone - 1] = normalizeDorsal(value);
    setLineup(next);
  };

  const onRotate = (direction: Direction) => setLineup(rotate(dorsales, direction));

  const onSetPress = (set: number) => {
    Keyboard.dismiss();
    setState((s) => openSet(s, mode, set));
  };

  const onNewMatch = () =>
    Alert.alert(t.newMatch, t.newMatchConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => setState((s) => initialCoachState(s.team)) },
    ]);

  const openQr = () => {
    Keyboard.dismiss();
    confirmReplace(() => {
      setState((s) => adoptViewedLineup(s, mode));
      setShowQr(true);
    });
  };

  const { width, height } = useWindowDimensions();
  const wide = width > height;

  const controls = (
    <View style={styles.controls}>
      <View style={styles.line}>
        <Text style={styles.label}>{t.teamCodeShort}</Text>
        <CodeInput
          value={state.team}
          onChange={(team) => setState((s) => ({ ...s, team }))}
          length={TEAM_CODE_LENGTH}
          normalize={normalizeTeamCode}
          accessibilityLabel={t.teamCode}
        />
      </View>
      <View style={styles.line}>
        <Text style={styles.label}>{t.set}</Text>
        <View style={styles.setRow}>
          {SETS.map((set) => (
            <Button
              key={set}
              label={String(set)}
              variant="secondary"
              pill
              selected={set === state.viewing}
              disabled={!canOpenSet(state, mode, set)}
              onPress={() => onSetPress(set)}
              style={[styles.setButton, set === state.current && set !== state.viewing && styles.setCurrent]}
              accessibilityLabel={`${t.set} ${set}`}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const court = (
    <Court
      mode={mode}
      fit
      activeZone={activeZone}
      renderZone={(zone) => (
        <TextInput
          value={dorsales[zone - 1] ?? ''}
          onChangeText={(v) => setDorsal(zone, v)}
          onFocus={() => setActiveZone(zone)}
          onBlur={() => setActiveZone((z) => (z === zone ? null : z))}
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
            <Text style={styles.qrCaption}>{t.qrCaption(state.team, state.current)}</Text>
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
  setRow: { flex: 1, flexDirection: 'row', gap: space.xs },
  setButton: { flex: 1, paddingHorizontal: 0 },
  // Marks the set being prepared while an earlier one is on screen.
  setCurrent: { borderWidth: 2, borderColor: color.volt },

  // Fills the whole cell so tapping anywhere in the zone edits it.
  dorsalInput: {
    flex: 1,
    alignSelf: 'stretch',
    fontFamily: font.headingBold,
    fontSize: 40,
    textAlign: 'center',
    color: color.courtInk,
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
