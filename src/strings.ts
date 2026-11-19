import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import type { DecodeError } from './core/qr';

/**
 * All user-facing text, in Spanish and English. Components read it with
 * `useT()` so they re-render when the language changes; code outside React
 * (dialogs) uses `getT()`.
 */
export type Lang = 'es' | 'en';
export const LANGS: readonly Lang[] = ['es', 'en'];

export function isLang(value: unknown): value is Lang {
  return value === 'es' || value === 'en';
}

const es = {
  appName: 'Clipeo Rota',
  tagline: 'La hoja de rotación, en un QR.',
  mode: 'Modalidad',
  chooseProfile: 'Elige tu rol',
  coach: 'Entrenador',
  coachHint: 'Escribe tu rotación y enséñala en un QR.',
  referee: 'Árbitro',
  refereeHint: 'Escanea el QR de cada equipo.',
  modeName: (mode: string): string => (mode === '6x6' ? 'Voleibol' : 'Minivoley'),
  back: 'Volver',
  language: 'Idioma',

  teamCode: 'Código de equipo',
  teamCodeShort: 'Código',
  teamCodePlaceholder: 'ABC',
  set: 'Set',
  setInProgress: (n: number) => `Preparando el set ${n}`,
  rotateCw: 'Rotar ↻',
  rotateCcw: '↺ Rotar',
  net: 'RED',
  zone: (n: number) => `Zona ${n}`,
  dorsalLabel: (n: number) => `Dorsal zona ${n}`,
  setLabel: (n: number) => `Set ${n}`,
  newMatch: 'Nuevo partido',
  replaceTitle: 'Sustituir rotación',
  replaceConfirm: (from: number, to: number) =>
    `El set ${to} ya tiene otra rotación. ¿Sustituirla por la del set ${from}?`,
  replace: 'Sustituir',
  newMatchConfirm: '¿Borrar el código de equipo y las rotaciones de todos los sets?',
  teamLockedTitle: 'Código de equipo',
  teamLocked: 'El código no se puede cambiar después de mostrar el QR. Para usar otro, empieza un nuevo partido.',
  delete: 'Borrar',
  cancel: 'Cancelar',
  showQr: 'Mostrar QR',
  qrCaption: (team: string, set: number) => `${team} · Set ${set}`,
  qrCloseHint: 'Toca para cerrar',

  setMismatch: (a: number, b: number) =>
    `Los equipos han entregado sets distintos (A: set ${a}, B: set ${b}).`,
  teamA: 'Equipo A',
  teamB: 'Equipo B',
  notScanned: 'Sin escanear',
  scan: 'Escanear',
  rescan: 'Volver a escanear',
  scanTitle: (field: string) => `Escanea el QR del ${field}`,
  close: 'Cerrar',
  privacy: 'Política de privacidad',
  cameraNeeded: 'Para escanear hace falta permiso de cámara.',
  cameraDenied: Platform.OS === 'web'
    ? 'La cámara está bloqueada para esta página. Permítela desde el candado de la barra de direcciones y vuelve a abrir el escáner.'
    : 'La cámara está desactivada para Clipeo Rota. Actívala en los ajustes del dispositivo.',
  allowCamera: 'Permitir cámara',
  settings: 'Abrir ajustes',
  sameTeamTitle: 'Mismo equipo',
  sameTeam: (team: string, other: string) =>
    `El código ${team} ya está cargado en el ${other}. ¿Cargarlo igualmente?`,
  load: 'Cargar',
  invalidQrTitle: 'QR no válido',
  decodeError(error: DecodeError, mode: string): string {
    switch (error) {
      case 'not-clipeo':
        return 'Este QR no es una rotación de Clipeo Rota.';
      case 'unsupported-version':
        return 'Este QR es de otra versión de Clipeo Rota. Actualiza la app.';
      case 'invalid':
        return 'El QR tiene datos incorrectos. Pide al entrenador que lo vuelva a generar.';
      case 'mode-mismatch':
        return `Este QR no es de ${mode}. Comprueba la modalidad en las dos apps.`;
    }
  },
};

export type Strings = typeof es;

const en: Strings = {
  appName: 'Clipeo Rota',
  tagline: 'The lineup sheet, in a QR code.',
  mode: 'Format',
  chooseProfile: 'Choose your role',
  coach: 'Coach',
  coachHint: 'Write your rotation and show it as a QR code.',
  referee: 'Referee',
  refereeHint: "Scan each team's QR code.",
  modeName: (mode: string) => (mode === '6x6' ? 'Volleyball' : 'Mini volleyball'),
  back: 'Back',
  language: 'Language',

  teamCode: 'Team code',
  teamCodeShort: 'Code',
  teamCodePlaceholder: 'ABC',
  set: 'Set',
  setInProgress: (n: number) => `Preparing set ${n}`,
  rotateCw: 'Rotate ↻',
  rotateCcw: '↺ Rotate',
  net: 'NET',
  zone: (n: number) => `Zone ${n}`,
  dorsalLabel: (n: number) => `Player number, zone ${n}`,
  setLabel: (n: number) => `Set ${n}`,
  newMatch: 'New match',
  replaceTitle: 'Replace rotation',
  replaceConfirm: (from: number, to: number) =>
    `Set ${to} already has another rotation. Replace it with the one from set ${from}?`,
  replace: 'Replace',
  newMatchConfirm: 'Delete the team code and the rotations of every set?',
  teamLockedTitle: 'Team code',
  teamLocked: 'The code cannot be changed after showing the QR code. To use another one, start a new match.',
  delete: 'Delete',
  cancel: 'Cancel',
  showQr: 'Show QR',
  qrCaption: (team: string, set: number) => `${team} · Set ${set}`,
  qrCloseHint: 'Tap to close',

  setMismatch: (a: number, b: number) =>
    `The teams handed in different sets (A: set ${a}, B: set ${b}).`,
  teamA: 'Team A',
  teamB: 'Team B',
  notScanned: 'Not scanned',
  scan: 'Scan',
  rescan: 'Scan again',
  scanTitle: (field: string) => `Scan the QR code of ${field}`,
  close: 'Close',
  privacy: 'Privacy policy',
  cameraNeeded: 'Camera permission is needed to scan.',
  cameraDenied: Platform.OS === 'web'
    ? 'The camera is blocked for this page. Allow it from the lock icon in the address bar and open the scanner again.'
    : 'The camera is turned off for Clipeo Rota. Turn it on in the device settings.',
  allowCamera: 'Allow camera',
  settings: 'Open settings',
  sameTeamTitle: 'Same team',
  sameTeam: (team: string, other: string) =>
    `The code ${team} is already loaded in ${other}. Load it anyway?`,
  load: 'Load',
  invalidQrTitle: 'Invalid QR code',
  decodeError(error: DecodeError, mode: string): string {
    switch (error) {
      case 'not-clipeo':
        return 'This QR code is not a Clipeo Rota rotation.';
      case 'unsupported-version':
        return 'This QR code is from another version of Clipeo Rota. Update the app.';
      case 'invalid':
        return 'The QR code has incorrect data. Ask the coach to generate it again.';
      case 'mode-mismatch':
        return `This QR code is not for ${mode}. Check the format in both apps.`;
    }
  },
};

const STRINGS: Record<Lang, Strings> = { es, en };

/** Device language: Spanish if the device is in Spanish, English otherwise. */
export function deviceLang(): Lang {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith('es') ? 'es' : 'en';
  } catch {
    return 'es';
  }
}

let current: Lang = deviceLang();
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return current;
}

/** Changes the language of the whole app (saving it is up to the caller, see storage.ts). */
export function setLang(lang: Lang): void {
  if (lang === current) return;
  current = lang;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current language; re-renders the component when it changes. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, getLang);
}

/** Texts in the current language; re-renders the component when it changes. */
export function useT(): Strings {
  return STRINGS[useLang()];
}

/** Texts in the current language, for code outside components. */
export function getT(): Strings {
  return STRINGS[current];
}
