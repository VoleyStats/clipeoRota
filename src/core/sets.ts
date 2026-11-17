import { emptyLineup, FORMATS, type Mode } from './formats';
import { normalizeDorsal, normalizeTeamCode, TEAM_CODE_LENGTH, validateLineup } from './lineup';

export const MAX_SETS = 5;

/**
 * Coach state for one modality, persisted on the device.
 *
 * `current` is the set being prepared (the last one opened) and the only one
 * that changes. Earlier sets are history: they can be viewed, and using one
 * (editing it or showing its QR) moves its rotation into the current set.
 */
export interface CoachState {
  team: string;
  /** Set being prepared (1..MAX_SETS). */
  current: number;
  /** Set on screen: the current one or an earlier one being looked at. */
  viewing: number;
  /** Rotation per set number. Missing set = blank. */
  sets: Record<number, string[]>;
  /** The team code is fixed: a QR has been shown in this match (the referee may have it). */
  teamLocked: boolean;
}

/** Blank match: no team code and no rotations ("Nuevo partido"). */
export function initialCoachState(): CoachState {
  return { team: '', current: 1, viewing: 1, sets: {}, teamLocked: false };
}

/** The team code can be changed until the first QR of the match is shown; then only a new match clears it. */
export function setTeam(state: CoachState, team: string): CoachState {
  if (state.teamLocked) return state;
  return { ...state, team: normalizeTeamCode(team) };
}

export function viewedLineup(state: CoachState, mode: Mode): string[] {
  return state.sets[state.viewing] ?? emptyLineup(mode);
}

/** The set has a QR: team code and a complete rotation without repeats. */
export function hasQr(state: CoachState, mode: Mode, set: number): boolean {
  return validateLineup(state.team, state.sets[set] ?? emptyLineup(mode)).length === 0;
}

/** Earlier sets and the current one can be opened; the next one once the current has a QR. */
export function canOpenSet(state: CoachState, mode: Mode, set: number): boolean {
  if (!Number.isInteger(set) || set < 1 || set > MAX_SETS) return false;
  if (set <= state.current) return true;
  return set === state.current + 1 && hasQr(state, mode, state.current);
}

/** Opening the next set makes it the current one, blank. Other sets are just viewed. */
export function openSet(state: CoachState, mode: Mode, set: number): CoachState {
  if (!canOpenSet(state, mode, set)) return state;
  if (set === state.current + 1) return { ...state, current: set, viewing: set };
  return { ...state, viewing: set };
}

/**
 * Applies an edit to the set on screen. Editing an earlier set writes the
 * result into the current set (the earlier one stays as it was) and goes back
 * to the current set.
 */
export function editLineup(state: CoachState, next: string[]): CoachState {
  return { ...state, viewing: state.current, sets: { ...state.sets, [state.current]: next } };
}

/**
 * Using the earlier set on screen would replace a different rotation already
 * written in the current set (worth a confirmation).
 */
export function wouldReplaceCurrent(state: CoachState, mode: Mode): boolean {
  if (state.viewing === state.current) return false;
  const current = state.sets[state.current];
  if (!current || current.every((d) => d === '')) return false;
  const viewed = viewedLineup(state, mode);
  return current.some((d, i) => d !== viewed[i]);
}

/** Moves the rotation on screen into the current set (used before showing the QR). */
export function adoptViewedLineup(state: CoachState, mode: Mode): CoachState {
  if (state.viewing === state.current) return state;
  return editLineup(state, [...viewedLineup(state, mode)]);
}

/** State once the QR is shown: the rotation on screen goes to the current set and the team code is fixed. */
export function showQr(state: CoachState, mode: Mode): CoachState {
  return { ...adoptViewedLineup(state, mode), teamLocked: true };
}

/** Validates data read from storage; returns null if it doesn't fit the modality. */
export function parseCoachState(raw: unknown, mode: Mode): CoachState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { team, current, viewing, sets, teamLocked } = raw as Record<string, unknown>;
  const isSet = (n: unknown): n is number =>
    typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= MAX_SETS;
  if (typeof team !== 'string' || !isSet(current)) return null;
  if (typeof sets !== 'object' || sets === null) return null;

  const zones = FORMATS[mode].zones;
  const parsed: Record<number, string[]> = {};
  for (const [key, value] of Object.entries(sets)) {
    const n = Number(key);
    if (!isSet(n) || !Array.isArray(value) || value.length !== zones) continue;
    parsed[n] = value.map((d) => (typeof d === 'string' ? normalizeDorsal(d) : ''));
  }
  const code = normalizeTeamCode(team);
  return {
    team: code,
    teamLocked: teamLocked === true && code.length === TEAM_CODE_LENGTH,
    current,
    viewing: isSet(viewing) && viewing <= current ? viewing : current,
    sets: parsed,
  };
}
