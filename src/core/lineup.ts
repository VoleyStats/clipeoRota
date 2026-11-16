/** Dorsales: 1–99, digits only, no leading zeros ("07" → "7"). */
export function normalizeDorsal(input: string): string {
  return input.replace(/\D/g, '').replace(/^0+/, '').slice(0, 2);
}

export const TEAM_CODE_LENGTH = 3;

/** Team code: exactly 3 alphanumeric characters, uppercase. */
export function normalizeTeamCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, TEAM_CODE_LENGTH);
}

export function isValidTeamCode(code: string): boolean {
  return /^[A-Z0-9]{3}$/.test(code);
}

export function isValidDorsal(dorsal: string): boolean {
  return /^[1-9]\d?$/.test(dorsal);
}

export type Direction = 'clockwise' | 'counterclockwise';

/**
 * Rotates the dorsales one position. `dorsales[i]` is zone ZN(i+1).
 * - clockwise (volleyball rotation): ZN2 → ZN1, ZN3 → ZN2 … ZN1 → last zone.
 * - counterclockwise: ZN1 → ZN2 … last zone → ZN1.
 */
export function rotate(dorsales: readonly string[], direction: Direction): string[] {
  const n = dorsales.length;
  return dorsales.map((_, i) =>
    direction === 'clockwise' ? dorsales[(i + 1) % n] : dorsales[(i - 1 + n) % n],
  );
}

export type Issue =
  | { kind: 'team' }
  | { kind: 'empty'; zones: number[] }
  | { kind: 'duplicate'; dorsal: string; zones: number[] };

export function validateLineup(team: string, dorsales: readonly string[]): Issue[] {
  const issues: Issue[] = [];
  if (!isValidTeamCode(team)) issues.push({ kind: 'team' });

  const empty = dorsales.flatMap((d, i) => (isValidDorsal(d) ? [] : [i + 1]));
  if (empty.length) issues.push({ kind: 'empty', zones: empty });

  const byDorsal = new Map<string, number[]>();
  dorsales.forEach((d, i) => {
    if (isValidDorsal(d)) byDorsal.set(d, [...(byDorsal.get(d) ?? []), i + 1]);
  });
  for (const [dorsal, zones] of byDorsal) {
    if (zones.length > 1) issues.push({ kind: 'duplicate', dorsal, zones });
  }
  return issues;
}

/** Zones (1-based) that hold a repeated dorsal, for highlighting. */
export function duplicateZones(dorsales: readonly string[]): Set<number> {
  return new Set(
    validateLineup('AAA', dorsales).flatMap((i) => (i.kind === 'duplicate' ? i.zones : [])),
  );
}

export function isLineupComplete(dorsales: readonly string[]): boolean {
  return validateLineup('AAA', dorsales).length === 0;
}
