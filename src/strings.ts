import type { DecodeError } from './core/qr';

/** All user-facing text. Spanish only for now (RNF-04); kept in one place to translate later. */
export const t = {
  appName: 'Clipeo Rota',
  tagline: 'La hoja de rotación, en un QR.',
  mode: 'Modalidad',
  chooseProfile: 'Elige tu rol',
  coach: 'Entrenador',
  coachHint: 'Escribe tu rotación y enséñala en un QR.',
  referee: 'Árbitro',
  refereeHint: 'Escanea el QR de cada equipo.',
  zones: (n: number) => `${n} zonas`,
  back: 'Volver',

  teamCode: 'Código de equipo',
  teamCodeShort: 'Código',
  teamCodePlaceholder: 'ABC',
  set: 'Set',
  setInProgress: (n: number) => `Preparando el set ${n}`,
  rotateCw: 'Rotar ↻',
  rotateCcw: '↺ Rotar',
  net: 'RED',
  zone: (n: number) => `Zona ${n}`,
  setLabel: (n: number) => `Set ${n}`,
  newMatch: 'Nuevo partido',
  newMatchConfirm: '¿Borrar las rotaciones de todos los sets? El código de equipo se mantiene.',
  copyConfirm: (from: number, to: number) =>
    `El set ${to} ya tiene dorsales. ¿Sustituirlos por la rotación del set ${from}?`,
  replace: 'Sustituir',
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
  cameraNeeded: 'Para escanear hace falta permiso de cámara.',
  cameraDenied:
    'La cámara está desactivada para Clipeo Rota. Actívala en los ajustes del dispositivo.',
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
