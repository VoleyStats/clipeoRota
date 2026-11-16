import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FORMATS, type Mode } from '../core/formats';
import { t } from '../strings';
import { color, courtCellSpacing, radius, space } from '../ui/theme';

interface Props {
  mode: Mode;
  /** Renders the content of one zone (1-based zone number), below its label. */
  renderZone: (zone: number) => ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Fill the parent's free space (flex: 1) instead of using the width + aspect ratio. */
  fit?: boolean;
  /** Zone being edited, outlined in volt. */
  activeZone?: number | null;
}

/** Clipeo's rotation board is 300x350; a little flatter leaves room for the controls. */
const ASPECT = 300 / 330;
const MAX_STRETCH = 1.25; // how much wider than ASPECT the court may get
const FIT_SCALE = 0.9; // leave some air around the court when it fills the free space

/**
 * Half court seen from the team's own side, net on top. Same geometry as
 * Clipeo's rotation board (Court.swift / OpponentCourt.swift): 2 pt gap,
 * 4 pt corners, smaller front row, zone 1 at the back right. Cells use the
 * family blue of the logo (#4A9FEE) with dark text, so the court stands out.
 */
export function Court({ mode, renderZone, style, fit, activeZone }: Props) {
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  if (fit) {
    return (
      <View style={styles.fitBox} onLayout={(e) => setBox(e.nativeEvent.layout)}>
        {box && (
          <CourtBody
            mode={mode}
            renderZone={renderZone}
            activeZone={activeZone}
            style={[
              {
                width: Math.min(box.width, box.height * ASPECT * MAX_STRETCH) * FIT_SCALE,
                height: box.height * FIT_SCALE,
              },
              style,
            ]}
          />
        )}
      </View>
    );
  }
  return (
    <CourtBody
      mode={mode}
      renderZone={renderZone}
      activeZone={activeZone}
      style={[{ width: '100%', aspectRatio: ASPECT }, style]}
    />
  );
}

function CourtBody({ mode, renderZone, style, activeZone }: Omit<Props, 'fit'>) {
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
              <View key={zone} style={[styles.cell, zone === activeZone && styles.cellActive]}>
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
  fitBox: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 0 },
  court: { gap: space.sm },
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
    // Always 3 pt wide so outlining the active zone doesn't shift its content.
    borderWidth: 3,
    borderColor: 'transparent',
  },
  cellActive: { borderColor: color.textPrimary },
  zoneLabel: { fontSize: 11, fontWeight: '600', color: color.courtLabel },
  content: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
});
