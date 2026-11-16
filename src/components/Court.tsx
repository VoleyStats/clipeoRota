import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FORMATS, type Mode } from '../core/formats';
import { t } from '../strings';
import { color, courtCellSpacing, radius, space } from '../ui/theme';

interface Props {
  mode: Mode;
  /** Renders the content of one zone (1-based zone number), below its label. */
  renderZone: (zone: number) => ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Half court seen from the team's own side, net on top. Same look as Clipeo's
 * rotation board (Court.swift / OpponentCourt.swift): translucent cells with
 * a 2 pt gap and 4 pt corners, smaller front row, zone 1 at the back right.
 */
export function Court({ mode, renderZone, style }: Props) {
  const { layout, rowWeights } = FORMATS[mode];
  return (
    <View style={[styles.court, style]}>
      <View style={styles.net}>
        <View style={styles.netLine} />
        <Text style={styles.netLabel}>{t.net}</Text>
        <View style={styles.netLine} />
      </View>
      <View style={styles.grid}>
        {layout.map((row, r) => (
          <View key={r} style={[styles.row, { flex: rowWeights[r] }]}>
            {row.map((zone) => (
              <View key={zone} style={styles.cell}>
                <Text style={styles.zoneLabel}>{t.zone(zone)}</Text>
                <View style={styles.content}>{renderZone(zone)}</View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  court: { width: '100%', aspectRatio: 300 / 330, gap: space.sm },
  net: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  netLine: { flex: 1, height: 2, backgroundColor: color.stroke },
  netLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 2, color: color.textSecondary },
  grid: { flex: 1, gap: courtCellSpacing },
  row: { flexDirection: 'row', gap: courtCellSpacing },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingTop: space.xs,
    borderRadius: radius.court,
    backgroundColor: color.courtCell,
  },
  zoneLabel: { fontSize: 11, color: color.textSecondary },
  content: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
});
