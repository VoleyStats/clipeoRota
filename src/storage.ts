import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

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

/**
 * State that is loaded from storage once and saved on every change.
 * `parse` validates what was stored; returning null falls back to `initial`.
 */
export function usePersistentState<T>(
  key: string,
  initial: () => T,
  parse: (raw: unknown) => T | null,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const parseRef = useRef(parse);

  useEffect(() => {
    let cancelled = false;
    loadJSON(key).then((raw) => {
      if (cancelled) return;
      const parsed = raw == null ? null : parseRef.current(raw);
      if (parsed != null) setState(parsed);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (loaded) saveJSON(key, state);
  }, [key, state, loaded]);

  return [state, setState, loaded];
}
