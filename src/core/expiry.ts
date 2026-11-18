/**
 * Match data expires on its own: a few hours after it was last used, the
 * coach and referee views start blank again, as if "Nuevo partido" had been
 * pressed. The stored value carries the time of its last change.
 */

/** A match is over well before this; the next one starts blank. */
export const MATCH_TTL_MS = 5 * 60 * 60 * 1000;

export interface Stamped<T> {
  /** Time of the last change (ms since epoch). */
  savedAt: number;
  data: T;
}

export function stamp<T>(data: T, now: number): Stamped<T> {
  return { savedAt: now, data };
}

export function isExpired(savedAt: number, now: number, ttl: number): boolean {
  return now - savedAt >= ttl;
}

/**
 * The stored value if it is still fresh, otherwise null. Values without a
 * time (saved before expiry existed) count as expired.
 */
export function readStamped(raw: unknown, now: number, ttl: number): Stamped<unknown> | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { savedAt, data } = raw as Record<string, unknown>;
  if (typeof savedAt !== 'number' || !Number.isFinite(savedAt) || data === undefined) return null;
  if (isExpired(savedAt, now, ttl)) return null;
  return { savedAt, data };
}
