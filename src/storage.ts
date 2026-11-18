import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { AppState } from 'react-native';

import { isExpired, readStamped, stamp } from './core/expiry';
import { isMode, type Mode } from './core/formats';

export type Profile = 'entrenador' | 'arbitro';

export function isProfile(value: unknown): value is Profile {
  return value === 'entrenador' || value === 'arbitro';
}

export async function loadJSON(key: string): Promise<unknown> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is a convenience; the app keeps working in memory.
  }
}

export async function removeJSON(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Nothing to do: the value will be overwritten or expire again.
  }
}

const PREFS_KEY = 'prefs';

export interface Prefs {
  /** Last modality chosen on the home screen (global). */
  mode: Mode | null;
  /** Last view opened, reopened directly on a cold start. */
  profile: Profile | null;
}

export async function loadPrefs(): Promise<Prefs> {
  const raw = await loadJSON(PREFS_KEY);
  const { profile, mode } = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  return { profile: isProfile(profile) ? profile : null, mode: isMode(mode) ? mode : null };
}

export async function savePrefs(changes: Partial<Prefs>): Promise<void> {
  await saveJSON(PREFS_KEY, { ...(await loadPrefs()), ...changes });
}

export interface PersistOptions {
  /**
   * Time (ms) after the last change when the stored value expires and the
   * state goes back to `initial`. Checked on load, when the app comes back to
   * the foreground and every minute while it is open.
   */
  ttl?: number;
}

/**
 * State that is loaded from storage once and saved on every change.
 * `parse` validates what was stored; returning null falls back to `initial`.
 */
export function usePersistentState<T>(
  key: string,
  initial: () => T,
  parse: (raw: unknown) => T | null,
  { ttl }: PersistOptions = {},
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const parseRef = useRef(parse);
  const initialRef = useRef(initial);
  // Time of the last change, and the value that came from storage or from an
  // expiry reset: setting it isn't a use, so it doesn't refresh the time.
  const savedAt = useRef<number | null>(null);
  const untouched = useRef<T | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadJSON(key).then((raw) => {
      if (cancelled) return;
      let parsed: T | null = null;
      if (ttl == null) {
        parsed = raw == null ? null : parseRef.current(raw);
      } else if (raw != null) {
        const fresh = readStamped(raw, Date.now(), ttl);
        parsed = fresh ? parseRef.current(fresh.data) : null;
        if (fresh && parsed != null) savedAt.current = fresh.savedAt;
        else removeJSON(key);
      }
      if (parsed != null) {
        untouched.current = parsed;
        setState(parsed);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key, ttl]);

  useEffect(() => {
    if (!loaded || state === untouched.current) return;
    if (ttl == null) {
      saveJSON(key, state);
    } else {
      savedAt.current = Date.now();
      saveJSON(key, stamp(state, savedAt.current));
    }
  }, [key, state, loaded, ttl]);

  // Expiry while the app stays open (the coach view keeps the screen on) or in the background.
  useEffect(() => {
    if (ttl == null) return;
    const check = () => {
      if (savedAt.current == null || !isExpired(savedAt.current, Date.now(), ttl)) return;
      savedAt.current = null;
      const blank = initialRef.current();
      untouched.current = blank;
      setState(blank);
      removeJSON(key);
    };
    const interval = setInterval(check, 60 * 1000);
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') check();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [key, ttl]);

  return [state, setState, loaded];
}
