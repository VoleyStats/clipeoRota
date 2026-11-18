import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../components/Button';
import { Court } from '../../components/Court';
import { Scanner } from '../../components/Scanner';
import { Screen } from '../../components/Screen';
import { MATCH_TTL_MS } from '../../core/expiry';
import { isMode, type Mode } from '../../core/formats';
import { decodeLineup, encodeLineup, type Lineup } from '../../core/qr';
import { savePrefs, usePersistentState } from '../../storage';
import { t } from '../../strings';
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

  const { width, height } = useWindowDimensions();
  const sideBySide = width >= 700 || width > height;

  return (
    <Screen back title={t.referee}>
      <ScrollView contentContainerStyle={styles.content}>
        {setMismatch && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>{t.setMismatch(state.A!.set, state.B!.set)}</Text>
          </View>
        )}
        <View style={[styles.cards, sideBySide && styles.cardsWide]}>
          {(['A', 'B'] as const).map((side) => (
            <TeamCard
              key={side}
              title={label(side)}
              mode={mode}
              lineup={state[side]}
              onScan={() => setScanning(side)}
            />
          ))}
        </View>
      </ScrollView>

      <Scanner
        visible={scanning !== null}
        title={scanning ? t.scanTitle(label(scanning)) : ''}
        onScanned={(data) => scanning && onScanned(scanning, data)}
        onClose={() => setScanning(null)}
      />
    </Screen>
  );
}

function TeamCard({
  title,
  mode,
  lineup,
  onScan,
}: {
  title: string;
  mode: Mode;
  lineup: Lineup | null;
  onScan: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {lineup ? (
          <View style={styles.teamInfo}>
            <Text style={styles.team}>{lineup.team}</Text>
            <View style={styles.setChip}>
              <Text style={styles.setChipText}>{t.setLabel(lineup.set)}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.notScanned}>{t.notScanned}</Text>
        )}
      </View>
      <Court
        mode={mode}
        style={styles.court}
        renderZone={(zone) => <Text style={styles.dorsal}>{lineup?.dorsales[zone - 1] ?? '–'}</Text>}
      />
      <Button label={lineup ? t.rescan : t.scan} variant={lineup ? 'secondary' : 'primary'} size="lg" onPress={onScan} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.lg, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  cards: { gap: space.lg },
  cardsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  warning: {
    padding: space.md,
    borderRadius: radius.control,
    backgroundColor: 'rgba(234,179,8,0.15)', // warning @ 15 %
  },
  warningText: { fontSize: 15, fontWeight: '600', color: color.warning, textAlign: 'center' },
  card: { flex: 1, gap: space.md, padding: space.lg, borderRadius: radius.card, backgroundColor: color.card },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
  cardTitle: { fontFamily: font.heading, fontSize: 20, color: color.textPrimary },
  teamInfo: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  team: { fontFamily: font.headingBold, fontSize: 30, letterSpacing: 4, color: color.volt },
  setChip: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    backgroundColor: color.card,
  },
  setChipText: { fontSize: 14, fontWeight: '600', color: color.textPrimary },
  notScanned: { fontSize: 15, color: color.textMuted },
  court: { maxWidth: 420, alignSelf: 'center' },
  dorsal: { fontFamily: font.headingBold, fontSize: 40, color: color.courtInk },
});
