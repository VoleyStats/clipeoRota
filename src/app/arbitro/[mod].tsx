import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../components/Button';
import { Court, type ZoneSize } from '../../components/Court';
import { Scanner } from '../../components/Scanner';
import { Screen } from '../../components/Screen';
import { MATCH_TTL_MS } from '../../core/expiry';
import { isMode, type Mode } from '../../core/formats';
import { decodeLineup, encodeLineup, type Lineup } from '../../core/qr';
import { savePrefs, usePersistentState } from '../../storage';
import { useT, type Strings } from '../../strings';
import { confirm, notify } from '../../ui/dialog';
import { color, font, radius, space } from '../../ui/theme';

type Side = 'A' | 'B';
type RefereeState = Record<Side, Lineup | null>;

export default function RefereeRoute() {
  const { mod } = useLocalSearchParams<{ mod: string }>();
  if (!isMode(mod)) return <Redirect href="/" />;
  return <RefereeScreen key={mod} mode={mod} />;
}

/** Stored lineups are re-validated through the QR decoder. */
function parseRefereeState(raw: unknown, mode: Mode): RefereeState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const read = (value: unknown): Lineup | null => {
    if (typeof value !== 'object' || value === null) return null;
    const result = decodeLineup(encodeLineup(value as Lineup), mode);
    return result.ok ? result.lineup : null;
  };
  const { A, B } = raw as Record<string, unknown>;
  return { A: read(A), B: read(B) };
}

function RefereeScreen({ mode }: { mode: Mode }) {
  const t = useT();
  useEffect(() => {
    savePrefs({ profile: 'arbitro', mode });
  }, [mode]);

  const [state, setState] = usePersistentState<RefereeState>(
    `referee:${mode}`,
    () => ({ A: null, B: null }),
    (raw) => parseRefereeState(raw, mode),
    { ttl: MATCH_TTL_MS },
  );
  const [scanning, setScanning] = useState<Side | null>(null);

  const label = (side: Side) => (side === 'A' ? t.teamA : t.teamB);

  const onScanned = (side: Side, data: string) => {
    setScanning(null);
    const result = decodeLineup(data, mode);
    if (!result.ok) {
      notify(t.invalidQrTitle, t.decodeError(result.error, mode));
      return;
    }
    const other: Side = side === 'A' ? 'B' : 'A';
    const store = () => setState((s) => ({ ...s, [side]: result.lineup }));
    if (state[other]?.team === result.lineup.team) {
      confirm({
        title: t.sameTeamTitle,
        message: t.sameTeam(result.lineup.team, label(other)),
        confirmText: t.load,
        onConfirm: store,
      });
    } else {
      store();
    }
  };

  const setMismatch = state.A && state.B && state.A.set !== state.B.set;

  // Landscape: both teams side by side, each filling half the screen, no scroll.
  const { width, height } = useWindowDimensions();
  const wide = width > height;

  const warning = setMismatch && (
    <View style={[styles.warning, wide && styles.warningCompact]}>
      <Text style={[styles.warningText, wide && styles.warningTextCompact]}>{t.setMismatch(state.A!.set, state.B!.set)}</Text>
    </View>
  );
  const cards = (['A', 'B'] as const).map((side) => (
    <TeamCard
      key={side}
      t={t}
      title={label(side)}
      mode={mode}
      lineup={state[side]}
      compact={wide}
      onScan={() => setScanning(side)}
    />
  ));

  return (
    <Screen back title={t.referee}>
      {wide ? (
        <View style={[styles.content, styles.fill]}>
          {warning}
          <View style={[styles.cardsWide, styles.fill]}>{cards}</View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {warning}
          <View style={styles.cards}>{cards}</View>
        </ScrollView>
      )}

      <Scanner
        visible={scanning !== null}
        title={scanning ? t.scanTitle(label(scanning)) : ''}
        onScanned={(data) => scanning && onScanned(scanning, data)}
        onClose={() => setScanning(null)}
      />
    </Screen>
  );
}

/** Landscape leaves plenty of width: let the court get wider than the board's proportions. */
const COMPACT_STRETCH = 2.4;
const DORSAL_MAX = 64;

/** Largest number (two digits) that fits in the zone, up to the usual size. */
function dorsalSize(size: ZoneSize | null): number {
  if (!size) return DORSAL_MAX;
  return Math.max(14, Math.floor(Math.min(DORSAL_MAX, size.height * 0.75, (size.width - 8) / 1.3)));
}

/**
 * One team. `compact` (landscape) puts the scan button in the header and lets
 * the court fill the rest of the card, so the whole card fits on screen.
 */
function TeamCard({
  t,
  title,
  mode,
  lineup,
  compact,
  onScan,
}: {
  t: Strings;
  title: string;
  mode: Mode;
  lineup: Lineup | null;
  compact: boolean;
  onScan: () => void;
}) {
  const scanButton = compact ? (
    <Button label={t.scan} variant={lineup ? 'secondary' : 'primary'} onPress={onScan} />
  ) : (
    <Button label={lineup ? t.rescan : t.scan} variant={lineup ? 'secondary' : 'primary'} size="lg" onPress={onScan} />
  );
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.cardHeader}>
        <View style={styles.teamInfo}>
          <Text style={[styles.cardTitle, compact && styles.cardTitleCompact]} numberOfLines={1}>
            {title}
          </Text>
          {lineup ? (
            <View style={styles.teamGroup}>
              <Text style={[styles.team, compact && styles.teamCompact]}>{lineup.team}</Text>
              <View style={styles.setChip}>
                <Text style={styles.setChipText}>{t.setLabel(lineup.set)}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.notScanned} numberOfLines={1}>
              {t.notScanned}
            </Text>
          )}
        </View>
        {compact && scanButton}
      </View>
      <Court
        mode={mode}
        fit={compact}
        cornerLabels={compact}
        maxStretch={COMPACT_STRETCH}
        style={compact ? undefined : styles.court}
        renderZone={(zone, size) => (
          <Text style={[styles.dorsal, { fontSize: dorsalSize(size) }]}>{lineup?.dorsales[zone - 1] ?? '–'}</Text>
        )}
      />
      {!compact && scanButton}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: space.lg, gap: space.lg, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  cards: { gap: space.lg },
  cardsWide: { flexDirection: 'row', gap: space.lg },
  warning: {
    padding: space.md,
    borderRadius: radius.control,
    backgroundColor: 'rgba(234,179,8,0.15)', // warning @ 15 %
  },
  warningCompact: { paddingVertical: space.xs },
  warningTextCompact: { fontSize: 13 },
  warningText: { fontSize: 15, fontWeight: '600', color: color.warning, textAlign: 'center' },
  card: { flex: 1, gap: space.md, padding: space.lg, borderRadius: radius.card, backgroundColor: color.card },
  cardCompact: { padding: space.md, gap: space.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, minHeight: 40 },
  cardTitle: { fontFamily: font.heading, fontSize: 20, color: color.textPrimary, flexShrink: 1 },
  cardTitleCompact: { fontSize: 17 },
  teamInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  teamGroup: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  team: { fontFamily: font.headingBold, fontSize: 30, letterSpacing: 4, color: color.volt },
  teamCompact: { fontSize: 24, letterSpacing: 2 },
  setChip: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    backgroundColor: color.card,
  },
  setChipText: { fontSize: 14, fontWeight: '600', color: color.textPrimary },
  notScanned: { fontSize: 15, color: color.textMuted },
  court: { maxWidth: 420, alignSelf: 'center' },
  dorsal: { fontFamily: font.headingBold, color: color.courtInk },
});
