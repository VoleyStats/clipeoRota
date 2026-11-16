export type Mode = '3x3' | '4x4' | '6x6';

export const MODES: readonly Mode[] = ['3x3', '4x4', '6x6'];

export interface Format {
  mode: Mode;
  /** Number of zones (ZN1..ZNn). ZN1 is always the serving zone. */
  zones: number;
  /**
   * Court layout, rows ordered from the net to the back line, each row from
   * left to right as seen by the team's own coach. Values are zone numbers.
   * Mirrors Clipeo's `Court.swift` so a rotation looks the same in both apps.
   */
  layout: number[][];
  /** Relative height of each layout row (Clipeo draws the front row smaller). */
  rowWeights: number[];
}

export const FORMATS: Record<Mode, Format> = {
  // Triangle: ZN2 front centre, ZN3 back left, ZN1 back right.
  '3x3': { mode: '3x3', zones: 3, layout: [[2], [3, 1]], rowWeights: [1, 2] },
  // Diamond: ZN3 front centre, ZN4 left, ZN2 right, ZN1 back centre.
  '4x4': { mode: '4x4', zones: 4, layout: [[3], [4, 2], [1]], rowWeights: [1, 2, 1] },
  // Official I–VI: front 4·3·2, back 5·6·1.
  '6x6': { mode: '6x6', zones: 6, layout: [[4, 3, 2], [5, 6, 1]], rowWeights: [1, 2] },
};

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

export function emptyLineup(mode: Mode): string[] {
  return Array.from({ length: FORMATS[mode].zones }, () => '');
}
