import { emptyLineup, FORMATS, type Mode } from './formats';
import { isLineupComplete, normalizeDorsal, normalizeTeamCode, validateLineup } from './lineup';

export const MAX_SETS = 5;

/** Coach state for one modality, persisted on the device. */
export interface CoachState {
  team: string;
  /** Set being prepared (1..MAX_SETS). */
  active: number;
  /** Rotation per set number. Missing set = not started. */
  sets: Record<number, string[]>;
}

export function initialCoachState(team = ''): CoachState {
  return { team, active: 1, sets: {} };
}

export function currentLineup(state: CoachState, mode: Mode): string[] {
  return state.sets[state.active] ?? emptyLineup(mode);
}

export function isEmptyLineup(dorsales: readonly string[]): boolean {
  return dorsales.every((d) => d === '');
}

/** Sets before the active one that have a complete rotation (can be copied). */
export function copyableSets(state: CoachState): number[] {
  const result: number[] = [];
  for (let s = 1; s < state.active; s++) {
    const lineup = state.sets[s];
    if (lineup && isLineupComplete(lineup)) result.push(s);
  }
  return result;
}

/**
 * What tapping a set button does:
 * - 'advance': the next set, enabled once the current one is complete (its QR exists).
 * - 'copy': an earlier set with a complete rotation, copied into the current one.
 * - 'current': the set being prepared (no-op).
 * - null: disabled.
 */
export type SetAction = 'advance' | 'copy' | 'current' | null;

export function setAction(state: CoachState, mode: Mode, set: number): SetAction {
  if (set === state.active) return 'current';
  if (set === state.active + 1 && set <= MAX_SETS) {
    return validateLineup(state.team, currentLineup(state, mode)).length === 0 ? 'advance' : null;
  }
  return copyableSets(state).includes(set) ? 'copy' : null;
}

/** Validates data read from storage; returns null if it doesn't fit the modality. */
export function parseCoachState(raw: unknown, mode: Mode): CoachState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { team, active, sets } = raw as Record<string, unknown>;
  if (typeof team !== 'string' || typeof active !== 'number') return null;
  if (!Number.isInteger(active) || active < 1 || active > MAX_SETS) return null;
  if (typeof sets !== 'object' || sets === null) return null;

  const zones = FORMATS[mode].zones;
  const parsed: Record<number, string[]> = {};
  for (const [key, value] of Object.entries(sets)) {
    const n = Number(key);
    if (!Number.isInteger(n) || n < 1 || n > MAX_SETS) continue;
    if (!Array.isArray(value) || value.length !== zones) continue;
    parsed[n] = value.map((d) => (typeof d === 'string' ? normalizeDorsal(d) : ''));
  }
  return { team: normalizeTeamCode(team), active, sets: parsed };
}
