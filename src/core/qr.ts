import { FORMATS, isMode, type Mode } from './formats';
import { isValidDorsal, isValidTeamCode } from './lineup';
import { MAX_SETS } from './sets';

/**
 * QR payload — spec in docs/requisitos.md, sección 6. Clipeo must be able to
 * read it, so any change here needs a version bump and a spec update.
 *
 *   {"app":"clipeo-rota","v":1,"mod":"6x6","eq":"ABC","set":2,"zn":["22","4","7","10","1","15"]}
 */
export const QR_APP = 'clipeo-rota';
export const QR_VERSION = 1;

export interface Lineup {
  mode: Mode;
  team: string;
  /** Set number the coach prepared this rotation for (1..MAX_SETS). */
  set: number;
  /** dorsales[i] is zone ZN(i+1). */
  dorsales: string[];
}

export function encodeLineup({ mode, team, set, dorsales }: Lineup): string {
  return JSON.stringify({ app: QR_APP, v: QR_VERSION, mod: mode, eq: team, set, zn: dorsales });
}

export type DecodeError =
  | 'not-clipeo' // not JSON or not a Clipeo Rota payload
  | 'unsupported-version'
  | 'invalid' // Clipeo Rota payload with bad content
  | 'mode-mismatch';

export type DecodeResult = { ok: true; lineup: Lineup } | { ok: false; error: DecodeError };

export function decodeLineup(text: string, expectedMode: Mode): DecodeResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'not-clipeo' };
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'not-clipeo' };
  }
  const { app, v, mod, eq, set, zn } = data as Record<string, unknown>;
  if (app !== QR_APP) return { ok: false, error: 'not-clipeo' };
  if (v !== QR_VERSION) return { ok: false, error: 'unsupported-version' };

  if (
    !isMode(mod) ||
    typeof eq !== 'string' ||
    !isValidTeamCode(eq) ||
    typeof set !== 'number' ||
    !Number.isInteger(set) ||
    set < 1 ||
    set > MAX_SETS ||
    !Array.isArray(zn) ||
    !zn.every((d): d is string => typeof d === 'string' && isValidDorsal(d)) ||
    new Set(zn).size !== zn.length ||
    zn.length !== FORMATS[mod].zones
  ) {
    return { ok: false, error: 'invalid' };
  }
  if (mod !== expectedMode) return { ok: false, error: 'mode-mismatch' };

  return { ok: true, lineup: { mode: mod, team: eq, set, dorsales: zn } };
}
