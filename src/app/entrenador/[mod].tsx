import { useKeepAwake } from 'expo-keep-awake';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

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
  canAdvance,
  copyableSets,
  currentLineup,
  initialCoachState,
  isEmptyLineup,
  MAX_SETS,
  parseCoachState,
  type CoachState,
} from '../../core/sets';
import { savePrefs, usePersistentState } from '../../storage';
import { t } from '../../strings';
import { color, font, radius, space } from '../../ui/theme';

export default function CoachRoute() {
  const { mod } = useLocalSearchParams<{ mod: string }>();
  if (!isMode(mod)) return <Redirect href="/" />;
  return <CoachScreen key={mod} mode={mod} />;
}

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

  const dorsales = currentLineup(state, mode);
  const issues = validateLineup(state.team, dorsales);
  const duplicates = duplicateZones(dorsales);
  const payload = issues.length ? null : encodeLineup({ mode, team: state.team, set: state.active, dorsales });
  const copyable = copyableSets(state);

  const setLineup = (next: string[]) =>
    setState((s) => ({ ...s, sets: { ...s.sets, [s.active]: next } }));

  const setDorsal = (zone: number, value: string) => {
    const next = [...dorsales];
    next[zone - 1] = normalizeDorsal(value);
    setLineup(next);
  };

  const onRotate = (direction: Direction) => setLineup(rotate(dorsales, direction));

  const onSetPress = (set: number) => {
    if (!copyable.includes(set)) return;
    const source = state.sets[set];
    if (isEmptyLineup(dorsales)) return setLineup([...source]);
    Alert.alert(t.setInProgress(state.active), t.copyConfirm(set, state.active), [
      { text: t.cancel, style: 'cancel' },
      { text: t.replace, style: 'destructive', onPress: () => setLineup([...source]) },
    ]);
  };

  const onNextSet = () => setState((s) => ({ ...s, active: Math.min(s.active + 1, MAX_SETS) }));

  const onNewMatch = () =>
    Alert.alert(t.newMatch, t.newMatchConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => setState((s) => initialCoachState(s.team)) },
    ]);

  const { width, height } = useWindowDimensions();
  const wide = width > height && width >= 700;
  const qrSize = Math.min(wide ? width / 2 - 96 : width - 96, wide ? height - 220 : 360, 420);

  const editor = (
    <View style={styles.column}>
      <View style={styles.field}>
        <Text style={styles.label}>{t.teamCode}</Text>
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

      <View style={styles.field}>
        <Text style={styles.label}>{t.setInProgress(state.active)}</Text>
        <View style={styles.setRow}>
          {Array.from({ length: MAX_SETS }, (_, i) => i + 1).map((set) => (
            <Button
              key={set}
              label={String(set)}
              variant="secondary"
              pill
              selected={set === state.active}
              disabled={set !== state.active && !copyable.includes(set)}
              onPress={() => onSetPress(set)}
              style={styles.setButton}
              accessibilityLabel={`${t.set} ${set}`}
            />
          ))}
        </View>
        {copyable.length > 0 && <Text style={styles.hint}>{t.copyHint}</Text>}
      </View>

      <Court
        mode={mode}
        style={styles.court}
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

      <View style={styles.rotateRow}>
        <Button label={t.rotateCcw} variant="secondary" onPress={() => onRotate('counterclockwise')} style={styles.flex} />
        <Button label={t.rotateCw} variant="secondary" onPress={() => onRotate('clockwise')} style={styles.flex} />
      </View>
    </View>
  );

  const qr = (
    <View style={styles.column}>
      <View style={styles.qrCard}>
        {payload ? (
          <>
            <View style={styles.qrBox}>
              <QRCode value={payload} size={qrSize} ecl="M" color={color.darkHigh} backgroundColor="#FFFFFF" />
            </View>
            <Text style={styles.qrCaption}>{t.qrCaption(state.team, state.active)}</Text>
          </>
        ) : (
          <View style={styles.missing}>
            <Text style={styles.missingTitle}>{t.missing}</Text>
            {issues.map((issue, i) => (
              <Text key={i} style={styles.missingItem}>
                • {t.issue(issue)}
              </Text>
            ))}
          </View>
        )}
      </View>

      {state.active < MAX_SETS && (
        <Button
          label={t.nextSet(state.active + 1)}
          onPress={onNextSet}
          disabled={!canAdvance(state, mode)}
          size="lg"
        />
      )}
      <Button label={t.newMatch} variant="secondary" onPress={onNewMatch} />
    </View>
  );

  return (
    <Screen back title={`${t.coach} · ${mode}`}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, wide && styles.contentWide]}
          keyboardShouldPersistTaps="handled"
        >
          {editor}
          {qr}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: space.lg, gap: space.xl, width: '100%', maxWidth: 640, alignSelf: 'center' },
  contentWide: { flexDirection: 'row', maxWidth: 1200, alignItems: 'flex-start' },
  column: { flex: 1, gap: space.lg },
  field: { gap: space.sm },
  label: { fontSize: 14, fontWeight: '600', color: color.textSecondary },
  hint: { fontSize: 13, color: color.textMuted },
  teamInput: {
    fontFamily: font.headingBold,
    fontSize: 30,
    letterSpacing: 6,
    color: color.textPrimary,
    backgroundColor: color.field,
    borderRadius: radius.control,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  setRow: { flexDirection: 'row', gap: space.sm },
  setButton: { flex: 1, paddingHorizontal: 0 },
  court: { maxWidth: 440, alignSelf: 'center' },
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
  dorsalDuplicate: { color: color.danger },
  rotateRow: { flexDirection: 'row', gap: space.md },
  qrCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: color.card,
    gap: space.md,
  },
  qrBox: { padding: space.lg, backgroundColor: '#FFFFFF', borderRadius: radius.control },
  qrCaption: { fontFamily: font.headingBold, fontSize: 24, color: color.textPrimary, letterSpacing: 2 },
  missing: { alignSelf: 'stretch', gap: space.sm },
  missingTitle: { fontSize: 16, fontWeight: '600', color: color.textBody },
  missingItem: { fontSize: 15, color: color.textSecondary },
});
