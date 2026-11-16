import { emptyLineup, FORMATS, MODES } from '../formats';
import {
  duplicateZones,
  normalizeDorsal,
  normalizeTeamCode,
  rotate,
  validateLineup,
} from '../lineup';
import { decodeLineup, encodeLineup } from '../qr';
import { canAdvance, copyableSets, parseCoachState } from '../sets';

describe('formats', () => {
  it.each(MODES)('%s layout contains each zone exactly once', (mode) => {
    const f = FORMATS[mode];
    const zones = f.layout.flat().sort((a, b) => a - b);
    expect(zones).toEqual(Array.from({ length: f.zones }, (_, i) => i + 1));
    expect(f.rowWeights).toHaveLength(f.layout.length);
  });
});

describe('normalizeDorsal', () => {
  it.each([
    ['7', '7'],
    ['07', '7'],
    ['00', ''],
    ['0', ''],
    ['123', '12'],
    ['1a2', '12'],
    ['', ''],
    ['99', '99'],
  ])('%p → %p', (input, expected) => expect(normalizeDorsal(input)).toBe(expected));
});

describe('normalizeTeamCode', () => {
  it('uppercases, strips symbols and keeps 3 chars', () => {
    expect(normalizeTeamCode('ab-c1')).toBe('ABC');
    expect(normalizeTeamCode('x9')).toBe('X9');
  });
});

describe('rotate', () => {
  const six = ['1', '2', '3', '4', '5', '6']; // ZN1..ZN6

  it('clockwise: ZN2 → ZN1 and ZN1 → last zone', () => {
    expect(rotate(six, 'clockwise')).toEqual(['2', '3', '4', '5', '6', '1']);
  });

  it('counterclockwise: ZN1 → ZN2 and last zone → ZN1', () => {
    expect(rotate(six, 'counterclockwise')).toEqual(['6', '1', '2', '3', '4', '5']);
  });

  it.each(MODES)('%s: full turn returns to start, both directions undo each other', (mode) => {
    const lineup = emptyLineup(mode).map((_, i) => String(i + 10));
    let r = lineup;
    for (let i = 0; i < lineup.length; i++) r = rotate(r, 'clockwise');
    expect(r).toEqual(lineup);
    expect(rotate(rotate(lineup, 'clockwise'), 'counterclockwise')).toEqual(lineup);
  });
});

describe('validateLineup', () => {
  it('accepts a complete lineup', () => {
    expect(validateLineup('ABC', ['1', '2', '3'])).toEqual([]);
  });

  it('reports team, empty zones and duplicates', () => {
    expect(validateLineup('AB', ['4', '', '4', '7'])).toEqual([
      { kind: 'team' },
      { kind: 'empty', zones: [2] },
      { kind: 'duplicate', dorsal: '4', zones: [1, 3] },
    ]);
    expect([...duplicateZones(['4', '', '4'])]).toEqual([1, 3]);
  });
});

describe('QR', () => {
  const lineup = { mode: '6x6' as const, team: 'ABC', set: 2, dorsales: ['22', '4', '7', '10', '1', '15'] };

  it('matches the documented format', () => {
    expect(encodeLineup(lineup)).toBe(
      '{"app":"clipeo-rota","v":1,"mod":"6x6","eq":"ABC","set":2,"zn":["22","4","7","10","1","15"]}',
    );
  });

  it('round-trips', () => {
    expect(decodeLineup(encodeLineup(lineup), '6x6')).toEqual({ ok: true, lineup });
  });

  it('rejects foreign, wrong version, invalid and mismatched payloads', () => {
    expect(decodeLineup('https://example.com', '6x6')).toEqual({ ok: false, error: 'not-clipeo' });
    expect(decodeLineup('["ABC","{}"]', '6x6')).toEqual({ ok: false, error: 'not-clipeo' });
    expect(decodeLineup(encodeLineup(lineup).replace('"v":1', '"v":2'), '6x6')).toEqual({
      ok: false,
      error: 'unsupported-version',
    });
    expect(
      decodeLineup(encodeLineup({ ...lineup, dorsales: ['1', '1', '2', '3', '4', '5'] }), '6x6'),
    ).toEqual({ ok: false, error: 'invalid' });
    expect(
      decodeLineup(encodeLineup({ mode: '4x4', team: 'ABC', set: 1, dorsales: ['1', '2', '3', '4'] }), '6x6'),
    ).toEqual({ ok: false, error: 'mode-mismatch' });
    for (const set of [0, 6, 1.5, '2', undefined]) {
      expect(decodeLineup(JSON.stringify({ ...JSON.parse(encodeLineup(lineup)), set }), '6x6')).toEqual({
        ok: false,
        error: 'invalid',
      });
    }
  });
});

describe('sets', () => {
  it('lists complete earlier sets as copyable and only advances when complete', () => {
    const state = { team: 'ABC', active: 3, sets: { 1: ['1', '2', '3'], 2: ['1', '', '3'] } };
    expect(copyableSets(state)).toEqual([1]);
    expect(canAdvance(state, '3x3')).toBe(false);
    expect(canAdvance({ ...state, sets: { ...state.sets, 3: ['4', '5', '6'] } }, '3x3')).toBe(true);
    expect(canAdvance({ ...state, active: 5, sets: { 5: ['4', '5', '6'] } }, '3x3')).toBe(false);
  });

  it('drops stored sets that do not fit the modality', () => {
    const raw = { team: 'abc', active: 2, sets: { 1: ['1', '2', '3'], 2: ['1', '2'], 9: ['1', '2', '3'] } };
    expect(parseCoachState(raw, '3x3')).toEqual({ team: 'ABC', active: 2, sets: { 1: ['1', '2', '3'] } });
    expect(parseCoachState({ team: 'A', active: 0, sets: {} }, '3x3')).toBeNull();
  });
});
