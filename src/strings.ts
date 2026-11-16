import type { DecodeError } from './core/qr';
import type { Issue } from './core/lineup';

/** All user-facing text. Spanish only for now (RNF-04); kept in one place to translate later. */
export const t = {
  appName: 'Clipeo Rota',
  tagline: 'La hoja de rotación, en un QR.',
  chooseProfile: 'Elige tu perfil',
  coach: 'Entrenador',
  coachHint: 'Escribe tu rotación y enséñala en un QR.',
  referee: 'Árbitro',
  refereeHint: 'Escanea el QR de cada equipo.',
  chooseMode: 'Elige la modalidad',
  zones: (n: number) => `${n} zonas`,
  back: 'Cambiar',

  teamCode: 'Código de equipo',
  teamCodePlaceholder: 'ABC',
  set: 'Set',
  setInProgress: (n: number) => `Preparando el set ${n}`,
  copyHint: 'Toca un set anterior para copiar su rotación.',
  rotateCw: 'Rotar ↻',
  rotateCcw: '↺ Rotar',
  net: 'RED',
  zone: (n: number) => `Zona ${n}`,
  setLabel: (n: number) => `Set ${n}`,
  nextSet: (n: number) => `Pasar al set ${n} →`,
  newMatch: 'Nuevo partido',
  newMatchConfirm: '¿Borrar las rotaciones de todos los sets? El código de equipo se mantiene.',
  copyConfirm: (from: number, to: number) =>
    `El set ${to} ya tiene dorsales. ¿Sustituirlos por la rotación del set ${from}?`,
  replace: 'Sustituir',
  delete: 'Borrar',
  cancel: 'Cancelar',
  missing: 'Para mostrar el QR falta:',
  qrCaption: (team: string, set: number) => `${team} · Set ${set}`,
  issue(issue: Issue): string {
    switch (issue.kind) {
      case 'team':
        return 'Código de equipo de 3 caracteres.';
      case 'empty':
        return issue.zones.length === 1
          ? `Dorsal en la zona ${issue.zones[0]}.`
          : `Dorsal en las zonas ${issue.zones.join(', ')}.`;
      case 'duplicate':
        return `El dorsal ${issue.dorsal} está repetido (zonas ${issue.zones.join(' y ')}).`;
    }
  },

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
